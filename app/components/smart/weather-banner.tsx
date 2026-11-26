import FxStage from '@/components/presentation/fx/FxStage';
import Icon from '@/components/presentation/pixel/Icon';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLiveWeather } from '@/hooks/useLiveWeather';
import { recordWeather } from '@/store/choices';
import { WEATHER_FX, weatherFromCode } from '@/services/weather';
import { type } from '@/theme/tokens';
import { TranslationKey, useTranslate } from '@tolgee/react';
import { LocalDate } from '@js-joda/core';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// design-spec: o palco do clima é escuro em todas as paletas, com texto claro fixo.
const STAGE_BG = '#0b0c0d';
const STAGE_TEXT1 = '#efe9db';
const STAGE_TEXT2 = '#b3ab99';

/** Faixa de clima de 48 px abaixo das quests (DR1/F7). O clima do dia vira modificador de XP (revoga D8). */
export default function WeatherBanner() {
  const { palette } = useAppTheme();
  const { t } = useTranslate();
  const { state, refresh } = useLiveWeather();
  const dispatch = useDispatch();

  const kind =
    state.status === 'ok'
      ? weatherFromCode(
          state.reading.code,
          state.reading.isDay,
          state.reading.wind,
        )
      : undefined;
  const simulated = state.status === 'ok' && !!state.simulated;
  // O primeiro clima do dia (real ou simulado) fica gravado para o XP daquele dia.
  useEffect(() => {
    if (kind)
      dispatch(recordWeather({ date: LocalDate.now().toString(), kind }));
  }, [dispatch, kind]);
  const title =
    state.status === 'loading'
      ? t('rpg.weather.loading')
      : `${t(`rpg.weather.${kind}` as TranslationKey)} · ${Math.round(state.reading.temp)}°`;
  const mod = kind && t(`rpg.weather.mod.${kind}` as TranslationKey);
  const place =
    state.status === 'loading'
      ? undefined
      : t(
          state.place === 'region'
            ? 'rpg.weather.place.region'
            : 'rpg.weather.place.default',
        );
  // Simulado: tentar de novo. No padrão: tocar pede a localização (nunca no boot).
  const action = simulated
    ? 'reload'
    : state.status === 'ok' && state.place === 'default'
      ? 'gps'
      : undefined;
  const eyebrow = [
    t('rpg.weather.eyebrow'),
    place,
    simulated && t('rpg.weather.simulated'),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      testID="weather-banner"
      disabled={!action}
      onPress={() => void refresh()}
      accessibilityRole={action ? 'button' : undefined}
      accessibilityLabel={[eyebrow, title, mod].filter(Boolean).join('. ')}
      accessibilityHint={
        action === 'gps'
          ? t('rpg.weather.locate')
          : action === 'reload'
            ? t('rpg.weather.retry')
            : undefined
      }
      style={{
        height: 48,
        overflow: 'hidden',
        justifyContent: 'center',
        backgroundColor: STAGE_BG,
        borderWidth: 1,
        borderColor: palette.line2,
      }}
    >
      {kind && <FxStage fx={WEATHER_FX[kind]} cover label={title} />}
      <LinearGradient
        colors={['rgba(11,12,13,0.92)', 'rgba(11,12,13,0.2)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 12,
        }}
      >
        <View style={{ flex: 1, minWidth: 136 }}>
          <Text numberOfLines={1} style={{ ...type.micro, color: STAGE_TEXT2 }}>
            {eyebrow}
          </Text>
          <Text
            testID="weather-title"
            numberOfLines={1}
            style={{ ...type.label, color: STAGE_TEXT1 }}
          >
            {title}
          </Text>
        </View>
        {mod && (
          <Text
            testID="weather-mod"
            numberOfLines={1}
            style={{ ...type.micro, color: STAGE_TEXT1, flexShrink: 1 }}
          >
            {`▸ ${mod}`}
          </Text>
        )}
        {action && <Icon name={action} size={16} color={STAGE_TEXT1} />}
      </View>
    </Pressable>
  );
}
