import FxStage from '@/components/presentation/fx/FxStage';
import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import { headerOptions } from '@/components/presentation/pixel/AppHeader';
import AsciiBar from '@/components/presentation/pixel/AsciiBar';
import Button from '@/components/presentation/pixel/Button';
import Dialog from '@/components/presentation/pixel/Dialog';
import Icon from '@/components/presentation/pixel/Icon';
import PixelBox from '@/components/presentation/pixel/PixelBox';
import TextField from '@/components/presentation/pixel/TextField';
import { useServices } from '@/components/smart/services-provider';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AiWorkoutPlan } from '@/models/ai-models';
import { ProgramBlueprint } from '@/models/blueprint-models';
import {
  displayName,
  loadCatalog,
  match,
  type CatalogExercise,
} from '@/services/exercise-catalog';
import type { PickedFile } from '@/services/file-picker-service';
import {
  importPdf,
  PDF_CONSENT_KEY,
  readSheet,
  type PdfImportError,
  type PdfImportEvent,
} from '@/services/pdf-import';
import { presentPaywall } from '@/services/pro-paywall';
import { useAppSelector } from '@/store';
import { savePlan } from '@/store/program';
import { setProToken } from '@/store/settings';
import { type, TITLE_MAX_SCALE } from '@/theme/tokens';
import { uuid } from '@/utils/uuid';
import { LocalDate } from '@js-joda/core';
import { TranslationKey, useTolgee, useTranslate } from '@tolgee/react';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import Purchases from 'react-native-purchases';
import { Portal } from 'react-native-paper';
import { useDispatch } from 'react-redux';

type Phase =
  | { kind: 'pick' }
  | { kind: 'consent'; file: PickedFile }
  | { kind: 'scan'; log: string[]; progress: number }
  | { kind: 'done'; plan: AiWorkoutPlan }
  | { kind: 'error'; reason: PdfImportError; file?: PickedFile };

const CONSENT_ITEMS = [1, 2, 3, 4] as const;

