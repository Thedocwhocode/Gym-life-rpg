import ListItem from '@/components/presentation/pixel/ListItem';
import Switch from '@/components/presentation/pixel/Switch';
import { ReactNode } from 'react';

interface ListSwitchProps {
  headline: ReactNode;
  supportingText?: ReactNode;
  value: boolean;
  focus?: boolean;
  onValueChange: (value: boolean) => void;
  testID?: string;
  disabled?: boolean;
}

/** Linha de configuração com Switch pixel (a linha toda alterna). */
export default function ListSwitch(props: ListSwitchProps) {
  return (
    <ListItem
      testID={props.testID}
      title={props.headline}
      description={props.supportingText}
      focus={props.focus}
      disabled={props.disabled}
      onPress={() => props.onValueChange(!props.value)}
      checked={props.value}
      checkRole="switch"
      trailing={
        <Switch value={props.value} disabled={props.disabled} decorative />
      }
    />
  );
}
