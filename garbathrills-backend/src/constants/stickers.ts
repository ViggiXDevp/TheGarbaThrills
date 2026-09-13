export const STICKER_IDS = [
  'heart',
  'dandiya',
  'diya',
  'mandala',
  'dancing-couple',
  'sparkle',
  'flower',
  'music-note',
  'fire',
  'clap',
  'laugh',
  'thumbs-up',
  'blush',
  'star-eyes',
] as const;

export type StickerId = (typeof STICKER_IDS)[number];
