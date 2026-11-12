/**
 * Visual-regression builds set EXPO_PUBLIC_FREEZE_MOTION=1 so animations hold their first frame
 * and screenshots are deterministic.
 */
export const FREEZE_MOTION = process.env.EXPO_PUBLIC_FREEZE_MOTION === '1';
