#!/usr/bin/env node
// Renders the pixelfx effects the app uses into assets/fx/<name>.{png,json}.
// The sheets are committed, so builds never need pixelfx; run this only to change or add an effect.
//
//   npm run fx:sheets -- <path to a pixelfx checkout>   (https://github.com/patch-gg/pixelfx, MIT)

import { writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const EFFECTS = [
  // Text off: the pixel font has no accents and the app is translated, so labels stay in the UI.
  // Frames past 72 only hold the faint stand-in body the effect lights up (it is an on-body effect).
  { id: 'ui/level-up', options: { text: '' }, maxFrames: 72 },
  { id: 'ui/confetti' },
  { id: 'pickups/xp-orb' },
  { id: 'pickups/power-star' },
];

const pixelfxDir = process.argv[2] ?? process.env.PIXELFX_DIR;
if (!pixelfxDir) {
  console.error('usage: npm run fx:sheets -- <path to pixelfx checkout>');
  process.exit(1);
}
const { loadEffect, renderFrames, spriteSheet, save } = await import(
  pathToFileURL(join(resolve(pixelfxDir), 'tools', 'lib', 'fxlib.mjs')).href
);

const out = join(import.meta.dirname, '..', 'assets', 'fx');
for (const { id, options, maxFrames } of EFFECTS) {
  const fx = await loadEffect(id);
  const r = renderFrames(fx, { bg: 'none', actor: false, options });
  const frames = maxFrames ? r.frames.slice(0, maxFrames) : r.frames;
  const name = id.split('/')[1];
  const { png, json } = spriteSheet(
    fx,
    { ...r, frames, n: frames.length },
    name,
  );
  const { fps, loop, frameSize, columns } = json.meta.pixelfx;
  save(join(out, `${name}.png`), png);
  writeFileSync(
    join(out, `${name}.json`),
    JSON.stringify({ fps, loop, frames: frames.length, frameSize, columns }) +
      '\n',
  );
  console.log(`${id}: ${frames.length} frames -> assets/fx/${name}.png`);
}
