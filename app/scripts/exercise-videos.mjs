// F11, piloto: vídeos curtos de exercícios com o herói do pixelfx (o mesmo boneco dos golpes do app) e o TEXTO do
// catálogo do openGym (assets/opengym-catalog.json). Nenhuma mídia do openGym entra aqui, nem como referência.
//
// Uso: node --no-warnings scripts/exercise-videos.mjs <pasta-de-saída> [--stills]
//   (--no-warnings cala o aviso de ESM do vendor do pixelfx, que não tem package.json próprio)
//   gera <saída>/og-<id>.mp4 e og-<id>.jpg (pôster, também no quadro 0); intermediários em <saída>/work.
//   --stills: só PNGs das poses-chave em <saída>/work, para conferir antes de renderizar.
// Precisa do ffmpeg no PATH. Cada quadro é função pura do tempo: poseAt(track, t % período) → posed().
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import {
  composite,
  createFrame,
  hex,
  poseAt,
  posed,
  skeleton,
} from '../vendor/pixelfx/src/core/index.js';
import { shortfall } from '../vendor/pixelfx/src/core/rig.js';

const [outArg, flag] = process.argv.slice(2);
if (!outArg)
  throw new Error(
    'uso: node scripts/exercise-videos.mjs <pasta-de-saída> [--stills]',
  );
const OUT = resolve(outArg),
  WORK = join(OUT, 'work');
mkdirSync(WORK, { recursive: true });

const S = 90,
  K = 12,
  SIDE = S * K,
  FPS = 30,
  DUR = 15,
  GY = 71,
  OX = 45; // palco 90×90 px ampliado 12×, pés em (45, 71)
const C = {
  bar: hex('#b6b9c3'),
  barD: hex('#6e707c'),
  plate: hex('#454c52'),
  plateL: hex('#868995'),
  ink: hex('#0e0c14'),
};

// ---- poses (px a partir dos pés, y negativo para cima; ver vendor/pixelfx/src/core/poses.js)
const FEET = { ffx: 4, fbx: -4 };
const EX = [
  {
    id: '0043',
    gear: 'barBack',
    P: 2.6, // agachamento completo com barra
    keys: (U, D) => [
      [0, U],
      [1.1, D, 'in'],
      [1.4, D],
      [2.6, U, 'out'],
    ],
    U: { ...FEET, ffx: 5, fbx: -5, fx: -6, fy: -31, bx: 8, by: -31 },
    D: {
      ffx: 5,
      fbx: -5,
      crouch: 9,
      lean: 6,
      fx: -1,
      fy: -23,
      bx: 12,
      by: -23,
    },
  },
  {
    id: '0336',
    gear: 'dumbbells',
    P: 2.8, // afundo com halteres
    keys: (U, D) => [
      [0, U],
      [1.0, D, 'in'],
      [1.4, D],
      [2.8, U, 'out'],
    ],
    U: { ffx: 2, fbx: -2, fx: -3, fy: -15, bx: 5, by: -15 },
    D: {
      ffx: 10,
      fbx: -8,
      toeB: true,
      crouch: 8,
      fx: -1,
      fy: -8,
      bx: 6,
      by: -8,
    },
  },
  {
    id: '0426',
    gear: 'dumbbells',
    P: 2.4, // desenvolvimento acima da cabeça em pé com halter
    keys: (U, D) => [
      [0, D],
      [0.8, U, 'out'],
      [1.1, U],
      [2.4, D],
    ],
    U: { ...FEET, fx: -6, fy: -42, bx: 8, by: -42 },
    D: { ...FEET, fx: -9, fy: -31, bx: 11, by: -31 },
  },
  {
    id: '0031',
    gear: 'barFront',
    P: 2.4, // rosca direta com barra
    keys: (U, D) => [
      [0, D],
      [0.9, U, 'out'],
      [1.2, U],
      [2.4, D],
    ],
    U: { ...FEET, fx: 4, fy: -28, bx: 7, by: -28 },
    D: { ...FEET, fx: 2, fy: -16, bx: 5, by: -16 },
  },
  {
    id: '0032',
    gear: 'barFront',
    P: 2.8, // levantamento terra com barra
    keys: (U, D) => [
      [0, U],
      [1.0, D, 'in'],
      [1.3, D],
      [2.8, U, 'out'],
    ],
    U: { ...FEET, fx: 1, fy: -16, bx: 4, by: -16 },
    D: { ...FEET, crouch: 8, lean: 14, fx: 5, fy: -8, bx: 8, by: -8 },
  },
  {
    id: '0027',
    gear: 'barFront',
    P: 2.2, // remada curvada com barra
    keys: (U, D) => [
      [0, D],
      [0.8, U, 'out'],
      [1.1, U],
      [2.2, D],
    ],
    U: { ...FEET, crouch: 3, lean: 18, fx: 2, fy: -17, bx: 5, by: -17 },
    D: { ...FEET, crouch: 3, lean: 18, fx: 7, fy: -10, bx: 10, by: -10 },
  },
  {
    id: '3224',
    gear: null,
    P: 0.9, // polichinelo com salto
    keys: (U, D) => [
      [0, D],
      [0.2, { ...U, y: -3, fy: -34, by: -34 }],
      [0.45, U],
      [0.7, { ...U, y: -3, fy: -34, by: -34 }],
      [0.9, D],
    ],
    U: { ffx: 8, fbx: -8, fx: -9, fy: -43, bx: 11, by: -43 },
    D: { ffx: 2, fbx: -2, fx: -4, fy: -15, bx: 6, by: -15 },
  },
];

