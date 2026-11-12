import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import SkillCard from '@/components/presentation/journey/SkillCard';
import { headerOptions } from '@/components/presentation/pixel/AppHeader';
import AsciiDivider from '@/components/presentation/pixel/AsciiDivider';
import Button from '@/components/presentation/pixel/Button';
import Segmented from '@/components/presentation/pixel/Segmented';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { equipSkill, learnSkill, type RpgClass } from '@/store/choices';
import { selectJourney } from '@/store/journey';
import {
  reqProgress,
  SCHOOLS,
  SKILLS,
  skillState,
  type School,
} from '@/store/journey/rules/skills';
import { type } from '@/theme/tokens';
import { useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useDispatch } from 'react-redux';

const SCHOOL_OF: Record<RpgClass, School> = {
  warrior: 'aco',
  scout: 'vento',
  paladin: 'luz',
};
const SCHOOL_META: Record<School, { attr: string; cls?: RpgClass }> = {
  aco: { attr: 'STR', cls: 'warrior' },
  vento: { attr: 'DEX', cls: 'scout' },
  luz: { attr: 'CON', cls: 'paladin' },
  arcano: { attr: 'INT' },
};

/** Grimório (D6): escola → skill selecionada (anima) → CTA → árvore compacta. */
export default function Grimoire() {
  const { t } = useTranslate();
  const { palette } = useAppTheme();
  const dispatch = useDispatch();
  const j = useAppSelector(selectJourney);
  const [school, setSchool] = useState<School>(
    j.rpgClass ? SCHOOL_OF[j.rpgClass] : 'aco',
  );
  const inSchool = SKILLS.filter((s) => s.school === school);
  const [picked, setPicked] = useState<string>();
  const skill = inSchool.find((s) => s.id === picked) ?? inSchool[0];
  const ctx = {
    stats: j.stats,
    rpgClass: j.rpgClass,
    learned: j.learned,
    equipped: j.equipped,
  };
  const stateOf = (id: string) =>
    skillState(SKILLS.find((s) => s.id === id)!, ctx);
  const known = SKILLS.filter((s) =>
    ['learned', 'equipped'].includes(stateOf(s.id)),
  ).length;
  const state = stateOf(skill.id);
  const meta = SCHOOL_META[school];

  return (
    <FullHeightScrollView
      contentContainerStyle={{ gap: 16, padding: 16, paddingBottom: 32 }}
    >
      <Stack.Screen
        options={headerOptions(
          t('rpg.journey.grimoire'),
          t('rpg.grimoire.eyebrow', { n: known }),
        )}
      />
      <Segmented
        testID="grimoire-school"
        value={school}
        onChange={(s) => {
          setSchool(s);
          setPicked(undefined);
        }}
        options={SCHOOLS.map((s) => ({
          value: s,
          label: t(`rpg.school.${s}`),
          testID: `school-${s}`,
        }))}
      />
      <Text style={{ ...type.small, color: palette.text2 }}>
        {t('rpg.grimoire.school_line', {
          attr: meta.attr,
          class: meta.cls
            ? t(`rpg.class.${meta.cls}`)
            : t('rpg.grimoire.everyone'),
        })}
        {' — '}
        {t(`rpg.school.${school}.blurb`)}
      </Text>
      <SkillCard
        skill={skill}
        state={state}
        progress={reqProgress(skill.req, j.stats, j.rpgClass)}
      />
      {state === 'available' && (
        <Button
          testID="skill-learn"
          icon="book-open"
          onPress={() => dispatch(learnSkill(skill.id))}
        >
          {t('rpg.skill.learn')}
        </Button>
      )}
      {state === 'learned' && (
        <Button
          testID="skill-equip"
          variant="secondary"
          icon="zap"
          onPress={() => dispatch(equipSkill(skill.id))}
        >
          {t('rpg.skill.equip')}
        </Button>
      )}
      <AsciiDivider
        label={t('rpg.grimoire.tree', { school: t(`rpg.school.${school}`) })}
      />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {inSchool.map((s) => (
          <View key={s.id} style={{ width: '48%', flexGrow: 1 }}>
            <SkillCard
              variant="compact"
              skill={s}
              state={stateOf(s.id)}
              progress={reqProgress(s.req, j.stats, j.rpgClass)}
              selected={s.id === skill.id}
              onPress={() => setPicked(s.id)}
            />
          </View>
        ))}
      </View>
    </FullHeightScrollView>
  );
}
