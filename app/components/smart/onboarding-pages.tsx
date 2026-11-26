import PixelBox from '@/components/presentation/pixel/PixelBox';
import Portrait from '@/components/presentation/pixel/Portrait';
import {
  HAIR_COLORS,
  SKIN_TONES,
  type HeroLook,
} from '@/components/presentation/pixel/hero-sprite';
import TextField from '@/components/presentation/pixel/TextField';
import SystemWindow from '@/components/presentation/system/SystemWindow';
import DailyQuest from '@/components/smart/daily-quest';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import type { RpgClass } from '@/store/choices';
import { HERO_NAME_MAX } from '@/store/choices/hero';
import { type, TITLE_MAX_SCALE } from '@/theme/tokens';
import { TranslationKey, useTranslate } from '@tolgee/react';
import { Pressable, Text, View } from 'react-native';

const gutter = { marginHorizontal: spacing.pageHorizontalMargin };

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const { palette } = useAppTheme();
  return (
    <View style={[gutter, { gap: 6, marginBottom: 20 }]}>
      <Text
        maxFontSizeMultiplier={TITLE_MAX_SCALE}
        accessibilityRole="header"
        style={[type.title, { color: palette.text1 }]}
      >
        {title}
      </Text>
      {!!subtitle && (
        <Text style={[type.body, { color: palette.text2 }]}>{subtitle}</Text>
      )}
    </View>
  );
}

/** Passo 1: o Sistema desperta e pergunta o nome. A janela só monta depois da abertura. */
export function AwakenPage({
  awake,
  name,
  error,
  onChangeName,
  onSubmit,
}: {
  awake: boolean;
  name: string;
  error: boolean;
  onChangeName: (v: string) => void;
  onSubmit: () => void;
}) {
  const { palette } = useAppTheme();
  const { t } = useTranslate();
  if (!awake) return <View style={{ minHeight: 320 }} />;
  return (
    <View style={gutter}>
      <SystemWindow kind="info" title={t('onboarding.awaken.title')}>
        <View style={{ gap: 14 }}>
          <Text style={[type.body, { color: palette.text1 }]}>
            {t('onboarding.awaken.body')}
          </Text>
          <TextField
            testID="hero-name-input"
            label={t('onboarding.awaken.name.label')}
            value={name}
            onChangeText={onChangeName}
            onSubmitEditing={onSubmit}
            returnKeyType="next"
            autoFocus
            autoCapitalize="words"
            autoComplete="off"
            error={
              error
                ? t('onboarding.awaken.name.error', { max: HERO_NAME_MAX })
                : undefined
            }
            helper={`${t('onboarding.awaken.name.helper')} · ${name.trim().length}/${HERO_NAME_MAX}`}
          />
        </View>
      </SystemWindow>
    </View>
  );
}

function Swatches({
  label,
  colors,
  value,
  optionLabel,
  testID,
  onChange,
}: {
  label: string;
  colors: readonly string[];
  value: number;
  optionLabel: (i: number) => string;
  testID: string;
  onChange: (i: number) => void;
}) {
  const { palette } = useAppTheme();
  return (
    <View style={{ gap: 8 }}>
      <Text style={[type.label, { color: palette.text2 }]}>{label}</Text>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={label}
        style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}
      >
        {colors.map((c, i) => {
          const selected = i === value;
          return (
            <Pressable
              key={c}
              testID={`${testID}-${i}`}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={optionLabel(i)}
              onPress={() => onChange(i)}
              style={{
                width: 44,
                height: 44,
                padding: 4,
                borderWidth: 2,
                borderColor: selected ? palette.accent : palette.line2,
              }}
            >
              <View style={{ flex: 1, backgroundColor: c }} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Passo 3: pele e cabelo sobre o retrato; a túnica segue a classe (DR12). */
export function SpritePage({
  rpgClass,
  look,
  onChange,
}: {
  rpgClass: RpgClass | undefined;
  look: HeroLook;
  onChange: (look: HeroLook) => void;
}) {
  const { t } = useTranslate();
  return (
    <View>
      <PageHeader
        title={t('onboarding.sprite.title')}
        subtitle={t('onboarding.sprite.subtitle')}
      />
      <View style={[gutter, { gap: 20 }]}>
        <View style={{ alignItems: 'center' }}>
          <Portrait rpgClass={rpgClass} look={look} width={136} height={168} />
        </View>
        <Swatches
          label={t('onboarding.sprite.skin')}
          colors={SKIN_TONES.map((s) => s[0])}
          value={look.skin}
          testID="sprite-skin"
          optionLabel={(i) =>
            t('onboarding.sprite.skin_n', {
              n: i + 1,
              total: SKIN_TONES.length,
            })
          }
          onChange={(skin) => onChange({ ...look, skin })}
        />
        <Swatches
          label={t('onboarding.sprite.hair')}
          colors={HAIR_COLORS}
          value={look.hair}
          testID="sprite-hair"
          optionLabel={(i) =>
            t(`onboarding.sprite.hair.${i}` as TranslationKey)
          }
          onChange={(hair) => onChange({ ...look, hair })}
        />
      </View>
    </View>
  );
}

const TOUR = [
  { id: 'workout', glyph: '⚔' },
  { id: 'quests', glyph: '◆' },
  { id: 'study', glyph: '✦' },
  { id: 'sheet', glyph: '▤' },
] as const;

/** Passo 4: o que o app faz, em quatro cartões. */
export function TourPage() {
  const { palette } = useAppTheme();
  const { t } = useTranslate();
  return (
    <View>
      <PageHeader
        title={t('onboarding.tour.title')}
        subtitle={t('onboarding.tour.subtitle')}
      />
      <View style={[gutter, { gap: 12 }]}>
        {TOUR.map((c) => (
          <PixelBox
            key={c.id}
            padding={12}
            innerStyle={{ flexDirection: 'row', gap: 12 }}
          >
            <Text aria-hidden style={[type.bodyLg, { color: palette.accent }]}>
              {c.glyph}
            </Text>
            <View style={{ flex: 1, gap: 4 }}>
              <Text
                maxFontSizeMultiplier={TITLE_MAX_SCALE}
                style={[type.label, { color: palette.text1 }]}
              >
                {t(`onboarding.tour.${c.id}.title` as TranslationKey)}
              </Text>
              <Text style={[type.small, { color: palette.text2 }]}>
                {t(`onboarding.tour.${c.id}.body` as TranslationKey)}
              </Text>
            </View>
          </PixelBox>
        ))}
      </View>
    </View>
  );
}

/** Último passo: a missão diária de hoje, a mesma do Painel. */
export function TodayPage() {
  const { t } = useTranslate();
  return (
    <View>
      <PageHeader
        title={t('onboarding.today.title')}
        subtitle={t('onboarding.today.subtitle')}
      />
      <View style={gutter}>
        <DailyQuest />
      </View>
    </View>
  );
}