// ---- texto do catálogo (dado não confiável: só strings, e vai por arquivo para o drawtext com expansion=none)
const cat = JSON.parse(
  readFileSync(
    new URL('../assets/opengym-catalog.json', import.meta.url),
    'utf8',
  ),
);
const row = (id) =>
  cat.rows.find((r) => r[0] === id) ??
  (() => {
    throw new Error(`id ${id} fora do catálogo`);
  })();
const MUSCLE = {
  quads: 'quadríceps',
  glutes: 'glúteos',
  delts: 'deltoides',
  biceps: 'bíceps',
  'cardiovascular system': 'cardio',
};
const GEAR = {
  barbell: 'barra',
  dumbbell: 'halteres',
  'body weight': 'peso do corpo',
};
const wrap = (s, n) =>
  s
    .split(' ')
    .reduce((ls, w) => {
      const last = ls[ls.length - 1];
      if (last && (last + ' ' + w).length <= n)
        ls[ls.length - 1] = last + ' ' + w;
      else ls.push(w);
      return ls;
    }, [])
    .join('\n');

// O rodapé do quadro cabe 3 linhas de legenda; o resto vira "…".
const upTo3 = (text) => {
  const ls = text.split('\n');
  return ls.length <= 3
    ? text
    : [...ls.slice(0, 2), ls[2].slice(0, 43) + '…'].join('\n');
};

// ---- desenho
function backdrop() {
  // o fundo "Brasa" do palco do app (components/presentation/fx/engine.ts)
  const B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5],
    out = new Uint32Array(S * S);
  const top = hex('#0b0c0d'),
    low = hex('#121518'),
    edge = hex('#454c52'),
    fl = hex('#252a2e'),
    fd = hex('#1c2023'),
    mo = hex('#121416');
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const gy = y - GY,
        off = Math.floor((gy - 1) / 5) % 2 ? 6 : 0;
      out[y * S + x] =
        y < GY
          ? (y / (GY - 1)) * 2 + B[((y & 3) << 2) | (x & 3)] / 16 > 1.7
            ? low
            : top
          : gy === 0
            ? edge
            : (gy - 1) % 5 === 4 || (x + off) % 12 === 0
              ? mo
              : gy < 3
                ? fl
                : fd;
    }
  return out;
}
const BG = backdrop();
const put = (f, x, y, c) => {
  x = Math.round(x);
  y = Math.round(y);
  if (x >= 0 && y >= 0 && x < S && y < S) f.color[y * S + x] = c;
};
const line = (f, a, b, c) => {
  const n =
    Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]))) || 1;
  for (let i = 0; i <= n; i++)
    put(f, a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n, c);
};
const box = (f, cx, cy, w, h, c) => {
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      put(
        f,
        cx - (w >> 1) + x,
        cy - (h >> 1) + y,
        x === 0 || y === 0 || x === w - 1 || y === h - 1 ? C.ink : c,
      );
};
// Barra: o pedaço do lado de lá vai antes do corpo, o resto depois; `behind` põe o trecho entre as mãos atrás dele.
function bar(f, j, front, behind) {
  const n = [OX + j.handN[0], GY + j.handN[1]],
    b = [OX + j.handF[0], GY + j.handF[1]];
  const dx = b[0] - n[0],
    dy = b[1] - n[1],
    L = Math.hypot(dx, dy) || 1,
    ux = dx / L,
    uy = dy / L;
  const endN = [n[0] - ux * 9, n[1] - uy * 9],
    endF = [b[0] + ux * 9, b[1] + uy * 9];
  if (!front) {
    line(f, b, endF, C.barD);
    box(f, endF[0] - ux * 2, endF[1] - uy * 2, 3, 8, C.plate);
    if (behind) line(f, n, b, C.barD);
  } else {
    if (!behind) line(f, n, b, C.bar);
    line(f, n, endN, C.bar);
    box(f, endN[0] + ux * 2, endN[1] + uy * 2, 3, 9, C.plateL);
  }
}
// Halter: placas cheias (com contorno, 2 px de largura viram só tinta preta e somem no fundo escuro).
function dumbbell(f, h, c) {
  const x = Math.round(OX + h[0]),
    y = Math.round(GY + h[1]);
  line(f, [x - 3, y], [x + 3, y], C.bar);
  for (const sx of [x - 4, x + 3])
    for (let dy = -3; dy <= 3; dy++) {
      put(f, sx, y + dy, Math.abs(dy) === 3 ? C.ink : c);
      put(f, sx + 1, y + dy, Math.abs(dy) === 3 ? C.ink : C.plate);
    }
}

