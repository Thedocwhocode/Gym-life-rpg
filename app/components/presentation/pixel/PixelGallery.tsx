import AsciiBar from '@/components/presentation/pixel/AsciiBar';
import AsciiDivider from '@/components/presentation/pixel/AsciiDivider';
import AsciiFrame from '@/components/presentation/pixel/AsciiFrame';
import Button from '@/components/presentation/pixel/Button';
import Fab from '@/components/presentation/pixel/Fab';
import Icon from '@/components/presentation/pixel/Icon';
import IconButton from '@/components/presentation/pixel/IconButton';
import Num from '@/components/presentation/pixel/Num';
import PixelBar from '@/components/presentation/pixel/PixelBar';
import PixelBox, {
  type PixelTone,
} from '@/components/presentation/pixel/PixelBox';
import ListItem from '@/components/presentation/pixel/ListItem';
import Segmented from '@/components/presentation/pixel/Segmented';
import Switch from '@/components/presentation/pixel/Switch';
import Tabs from '@/components/presentation/pixel/Tabs';
import Tag from '@/components/presentation/pixel/Tag';
import TextField from '@/components/presentation/pixel/TextField';
import EmptyInfo from '@/components/presentation/empty-info';
import SelectButton from '@/components/presentation/select-button';
import { useAppTheme } from '@/hooks/useAppTheme';
import { PALETTE_IDS } from '@/theme/palettes';
import { fontFamily } from '@/theme/tokens';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Só desenvolvimento: mostra os primitivos do redesign (usada por settings/dev-gallery e pelo teste visual).
// Textos sem tradução de propósito: ninguém fora do desenvolvimento vê esta tela.

const TONES: PixelTone[] = [
  'default',
  'raised',
  'sunken',
  'accent',
  'danger',
  'success',
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View testID={`gallery-${id}`} style={styles.section}>
      <AsciiDivider label={title} />
      {children}
    </View>
  );
}

function ControlsDemo() {
  const [on, setOn] = useState(true);
  const [seg, setSeg] = useState<'todos' | 'forca' | 'cardio'>('todos');
  const [tab, setTab] = useState<'feed' | 'seguindo' | 'seguidores'>('feed');
  const [period, setPeriod] = useState(30);
  const [text, setText] = useState('');
  return (
    <>
      <View style={styles.row}>
        <Switch value={on} onValueChange={setOn} label="Demo" />
        <Switch value={false} disabled label="Desligado" />
      </View>
      <Segmented
        value={seg}
        onChange={setSeg}
        options={[
          { value: 'todos', label: 'Todos' },
          { value: 'forca', label: 'Força' },
          { value: 'cardio', label: 'Cardio' },
        ]}
      />
      <SelectButton
        value={period}
        onChange={setPeriod}
        options={[
          { value: 7, label: '7 dias' },
          { value: 30, label: '30 dias' },
          { value: 90, label: '90 dias' },
        ]}
      />
      <TextField
        label="Buscar exercício"
        prefix="⌕"
        value={text}
        onChangeText={setText}
        placeholder="Agachamento"
      />
      <TextField
        label="Endpoint"
        value="http://x"
        error="O endpoint precisa começar com https://"
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'feed', label: 'Feed' },
          { value: 'seguindo', label: 'Seguindo' },
          { value: 'seguidores', label: 'Seguidores', badge: 1 },
        ]}
      />
      <View>
        <ListItem
          icon="list-box"
          title="Gerenciar planos"
          description="Planos e treinos"
          onPress={() => undefined}
        />
        <ListItem
          icon="briefcase"
          title="Inventário"
          meta="3/20"
          onPress={() => undefined}
        />
        <ListItem
          icon="trash"
          title="Apagar dados"
          danger
          onPress={() => undefined}
        />
      </View>
      <EmptyInfo icon="calendar">Nada registrado neste mês</EmptyInfo>
    </>
  );
}

