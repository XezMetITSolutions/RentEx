const tintColorLight = '#E31E24'; // Red
const tintColorDark = '#FF3B3F'; // Brighter Red

export default {
  light: {
    text: '#000000',
    background: '#FFFFFF',
    tint: tintColorLight,
    tabIconDefault: '#8F8F8F',
    tabIconSelected: tintColorLight,
    card: '#F8F8F8',
    border: '#EEEEEE',
    borderStrong: '#DDDDDD',
    surfaceAlt: '#F2F2F2',
    accentSoft: '#FFEBEC',
    textMuted: '#444444',
    textFaint: '#999999',
    accentInk: '#FFFFFF',
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000',
    tint: tintColorDark,
    tabIconDefault: '#666666',
    tabIconSelected: tintColorDark,
    card: '#111111',
    border: '#222222',
    borderStrong: '#333333',
    surfaceAlt: '#1A1A1A',
    accentSoft: '#2D1011',
    textMuted: '#AAAAAA',
    textFaint: '#666666',
    accentInk: '#FFFFFF',
  },
} as const;