function render(ex, t, rgba) {
  const q = poseAt(ex.track, t % ex.P),
    r = posed(q),
    j = skeleton(q).joints;
  const f = createFrame(S, S),
    bx = OX + Math.round(q.x ?? 0),
    by = GY + Math.round(q.y ?? 0);
  // sombra sob os pés
  const hw =
    9 + (Math.abs(q.ffx - q.fbx) >> 1) - Math.min(6, Math.abs(q.y ?? 0));
  for (let x = -hw; x <= hw; x++)
    f.color[(GY + 1) * S + OX + x] = hex('#0e1012');
  for (const k of ['handN', 'handF'])
    j[k] = [j[k][0] + (q.x ?? 0), j[k][1] + (q.y ?? 0)];
  if (ex.gear === 'barBack' || ex.gear === 'barFront')
    bar(f, j, false, ex.gear === 'barBack');
  if (ex.gear === 'dumbbells') dumbbell(f, j.handF, C.barD);
  for (let i = 0; i < r.n; i++) put(f, bx + r.xs[i], by + r.ys[i], r.color[i]);
  if (ex.gear === 'barBack' || ex.gear === 'barFront')
    bar(f, j, true, ex.gear === 'barBack');
  if (ex.gear === 'dumbbells') dumbbell(f, j.handN, C.bar);
  return composite(f, rgba, BG);
}

function ffmpeg(args, input) {
  const p = spawnSync(
    'ffmpeg',
    ['-hide_banner', '-loglevel', 'error', '-y', ...args],
    { cwd: WORK, input, maxBuffer: 1 << 28 },
  );
  if (p.status !== 0) throw new Error(`ffmpeg: ${p.stderr}`);
}

// ---- fontes do app (caminho relativo: o "C:" quebra o escape do filtro no Windows)
const FONT = (p) =>
  new URL(`../node_modules/@expo-google-fonts/${p}`, import.meta.url);
copyFileSync(
  FONT('pixelify-sans/700Bold/PixelifySans_700Bold.ttf'),
  join(WORK, 'title.ttf'),
);
copyFileSync(
  FONT('space-mono/400Regular/SpaceMono_400Regular.ttf'),
  join(WORK, 'mono.ttf'),
);
copyFileSync(
  FONT('space-mono/700Bold/SpaceMono_700Bold.ttf'),
  join(WORK, 'mono-bold.ttf'),
);

const fade = (a, b, d = 0.3) =>
  `alpha='max(0,min(1,min((t-${a})/${d},(${b}-t)/${d})))'`;
function filters(ex, r) {
  const id = ex.id,
    files = [];
  const txt = (name, s) => (
    writeFileSync(join(WORK, `${id}-${name}.txt`), s),
    `${id}-${name}.txt`
  );
  const name = r[8].replace(/\s*\((masculino|feminino)\)$/, '');
  const title = wrap(name.charAt(0).toUpperCase() + name.slice(1), 26);
  const steps = r[9].filter((s) => !/^Repita/.test(s)).slice(0, 3);
  const dt = (DUR - 1.4) / steps.length;
  files.push(
    `drawtext=fontfile=mono-bold.ttf:textfile=${txt('tag', 'GYMLIFE RPG · EXERCÍCIO')}:expansion=none:fontsize=28:fontcolor=#c98a35:x=64:y=56:${fade(0.1, DUR + 1)}`,
  );
  files.push(
    `drawtext=fontfile=title.ttf:textfile=${txt('title', title)}:expansion=none:fontsize=56:line_spacing=4:fontcolor=#efe9db:x=64:y=104:${fade(0.3, DUR + 1)}`,
  );
  const sub = `Alvo: ${MUSCLE[r[4]] ?? r[4]} · ${GEAR[r[3]] ?? r[3]}`;
  const subY = 104 + title.split('\n').length * 70 + 8;
  files.push(
    `drawtext=fontfile=mono.ttf:textfile=${txt('sub', sub)}:expansion=none:fontsize=30:fontcolor=#a9a294:x=64:y=${subY}:${fade(0.6, DUR + 1)}`,
  );
  steps.forEach((s, i) => {
    const a = 1.2 + i * dt,
      b = a + dt;
    files.push(
      `drawtext=fontfile=mono-bold.ttf:textfile=${txt(`n${i}`, `${i + 1}/${steps.length}`)}:expansion=none:fontsize=28:fontcolor=#c98a35:x=64:y=870:enable='between(t,${a},${b})':${fade(a, b)}`,
    );
    files.push(
      `drawtext=fontfile=mono.ttf:textfile=${txt(`s${i}`, upTo3(wrap(s, 44)))}:expansion=none:fontsize=32:line_spacing=10:fontcolor=#efe9db:x=64:y=912:enable='between(t,${a},${b})':${fade(a, b)}`,
    );
  });
  files.push(
    `drawtext=fontfile=mono.ttf:textfile=${txt('credit', 'Instruções: openGym (AGPL-3.0)')}:expansion=none:fontsize=20:fontcolor=#6b675f:x=w-tw-64:y=62`,
  );
  // pôster no meio do 2º passo: tudo assentado, nada em fade
  return {
    chain: `scale=${SIDE}:${SIDE}:flags=neighbor,${files.join(',')}`,
    poster: (1.2 + dt * Math.min(1.5, steps.length - 0.5)).toFixed(2),
  };
}

