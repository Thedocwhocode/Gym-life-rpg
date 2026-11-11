import { readFileSync } from 'fs';
import { gunzipSync } from 'zlib';
import { LocalDate } from '@js-joda/core';
import { describe, expect, it } from 'vitest';
import { google, GymLifeRpg } from '@/gen/proto';
import { fromSessionHistoryDao } from '@/models/storage/conversions.from-dao';
import { choicesFromJson, choicesToJson } from '@/store/choices/migrate';
import { projectProgress } from '@/store/rpg';
import type { Choices } from '@/store/choices';

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

  it('restore do backup antigo do LiftLog: XP recalculado e regras novas não mexem no passado', () => {
    const raw = gunzipSync(
      readFileSync(__dirname + '/../../models/storage/export.liftlogbackup.gz'),
    );
    const sessions = [
      ...fromSessionHistoryDao(
        GymLifeRpg.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2.decode(raw),
      ).values(),
    ];
    const today = LocalDate.parse(TODAY);
    const ctx = choicesFromJson('{}', TODAY);
    const withRules = projectProgress(
      sessions,
      {
        multipliersSince: LocalDate.parse(ctx.multiplicadoresDesde!),
        heartsSince: LocalDate.parse(ctx.coracoesDesde!),
      },
      today,
    );
    const plain = projectProgress(sessions, {}, today);
    expect(sessions).toHaveLength(85);
    expect(withRules.stats.missions).toBe(85);
    expect(withRules.xp).toBe(plain.xp);
    expect(withRules.level).toBeGreaterThanOrEqual(1);
    expect(Object.keys(withRules.sources)).toHaveLength(0);
    expect(projectProgress([...sessions].reverse(), {}, today)).toEqual(plain);
  });
});
