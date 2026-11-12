// Visual regression (E3, docs/redesign/PLANO.md §3.9) without a third-party Cypress plugin:
// pixelmatch + pngjs compare a cy.screenshot against cypress/snapshots/<name>.png.
//
// References are generated on the Linux CI runner only (fonts must rasterise the same way):
// a missing reference is written to cypress/snapshots/new/ and the test passes; download that
// folder from the job artifact and commit it to cypress/snapshots/ to start comparing.
const fs = require('node:fs');
const path = require('node:path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

const SNAPSHOTS = path.join(__dirname, '..', 'snapshots');
// ponytail: one global tolerance; per-snapshot thresholds when a primitive needs it.
const MAX_DIFF_RATIO = 0.001;

function compareSnapshot({ name, screenshotPath }) {
  const reference = path.join(SNAPSHOTS, `${name}.png`);
  const actual = PNG.sync.read(fs.readFileSync(screenshotPath));
  // An element below an inner scroll container screenshots as a 1px strip: never a reference.
  if (actual.height < 2) {
    return { status: 'failed', reason: `screenshot clipped to ${actual.width}×${actual.height}` };
  }
  if (!fs.existsSync(reference)) {
    fs.mkdirSync(path.join(SNAPSHOTS, 'new'), { recursive: true });
    fs.copyFileSync(screenshotPath, path.join(SNAPSHOTS, 'new', `${name}.png`));
    return { status: 'new' };
  }

  const expected = PNG.sync.read(fs.readFileSync(reference));
  if (expected.width !== actual.width || expected.height !== actual.height) {
    return {
      status: 'failed',
      reason: `size ${actual.width}×${actual.height} ≠ reference ${expected.width}×${expected.height}`,
    };
  }

  const diff = new PNG({ width: expected.width, height: expected.height });
  const changed = pixelmatch(expected.data, actual.data, diff.data, expected.width, expected.height, {
    threshold: 0.1,
  });
  const ratio = changed / (expected.width * expected.height);
  if (ratio <= MAX_DIFF_RATIO) return { status: 'passed', ratio };

  fs.mkdirSync(path.join(SNAPSHOTS, 'diff'), { recursive: true });
  fs.writeFileSync(path.join(SNAPSHOTS, 'diff', `${name}.png`), PNG.sync.write(diff));
  return { status: 'failed', reason: `${(ratio * 100).toFixed(2)}% of pixels differ` };
}

module.exports = { compareSnapshot };
