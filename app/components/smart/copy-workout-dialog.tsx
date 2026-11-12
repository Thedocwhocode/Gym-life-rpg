import ListItem from '@/components/presentation/pixel/ListItem';
import { spacing } from '@/hooks/useAppTheme';
import { ProgramBlueprint, SessionBlueprint } from '@/models/blueprint-models';
import { useAppSelector } from '@/store';
import { showSnackbar } from '@/store/app';
import { addProgramSession, selectAllPrograms } from '@/store/program';
import { T, useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { Portal, Text } from 'react-native-paper';
import Dialog from '@/components/presentation/pixel/Dialog';
import Check from '@/components/presentation/pixel/Check';
import { useDispatch } from 'react-redux';
import Button from '@/components/presentation/gesture-wrappers/button';

type CopyWorkoutDialogProps = {
  visible: boolean;
  onDismiss: () => void;
  sessionBlueprint: SessionBlueprint;
  currentProgramId: string;
};

export default function CopyWorkoutDialog({
  visible,
  onDismiss,
  sessionBlueprint,
  currentProgramId,
}: CopyWorkoutDialogProps) {
  const dispatch = useDispatch();
  const { t } = useTranslate();
  const allPrograms = useAppSelector(selectAllPrograms);
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');

  // Filter out the current program from the list
  const otherPrograms = allPrograms.filter(({ id }) => id !== currentProgramId);

  const handleCopy = () => {
    if (selectedProgramId) {
      const targetProgram = allPrograms.find(
        ({ id }) => id === selectedProgramId,
      );

      dispatch(
        addProgramSession({
          programId: selectedProgramId,
          sessionBlueprint: sessionBlueprint,
        }),
      );

      dispatch(
        showSnackbar({
          text: t('workout.copied_to_plan.message', {
            planName: targetProgram?.program.name,
          }),
        }),
      );

      onDismiss();
      setSelectedProgramId(''); // Reset selection
    }
  };

  const renderProgramItem = ({
    item,
  }: {
    item: { id: string; program: ProgramBlueprint };
  }) => (
    <ListItem
      title={item.program.name}
      leading={
        <Check
          checked={selectedProgramId === item.id}
          onPress={() => setSelectedProgramId(item.id)}
        />
      }
      onPress={() => setSelectedProgramId(item.id)}
    />
  );

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>
          <T keyName="workout.copy_to_plan.button" />
        </Dialog.Title>
        <Dialog.Content>
          <View style={{ gap: spacing[2] }}>
            <Text variant="bodyMedium">
              <T
                keyName="workout.copy_to_plan.select_plan.label"
                params={{ workoutName: sessionBlueprint.name }}
              />
            </Text>
            {otherPrograms.length === 0 ? (
              <Text variant="bodyMedium" style={{ fontStyle: 'italic' }}>
                <T keyName="plan.no_other_available.message" />
              </Text>
            ) : (
              <View style={{ maxHeight: 200 }}>
                <FlatList
                  data={otherPrograms}
                  keyExtractor={(item) => item.id}
                  renderItem={renderProgramItem}
                />
              </View>
            )}
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>
            <T keyName="generic.cancel.button" />
          </Button>
          <Button
            onPress={handleCopy}
            disabled={!selectedProgramId || otherPrograms.length === 0}
          >
            <T keyName="generic.copy.button" />
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
