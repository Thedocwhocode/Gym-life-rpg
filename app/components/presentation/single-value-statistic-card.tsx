import PixelBox from '@/components/presentation/pixel/PixelBox';
import { useAppTheme } from '@/hooks/useAppTheme';
import { type } from '@/theme/tokens';
import { ReactNode } from 'react';
import { Text } from 'react-native';

/** Card da grade 2×2 do Stats: rótulo em cima, valor grande embaixo. */
export default function SingleValueStatisticCard(props: {
  children: ReactNode;
  title: string;
}) {
  const { palette } = useAppTheme();
  return (
    <PixelBox
      padding={12}
      style={{ flex: 1 }}
      innerStyle={{ gap: 8, minHeight: 84, justifyContent: 'space-between' }}
    >
      <Text style={{ ...type.label, color: palette.text3 }}>{props.title}</Text>
      {props.children}
    </PixelBox>
  );
}
