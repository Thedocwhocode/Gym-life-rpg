import FxStage from '@/components/presentation/fx/FxStage';
import PixelBar from '@/components/presentation/pixel/PixelBar';
import PixelBox from '@/components/presentation/pixel/PixelBox';
import Tag from '@/components/presentation/pixel/Tag';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  isDebuff,
  STATUS_FX,
  STATUS_XP,
  type StatusId,
} from '@/store/journey/rules/status';
import { type } from '@/theme/tokens';
import { TranslationKey, useTranslate } from '@tolgee/react';
import { Text, View } from 'react-native';

/** Buff ou debuff ativo (design-spec §D.2). `cure` 0..1 = progresso da cura (3 segmentos). */
export default function StatusBanner({
  status,
  cure,
}: {
  status: StatusId;
  cure?: number | undefined;
}) {
  const { palette } = useAppTheme();
  const { t } = useTranslate();
  const debuff = isDebuff(status);
  const pct = STATUS_XP[status];
  const key = `rpg.status.${status}`;
  return (
    <PixelBox
      testID={`status-${status}`}
      tone={debuff ? 'danger' : 'success'}
      padding={10}
      innerStyle={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}
    >
      <FxStage
        fx={STATUS_FX[status]}
        size={[46, 46]}
        scale={2}
        bg="none"
        label={t(key as TranslationKey)}
      />
      <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Text
            style={{
              ...type.label,
              color: debuff ? palette.dangerStrong : palette.success,
            }}
          >
            {t(debuff ? 'rpg.status.negative' : 'rpg.status.positive')}
          </Text>
          <Tag tone={debuff ? 'danger' : 'success'} size="sm">
            {t('rpg.status.xp', { pct: pct > 0 ? `+${pct}` : String(pct) })}
          </Tag>
        </View>
        <Text style={{ ...type.title, color: palette.text1 }}>
          {t(key as TranslationKey)}
        </Text>
        <Text style={{ ...type.small, color: palette.text2 }}>
          {t(`${key}.why` as TranslationKey)}
        </Text>
        {debuff && (
          <>
            <Text style={{ ...type.small, color: palette.text2 }}>
              {'▸ '}
              {t('rpg.status.cure', {
                text: t(`${key}.cure` as TranslationKey),
              })}
            </Text>
            {cure !== undefined && (
              <PixelBar value={cure} segments={3} tone="hp" height={8} />
            )}
          </>
        )}
      </View>
    </PixelBox>
  );
}
