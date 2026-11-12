import Icon from '@/components/presentation/pixel/Icon';
import { resolvePixelIcon } from '@/components/presentation/pixel-icon-map';
import { useAppTheme } from '@/hooks/useAppTheme';
import { type, TITLE_MAX_SCALE } from '@/theme/tokens';
import { ReactNode } from 'react';
import { Text, View, ViewProps } from 'react-native';

/** Estado vazio (EmptyState): ícone pixel 48, título opcional, texto e ação opcional. */
export default function EmptyInfo(
  props: ViewProps & { icon?: string; title?: string; action?: ReactNode },
) {
  const { icon, title, action, style, children, ...rest } = props;
  const { palette } = useAppTheme();
  const glyph = resolvePixelIcon(icon ?? 'info');
  return (
    <View
      {...rest}
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 16,
          paddingVertical: 24,
          gap: 12,
        },
        style,
      ]}
    >
      <Icon
        name={glyph.name}
        rotate={glyph.rotate}
        size={48}
        color={palette.line2}
      />
      {title ? (
        <Text
          maxFontSizeMultiplier={TITLE_MAX_SCALE}
          style={{ ...type.titleSm, color: palette.text2, textAlign: 'center' }}
        >
          {title}
        </Text>
      ) : null}
      <Text
        style={{
          ...(title ? type.small : type.body),
          color: title ? palette.text3 : palette.text2,
          textAlign: 'center',
          maxWidth: 280,
        }}
      >
        {children}
      </Text>
      {action}
    </View>
  );
}