/** F10: ficha em PDF → leitor de fichas (OCR + tabulação) → tabela para conferir → Planos. */
export default function PdfImport() {
  const { t } = useTranslate();
  const { palette } = useAppTheme();
  const { push } = useRouter();
  const dispatch = useDispatch();
  const { filePickerService, keyValueStore } = useServices();
  const proToken = useAppSelector((s) => s.settings.proToken);
  const [phase, setPhase] = useState<Phase>({ kind: 'pick' });
  const [name, setName] = useState('');
  const lang = useTolgee(['language']).getLanguage() ?? 'en';
  // F11: o nome lido continua o da ficha; o catálogo só mostra com o que ele casou.
  const [catalog, setCatalog] = useState<CatalogExercise[]>();
  useEffect(() => {
    if (phase.kind === 'done' && !catalog)
      loadCatalog().then(setCatalog, () => undefined);
  }, [phase.kind, catalog]);
  const matched = (exercise: string) => {
    const m = catalog && match(catalog, exercise);
    return m ? displayName(m, lang) : undefined;
  };

  const run = async (file: PickedFile, token = proToken) => {
    const log: string[] = [];
    let progress = 0;
    const addLine = (line: string, p = progress) => {
      log.push(line);
      progress = p;
      setPhase({ kind: 'scan', log: [...log], progress });
    };
    const onEvent = (e: PdfImportEvent) => {
      if (e.type === 'opened')
        addLine(
          t('pdf.log.opened', {
            name: e.name,
            kb: Math.max(1, Math.round(e.bytes / 1024)),
          }),
          0.05,
        );
      if (e.type === 'sending') addLine(t('pdf.log.sending'), 0.3);
      if (e.type === 'plan')
        addLine(t('pdf.log.plan', { n: e.workouts }), 0.95);
    };
    setPhase({ kind: 'scan', log, progress });
    const result = await importPdf(
      file,
      { read: (bytes) => readSheet(bytes, token) },
      onEvent,
    );
    if (result.status === 'ok') {
      setName(result.plan.name);
      setPhase({ kind: 'done', plan: result.plan });
    } else setPhase({ kind: 'error', reason: result.reason, file });
  };

  // O paywall da RevenueCat (antes no chat do Planejador); com o Pro, tenta de novo.
  const upgrade = async (file: PickedFile) => {
    const owned = await presentPaywall().catch(() => false);
    if (!owned) return;
    const info = await Purchases.getCustomerInfo();
    dispatch(setProToken(info.originalAppUserId));
    void run(file, info.originalAppUserId);
  };

  const pick = async () => {
    const file = await filePickerService.pickFile('application/pdf');
    if (!file) return;
    const consent = await keyValueStore
      .getItem(PDF_CONSENT_KEY)
      .catch(() => undefined);
    if (consent === 'true') void run(file);
    else setPhase({ kind: 'consent', file });
  };

  const save = (plan: AiWorkoutPlan) => {
    const programId = uuid();
    dispatch(
      savePlan({
        programId,
        programBlueprint: ProgramBlueprint.fromPOJO({
          lastEdited: LocalDate.now(),
          name: name.trim() || plan.name,
          sessions: plan.sessions.map((x) => x.toPOJO()),
        }),
      }),
    );
    push(`/(tabs)/settings/program-list?focusprogramId=${programId}`);
  };

  const muted = { ...type.body, color: palette.text2 };

  return (
    <FullHeightScrollView
      contentContainerStyle={{ gap: 16, padding: 16, paddingBottom: 32 }}
    >
      <Stack.Screen options={headerOptions(t('pdf.title'), t('pdf.eyebrow'))} />

      {(phase.kind === 'pick' || phase.kind === 'consent') && (
        <>
          <Text style={muted}>{t('pdf.pick.body')}</Text>
          <PixelBox
            testID="pdf-pick"
            padding={20}
            innerStyle={{ alignItems: 'center', gap: 12 }}
          >
            <Icon name="upload" size={48} color={palette.text2} />
            <Button
              icon="upload"
              testID="pdf-pick-button"
              onPress={() => void pick()}
            >
              {t('pdf.pick.button')}
            </Button>
            <Text style={{ ...type.micro, color: palette.text3 }}>
              {t('pdf.pick.hint')}
            </Text>
          </PixelBox>
        </>
      )}

      {phase.kind === 'scan' && (
        <View testID="pdf-scan" style={{ gap: 12 }}>
          <View style={{ height: 96, overflow: 'hidden' }}>
            <FxStage fx="scifi/scanner" fill label={t('pdf.scan.label')} />
          </View>
          <AsciiBar
            value={phase.progress}
            cells={22}
            label={t('pdf.scan.label')}
          />
          <PixelBox padding={12}>
            {phase.log.map((line, i) => (
              <Text key={i} style={{ ...type.micro, color: palette.success }}>
                {line}
              </Text>
            ))}
            <Text style={{ ...type.micro, color: palette.success }}>
              {'> _'}
            </Text>
          </PixelBox>
        </View>
      )}

      {phase.kind === 'done' && (
        <View testID="pdf-done" style={{ gap: 12 }}>
          <View style={{ height: 96, overflow: 'hidden' }}>
            <FxStage
              fx="ui/quest-complete"
              fill
              repeat={false}
              label={t('pdf.done.title')}
            />
          </View>
          <Text
            maxFontSizeMultiplier={TITLE_MAX_SCALE}
            style={{
              ...type.title,
              color: palette.reward,
              textAlign: 'center',
            }}
          >
            {t('pdf.done.title')}
          </Text>
          <TextField
            label={t('pdf.done.name')}
            value={name}
            onChangeText={setName}
          />
          <Text style={{ ...type.label, color: palette.text1 }}>
            {t('pdf.done.found', { n: phase.plan.sessions.length })}
          </Text>
          {phase.plan.sessions.map((s, i) => (
            <PixelBox key={i} padding={12} innerStyle={{ gap: 4 }}>
              <Text style={{ ...type.label, color: palette.text1 }}>
                {s.name}
              </Text>
              {s.exercises.map((e, j) => (
                <View key={j} style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...type.small, color: palette.text1 }}>
                      {e.name}
                    </Text>
                    {!!matched(e.name) && (
                      <Text style={{ ...type.micro, color: palette.text3 }}>
                        {t('pdf.done.match', { name: matched(e.name) })}
                      </Text>
                    )}
                  </View>
                  {'sets' in e && (
                    <Text style={{ ...type.small, color: palette.text2 }}>
                      {e.sets}×{e.repsPerSet}
                    </Text>
                  )}
                  {!!e.notes && (
                    <Text
                      style={{
                        ...type.small,
                        color: palette.text2,
                        maxWidth: '40%',
                      }}
                    >
                      {e.notes}
                    </Text>
                  )}
                </View>
              ))}
            </PixelBox>
          ))}
          <Text style={{ ...type.small, color: palette.reward }}>
            {t('pdf.done.check')}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button
              variant="secondary"
              style={{ flex: 1 }}
              onPress={() => setPhase({ kind: 'pick' })}
            >
              {t('pdf.another')}
            </Button>
            <Button
              testID="pdf-save"
              style={{ flex: 1 }}
              onPress={() => save(phase.plan)}
            >
              {t('pdf.done.save')}
            </Button>
          </View>
        </View>
      )}

      {phase.kind === 'error' && (
        <PixelBox
          testID="pdf-error"
          tone="danger"
          padding={16}
          innerStyle={{ gap: 12 }}
        >
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Icon name="warning-box" size={20} color={palette.dangerStrong} />
            <Text style={{ ...type.body, color: palette.text1, flex: 1 }}>
              {t(`pdf.error.${phase.reason}` as TranslationKey)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button
              variant="secondary"
              style={{ flex: 1 }}
              onPress={() => setPhase({ kind: 'pick' })}
            >
              {t('pdf.another')}
            </Button>
            {phase.reason === 'pro'
              ? Platform.OS !== 'web' &&
                phase.file && (
                  <Button
                    style={{ flex: 1 }}
                    onPress={() => void upgrade(phase.file!)}
                  >
                    {t('pdf.error.pro.button')}
                  </Button>
                )
              : phase.reason === 'no_plan' &&
                phase.file && (
                  <Button
                    testID="pdf-retry"
                    style={{ flex: 1 }}
                    onPress={() => void run(phase.file!)}
                  >
                    {t('pdf.retry')}
                  </Button>
                )}
          </View>
        </PixelBox>
      )}

      {phase.kind === 'consent' && (
        <Portal>
          <Dialog visible onDismiss={() => setPhase({ kind: 'pick' })}>
            <View testID="pdf-consent" style={{ gap: 10 }}>
              <Dialog.Title>{t('pdf.consent.title')}</Dialog.Title>
              {CONSENT_ITEMS.map((n) => (
                <Text key={n} style={{ ...type.body, color: palette.text2 }}>
                  {`· ${t(`pdf.consent.${n}` as TranslationKey)}`}
                </Text>
              ))}
            </View>
            <Dialog.Actions>
              <Button
                variant="ghost"
                onPress={() => setPhase({ kind: 'pick' })}
              >
                {t('generic.cancel.button')}
              </Button>
              <Button
                testID="pdf-consent-ok"
                onPress={() => {
                  void keyValueStore.setItem(PDF_CONSENT_KEY, 'true');
                  void run(phase.file);
                }}
              >
                {t('pdf.consent.ok')}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      )}
    </FullHeightScrollView>
  );
}
