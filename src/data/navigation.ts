export const primaryNavigation = [
  { label: 'Cover', href: '/' },
  { label: 'Feature', href: '/feature/' },
  { label: 'Reviews', href: '/reviews/' },
  { label: 'The Interview', href: '/interview/' },
  { label: 'Columns', href: '/columns/' },
  { label: 'B-Sides', href: '/b-sides/' },
  { label: 'Rotation', href: '/rotation/' },
  { label: 'Letters', href: '/letters/' },
] as const;

export const navigation = [
  ...primaryNavigation,
  { label: 'Resume', href: '/resume/' },
] as const;

export type NavigationItem = (typeof navigation)[number];
