import PixelBox from '@/components/presentation/pixel/PixelBox';
import { useAppTheme } from '@/hooks/useAppTheme';
import { steps, type } from '@/theme/tokens';
import { useState } from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

export interface TextFieldProps
  extends Omit<TextInputProps, 'style' | 'onChange'> {
  label?: string | undefined;
  error?: string | undefined;
  helper?: string | undefined;
  /** Glifo curto antes do valor (ex.: "⌕"). */
  prefix?: string | undefined;
  rows?: number | undefined;
}

/** Input pixel: rótulo em caixa alta, borda accent no foco e danger no erro. */
export default function TextField({
  label,
  error,
  helper,
  prefix,
  rows = 3,
  multiline,
  onFocus,
  onBlur,
  ...input
}: TextFieldProps) {
  const { palette } = useAppTheme();
  const [focused, setFocused] = useState(false);
  const edge = error
    ? palette.danger
    : focused
      ? palette.accent
      : palette.line2;
  return (
    <View style={{ gap: 6 }}>
      {!!label && (
        <Text
          style={{
            ...type.label,
            color: error
              ? palette.danger
              : focused
                ? palette.accent
                : palette.text2,
          }}
        >
          {label}
        </Text>
      )}
      <PixelBox
        steps={steps.control}
        padding={0}
        borderColor={edge}
        fillColor={palette.bgSunken}
        innerStyle={{
          flexDirection: 'row',
          alignItems: multiline ? 'flex-start' : 'center',
          minHeight: multiline ? 22 * rows + 20 : 40,
          paddingHorizontal: 12,
          gap: 8,
        }}
      >
        {!!prefix && (
          <Text style={{ ...type.bodyLg, color: palette.text3 }}>{prefix}</Text>
        )}
        <TextInput
          {...input}
          accessibilityLabel={input.accessibilityLabel ?? label}
          multiline={multiline}
          numberOfLines={multiline ? rows : 1}
          placeholderTextColor={palette.text3}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={
            {
              ...type.bodyLg,
              flex: 1,
              minWidth: 0,
              color: palette.text1,
              paddingVertical: 9,
              textAlignVertical: multiline ? 'top' : 'center',
              // ponytail: o anel de foco nativo do navegador some; a borda accent faz esse papel.
              outlineStyle: 'none',
            } as object
          }
        />
      </PixelBox>
      {!!(error ?? helper) && (
        <Text
          style={{
            ...type.small,
            color: error ? palette.danger : palette.text3,
          }}
        >
          {error ?? helper}
        </Text>
      )}
    </View>
  );
}
