import { Loader } from '@/components/presentation/loader';
import { SurfaceText } from '@/components/presentation/surface-text';
import { spacing } from '@/hooks/useAppTheme';
import { RemoteData } from '@/models/remote';
import { ReactNode } from 'react';
import { View } from 'react-native';
import { Icon } from 'react-native-paper';
import Button from '@/components/presentation/gesture-wrappers/button';
import { useTranslate } from '@tolgee/react';

interface RemoteProps<T> {
  value: RemoteData<T>;
  retry?: () => void;
  success: (value: T) => ReactNode;
  loading?: () => ReactNode;
  notAsked?: () => ReactNode;
  error?: (err: unknown) => ReactNode;
}
export function Remote<T>(props: RemoteProps<T>) {
  const { success, retry } = props;
  const { t } = useTranslate();
  let { error, loading, notAsked } = props;
  loading ??= () => <Loader />;
  notAsked ??= loading;
  error ??= (value) => (
    <View style={{ alignItems: 'center', gap: spacing[4] }}>
      <Icon source={'error'} size={30} />
      <View style={{ justifyContent: 'center' }}>
        <SurfaceText style={{ textAlign: 'center' }}>
          {typeof value === 'string' ? value : t('generic.unknown_error.body')}
        </SurfaceText>
        {retry ? (
          <Button onPress={retry}>{t('generic.retry.button')}</Button>
        ) : undefined}
      </View>
    </View>
  );
  return props.value.match({
    notAsked,
    loading,
    error,
    success,
  });
}
