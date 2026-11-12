import type { ShareCardFields } from '@/store/journey/rules/combat';
import { palettes } from '@/theme/palettes';
import { fontFamily } from '@/theme/tokens';
import { forwardRef } from 'react';
import { Text, View } from 'react-native';

/** Tamanho na tela; a captura sai em 1080×1350 (4:5, DR24). */
export const SHARE_CARD = { w: 360, h: 450, outW: 1080, outH: 1350 } as const;
const P = palettes.brasa; // sempre Brasa, qualquer que seja a paleta do app

interface ShareCardProps {
  fields: ShareCardFields;
  labels: { title: string; boss: string; level: string; brand: string };
}

/** Cartão E2: pôster da missão. Só mostra os campos de `shareCardFields` (C8). */
const ShareCard = forwardRef<View, ShareCardProps>(function ShareCard(
  { fields, labels },
  ref,
) {
  const mono = { fontFamily: fontFamily.mono, color: P.text2 } as const;
  const display = { fontFamily: fontFamily.display, color: P.text1 } as const;
  return (
    <View
      ref={ref}
      collapsable={false}
      testID="share-card"
      style={{
        width: SHARE_CARD.w,
        height: SHARE_CARD.h,
        backgroundColor: P.bgApp,
        padding: 24,
        justifyContent: 'space-between',
      }}
    >
      <View
        style={{
          borderWidth: 1,
          borderColor: P.lineFrame,
          padding: 16,
          gap: 14,
          alignItems: 'center',
        }}
      >
        <Text style={{ ...display, fontSize: 14, textTransform: 'uppercase' }}>
          {`+== ${labels.title} ==+`}
        </Text>
        <Text style={{ ...mono, fontSize: 15, textAlign: 'center' }}>
          {fields.workout}
        </Text>
        {fields.boss ? (
          <Text
            style={{
              ...display,
              fontSize: 12,
              color: P.dangerStrong,
              textAlign: 'center',
              textTransform: 'uppercase',
            }}
          >
            {`${labels.boss}: ${fields.boss}`}
          </Text>
        ) : null}
        <Text
          style={{
            fontFamily: fontFamily.monoBold,
            fontSize: 40,
            color: P.reward,
          }}
        >
          {`+${fields.xp} XP`}
        </Text>
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Text style={{ ...display, fontSize: 16 }}>{labels.level}</Text>
        <Text
          style={{
            ...mono,
            fontSize: 14,
            color: P.accent,
            textTransform: 'uppercase',
          }}
        >
          {fields.title}
        </Text>
      </View>
      <Text
        style={{
          ...mono,
          fontSize: 12,
          color: P.text3,
          textAlign: 'center',
          letterSpacing: 2,
        }}
      >
        {labels.brand}
      </Text>
    </View>
  );
});

export default ShareCard;
