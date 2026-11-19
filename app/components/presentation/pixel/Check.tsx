import Icon from '@/components/presentation/pixel/Icon';
import { useAppTheme } from '@/hooks/useAppTheme';
import { accentText } from '@/theme/palettes';
import { Pressable } from 'react-native';

/** Rádio ou checkbox pixel (24 px, alvo 44). Sem `onPress` vira só indicador. */
export default function Check({
  kind = 'radio',
  checked,
  onPress,
  disabled = false,
  accessibilityLabel,
  testID,
}: {
  kind?: 'radio' | 'checkbox';
  checked: boolean;
  onPress?: (() => void) | undefined;
  disabled?: boolean | undefined;
  /** Obrigatório na prática quando há `onPress`: o ícone sozinho não tem nome. */
  accessibilityLabel?: string | undefined;
  testID?: string | undefined;
}) {
  const { palette } = useAppTheme();
  const name =
    kind === 'radio'
      ? checked
        ? 'radio-on'
        : 'circle'
      : // pixelarticons: `checkbox` é o quadrado marcado; `checkbox-on` é o vazio
        checked
        ? 'checkbox'
        : 'checkbox-on';
  return (
    <Pressable
      testID={testID}
      accessibilityRole={kind}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked, disabled }}
      // react-native-web ignora accessibilityState
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled || !onPress}
      // Sem onPress é só indicador: quem anuncia o estado é a linha (ListItem `checked`).
      importantForAccessibility={onPress ? 'auto' : 'no-hide-descendants'}
      accessibilityElementsHidden={!onPress}
      onPress={onPress}
      hitSlop={10}
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      <Icon
        name={name}
        size={24}
        color={checked ? accentText(palette) : palette.text3}
      />
    </Pressable>
  );
}
