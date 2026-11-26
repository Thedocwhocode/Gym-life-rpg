import Button from '@/components/presentation/pixel/Button';
import ListItem from '@/components/presentation/pixel/ListItem';
import Segmented from '@/components/presentation/pixel/Segmented';
import Tag, {
  tagColor,
  type TagTone,
} from '@/components/presentation/pixel/Tag';
import TextField from '@/components/presentation/pixel/TextField';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  catalogKey,
  label,
  loadCatalog,
  toDescriptor,
  type CatalogExercise,
} from '@/services/exercise-catalog';
import { useAppSelector } from '@/store';
import type { AttrKey } from '@/store/journey/rules/attributes';
import {
  BODY_ATTRS,
  filterEntries,
  PATTERNS,
  pickerEntry,
  type PatternKey,
  type PickerEntry,
} from '@/store/journey/rules/patterns';
import {
  selectExercises,
  updateExercise,
  type ExerciseDescriptor,
} from '@/store/stored-sessions';
import { type } from '@/theme/tokens';
import { useTolgee, useTranslate } from '@tolgee/react';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';

const PAGE = 30;

interface Entry extends PickerEntry {
  descriptor: ExerciseDescriptor;
  saved: boolean;
  meta: string;
}

function toEntry(
  key: string,
  d: ExerciseDescriptor,
  saved: boolean,
  lang: string,
  extraNames: string[] = [],
): Entry {
  const muscles = d.muscles.map((m) => label(m, lang));
  return {
    // nomes em pt e en + músculos traduzidos: "peito" acha "pectorals"
    ...pickerEntry(key, [d.name, ...extraNames, ...muscles], d),
    descriptor: d,
    saved,
    meta: [
      muscles.slice(0, 2).join(', '),
      d.equipment && label(d.equipment, lang),
    ]
      .filter(Boolean)
      .join(' · '),
  };
}

/** Seletor do design v1.2: biblioteca + catálogo openGym, busca sem acento, filtro por atributo e padrão. */
export default function ExercisePicker({
  onSelect,
}: {
  onSelect: (exercise: ExerciseDescriptor) => void;
}) {
  const { t } = useTranslate();
  const { palette } = useAppTheme();
  const lang = useTolgee(['language']).getLanguage() ?? 'en';
  const saved = useAppSelector(selectExercises);
  const dispatch = useDispatch();
  const [catalog, setCatalog] = useState<CatalogExercise[] | 'error'>();
  const [q, setQ] = useState('');
  const [attr, setAttr] = useState<AttrKey | 'all'>('all');
  const [pattern, setPattern] = useState<PatternKey>();
  const [shown, setShown] = useState(PAGE);

  useEffect(() => {
    loadCatalog().then(setCatalog, () => setCatalog('error'));
  }, []);

  const entries = useMemo(() => {
    const lib = Object.entries(saved).map(([key, d]) =>
      toEntry(key, d, true, lang),
    );
    const og = Array.isArray(catalog)
      ? catalog
          .filter((e) => !(catalogKey(e.id) in saved))
          .map((e) =>
            toEntry(catalogKey(e.id), toDescriptor(e, lang), false, lang, [
              e.name,
              e.namePt,
            ]),
          )
      : [];
    return [...lib, ...og];
  }, [saved, catalog, lang]);

  const found = useMemo(
    () =>
      filterEntries(entries, {
        q,
        pattern,
        attr: attr === 'all' ? undefined : attr,
      }),
    [entries, q, pattern, attr],
  );

  // filtro novo volta para a primeira página
  const reset =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v);
      setShown(PAGE);
    };

  const pick = (e: Entry) => {
    // do catálogo: entra na biblioteca com a chave og:<id>, como na tela do catálogo
    if (!e.saved)
      dispatch(updateExercise({ id: e.key, exercise: e.descriptor }));
    onSelect(e.descriptor);
  };

  const rest = found.length - shown;
  return (
    <View style={{ gap: 12, paddingBottom: 24 }} testID="exercise-picker">
      <View style={{ gap: 12, paddingHorizontal: 16 }}>
        <TextField
          testID="exercise-picker-search"
          prefix="⌕"
          value={q}
          onChangeText={reset(setQ)}
          placeholder={t('picker.search')}
          accessibilityLabel={t('picker.search')}
          autoCorrect={false}
        />
        <Segmented
          testID="exercise-picker-attr"
          value={attr}
          onChange={reset(setAttr)}
          options={[
            { value: 'all', label: t('picker.all') },
            ...BODY_ATTRS.map((k) => ({
              value: k,
              label: k,
              testID: `exercise-picker-attr-${k}`,
            })),
          ]}
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
        accessibilityLabel={t('picker.pattern')}
      >
        {PATTERNS.map((k) => (
          <Button
            key={k}
            size="sm"
            variant={pattern === k ? 'primary' : 'secondary'}
            onPress={() => reset(setPattern)(pattern === k ? undefined : k)}
            accessibilityLabel={`${t(`rpg.pattern.${k}`)}${pattern === k ? ` (${t('picker.active')})` : ''}`}
            testID={`exercise-picker-pattern-${k}`}
          >
            {`${k} · ${t(`rpg.pattern.${k}`)}`}
          </Button>
        ))}
      </ScrollView>
      <Text
        accessibilityLiveRegion="polite"
        aria-live="polite"
        style={{ ...type.label, color: palette.text3, paddingHorizontal: 16 }}
        testID="exercise-picker-count"
      >
        {catalog === undefined
          ? t('picker.loading')
          : t('picker.found', { count: found.length })}
      </Text>
      <View>
        {found.slice(0, shown).map((e) => {
          const tone = e.attr.toLowerCase() as TagTone;
          return (
            <ListItem
              key={e.key}
              testID={`exercise-picker-item-${e.key}`}
              onPress={() => pick(e)}
              leading={
                <View
                  style={{
                    width: 48,
                    height: 48,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: palette.line1,
                    backgroundColor: palette.surface2,
                  }}
                >
                  <Text
                    style={{ ...type.label, color: tagColor(palette, tone) }}
                  >
                    {e.pattern}
                  </Text>
                </View>
              }
              title={e.name}
              description={[t(`rpg.pattern.${e.pattern}`), e.meta]
                .filter(Boolean)
                .join(' · ')}
              meta={e.saved ? t('picker.saved') : undefined}
              trailing={<Tag tone={tone}>{e.attr}</Tag>}
            />
          );
        })}
      </View>
      {rest > 0 && (
        <View style={{ paddingHorizontal: 16 }}>
          <Button
            variant="ghost"
            block
            onPress={() => setShown(shown + PAGE)}
            testID="exercise-picker-more"
          >
            {t('picker.more', { count: Math.min(rest, PAGE) })}
          </Button>
        </View>
      )}
    </View>
  );
}
