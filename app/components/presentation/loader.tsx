import AsciiSkeleton from '@/components/presentation/pixel/AsciiSkeleton';
import { useTranslate } from '@tolgee/react';
import { ReactNode } from 'react';
import { View } from 'react-native';
interface LoaderProps {
  children?: ReactNode;
  loadingText?: string;
}
/** Carregamento: spinner ASCII (só aparece depois de 300 ms). */
export function Loader(props: LoaderProps) {
  const { t } = useTranslate();
  return (
    <View style={{ justifyContent: 'center', marginVertical: 'auto' }}>
      <AsciiSkeleton
        variant="spinner"
        label={props.loadingText ?? t('generic.loading.label')}
      />
      {props.children}
    </View>
  );
}
