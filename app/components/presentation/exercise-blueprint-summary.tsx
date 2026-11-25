import ItemTitle from '@/components/presentation/item-title';
import RestFormat, {
  formatTimeSpan,
} from '@/components/presentation/rest-format';
import { SurfaceText } from '@/components/presentation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { useState } from 'react';
import { View } from 'react-native';
import { Menu } from 'react-native-paper';
import IconButton from '@/components/presentation/gesture-wrappers/icon-button';
import TouchableRipple from '@/components/presentation/gesture-wrappers/touchable-ripple';
import { useTranslate } from '@tolgee/react';
import {
  CardioExerciseBlueprint,
  CardioTarget,
  ExerciseBlueprint,
  WeightedExerciseBlueprint,
} from '@/models/blueprint-models';
import { match, P } from 'ts-pattern';
import { assertUnreachable } from '@/utils/assert-unreachable';
import { formatDistance } from '@/utils/distance';

interface ExerciseBlueprintSummaryProps {
  blueprint: ExerciseBlueprint;
  onEdit: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onRemove: () => void;
  onCopyTo: () => void;
}

export default function ExerciseBlueprintSummary({
  blueprint,
  onEdit,
  onMoveDown,
  onMoveUp,
  onRemove,
  onCopyTo,
}: ExerciseBlueprintSummaryProps) {
  const { t } = useTranslate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <TouchableRipple
      testID="exercise-blueprint-summary"
      onPress={onEdit}
      style={{
        paddingHorizontal: spacing.pageHorizontalMargin,
        paddingVertical: spacing[4],
      }}
    >
      <View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <ItemTitle title={blueprint.name} />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <IconButton
              accessibilityLabel={t('generic.move_up.button')}
              onPress={onMoveUp}
              icon={'arrowUpward'}
            />
            <IconButton
              accessibilityLabel={t('generic.move_down.button')}
              onPress={onMoveDown}
              icon={'arrowDownward'}
            />
            <IconButton
              accessibilityLabel={t('generic.delete.button')}
              onPress={onRemove}
              icon={'delete'}
            />
            <Menu
              visible={menuOpen}
              onDismiss={() => setMenuOpen(false)}
              anchor={
                <IconButton
                  accessibilityLabel={t('generic.more_options.label')}
                  onPress={() => setMenuOpen(true)}
                  icon={'moreHoriz'}
                />
              }
            >
              <Menu.Item
                title={t('exercise.copy_to.button')}
                leadingIcon={'copyAll'}
                onPress={() => {
                  setMenuOpen(false);
                  onCopyTo();
                }}
              />
            </Menu>
          </View>
        </View>
        {match(blueprint)
          .with(P.instanceOf(WeightedExerciseBlueprint), (b) => (
            <WeightedExerciseBlueprintSummary blueprint={b} />
          ))
          .with(P.instanceOf(CardioExerciseBlueprint), (b) => (
            <CardioExerciseBlueprintSummary blueprint={b} />
          ))
          .exhaustive()}
      </View>
    </TouchableRipple>
  );
}

function CardioExerciseBlueprintSummary({
  blueprint,
}: {
  blueprint: CardioExerciseBlueprint;
}) {
  return (
    <View style={{ gap: spacing[1], alignItems: 'flex-start' }}>
      <SurfaceText>
        <SurfaceText color="primary">{blueprint.target.type}</SurfaceText>
        {': '}
        <SurfaceText color="primary">
          {formatCardioTarget(blueprint.target)}
        </SurfaceText>
      </SurfaceText>
    </View>
  );
}

export function formatCardioTarget(target: CardioTarget): string {
  if (target.type === 'distance') {
    return formatDistance(target.value);
  } else if (target.type === 'time') {
    return formatTimeSpan(target.value);
  }
  assertUnreachable(target);
}

function WeightedExerciseBlueprintSummary({
  blueprint,
}: {
  blueprint: WeightedExerciseBlueprint;
}) {
  const { t } = useTranslate();
  return (
    <View style={{ gap: spacing[1], alignItems: 'flex-start' }}>
      <SurfaceText>
        <SurfaceText color="primary">{blueprint.sets}</SurfaceText>{' '}
        {t(
          blueprint.sets === 1
            ? 'exercise.summary.set_one'
            : 'exercise.summary.set_other',
        )}{' '}
        {t('exercise.summary.of')}{' '}
        <SurfaceText color="primary">{blueprint.repsPerSet}</SurfaceText>{' '}
        {t(
          blueprint.repsPerSet === 1
            ? 'exercise.summary.rep_one'
            : 'exercise.summary.rep_other',
        )}
      </SurfaceText>
      <SurfaceText>
        <RestFormat rest={blueprint.restBetweenSets} />
      </SurfaceText>
    </View>
  );
}
