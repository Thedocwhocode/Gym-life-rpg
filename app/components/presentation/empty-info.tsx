import Icon from '@/components/presentation/pixel/Icon';
import { resolvePixelIcon } from '@/components/presentation/pixel-icon-map';
import { useAppTheme } from '@/hooks/useAppTheme';
import { type } from '@/theme/tokens';
import { Text, View, ViewProps } from 'react-native';

/** Estado vazio: ícone pixel 48 em text-3 e texto centralizado. */
export default function EmptyInfo(props: ViewProps & { icon?: string }) {
  const { icon, style, children, ...rest } = props;
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
        color={palette.text3}
      />
      <Text style={{ ...type.body, color: palette.text2, textAlign: 'center' }}>
        {children}
      </Text>
    </View>
  );
}
