import { readFileSync } from 'fs';
import { gunzipSync } from 'zlib';
import { LocalDate } from '@js-joda/core';
import { describe, expect, it } from 'vitest';
import { google, GymLifeRpg } from '@/gen/proto';
import { fromSessionHistoryDao } from '@/models/storage/conversions.from-dao';
import {
  choicesFromJson,
  choicesToJson,
  withJourneyDefaults,
} from '@/store/choices/migrate';
import { projectProgress } from '@/store/rpg';
import { selectJourneyContext, type Choices } from '@/store/choices';
import type { RootState } from '@/store/store';

const Exported = GymLifeRpg.Ui.Models.ExportedDataDao.ExportedDataDaoV2;
const TODAY = '2026-11-10';

describe('backup das escolhas (campo 6)', () => {
  it('ida e volta pelo proto preserva as escolhas, sem o estado de tela', () => {
    const choices: Choices & { isHydrated: boolean } = {
      isHydrated: true,
      rpgClass: 'scout',
      classHistory: [{ since: '1970-01-01', value: 'scout' }],
      trainingDays: [{ since: '2026-11-02', value: [1, 3, 5] }],
      skillsLearned: [{ since: '2026-11-03', value: 'giro' }],
      multiplicadoresDesde: '2026-11-01',
      coracoesDesde: '2026-11-01',
      chronicleSeenWeek: '2026-W46',
    };
    const bytes = Exported.encode(
      new Exported({
        choicesJson: new google.protobuf.StringValue({
          value: choicesToJson(choices),
        }),
      }),
    ).finish();
    const back = Exported.decode(bytes);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { isHydrated, ...saved } = choices;
    expect(choicesFromJson(back.choicesJson?.value ?? '', TODAY)).toEqual(
      saved,
    );
  });

  it('backup sem o campo 6 decodifica com choicesJson vazio', () => {
    const back = Exported.decode(Exported.encode(new Exported({})).finish());
    expect(back.choicesJson).toBeNull();
  });

  it('JSON de escolhas quebrado vira só os "desde" do dia do restore', () => {
    expect(choicesFromJson('{quebrado', TODAY)).toEqual({
      multiplicadoresDesde: TODAY,
      coracoesDesde: TODAY,
    });
  });

  // Caminho real do import: backup do LiftLog não tem choices_json, então o effect não
  // despacha restoreChoices e a projeção usa as escolhas que já estavam no aparelho.
  const liftLogSessions = () => [
    ...fromSessionHistoryDao(
      GymLifeRpg.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2.decode(
        gunzipSync(
          readFileSync(
            __dirname + '/../../models/storage/export.liftlogbackup.gz',
          ),
        ),
      ),
    ).values(),
  ];
  const ctxOf = (local: Choices) =>
    selectJourneyContext({
      choices: { ...local, isHydrated: true },
    } as unknown as RootState);

  it('restore do LiftLog num aparelho novo: regras desde hoje, XP passado intacto', () => {
    const sessions = liftLogSessions();
    const today = LocalDate.parse(TODAY);
    const local = withJourneyDefaults({ rpgClass: 'warrior' }, TODAY);
    const withRules = projectProgress(sessions, ctxOf(local), today);
    const plain = projectProgress(sessions, {}, today);
    expect(sessions).toHaveLength(85);
    expect(withRules.stats.missions).toBe(85);
    expect(withRules.xp).toBe(plain.xp);
    expect(Object.keys(withRules.sources)).toHaveLength(0);
    expect(projectProgress([...sessions].reverse(), {}, today)).toEqual(plain);
  });

  it('restore do LiftLog com "desde" local antigo: só as sessões a partir dele ganham %', () => {
    // Decisão: as escolhas locais ficam. Sessão restaurada com data ≥ "desde" conta como se
    // tivesse sido registrada aqui; antes disso o XP é o de sempre.
    const sessions = liftLogSessions();
    const days = sessions.map((s) => s.date.toString()).sort();
    const desde = days[80];
    const local = withJourneyDefaults(
      { rpgClass: 'warrior', multiplicadoresDesde: desde },
      TODAY,
    );
    const p = projectProgress(sessions, ctxOf(local), LocalDate.parse(TODAY));
    const after = sessions.filter((s) => s.date.toString() >= desde);
    expect(Object.keys(p.sources).sort()).toEqual(
      after.map((s) => s.id).sort(),
    );
    for (const s of sessions) expect(p.xpBySession[s.id]).toBeGreaterThan(0);
  });
});
