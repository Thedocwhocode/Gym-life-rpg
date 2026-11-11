import FxStage from '@/components/presentation/fx/FxStage';
import PixelBar from '@/components/presentation/pixel/PixelBar';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { Enemy } from '@/store/journey/rules/combat';
import { fontFamily, type } from '@/theme/tokens';
import { TranslationKey, useTranslate } from '@tolgee/react';
import { ReactNode, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

const DEATH_FX = 'spawn/coin-drop' as const;

interface CombatStageProps {
  enemy: Enemy;
  /** Sobe a cada golpe; 0 = herói em guarda. */
  strikeKey: number;
  collapsed: boolean;
  onToggle: () => void;
  onStrikeDone?: () => void;
  /** Momentos (FxBurst) por cima do palco. */
  children?: ReactNode;
}

/**
 * Palco do combate (F5): o herói golpeia o monstro do exercício atual; HP = séries (DR21).
 * Recolhe numa faixa de 64 px e expande ao tocar (DR2). Remontar com `key={enemy.index}` ao trocar de inimigo.
 */
export default function CombatStage({
  enemy,
  strikeKey,
  collapsed,
  onToggle,
  onStrikeDone,
  children,
}: CombatStageProps) {
  const { palette } = useAppTheme();
  const { t } = useTranslate();
  // morto só depois do golpe final terminar; inimigo já morto (sessão retomada) aparece morto
  const [dead, setDead] = useState(enemy.defeated);
  useEffect(() => {
    if (!enemy.defeated) setDead(false);
  }, [enemy.defeated]);

  const name = t(`combat.monster.${enemy.monster.id}` as TranslationKey);
  const role = t(enemy.boss ? 'combat.boss.label' : 'combat.enemy.label');
  const hpText = `${enemy.hp}/${enemy.maxHp}`;

  return (
    <Pressable
      testID="combat-stage"
      accessibilityRole="button"
      accessibilityState={{ expanded: !collapsed }}
      accessibilityLabel={`${role}: ${name}, HP ${hpText}`}
      accessibilityHint={t('combat.toggle.hint')}
      onPress={onToggle}
      style={{
        borderWidth: 1,
        borderColor: palette.line1,
        backgroundColor: palette.surface1,
      }}
    >
      {collapsed ? null : (
        <FxStage
          fx={enemy.monster.attack}
          target={false}
          companions={[{ fx: dead ? DEATH_FX : enemy.monster.fx, x: 'target' }]}
          size={[200, 104]}
          fill
          bg="ground"
          repeat={false}
          hold={!dead && strikeKey === 0}
          playKey={dead ? 'x' : strikeKey}
          onDone={() => {
            if (enemy.defeated) setDead(true);
            onStrikeDone?.();
          }}
          label={`${role}: ${name}`}
        />
      )}
      <View
        style={{
          minHeight: collapsed ? 64 : undefined,
          justifyContent: 'center',
          gap: 6,
          paddingHorizontal: 12,
          paddingVertical: 8,
        }}
      >
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'baseline' }}>
          <Text
            style={{
              ...type.label,
              color: enemy.boss ? palette.dangerStrong : palette.text2,
            }}
          >
            {role}:
          </Text>
          <Text
            numberOfLines={1}
            style={{
              ...type.label,
              color: palette.dangerStrong,
              flex: 1,
            }}
          >
            {name}
            {enemy.defeated ? ` (${t('combat.defeated.label')})` : ''}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ ...type.label, color: palette.dangerStrong }}>HP</Text>
          <View style={{ flex: 1 }}>
            <PixelBar
              value={enemy.maxHp ? enemy.hp / enemy.maxHp : 0}
              segments={Math.max(1, enemy.maxHp)}
              height={10}
              gap={4}
              tone="hp"
              testID="combat-hp"
            />
          </View>
          <Text
            style={{
              fontFamily: fontFamily.monoBold,
              fontSize: 11,
              color: palette.text2,
            }}
          >
            {hpText}
          </Text>
        </View>
      </View>
      {children}
    </Pressable>
  );
}
