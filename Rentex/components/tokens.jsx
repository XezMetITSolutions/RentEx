// Rentex design tokens — DACH corporate, ÖAMTC-adjacent but original
// Using IBM Plex Sans (body) + IBM Plex Mono (numerics/labels)

const RX_TOKENS = {
  light: {
    bg: '#F5F3EF',          // warm off-white, subtle sand
    surface: '#FFFFFF',
    surfaceAlt: '#EBE8E2',
    line: '#E2DED6',
    lineStrong: '#CFC9BE',
    text: '#141311',        // near-black, warm
    textMuted: '#5A564E',
    textFaint: '#8A857A',
    accent: '#C77A1E',      // Rentex amber — deep, warm, Austrian
    accentInk: '#1C0F00',
    accentSoft: '#F5E6D0',
    ok: '#3E6B4A',
    warn: '#B8601A',
    danger: '#9E2A2B',
  },
  dark: {
    bg: '#0F0E0C',
    surface: '#1A1815',
    surfaceAlt: '#252219',
    line: '#2B2720',
    lineStrong: '#3D382F',
    text: '#F2EFE8',
    textMuted: '#A49E91',
    textFaint: '#6E685D',
    accent: '#E09A3D',
    accentInk: '#1C0F00',
    accentSoft: '#3A2910',
    ok: '#7FB38B',
    warn: '#E0A060',
    danger: '#D26565',
  },
};

const RX_FONT_SANS = '"IBM Plex Sans", -apple-system, system-ui, sans-serif';
const RX_FONT_MONO = '"IBM Plex Mono", ui-monospace, "SF Mono", monospace';

Object.assign(window, { RX_TOKENS, RX_FONT_SANS, RX_FONT_MONO });
