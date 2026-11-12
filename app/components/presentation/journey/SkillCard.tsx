import FxStage from '@/components/presentation/fx/FxStage';
import Icon from '@/components/presentation/pixel/Icon';
import PixelBar from '@/components/presentation/pixel/PixelBar';
import PixelBox from '@/components/presentation/pixel/PixelBox';
import Tag, { type TagTone } from '@/components/presentation/pixel/Tag';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  hasEffect,
  type Req,
  type Skill,
  type SkillState,
} from '@/store/journey/rules/skills';
import { type } from '@/theme/tokens';
import { TranslationKey, useTranslate } from '@tolgee/react';
import { Pressable, Text, View } from 'react-native';

const STATE_TONE: Record<SkillState, TagTone> = {
  locked: 'muted',
  available: 'reward',
  learned: 'accent',
  equipped: 'success',
};
const TIER = ['I', 'II', 'III', 'IV'];

export function useReqText() {
  const { t } = useTranslate();
  return (req: Req) => {
    switch (req.kind) {
      case 'class':
        return t('rpg.req.class', { class: t(`rpg.class.${req.cls}`) });
      case 'deadliftPr':
      case 'comeback':
      case 'soon':
        return t(`rpg.req.${req.kind}`);
      default:
        return t(`rpg.req.${req.kind}` as TranslationKey, { n: req.n });
    }
  };
}

/**
 * Skill do Grimório. Só a variante `card` (a selecionada) anima o FX; as compactas da árvore
 * ficam estáticas (o spec avisa de 7+ canvases por tela).
 */
export default function SkillCard({
  skill,
  state,
  progress,
  variant = 'card',
  selected = false,
  onPress,
}: {
  skill: Skill;
  state: SkillState;
  progress: { value: number; target: number; ratio: number };
  variant?: 'card' | 'compact';
  selected?: boolean;
  onPress?: () => void;
}) {
  const { palette } = useAppTheme();
  const { t } = useTranslate();
  const reqText = useReqText();
  const locked = state === 'locked';
  const name = t(`rpg.skill.${skill.id}` as TranslationKey);
  const stateLabel = t(`rpg.skill.state.${state}` as TranslationKey);

  if (variant === 'compact')
    return (
      <Pressable
        testID={`skill-${skill.id}`}
        accessibilityRole="button"
        aria-selected={selected}
        aria-label={`${name}, ${stateLabel}`}
        onPress={onPress}
        style={{ flex: 1 }}
      >
        <PixelBox
          tone={state === 'available' ? 'accent' : 'default'}
          borderColor={selected ? palette.lineFocus : undefined}
          padding={10}
          innerStyle={{ gap: 4, opacity: locked ? 0.55 : 1 }}
        >
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            {locked && <Icon name="lock" size={14} color={palette.text3} />}
            <Text
              numberOfLines={1}
              style={{ ...type.label, color: palette.text1, flex: 1 }}
            >
              {name}
            </Text>
          </View>
          <Text style={{ ...type.micro, color: palette.text3 }}>
            {t('rpg.skill.tier', { tier: TIER[skill.tier - 1] })} · {stateLabel}
          </Text>
          {locked && skill.req.kind !== 'soon' && (
            <PixelBar value={progress.ratio} segments={10} height={4} />
          )}
        </PixelBox>
      </Pressable>
    );

  return (
    <PixelBox
      testID={`skill-card-${skill.id}`}
      tone="raised"
      glow={state === 'available'}
      borderColor={
        state === 'equipped'
          ? palette.lineFrame
          : state === 'available'
            ? palette.reward
            : undefined
      }
      padding={14}
      innerStyle={{ gap: 10 }}
    >
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <View style={{ opacity: locked ? 0.55 : 1 }}>
          <FxStage
            fx={skill.fx}
            size={[64, 64]}
            scale={1}
            bg="ground"
            hold={locked}
            label={name}
          />
          {locked && (
            <View
              style={{
                position: 'absolute',
                inset: 0,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="lock" size={24} color={palette.text1} />
            </View>
          )}
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
          <Text style={{ ...type.micro, color: palette.text3 }}>
            {t('rpg.skill.tier', { tier: TIER[skill.tier - 1] })}
          </Text>
          <Text style={{ ...type.title, color: palette.text1 }}>{name}</Text>
          <View style={{ flexDirection: 'row' }}>
            <Tag tone={STATE_TONE[state]} size="sm">
              {stateLabel}
            </Tag>
          </View>
        </View>
      </View>
      <Text style={{ ...type.body, color: palette.success }}>
        {t(`rpg.skill.${skill.id}.effect` as TranslationKey)}
        {hasEffect(skill) ? '' : ` (${t('rpg.skill.soon')})`}
      </Text>
      <View style={{ gap: 4 }}>
        <Text style={{ ...type.small, color: palette.text2 }}>
          {'▸ '}
          {reqText(skill.req)}
          {skill.req.kind !== 'soon' && skill.req.kind !== 'class'
            ? ` · ${progress.value}/${progress.target}`
            : ''}
        </Text>
        {skill.req.kind !== 'soon' && (
          <PixelBar value={progress.ratio} segments={10} height={6} />
        )}
      </View>
    </PixelBox>
  );
}