export default function PixelGallery() {
  const { palette } = useAppTheme();
  return (
    <View style={styles.root}>
      <Section id="palette" title="Paleta ativa">
        <View style={styles.row}>
          {(
            [
              'bgApp',
              'surface1',
              'surface2',
              'surface3',
              'accent',
              'danger',
              'success',
              'reward',
            ] as const
          ).map((key) => (
            <View key={key} style={styles.swatch}>
              <View
                style={[
                  styles.chip,
                  { backgroundColor: palette[key], borderColor: palette.line2 },
                ]}
              />
              <Text style={[styles.caption, { color: palette.text3 }]}>
                {key}
              </Text>
            </View>
          ))}
        </View>
        <Text style={[styles.caption, { color: palette.text3 }]}>
          {PALETTE_IDS.join(' · ')} — ativa: {palette.id}
        </Text>
      </Section>

      <Section id="pixelbox" title="PixelBox">
        <View style={styles.row}>
          {TONES.map((tone) => (
            <PixelBox key={tone} tone={tone} style={styles.box}>
              <Text style={[styles.caption, { color: palette.text1 }]}>
                {tone}
              </Text>
            </PixelBox>
          ))}
          <PixelBox shadow style={styles.box}>
            <Text style={[styles.caption, { color: palette.text1 }]}>
              sombra
            </Text>
          </PixelBox>
          <PixelBox glow tone="accent" style={styles.box}>
            <Text style={[styles.caption, { color: palette.reward }]}>
              recompensa
            </Text>
          </PixelBox>
          <PixelBox steps={3} tone="raised" style={styles.box}>
            <Text style={[styles.caption, { color: palette.text1 }]}>
              diálogo
            </Text>
          </PixelBox>
        </View>
      </Section>

      <Section id="ascii" title="Ascii">
        <AsciiFrame title="Ficha">
          <Text
            style={{
              fontFamily: fontFamily.mono,
              fontSize: 13,
              color: palette.text1,
            }}
          >
            Conteúdo dentro da moldura N1
          </Text>
        </AsciiFrame>
        <AsciiDivider label="Centro" align="center" />
        <AsciiDivider label="Esquerda" meta="3/5" />
        <AsciiBar value={0.72} label="XP" />
        <AsciiBar value={0.4} tone="energy" label="ENERGIA" />
      </Section>

      <Section id="bars" title="PixelBar">
        <PixelBar value={0.72} label="XP" />
        <PixelBar value={0.5} tone="energy" label="Energia" />
        <PixelBar value={0.25} tone="hp" label="Vida" />
        <PixelBar value={1} tone="reward" segments={10} label="Recompensa" />
      </Section>

      <Section id="tags" title="Tag e Num">
        <View style={styles.row}>
          <Tag>120 kg</Tag>
          <Tag tone="reward" brackets={false}>
            +50 XP
          </Tag>
          <Tag tone="success">ok</Tag>
          <Tag tone="danger">falhou</Tag>
          <Tag tone="muted" size="sm">
            nota
          </Tag>
          <Tag tone="str">STR</Tag>
          <Tag tone="dex">DEX</Tag>
          <Tag tone="con">CON</Tag>
          <Tag tone="sta">STA</Tag>
        </View>
        <Num size={40}>1.234</Num>
      </Section>

      <Section id="buttons" title="Button, IconButton e Fab">
        <View style={styles.row}>
          <Button variant="primary" icon="plus">
            Primário
          </Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="danger" icon="trash">
            Perigo
          </Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Desativado</Button>
        </View>
        <View style={styles.row}>
          <Button size="sm">Pequeno</Button>
          <Button size="lg" iconRight="chevron-right">
            Grande
          </Button>
        </View>
        <View style={styles.row}>
          <IconButton icon="plus" label="Adicionar" />
          <IconButton icon="edit" label="Editar" variant="secondary" />
          <IconButton icon="heart" label="Favorito" active />
          <IconButton icon="play" label="Iniciar" variant="primary" />
          <IconButton icon="trash" label="Apagar" variant="danger" />
        </View>
        <Fab label="Novo treino" />
      </Section>

      <Section id="icons-sizes" title="Icon">
        <View style={styles.row}>
          <Icon name="trophy" size={24} color={palette.reward} />
          <Icon name="trophy" size={48} color={palette.reward} />
          <Icon name="heart" size={24} color={palette.danger} />
          <Icon name="zap" size={24} color={palette.accent} />
        </View>
      </Section>

      <Section id="controls" title="Controles">
        <ControlsDemo />
      </Section>

      <Section id="toast" title="Toast">
        <PixelBox shadow tone="raised" steps={2} padding={0}>
          <View style={styles.toast}>
            <Icon name="check" size={24} color={palette.success} />
            <Text
              style={{
                fontFamily: fontFamily.mono,
                fontSize: 13,
                color: palette.text1,
                flex: 1,
              }}
            >
              Treino salvo
            </Text>
            <Tag tone="reward" brackets={false}>
              +50 XP
            </Tag>
          </View>
        </PixelBox>
      </Section>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 20 },
  section: { gap: 12 },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
  },
  box: { minWidth: 88 },
  swatch: { alignItems: 'center', gap: 4 },
  chip: { width: 40, height: 40, borderWidth: 1 },
  caption: { fontFamily: fontFamily.mono, fontSize: 10 },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
});
