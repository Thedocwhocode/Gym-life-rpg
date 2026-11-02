import { describe, it, expect } from 'vitest';
import {
  frameAt,
  frameRect,
  isFinished,
  type PixelFxSheet,
} from './pixel-fx-frames';

const oneShot: PixelFxSheet = {
  fps: 30,
  loop: false,
  frames: 72,
  frameSize: [176, 138],
  columns: 8,
};
const looping: PixelFxSheet = { ...oneShot, loop: true, frames: 54 };

describe('frameAt', () => {
  it('starts on the first frame', () => {
    expect(frameAt(0, oneShot)).toBe(0);
  });

  it('advances one frame per 1/fps seconds', () => {
    expect(frameAt(1000 / 30, oneShot)).toBe(1);
    expect(frameAt(1000, oneShot)).toBe(30);
  });

  it('holds the last frame of a one-shot', () => {
    expect(frameAt(10_000, oneShot)).toBe(71);
  });

  it('wraps a looping effect', () => {
    expect(frameAt((54 * 1000) / 30, looping)).toBe(0);
    expect(frameAt((55 * 1000) / 30, looping)).toBe(1);
  });

  it('treats negative time as the start', () => {
    expect(frameAt(-50, oneShot)).toBe(0);
  });
});

describe('isFinished', () => {
  it('is true once a one-shot has played every frame', () => {
    expect(isFinished((71 * 1000) / 30, oneShot)).toBe(false);
    expect(isFinished((72 * 1000) / 30, oneShot)).toBe(true);
  });

  it('is never true for a loop', () => {
    expect(isFinished(1_000_000, looping)).toBe(false);
  });
});

describe('frameRect', () => {
  it('lays frames out row by row', () => {
    expect(frameRect(0, oneShot)).toEqual({
      x: 0,
      y: 0,
      width: 176,
      height: 138,
    });
    expect(frameRect(7, oneShot)).toEqual({
      x: 7 * 176,
      y: 0,
      width: 176,
      height: 138,
    });
    expect(frameRect(8, oneShot)).toEqual({
      x: 0,
      y: 138,
      width: 176,
      height: 138,
    });
    expect(frameRect(71, oneShot)).toEqual({
      x: 7 * 176,
      y: 8 * 138,
      width: 176,
      height: 138,
    });
  });
});
