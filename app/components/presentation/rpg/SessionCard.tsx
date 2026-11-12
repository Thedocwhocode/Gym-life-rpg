import PixelBox from '@/components/presentation/pixel/PixelBox';
import SessionSummary from '@/components/presentation/session-summary';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useFormatDate } from '@/hooks/useFormatDate';
import { Session } from '@/models/session-models';
import type { Palette } from '@/theme/palettes';
import { type, TITLE_MAX_SCALE } from '@/theme/tokens';
import { LocalDate } from '@js-joda/core';
import { ReactNode } from 'react';
import { Text, View } from 'react-native';

export type EyebrowTone = 'accent' | 'success' | 'muted';

interface SessionCardProps {
  session: Session;
  eyebrow?: string | undefined;
  eyebrowTone?: EyebrowTone | undefined;
  /** Treino feito: mostra data e as séries realizadas. */
  filled?: boolean | undefined;
  /** Treino em andamento: tom raised com borda line-frame. */
  highlight?: boolean | undefined;
  actions?: ReactNode;
  testID?: string | undefined;
}

const toneColor = (p: Palette, tone: EyebrowTone) =>
  tone === 'success' ? p.success : tone === 'muted' ? p.text3 : p.accent;

/** Resumo de treino: cabeçalho (sobrancelha, nome, data), exercícios e ações. */
export default function SessionCard({
  session,
  eyebrow,
  eyebrowTone = 'accent',
  filled = false,
  highlight = false,
  actions,
  testID,
}: SessionCardProps) {
  const { palette } = useAppTheme();
  const formatDate = useFormatDate();
  const date = formatDate(session.date, {
    year:
      session.date.year() !== LocalDate.now().year() ? 'numeric' : undefined,
    day: 'numeric',
    weekday: 'short',
    month: 'short',
  });

  return (
    <PixelBox
      testID={testID}
      tone={highlight ? 'raised' : 'default'}
      borderColor={highlight ? palette.lineFrame : undefined}
      padding={14}
      innerStyle={{ gap: 12 }}
    >
      <View style={{ gap: 4 }} testID="session-summary-title">
        {!!eyebrow && (
          <Text
            style={{ ...type.label, color: toneColor(palette, eyebrowTone) }}
          >
            {eyebrow}
          </Text>
        )}
        <Text
          maxFontSizeMultiplier={TITLE_MAX_SCALE}
          numberOfLines={2}
          style={{
            ...type.titleSm,
            color: palette.text1,
            textTransform: 'uppercase',
          }}
        >
          {session.blueprint.name}
        </Text>
        {filled && (
          <Text style={{ ...type.small, color: palette.text3 }}>{date}</Text>
        )}
      </View>
      <View
        style={{
          borderTopWidth: 1,
          borderStyle: 'dashed',
          borderColor: palette.line2,
          paddingTop: 10,
        }}
      >
        <SessionSummary session={session} isFilled={filled} showWeight />
      </View>
      {actions && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {actions}
        </View>
      )}
    </PixelBox>
  );
}
