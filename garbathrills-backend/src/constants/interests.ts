export const INTEREST_TAGS = [
  'Garba',
  'Dandiya',
  'Music',
  'Dance',
  'Foodie',
  'Travel',
  'Movies',
  'Fitness',
  'Photography',
  'Fashion',
  'Art',
  'Sports',
  'Comedy',
  'Festivals',
  'Bollywood',
  'Traveling',
] as const;

export type InterestTag = (typeof INTEREST_TAGS)[number];
