const tintColorLight = '#C77A1E';
const tintColorDark = '#E09A3D';

export default {
  light: {
    text: '#141311',
    background: '#F5F3EF',
    tint: tintColorLight,
    tabIconDefault: '#8A857A',
    tabIconSelected: tintColorLight,
    card: '#FFFFFF',
    border: '#E2DED6',
    borderStrong: '#CFC9BE',
    surfaceAlt: '#EBE8E2',
    accentSoft: '#F5E6D0',
    textMuted: '#5A564E',
    textFaint: '#8A857A',
    accentInk: '#1C0F00',
  },
  dark: {
    text: '#F2EFE8',
    background: '#0F0E0C',
    tint: tintColorDark,
    tabIconDefault: '#6E685D',
    tabIconSelected: tintColorDark,
    card: '#1A1815',
    border: '#2B2720',
    borderStrong: '#3D382F',
    surfaceAlt: '#252219',
    accentSoft: '#3A2910',
    textMuted: '#A49E91',
    textFaint: '#6E685D',
    accentInk: '#1C0F00',
  },
} as const;
