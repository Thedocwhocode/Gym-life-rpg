import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader, {
  eyebrowOf,
} from '@/components/presentation/pixel/AppHeader';
import { useTranslate } from '@tolgee/react';

export default function MaterialStackHeader(props: NativeStackHeaderProps) {
  const { top } = useSafeAreaInsets();
  const { t } = useTranslate();
  const { options, navigation, back } = props;
  return (
    <AppHeader
      title={options.title ?? ''}
      eyebrow={eyebrowOf(options)}
      topInset={top}
      backLabel={t('generic.back.button')}
      onBack={back ? () => navigation.goBack() : undefined}
      actions={options.headerRight?.({ canGoBack: !!back })}
    />
  );
}
