import type { JSX } from 'react';
import { SvgXml } from 'react-native-svg';
import { IconProps } from 'react-native-paper/lib/typescript/components/MaterialCommunityIcon';
import Icon from '@/components/presentation/pixel/Icon';
import {
  PixelIconKey,
  resolvePixelIcon,
} from '@/components/presentation/pixel-icon-map';
import plusMinus from '../../assets/math-plus-minus.svg';

const CustomIcons = {
  plusMinus: plusMinus,
};

export type AppIconSource =
  | PixelIconKey
  | keyof typeof CustomIcons
  | (() => JSX.Element);

/** Ícone do app: nomes Material legados desenhados com Pixelarticons (redesign F1). */
export function MsIconSrc({ name, ...rest }: IconProps) {
  if ((name as keyof typeof CustomIcons) in CustomIcons) {
    return (
      <SvgXml
        width={rest.size}
        stroke={rest.color ?? 'white'}
        height={rest.size}
        fill={rest.color ?? 'white'}
        xml={CustomIcons[name as keyof typeof CustomIcons]}
        {...rest}
      />
    );
  }
  const { name: pixelName, rotate } = resolvePixelIcon(String(name));
  return (
    <Icon
      name={pixelName}
      size={rest.size}
      color={rest.color}
      rotate={rotate}
    />
  );
}
