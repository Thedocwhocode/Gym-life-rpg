import { ReactElement } from 'react';
import { Platform } from 'react-native';
import { Tooltip } from 'react-native-paper';

/**
 * Tooltip do Paper só no web (hover). No nativo ele embrulha o botão num Pressable sem rótulo,
 * que o TalkBack lê como um segundo foco; lá o `accessibilityLabel` do botão basta.
 */
export default function WebTooltip({
  title,
  children,
}: {
  title: string;
  children: ReactElement;
}) {
  return Platform.OS === 'web' ? (
    <Tooltip title={title}>{children}</Tooltip>
  ) : (
    children
  );
}
