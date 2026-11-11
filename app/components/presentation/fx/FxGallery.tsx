import AsciiDivider from '@/components/presentation/pixel/AsciiDivider';
import Button from '@/components/presentation/pixel/Button';
import { useAppTheme } from '@/hooks/useAppTheme';
import { type } from '@/theme/tokens';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import FxBurst from './FxBurst';
import FxStage from './FxStage';
import { UI_MOMENTS } from './moments';
import { FX_IDS, type FxId } from './registry';

// Só desenvolvimento (galeria): toca os 68 efeitos, testa o error boundary e a carga de 8 palcos
// (critério do spike, PLANO §3.6). Textos sem tradução de propósito.

const GROUPS = FX_IDS.reduce<Record<string, FxId[]>>((acc, id) => {
  (acc[id.split('/')[0]] ??= []).push(id);
  return acc;
}, {});

export default function FxGallery() {
  const { palette } = useAppTheme();
  const [fx, setFx] = useState<FxId>('ui/level-up');
  const [broken, setBroken] = useState(false);
  const [eight, setEight] = useState(false);
  const [burst, setBurst] = useState(0);

  return (
    <View testID="gallery-fx" style={{ gap: 12 }}>
      <AsciiDivider label={`Efeitos pixelfx (${FX_IDS.length})`} />
      <View style={{ alignItems: 'center', minHeight: 160 }}>
        <FxStage fx={fx} scale={2} testID="fx-stage" label={fx} />
        <Text style={[type.micro, { color: palette.text3 }]}>{fx}</Text>
        {burst > 0 && (
          // cada toque troca o momento e dispara de novo; some sozinho no fim
          <FxBurst
            {...[
              UI_MOMENTS.levelUp(),
              UI_MOMENTS.combo(burst, 'Combo'),
              UI_MOMENTS.quest('Missão concluída'),
            ][burst % 3]}
            playKey={burst}
          />
        )}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Button
          size="sm"
          variant="danger"
          testID="fx-break"
          onPress={() => setBroken(true)}
        >
          Efeito quebrado
        </Button>
        <Button
          size="sm"
          variant="secondary"
          testID="fx-eight"
          onPress={() => setEight((v) => !v)}
        >
          {eight ? 'Parar 8 palcos' : '8 palcos juntos'}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          testID="fx-burst"
          onPress={() => setBurst((n) => n + 1)}
        >
          Burst
        </Button>
      </View>
      {broken && (
        // id fora do registro: createStage lança e o FxBoundary tira o palco da tela
        <FxStage fx={'ui/quebrado' as FxId} testID="fx-stage-broken" />
      )}
      {eight && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
          {FX_IDS.filter((id) => id.startsWith('critters/'))
            .concat(['ui/quest-complete'])
            .slice(0, 8)
            .map((id) => (
              <FxStage key={id} fx={id} scale={1} />
            ))}
        </View>
      )}
      {Object.entries(GROUPS).map(([group, ids]) => (
        <View key={group} style={{ gap: 4 }}>
          <Text style={[type.label, { color: palette.text2 }]}>{group}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {ids.map((id) => (
              <Pressable
                key={id}
                testID={`fx-${id}`}
                accessibilityRole="button"
                accessibilityState={{ selected: id === fx }}
                onPress={() => setFx(id)}
                style={{
                  borderWidth: 1,
                  borderColor: id === fx ? palette.accent : palette.line2,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}
              >
                <Text
                  style={[
                    type.small,
                    { color: id === fx ? palette.accent : palette.text1 },
                  ]}
                >
                  {id.split('/')[1]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}
