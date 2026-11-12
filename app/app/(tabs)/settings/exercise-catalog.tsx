import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import { headerOptions } from '@/components/presentation/pixel/AppHeader';
import Button from '@/components/presentation/pixel/Button';
import ListItem from '@/components/presentation/pixel/ListItem';
import PixelBox from '@/components/presentation/pixel/PixelBox';
import TextField from '@/components/presentation/pixel/TextField';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  catalogKey,
  displayName,
  label,
  loadCatalog,
  search,
  toDescriptor,
  type CatalogExercise,
} from '@/services/exercise-catalog';
import { useAppSelector } from '@/store';
import { selectExercises, updateExercise } from '@/store/stored-sessions';
import { type } from '@/theme/tokens';
import { useTolgee, useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Text } from 'react-native';
import { useDispatch } from 'react-redux';

/** F11: busca no catálogo do openGym (só texto) e copia um exercício por vez para a lista do usuário. */
export default function ExerciseCatalog() {
  const { t } = useTranslate();
  const lang = useTolgee(['language']).getLanguage() ?? 'en';
  const { palette } = useAppTheme();
  const dispatch = useDispatch();
  const saved = useAppSelector(selectExercises);
  const [catalog, setCatalog] = useState<CatalogExercise[] | 'error'>();
  const [query, setQuery] = useState('');

  useEffect(() => {
    loadCatalog().then(setCatalog, () => setCatalog('error'));
  }, []);

  const results = useMemo(
    () => (Array.isArray(catalog) ? search(catalog, query, 30) : []),
    [catalog, query],
  );
  const muted = { ...type.body, color: palette.text2 };

  return (
    <FullHeightScrollView
      contentContainerStyle={{ gap: 12, padding: 16, paddingBottom: 32 }}
    >
      <Stack.Screen options={headerOptions(t('catalog.title'))} />
      <TextField
        testID="catalog-search"
        label={t('catalog.search.label')}
        helper={t('catalog.search.hint')}
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
      />
      {catalog === undefined && (
        <Text style={muted}>{t('catalog.loading')}</Text>
      )}
      {catalog === 'error' && (
        <PixelBox tone="danger" padding={12}>
          <Text style={muted}>{t('catalog.error')}</Text>
        </PixelBox>
      )}
      {Array.isArray(catalog) && !!query.trim() && results.length === 0 && (
        <Text style={muted}>{t('catalog.empty')}</Text>
      )}
      {results.length > 0 && (
        <PixelBox padding={0}>
          {results.map((e) => {
            const key = catalogKey(e.id);
            return (
              <ListItem
                key={e.id}
                testID={`catalog-item-${e.id}`}
                title={displayName(e, lang)}
                description={`${label(e.target, lang)} · ${label(e.equipment, lang)}`}
                trailing={
                  key in saved ? (
                    <Text style={{ ...type.small, color: palette.success }}>
                      {t('catalog.added')}
                    </Text>
                  ) : (
                    <Button
                      variant="secondary"
                      icon="plus"
                      onPress={() =>
                        dispatch(
                          updateExercise({
                            id: key,
                            exercise: toDescriptor(e, lang),
                          }),
                        )
                      }
                    >
                      {t('catalog.add.button')}
                    </Button>
                  )
                }
              />
            );
          })}
        </PixelBox>
      )}
      <Text style={{ ...type.micro, color: palette.text3 }}>
        {t('catalog.credit')}
      </Text>
    </FullHeightScrollView>
  );
}
