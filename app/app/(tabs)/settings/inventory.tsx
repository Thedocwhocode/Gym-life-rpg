import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import AsciiDivider from '@/components/presentation/pixel/AsciiDivider';
import Button from '@/components/presentation/pixel/Button';
import Icon from '@/components/presentation/pixel/Icon';
import PixelBox from '@/components/presentation/pixel/PixelBox';
import Portrait from '@/components/presentation/pixel/Portrait';
import Tag, { type TagTone } from '@/components/presentation/pixel/Tag';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { equipItem, unequipItem } from '@/store/choices';
import { selectJourney } from '@/store/journey';
import { BESTIARY } from '@/store/journey/rules/bestiary';
import {
  ITEMS,
  SLOTS,
  type Item,
  type Rarity,
} from '@/store/journey/rules/items';
import { type } from '@/theme/tokens';
import { TranslationKey, useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';

const BAG = 15;
const RARITY_TONE: Record<Rarity, TagTone> = {
  comum: 'muted',
  raro: 'dex',
  epico: 'reward',
};

function ItemCell({
  item,
  label,
  selected = false,
  equipped = false,
  onPress,
  size,
  testID,
}: {
  item: Item | undefined;
  label: string;
  selected?: boolean;
  equipped?: boolean;
  onPress?: () => void;
  size: number;
  testID?: string | undefined;
}) {
  const { palette } = useAppTheme();
  const { t } = useTranslate();
  const color =
    item?.rarity === 'epico'
      ? palette.reward
      : item?.rarity === 'raro'
        ? palette.attrDex
        : palette.text2;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      aria-selected={selected}
      aria-disabled={!item}
      aria-label={item ? t(`rpg.item.${item.id}` as TranslationKey) : label}
      disabled={!item}
      onPress={onPress}
    >
      <PixelBox
        tone={equipped ? 'success' : 'sunken'}
        borderColor={selected ? palette.lineFocus : undefined}
        steps={1}
        style={{ width: size, height: size }}
        innerStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        {item ? (
          <Icon name="gift" size={24} color={color} />
        ) : (
          <Text
            numberOfLines={1}
            style={{ ...type.micro, color: palette.text3 }}
          >
            {label}
          </Text>
        )}
      </PixelBox>
    </Pressable>
  );
}

/** Inventário (D7): só itens dos drops do bestiário; equipar é escolha datada. */
export default function Inventory() {
  const { t } = useTranslate();
  const { palette } = useAppTheme();
  const dispatch = useDispatch();
  const { drops, itemsEquipped } = useAppSelector(selectJourney);
  const owned = ITEMS.filter((i) => drops.includes(i.id));
  const [picked, setPicked] = useState<string>();
  const item = owned.find((i) => i.id === picked);
  const isOn = (id: string) => itemsEquipped.includes(id);
  const inSlot = (s: string) => owned.find((i) => i.slot === s && isOn(i.id));
  const origin = (id: string) => BESTIARY.find((b) => b.drop === id)?.id;

  return (
    <FullHeightScrollView
      contentContainerStyle={{ gap: 16, padding: 16, paddingBottom: 32 }}
    >
      <Stack.Screen options={{ title: t('rpg.journey.inventory') }} />
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <Portrait label={t('rpg.sheet.portrait')} width={120} height={152} />
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            alignContent: 'flex-start',
          }}
        >
          {SLOTS.map((s) => {
            const on = inSlot(s);
            return (
              <ItemCell
                key={s}
                testID={`slot-${s}`}
                item={on}
                label={t(`rpg.slot.${s}` as TranslationKey)}
                equipped={!!on}
                selected={!!on && on.id === picked}
                onPress={() => on && setPicked(on.id)}
                size={52}
              />
            );
          })}
        </View>
      </View>
      <AsciiDivider
        label={t('rpg.inventory.bag', { n: owned.length, total: BAG })}
      />
      {owned.length === 0 && (
        <Text style={{ ...type.body, color: palette.text2 }}>
          {t('rpg.inventory.empty')}
        </Text>
      )}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {Array.from({ length: BAG }, (_, i) => owned[i]).map((it, i) => (
          <ItemCell
            key={it?.id ?? `empty-${i}`}
            testID={it ? `bag-${it.id}` : undefined}
            item={it}
            label=""
            selected={!!it && it.id === picked}
            equipped={!!it && isOn(it.id)}
            onPress={() => it && setPicked(it.id)}
            size={56}
          />
        ))}
      </View>
      {item && (
        <PixelBox
          testID="item-detail"
          tone="raised"
          padding={14}
          innerStyle={{ gap: 8 }}
        >
          <Text style={{ ...type.title, color: palette.text1 }}>
            {t(`rpg.item.${item.id}` as TranslationKey)}
          </Text>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            <Tag tone={RARITY_TONE[item.rarity]} size="sm">
              {t(`rpg.rarity.${item.rarity}` as TranslationKey)}
            </Tag>
            <Tag tone="muted" size="sm">
              {t(`rpg.slot.${item.slot}` as TranslationKey)}
            </Tag>
            {isOn(item.id) && (
              <Tag tone="success" size="sm">
                {t('rpg.inventory.equipped')}
              </Tag>
            )}
          </View>
          <Text
            style={{
              ...type.body,
              color: item.bonus ? palette.success : palette.text3,
            }}
          >
            {'▸ '}
            {item.bonus
              ? t(`rpg.bonus.${item.bonus.kind}`, { pct: item.bonus.pct })
              : t('rpg.inventory.cosmetic')}
          </Text>
          <Text style={{ ...type.micro, color: palette.text3 }}>
            {t('rpg.inventory.origin', {
              beast: t(`rpg.beast.${origin(item.id)}` as TranslationKey),
            })}
          </Text>
          <Button
            testID="item-toggle"
            variant={isOn(item.id) ? 'secondary' : 'primary'}
            onPress={() =>
              dispatch(
                isOn(item.id) ? unequipItem(item.id) : equipItem(item.id),
              )
            }
          >
            {t(isOn(item.id) ? 'rpg.inventory.unequip' : 'rpg.inventory.equip')}
          </Button>
        </PixelBox>
      )}
    </FullHeightScrollView>
  );
}
