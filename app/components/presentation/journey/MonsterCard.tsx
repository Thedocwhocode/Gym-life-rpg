import FxStage from '@/components/presentation/fx/FxStage';
import Icon from '@/components/presentation/pixel/Icon';
import PixelBox from '@/components/presentation/pixel/PixelBox';
import Tag from '@/components/presentation/pixel/Tag';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { Beast, BeastState } from '@/store/journey/rules/bestiary';
import { type } from '@/theme/tokens';
import { TranslationKey, useTranslate } from '@tolgee/react';
import { Text, View } from 'react-native';

/**
 * Entrada do Bestiário. Desconhecido = só "???" (sem FX nem nome); visto/derrotado mostram o
 * monstro num quadro parado (hold), para a grade não animar 8 canvases ao mesmo tempo.
 */
export default function MonsterCard({
  beast,
  state,
}: {
  beast: Beast;
  state: BeastState;
}) {
  const { palette } = useAppTheme();
  const { t } = useTranslate();
  const unknown = state === 'unknown';
  const name = unknown ? '???' : t(`rpg.beast.${beast.id}` as TranslationKey);
  return (
    <PixelBox
      testID={`beast-${beast.id}`}
      tone={beast.boss ? 'danger' : 'default'}
      padding={10}
      innerStyle={{ gap: 6 }}
    >
      {beast.boss && (
        <Text style={{ ...type.micro, color: palette.dangerStrong }}>
          {t(
            beast.boss === 'weekly'
              ? 'rpg.bestiary.boss.weekly'
              : 'rpg.bestiary.boss.dungeon',
          )}
        </Text>
      )}
      <View
        style={{
          height: 64,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: palette.bgSunken,
        }}
      >
        {unknown ? (
          <Icon name="lock" size={24} color={palette.text3} />
        ) : (
          <FxStage
            fx={beast.fx}
            size={[64, 64]}
            scale={1}
            bg="none"
            hold
            label={name}
          />
        )}
      </View>
      <Text numberOfLines={2} style={{ ...type.label, color: palette.text1 }}>
        {name}
      </Text>
      {!unknown && (
        <Text style={{ ...type.micro, color: palette.text3 }}>
          {t(`rpg.beast.${beast.id}.region` as TranslationKey)} ·{' '}
          {t('rpg.bestiary.weak', { attr: beast.weak })}
        </Text>
      )}
      {state === 'defeated' ? (
        <View style={{ gap: 4 }}>
          <Text style={{ ...type.label, color: palette.success }}>
            {t('rpg.bestiary.defeated')}
          </Text>
          <Text style={{ ...type.micro, color: palette.reward }}>
            {t('rpg.bestiary.drop', {
              item: t(`rpg.item.${beast.drop}` as TranslationKey),
            })}
          </Text>
        </View>
      ) : state === 'seen' ? (
        <View style={{ flexDirection: 'row' }}>
          <Tag tone="muted" size="sm">
            {t('rpg.bestiary.seen')}
          </Tag>
        </View>
      ) : null}
    </PixelBox>
  );
}
