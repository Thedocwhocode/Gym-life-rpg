import AsciiBar from '@/components/presentation/pixel/AsciiBar';
import AsciiFrame from '@/components/presentation/pixel/AsciiFrame';
import Portrait from '@/components/presentation/pixel/Portrait';
import AttributeStat from '@/components/presentation/rpg/AttributeStat';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useHeroAttributes, weekDelta } from '@/hooks/useHeroAttributes';
import { useAppSelector } from '@/store';
import { selectJourney } from '@/store/journey';
import { ENERGY } from '@/store/journey/rules/energy';
import { selectRpgLevel, selectRpgTitle, selectXpProgress } from '@/store/rpg';
import type { AttrKey } from '@/store/rpg/derive';
import { fontFamily, type } from '@/theme/tokens';
import { useTranslate } from '@tolgee/react';
import { Text, View } from 'react-native';

const ATTR_ORDER: AttrKey[] = ['STR', 'DEX', 'CON', 'STA'];

/** Cabeçalho do herói: retrato, nível, título, XP e a linha de atributos. */
export default function CharacterSheet() {
  const { palette } = useAppTheme();
  const { t } = useTranslate();
  const level = useAppSelector(selectRpgLevel);
  const title = useAppSelector(selectRpgTitle);
  const xp = useAppSelector(selectXpProgress);
  const attrs = useHeroAttributes();
  const { energy } = useAppSelector(selectJourney);
  const ratio = xp.needed > 0 ? xp.current / xp.needed : 0;

  return (
    <AsciiFrame testID="character-sheet" padding={16}>
      <View style={{ flexDirection: 'row', gap: 14 }}>
        <Portrait label={t('rpg.sheet.portrait')} width={92} height={116} />
        <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
          <Text
            style={{
              fontFamily: fontFamily.display,
              fontSize: 17,
              lineHeight: 20,
              color: palette.accent,
              textTransform: 'uppercase',
            }}
          >
            {t('rpg.sheet.level', { level })}
          </Text>
          <Text
            style={{
              fontFamily: fontFamily.display,
              fontSize: 15,
              lineHeight: 18,
              color: palette.text1,
              textTransform: 'uppercase',
              letterSpacing: 0.3,
            }}
          >
            {t(title)}
          </Text>
          <View style={{ gap: 4, marginTop: 6 }}>
            <AsciiBar value={ratio} cells={12} label="XP" fontSize={12} />
            <AsciiBar
              testID="energy-bar"
              value={energy / ENERGY.max}
              cells={12}
              tone="energy"
              label={t('rpg.sheet.energy')}
              fontSize={12}
            />
            <Text style={{ ...type.micro, color: palette.text3 }}>
              {t('rpg.sheet.xp', {
                current: xp.current,
                needed: xp.needed,
                left: Math.max(0, xp.needed - xp.current),
              })}
            </Text>
          </View>
        </View>
      </View>
      {/* ponytail: linha sólida; borda tracejada num lado só não funciona no iOS/Android. */}
      <View
        style={{
          flexDirection: 'row',
          gap: 8,
          marginTop: 16,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: palette.line1,
        }}
      >
        {ATTR_ORDER.map((k) => (
          <AttributeStat
            key={k}
            variant="inline"
            attr={k}
            value={String(attrs[k].total)}
            delta={weekDelta(attrs[k].week)}
          />
        ))}
      </View>
    </AsciiFrame>
  );
}
