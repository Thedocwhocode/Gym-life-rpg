import { SurfaceText } from '@/components/presentation/surface-text';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Session } from '@/models/session-models';
import { useAppSelector } from '@/store';
import { getDateOnDay } from '@/utils/format-date';
import { DayOfWeek, LocalDate, Year, YearMonth } from '@js-joda/core';
import Enumerable from 'linq';
import { I18nManager, View } from 'react-native';
import IconButton from '@/components/presentation/pixel/IconButton';
import PixelBox from '@/components/presentation/pixel/PixelBox';
import { size, steps, type, TITLE_MAX_SCALE } from '@/theme/tokens';
import { useTranslate } from '@tolgee/react';
import TouchableRipple from '@/components/presentation/gesture-wrappers/touchable-ripple';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { ReactNode } from 'react';
import { useFormatDate } from '@/hooks/useFormatDate';

interface HistoryCalendarCardProps {
  currentYearMonth: YearMonth;
  sessions: Session[];

  onMonthChange: (date: YearMonth) => void;
  onDateSelect: (date: LocalDate) => void;
  onSessionSelect: (Session: Session) => void;
  onDeleteSession: (session: Session) => void;
}

export default function HistoryCalendarCard({
  currentYearMonth,
  sessions,
  onMonthChange,
  onDateSelect,
  onSessionSelect,
  onDeleteSession,
}: HistoryCalendarCardProps) {
  const firstDayOfMonth = LocalDate.of(
    currentYearMonth.year(),
    currentYearMonth.month(),
    1,
  );
  const formatDate = useFormatDate();
  const { t } = useTranslate();
  const { palette } = useAppTheme();
  const dayOfFirstDayOfTheMonth = firstDayOfMonth.dayOfWeek().value();
  const firstDayOfWeek = useAppSelector((x) => x.settings.firstDayOfWeek);
  const numberOfDaysToShowFromPreviousMonth =
    (dayOfFirstDayOfTheMonth - firstDayOfWeek.value() + 7) % 7;
  const numberOfDaysToShowFromNextMonth =
    (7 -
      ((numberOfDaysToShowFromPreviousMonth +
        currentYearMonth.lengthOfMonth()) %
        7)) %
    7;
  const disableNextMonth = currentYearMonth.equals(YearMonth.now());

  const sessionsByDate = Enumerable.from(sessions).toLookup((x) =>
    x.date.toString(),
  );

  const previousMonth = () => {
    onMonthChange(currentYearMonth.minusMonths(1));
  };
  const nextMonth = () => {
    onMonthChange(currentYearMonth.plusMonths(1));
  };

  const handleDayPress = (date: LocalDate) => {
    const sessionsForDate = sessionsByDate.get(date.toString());
    if (sessionsForDate.any()) {
      onSessionSelect(sessionsForDate.first());
    } else {
      onDateSelect(date);
    }
  };
  const handleDayLongPress = (date: LocalDate) => {
    const sessionsForDate = sessionsByDate.get(date.toString());
    if (sessionsForDate.any()) {
      onDeleteSession(sessionsForDate.first());
    }
  };

  const navButtons = (
    <ForceLTRRow>
      <IconButton
        testID="calendar-nav-previous-month"
        icon="chevron-left"
        label={t('rpg.calendar.previous')}
        onPress={previousMonth}
      />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <SurfaceText
          maxFontSizeMultiplier={TITLE_MAX_SCALE}
          testID="calendar-month"
          style={{
            ...type.titleSm,
            color: palette.text1,
            textTransform: 'uppercase',
          }}
        >
          {formatDate(firstDayOfMonth, {
            month: 'long',
            year:
              currentYearMonth.year() === Year.now().value()
                ? undefined
                : 'numeric',
          })}
        </SurfaceText>
      </View>
      <IconButton
        testID="calendar-nav-next-month"
        icon="chevron-right"
        label={t('rpg.calendar.next')}
        onPress={nextMonth}
        disabled={disableNextMonth}
      />
    </ForceLTRRow>
  );

  const dayHeaders = (
    <ForceLTRRow>
      {Array.from({ length: 7 }, (_, offset) => {
        const dayOfWeek = (offset + firstDayOfWeek.ordinal()) % 7;
        return (
          <View
            style={{
              flex: 1,
            }}
            key={dayOfWeek}
          >
            <SurfaceText
              key={dayOfWeek}
              style={{
                ...type.label,
                color: palette.text3,
                marginVertical: 8,
                textAlign: 'center',
              }}
            >
              {formatDate(getDateOnDay(DayOfWeek.of(dayOfWeek + 1)), {
                weekday: 'narrow',
              })}
            </SurfaceText>
          </View>
        );
      })}
    </ForceLTRRow>
  );
  let dateEnterDelay = 0;
  const daysFromPreviousMonth = Array.from(
    { length: numberOfDaysToShowFromPreviousMonth },
    (_, offset) => {
      offset = offset - numberOfDaysToShowFromPreviousMonth;
      const date = firstDayOfMonth.plusDays(offset);
      return (
        <HistoryCalendarDay
          key={date.toString() + dateEnterDelay}
          sessions={sessionsByDate.get(date.toString())}
          // eslint-disable-next-line react-compiler/react-compiler
          delayEntranceAnimMs={(dateEnterDelay += 5)}
          day={date}
          onPress={() => handleDayPress(date)}
          onLongPress={() => handleDayLongPress(date)}
        />
      );
    },
  );

  const daysInMonth = Array.from(
    {
      length: firstDayOfMonth.lengthOfMonth(),
    },
    (_, i) => {
      const date = firstDayOfMonth.withDayOfMonth(i + 1);
      return (
        <HistoryCalendarDay
          key={date.toString() + dateEnterDelay}
          sessions={sessionsByDate.get(date.toString())}
          delayEntranceAnimMs={(dateEnterDelay += 5)}
          day={date}
          onPress={() => handleDayPress(date)}
          onLongPress={() => handleDayLongPress(date)}
        />
      );
    },
  );

  const daysFromNextMonth = Array.from(
    { length: numberOfDaysToShowFromNextMonth },
    (_, i) => {
      const date = firstDayOfMonth.plusMonths(1).withDayOfMonth(i + 1);
      return (
        <HistoryCalendarDay
          key={date.toString() + dateEnterDelay}
          sessions={sessionsByDate.get(date.toString())}
          // eslint-disable-next-line react-compiler/react-compiler
          delayEntranceAnimMs={(dateEnterDelay += 5)}
          day={date}
          onPress={() => handleDayPress(date)}
          onLongPress={() => handleDayLongPress(date)}
        />
      );
    },
  );
  const daysInSections = [daysFromPreviousMonth, daysInMonth, daysFromNextMonth]
    .flat()
    .reduce(
      (acc, cur) => {
        if (acc[acc.length - 1].length === 7) {
          acc.push([]);
        }
        acc[acc.length - 1].push(cur);
        return acc;
      },
      [[]] as ReactNode[][],
    );

  return (
    <PixelBox padding={12} innerStyle={{ gap: 2 }}>
      {navButtons}
      {dayHeaders}
      {daysInSections.map((days, i) => (
        <ForceLTRRow key={i}>{days}</ForceLTRRow>
      ))}
    </PixelBox>
  );
}