// Trilha: um acorde baixo e um "tum" no fundo de cada repetição, no mesmo tom (lá menor).
const audio = (ex) => {
  const bottom = ex.keys(ex.U, ex.D)[1][0],
    P = ex.P;
  const pad = `0.035*(sin(2*PI*110*t)+sin(2*PI*130.81*t)+sin(2*PI*164.81*t))*(0.7+0.3*sin(2*PI*0.2*t))`;
  const thump = `0.32*sin(2*PI*55*mod(t+${P - bottom},${P}))*exp(-14*mod(t+${P - bottom},${P}))`;
  return `aevalsrc=exprs='${pad}+${thump}':s=44100:d=${DUR},lowpass=f=900,afade=t=in:d=0.6,afade=t=out:st=${DUR - 1}:d=1`;
};

const rgba = Buffer.alloc(S * S * 4);
for (const ex of EX) {
  ex.track = ex.keys(ex.U, ex.D);
  for (const [, p] of ex.track) {
    const miss = shortfall(p);
    if (miss > 1.5)
      console.warn(
        `og-${ex.id}: a mão fica ${miss.toFixed(1)} px longe do alvo`,
      );
  }
  if (flag === '--stills') {
    for (const [t] of ex.track) {
      render(ex, Math.min(t, ex.P - 0.001), rgba);
      ffmpeg(
        [
          '-f',
          'rawvideo',
          '-pix_fmt',
          'rgba',
          '-s',
          `${S}x${S}`,
          '-i',
          '-',
          '-vf',
          `scale=${SIDE / 2}:${SIDE / 2}:flags=neighbor`,
          '-frames:v',
          '1',
          `still-${ex.id}-${t}.png`,
        ],
        rgba,
      );
    }
    continue;
  }
  const n = FPS * DUR,
    video = Buffer.alloc(S * S * 4 * n);
  for (let i = 0; i < n; i++)
    render(ex, i / FPS, video.subarray(i * S * S * 4, (i + 1) * S * S * 4));
  const { chain, poster } = filters(ex, row(ex.id));
  writeFileSync(join(WORK, `${ex.id}.filter`), `[0:v]${chain}[v]`);
  const raw = [
    '-f',
    'rawvideo',
    '-pix_fmt',
    'rgba',
    '-s',
    `${S}x${S}`,
    '-r',
    `${FPS}`,
    '-i',
    '-',
  ];
  ffmpeg(
    [
      ...raw,
      '-f',
      'lavfi',
      '-i',
      audio(ex),
      '-/filter_complex',
      `${ex.id}.filter`,
      '-map',
      '[v]',
      '-map',
      '1:a',
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      '-crf',
      '18',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      '-t',
      `${DUR}`,
      `${ex.id}-raw.mp4`,
    ],
    video,
  );
  // pôster: um quadro assentado (texto inteiro na tela), também gravado como quadro 0 sem mudar a duração
  ffmpeg([
    '-ss',
    poster,
    '-i',
    `${ex.id}-raw.mp4`,
    '-frames:v',
    '1',
    '-q:v',
    '2',
    `../og-${ex.id}.jpg`,
  ]);
  ffmpeg([
    '-i',
    `${ex.id}-raw.mp4`,
    '-i',
    `../og-${ex.id}.jpg`,
    '-filter_complex',
    "[0:v][1:v]overlay=enable='eq(n,0)'[v]",
    '-map',
    '[v]',
    '-map',
    '0:a',
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-crf',
    '18',
    '-c:a',
    'copy',
    `../og-${ex.id}.mp4`,
  ]);
  console.log(`og-${ex.id}.mp4`);
}
