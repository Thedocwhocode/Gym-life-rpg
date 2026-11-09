import Icon from '@/components/presentation/pixel/Icon';
import PixelBox from '@/components/presentation/pixel/PixelBox';
import { resolvePixelIcon } from '@/components/presentation/pixel-icon-map';
import { useAppTheme } from '@/hooks/useAppTheme';
import { fontFamily, type } from '@/theme/tokens';
import { useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { Modal, Portal } from 'react-native-paper';

interface AchievementBadgeProps {
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string | undefined;
}

const SIZE = 56;

export default function AchievementBadge({
  name,
  description,
  icon,
  unlockedAt,
}: AchievementBadgeProps) {
  const { palette } = useAppTheme();
  const { t } = useTranslate();
  const [open, setOpen] = useState(false);
  const unlocked = !!unlockedAt;
  const glyph = unlocked ? resolvePixelIcon(icon) : { name: 'lock' as const };
  const label = unlocked ? name : t('rpg.achievement.locked_label', { name });

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => setOpen(true)}
        style={{ width: SIZE + 20, alignItems: 'center', gap: 6 }}
      >
        <PixelBox
          tone={unlocked ? 'accent' : 'sunken'}
          padding={0}
          style={{ opacity: unlocked ? 1 : 0.5 }}
          innerStyle={{
            width: SIZE,
            height: SIZE,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon
            name={glyph.name}
            rotate={'rotate' in glyph ? glyph.rotate : undefined}
            size={24}
            color={unlocked ? palette.reward : palette.text3}
          />
        </PixelBox>
        <Text
          numberOfLines={2}
          style={{
            ...type.micro,
            textAlign: 'center',
            textTransform: 'uppercase',
            // ponytail: sem tracking; com 0,4 px "CONSISTÊNCIA" quebra no meio em 76 px.
            letterSpacing: 0,
            color: unlocked ? palette.text1 : palette.text3,
          }}
        >
          {name}
        </Text>
      </Pressable>

      <Portal>
        <Modal
          visible={open}
          onDismiss={() => setOpen(false)}
          contentContainerStyle={{ margin: 24 }}
        >
          <PixelBox
            tone={unlocked ? 'accent' : 'default'}
            steps={3}
            padding={24}
            innerStyle={{ alignItems: 'center', gap: 12 }}
          >
            <Icon
              name={glyph.name}
              size={48}
              color={unlocked ? palette.reward : palette.text3}
            />
            <Text
              style={{
                ...type.title,
                color: palette.text1,
                textAlign: 'center',
              }}
            >
              {name}
            </Text>
            <Text
              style={{
                ...type.body,
                color: palette.text2,
                textAlign: 'center',
              }}
            >
              {description}
            </Text>
            <Text
              style={{
                fontFamily: fontFamily.monoBold,
                fontSize: 11,
                letterSpacing: 1.5,
                color: unlocked ? palette.success : palette.text3,
              }}
            >
              {unlocked
                ? t('rpg.achievement.unlocked')
                : t('rpg.achievement.locked')}
            </Text>
          </PixelBox>
        </Modal>
      </Portal>
    </>
  );
}
