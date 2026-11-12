import AsciiDivider from '@/components/presentation/pixel/AsciiDivider';
import ListItem from '@/components/presentation/pixel/ListItem';
import { SurfaceText } from '@/components/presentation/surface-text';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import {
  DiffChange,
  ExerciseModification,
  filterDiff,
  getChangeDescription,
  getChangeLabelKey,
  SessionBlueprintDiff,
} from '@/models/blueprint-diff';
import { useTranslate } from '@tolgee/react';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import Check from '@/components/presentation/pixel/Check';
import { match } from 'ts-pattern';

interface SessionDiffViewProps {
  diff: SessionBlueprintDiff;
  onSelectedDiffChange: (selectedDiff: SessionBlueprintDiff) => void;
}

export default function SessionDiffView({
  diff: fullDiff,
  onSelectedDiffChange,
}: SessionDiffViewProps) {
  const { t } = useTranslate();

  // Track selected change IDs internally - default to all selected
  const [selectedChangeIds, setSelectedChangeIds] = useState<Set<string>>(
    () => new Set(fullDiff.allChanges.map((c) => c.id)),
  );

  // Reset selection when the diff changes
  useEffect(() => {
    setSelectedChangeIds(new Set(fullDiff.allChanges.map((c) => c.id)));
  }, [fullDiff]);

  // Compute the filtered diff based on selection
  const selectedDiff = filterDiff(fullDiff, selectedChangeIds);

  // Emit the selected diff when it changes
  useEffect(() => {
    onSelectedDiffChange(selectedDiff);
  }, [selectedDiff, onSelectedDiffChange]);

  const toggleChange = (changeId: string) => {
    setSelectedChangeIds((prev) => {
      const next = new Set(prev);
      if (next.has(changeId)) {
        next.delete(changeId);
      } else {
        next.add(changeId);
      }
      return next;
    });
  };

  if (!fullDiff.hasChanges) {
    return (
      <View style={{ padding: spacing[4] }}>
        <SurfaceText style={{ textAlign: 'center' }}>
          {t('plan.diff.no_changes.body')}
        </SurfaceText>
      </View>
    );
  }

  return (
    <View>
      {/* Session-level changes */}
      {fullDiff.sessionChanges.length > 0 && (
        <DiffSection title={t('plan.diff.section.session.title')}>
          {fullDiff.sessionChanges.map((change) => (
            <DiffChangeRow
              key={change.id}
              change={change}
              disabled={change.kind === 'sessionName'}
              selected={selectedChangeIds.has(change.id)}
              onToggle={() => toggleChange(change.id)}
            />
          ))}
        </DiffSection>
      )}

      {/* Added exercises */}
      {fullDiff.addedExercises.length > 0 && (
        <DiffSection title={t('plan.diff.section.added.title')}>
          {fullDiff.addedExercises.map((change) => (
            <DiffChangeRow
              key={change.id}
              change={change}
              selected={selectedChangeIds.has(change.id)}
              onToggle={() => toggleChange(change.id)}
              variant="added"
            />
          ))}
        </DiffSection>
      )}

      {/* Removed exercises */}
      {fullDiff.removedExercises.length > 0 && (
        <DiffSection title={t('plan.diff.section.removed.title')}>
          {fullDiff.removedExercises.map((change) => (
            <DiffChangeRow
              key={change.id}
              change={change}
              selected={selectedChangeIds.has(change.id)}
              onToggle={() => toggleChange(change.id)}
              variant="removed"
            />
          ))}
        </DiffSection>
      )}

      {/* Reordered exercises */}
      {fullDiff.reorderedExercises.length > 0 && (
        <DiffSection title={t('plan.diff.section.reordered.title')}>
          {fullDiff.reorderedExercises.map((change) => (
            <DiffChangeRow
              key={change.id}
              change={change}
              selected={selectedChangeIds.has(change.id)}
              onToggle={() => toggleChange(change.id)}
            />
          ))}
        </DiffSection>
      )}

      {/* Modified exercises */}
      {fullDiff.modifiedExercises.length > 0 && (
        <DiffSection title={t('plan.diff.section.modified.title')}>
          {fullDiff.modifiedExercises.map((mod) => (
            <ExerciseModificationGroup
              key={mod.exerciseName}
              modification={mod}
              selectedChangeIds={selectedChangeIds}
              onToggleChange={toggleChange}
            />
          ))}
        </DiffSection>
      )}
    </View>
  );
}

interface DiffSectionProps {
  title: string;
  children: React.ReactNode;
}

function DiffSection({ title, children }: DiffSectionProps) {
  return (
    <View>
      <View
        style={{
          paddingVertical: spacing[2],
        }}
      >
        <Text variant="titleSmall">{title}</Text>
      </View>
      {children}
    </View>
  );
}

interface DiffChangeRowProps {
  change: DiffChange;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
  variant?: 'added' | 'removed' | 'modified';
}

function DiffChangeRow({
  change,
  selected,
  onToggle,
  disabled,
  variant,
}: DiffChangeRowProps) {
  const { t } = useTranslate();
  const theme = useAppTheme();

  const description = getChangeDescription(change);
  const label = getChangeLabelKey(change);

  const variantColor = match(variant)
    .with('added', () => theme.colors.tertiary)
    .with('removed', () => theme.colors.error)
    .otherwise(() => undefined);

  return (
    <ListItem
      disabled={disabled}
      onPress={onToggle}
      title={t(label.key, label.params)}
      titleColor={variantColor}
      description={t(description.key, description.params)}
      leading={<Check kind="checkbox" disabled={disabled} checked={selected} />}
    />
  );
}

interface ExerciseModificationGroupProps {
  modification: ExerciseModification;
  selectedChangeIds: Set<string>;
  onToggleChange: (changeId: string) => void;
}

function ExerciseModificationGroup({
  modification,
  selectedChangeIds,
  onToggleChange,
}: ExerciseModificationGroupProps) {
  return (
    <View>
      <AsciiDivider label={modification.exerciseName} />
      {modification.changes.map((change) => (
        <DiffChangeRow
          key={change.id}
          change={change}
          selected={selectedChangeIds.has(change.id)}
          onToggle={() => onToggleChange(change.id)}
        />
      ))}
    </View>
  );
}