function HistoryCalendarDay(props: {
  day: LocalDate;
  sessions: Enumerable.IEnumerable<Session>;
  delayEntranceAnimMs: number;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const isFuture = props.day.isAfter(LocalDate.now());
  const hasSessions = props.sessions.any();
  const isTodayWithNoSessions =
    props.day.equals(LocalDate.now()) && !hasSessions;
  const isToday = props.day.equals(LocalDate.now());
  const { palette } = useAppTheme();
  const formatDate = useFormatDate();
  return (
    <Animated.View
      entering={ZoomIn.delay(props.delayEntranceAnimMs)}
      style={{ flex: 1, alignItems: 'center', paddingVertical: 2 }}
    >
      {/* DR19: célula visual de 34 px, alvo de toque de 44 px. */}
      <TouchableRipple
        onPress={props.onPress}
        onLongPress={props.onLongPress}
        disabled={isFuture}
        style={{ padding: (size.hitMin - 34) / 2 }}
      >
        <PixelBox
          steps={steps.control}
          padding={0}
          borderColor={
            hasSessions
              ? palette.accentStrong
              : isToday
                ? palette.accent
                : 'transparent'
          }
          fillColor={
            hasSessions
              ? palette.accent
              : isToday
                ? palette.surface3
                : 'transparent'
          }
          innerStyle={{
            width: 34,
            height: 34,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SurfaceText
            style={{
              ...type.body,
              textAlign: 'center',
              color: hasSessions
                ? palette.textOnAccent
                : isFuture
                  ? palette.textDisabled
                  : palette.text1,
            }}
            weight={hasSessions || isTodayWithNoSessions ? 'bold' : undefined}
          >
            {formatDate(props.day, { day: 'numeric' })}
          </SurfaceText>
        </PixelBox>
      </TouchableRipple>
    </Animated.View>
  );
}

/**
 * Our app automatically swaps layout directions for RTL, however, we don't want to do this for our calendar
 * @returns
 */
function ForceLTRRow(props: { children: ReactNode }) {
  const rtl = I18nManager.isRTL;
  return (
    <View style={{ flexDirection: rtl ? 'row-reverse' : 'row' }}>
      {props.children}
    </View>
  );
}
