import Check from '@/components/presentation/pixel/Check';

export interface SakugaCheckProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Nome lido pelo leitor de tela (o quadrado não tem texto visível). */
  label: string;
  testID?: string | undefined;
}

/** Fora do web (e nos testes): o checkbox pixel. A versão web é `SakugaCheck.web.tsx`. */
export default function SakugaCheck({
  checked,
  onChange,
  label,
  testID,
}: SakugaCheckProps) {
  return (
    <Check
      kind="checkbox"
      checked={checked}
      onPress={() => onChange(!checked)}
      accessibilityLabel={label}
      testID={testID}
    />
  );
}
