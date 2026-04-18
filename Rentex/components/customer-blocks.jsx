// Rentex customer home — shared content blocks used across iOS + Android
// Design: DACH corporate, warm cream or deep espresso bg, single amber accent.
// All German copy. No fake data-slop; only meaningful modules.

// ─── Placeholder SVG for car shots ─────────────────────────────
const CarPlaceholder = ({ w = 200, h = 120, T, label = 'VW Passat Variant' }) => (
  <div style={{
    width: w, height: h, borderRadius: 8, overflow: 'hidden',
    background: T.surfaceAlt, position: 'relative',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    {/* subtle stripe texture */}
    <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.35 }}>
      <defs>
        <pattern id={`s-${label.replace(/\W/g,'')}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="3" height="8" fill={T.lineStrong}/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#s-${label.replace(/\W/g,'')})`}/>
    </svg>
    {/* minimalist car silhouette */}
    <svg width={Math.min(w*0.7, 140)} height={Math.min(h*0.6, 50)} viewBox="0 0 140 50" style={{ position: 'relative', zIndex: 1, opacity: 0.55 }}>
      <path d="M5 35 L15 20 Q20 12 30 12 L85 12 Q95 12 105 20 L125 25 Q135 28 135 35 L135 40 Q135 42 133 42 L120 42 M40 42 L95 42 M25 42 L18 42 Q5 42 5 38 L5 35 Z"
        fill="none" stroke={T.textMuted} strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="30" cy="42" r="6" fill={T.bg} stroke={T.textMuted} strokeWidth="1.5"/>
      <circle cx="108" cy="42" r="6" fill={T.bg} stroke={T.textMuted} strokeWidth="1.5"/>
    </svg>
    <div style={{
      position: 'absolute', bottom: 6, left: 8,
      fontFamily: RX_FONT_MONO, fontSize: 9, letterSpacing: 0.3,
      color: T.textFaint, textTransform: 'uppercase',
    }}>{label}</div>
  </div>
);

// ─── Section header ───────────────────────────────────────────
const SectionHead = ({ T, kicker, title, action }) => (
  <div style={{ padding: '0 20px', marginBottom: 12 }}>
    {kicker && (
      <div style={{
        fontFamily: RX_FONT_MONO, fontSize: 10, letterSpacing: 1.2,
        color: T.accent, textTransform: 'uppercase', marginBottom: 4,
      }}>{kicker}</div>
    )}
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
      <div style={{ fontFamily: RX_FONT_SANS, fontSize: 20, fontWeight: 600, color: T.text, letterSpacing: -0.3 }}>
        {title}
      </div>
      {action && (
        <div style={{ fontFamily: RX_FONT_SANS, fontSize: 13, color: T.textMuted, fontWeight: 500 }}>
          {action}
        </div>
      )}
    </div>
  </div>
);

// ─── Hero / greeting block ────────────────────────────────────
const GreetingBlock = ({ T, name = 'Lukas', km = 1240 }) => (
  <div style={{ padding: '4px 20px 18px' }}>
    <div style={{
      fontFamily: RX_FONT_MONO, fontSize: 10, letterSpacing: 1.2,
      color: T.textFaint, textTransform: 'uppercase', marginBottom: 6,
    }}>Guten Morgen</div>
    <div style={{ fontFamily: RX_FONT_SANS, fontSize: 28, fontWeight: 600, color: T.text, letterSpacing: -0.6, lineHeight: 1.1 }}>
      {name}.
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
      <div style={{
        padding: '3px 8px', borderRadius: 4,
        background: T.accentSoft, color: T.accent,
        fontFamily: RX_FONT_MONO, fontSize: 10, fontWeight: 600, letterSpacing: 0.3,
      }}>GOLD</div>
      <div style={{ fontFamily: RX_FONT_MONO, fontSize: 11, color: T.textMuted, letterSpacing: 0.2 }}>
        {km.toLocaleString('de-AT')} km-Guthaben
      </div>
    </div>
  </div>
);

// ─── INLINE SEARCH — Variation A ──────────────────────────────
const InlineSearch = ({ T, onFocus, activeField = null, setActiveField }) => {
  const field = (icon, label, value, sub, key) => {
    const active = activeField === key;
    return (
      <button
        onClick={() => setActiveField?.(active ? null : key)}
        style={{
          flex: 1, background: 'transparent', border: 'none',
          padding: '14px 14px', textAlign: 'left', cursor: 'pointer',
          borderRadius: 0, display: 'flex', alignItems: 'center', gap: 10,
          outline: active ? `2px solid ${T.accent}` : 'none',
          outlineOffset: -2, borderRadius: active ? 6 : 0,
        }}>
        <div style={{ color: T.accent }}><RxIcon name={icon} size={18} sw={1.7}/></div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontFamily: RX_FONT_MONO, fontSize: 9, letterSpacing: 0.8,
            color: T.textFaint, textTransform: 'uppercase', marginBottom: 2,
          }}>{label}</div>
          <div style={{ fontFamily: RX_FONT_SANS, fontSize: 15, fontWeight: 500, color: T.text, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {value}
          </div>
          {sub && <div style={{ fontFamily: RX_FONT_SANS, fontSize: 11, color: T.textMuted, marginTop: 1 }}>{sub}</div>}
        </div>
      </button>
    );
  };
  return (
    <div style={{
      margin: '0 20px 24px',
      background: T.surface, borderRadius: 14,
      border: `1px solid ${T.line}`,
      boxShadow: '0 1px 2px rgba(20,19,17,0.04)',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', borderBottom: `1px solid ${T.line}` }}>
        {field('location', 'Abholort', 'Wien Hauptbahnhof', 'Station 04', 'pickup')}
        <div style={{ width: 1, background: T.line }}/>
        <button onClick={() => setActiveField?.('swap')} style={{
          width: 40, background: 'transparent', border: 'none', color: T.textMuted,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <RxIcon name="swap" size={16} sw={1.6}/>
        </button>
      </div>
      <div style={{ display: 'flex', borderBottom: `1px solid ${T.line}` }}>
        {field('location', 'Rückgabe', 'Selber Ort', null, 'dropoff')}
      </div>
      <div style={{ display: 'flex' }}>
        {field('calendar', 'Abholung', 'Mi. 22. Apr.', '10:00', 'start')}
        <div style={{ width: 1, background: T.line }}/>
        {field('calendar', 'Rückgabe', 'Fr. 24. Apr.', '10:00', 'end')}
      </div>
      <button onClick={onFocus} style={{
        width: '100%', background: T.accent, color: T.accentInk,
        border: 'none', padding: '14px', cursor: 'pointer',
        fontFamily: RX_FONT_SANS, fontSize: 15, fontWeight: 600, letterSpacing: -0.1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        Fahrzeuge suchen
        <RxIcon name="arrow" size={16} sw={2} color={T.accentInk}/>
      </button>
    </div>
  );
};

// ─── BOTTOM SHEET TRIGGER — Variation B ───────────────────────
const SearchTrigger = ({ T, onOpen }) => (
  <div style={{ padding: '0 20px 24px' }}>
    <button onClick={onOpen} style={{
      width: '100%', background: T.surface, border: `1px solid ${T.line}`,
      borderRadius: 14, padding: '18px 16px', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 14,
      boxShadow: '0 1px 2px rgba(20,19,17,0.04)', textAlign: 'left',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, background: T.accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <RxIcon name="search" size={20} color={T.accentInk} sw={2}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: RX_FONT_SANS, fontSize: 15, fontWeight: 600, color: T.text, letterSpacing: -0.1 }}>
          Wohin geht die Reise?
        </div>
        <div style={{ fontFamily: RX_FONT_SANS, fontSize: 12, color: T.textMuted, marginTop: 2 }}>
          Ort & Zeitraum wählen
        </div>
      </div>
      <RxIcon name="chevron" size={18} color={T.textMuted} sw={1.8}/>
    </button>
    {/* Quick-chips */}
    <div style={{ display: 'flex', gap: 8, marginTop: 10, overflowX: 'auto' }}>
      {['Flughafen Wien', 'Hauptbahnhof', 'Graz', 'Salzburg', 'Innsbruck'].map((c, i) => (
        <div key={c} style={{
          padding: '7px 12px', borderRadius: 100,
          background: i === 0 ? T.text : 'transparent',
          color: i === 0 ? T.bg : T.textMuted,
          border: i === 0 ? 'none' : `1px solid ${T.line}`,
          fontFamily: RX_FONT_SANS, fontSize: 12, fontWeight: 500,
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>{c}</div>
      ))}
    </div>
  </div>
);

// ─── Category strip ──────────────────────────────────────────
const CategoryStrip = ({ T }) => {
  const cats = [
    { name: 'Kompakt', from: '29', active: true },
    { name: 'Mittelklasse', from: '39' },
    { name: 'Kombi', from: '44' },
    { name: 'SUV', from: '59' },
    { name: 'Premium', from: '89' },
    { name: 'Transporter', from: '69' },
  ];
  return (
    <div style={{ display: 'flex', gap: 10, padding: '0 20px', overflowX: 'auto', paddingBottom: 4 }}>
      {cats.map(c => (
        <div key={c.name} style={{
          flexShrink: 0, minWidth: 110,
          padding: '12px 14px', borderRadius: 10,
          background: c.active ? T.text : T.surface,
          border: `1px solid ${c.active ? T.text : T.line}`,
          color: c.active ? T.bg : T.text,
        }}>
          <div style={{ fontFamily: RX_FONT_SANS, fontSize: 14, fontWeight: 600, letterSpacing: -0.1 }}>{c.name}</div>
          <div style={{ fontFamily: RX_FONT_MONO, fontSize: 10, marginTop: 2, opacity: 0.7 }}>
            ab € {c.from}/Tag
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Featured fleet carousel ────────────────────────────────
const FleetCarousel = ({ T }) => {
  const cars = [
    { model: 'VW Passat Variant', trim: 'Kombi · Diesel · Automatik', price: 52, tag: 'EMPFOHLEN' },
    { model: 'ŠKODA Octavia', trim: 'Kombi · Benzin · Automatik', price: 44, tag: null },
    { model: 'BMW 3er Touring', trim: 'Kombi · Diesel · Automatik', price: 79, tag: 'PREMIUM' },
  ];
  return (
    <div style={{ display: 'flex', gap: 12, padding: '0 20px', overflowX: 'auto', paddingBottom: 4 }}>
      {cars.map(c => (
        <div key={c.model} style={{
          flexShrink: 0, width: 220,
          background: T.surface, borderRadius: 12,
          border: `1px solid ${T.line}`, overflow: 'hidden',
        }}>
          <div style={{ position: 'relative' }}>
            <CarPlaceholder w={220} h={120} T={T} label={c.model}/>
            {c.tag && (
              <div style={{
                position: 'absolute', top: 10, left: 10,
                padding: '3px 7px', borderRadius: 4,
                background: T.accent, color: T.accentInk,
                fontFamily: RX_FONT_MONO, fontSize: 9, fontWeight: 700, letterSpacing: 0.6,
              }}>{c.tag}</div>
            )}
          </div>
          <div style={{ padding: '12px 14px' }}>
            <div style={{ fontFamily: RX_FONT_SANS, fontSize: 14, fontWeight: 600, color: T.text, letterSpacing: -0.1 }}>
              {c.model}
            </div>
            <div style={{ fontFamily: RX_FONT_SANS, fontSize: 11, color: T.textMuted, marginTop: 2 }}>
              {c.trim}
            </div>
            <div style={{
              display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
              marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.line}`,
            }}>
              <div>
                <span style={{ fontFamily: RX_FONT_MONO, fontSize: 18, fontWeight: 600, color: T.text }}>€{c.price}</span>
                <span style={{ fontFamily: RX_FONT_MONO, fontSize: 11, color: T.textFaint, marginLeft: 2 }}>/Tag</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: RX_FONT_MONO, fontSize: 10, color: T.textMuted }}>
                <RxIcon name="star" size={11} color={T.accent} sw={2}/> 4.8
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Rewards / KM balance card ─────────────────────────────
const RewardsCard = ({ T }) => (
  <div style={{
    margin: '0 20px', padding: 18, borderRadius: 14,
    background: T.text, color: T.bg, position: 'relative', overflow: 'hidden',
  }}>
    {/* faint accent strip */}
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 3, height: '100%',
      background: T.accent,
    }}/>
    <div style={{
      fontFamily: RX_FONT_MONO, fontSize: 10, letterSpacing: 1.2,
      color: T.accent, textTransform: 'uppercase', marginBottom: 8,
    }}>KM-Guthaben</div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <div style={{ fontFamily: RX_FONT_MONO, fontSize: 34, fontWeight: 500, letterSpacing: -0.5 }}>
        1.240
      </div>
      <div style={{ fontFamily: RX_FONT_MONO, fontSize: 12, opacity: 0.55 }}>km</div>
    </div>
    <div style={{
      fontFamily: RX_FONT_SANS, fontSize: 12, opacity: 0.65,
      marginTop: 6, lineHeight: 1.5, maxWidth: 260,
    }}>
      Lade Freunde ein und verdiene 250 km pro Empfehlung.
    </div>
    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
      <button style={{
        padding: '8px 14px', borderRadius: 8,
        background: T.accent, color: T.accentInk, border: 'none',
        fontFamily: RX_FONT_SANS, fontSize: 12, fontWeight: 600, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        Freund einladen
        <RxIcon name="arrow" size={12} sw={2} color={T.accentInk}/>
      </button>
      <button style={{
        padding: '8px 14px', borderRadius: 8,
        background: 'transparent', color: T.bg,
        border: `1px solid ${T.textFaint}`,
        fontFamily: RX_FONT_SANS, fontSize: 12, fontWeight: 500, cursor: 'pointer',
      }}>
        Übertragen
      </button>
    </div>
  </div>
);

// ─── Location row (nearby stations) ───────────────────────
const LocationList = ({ T }) => {
  const locs = [
    { name: 'Wien Hauptbahnhof', dist: '0,8 km', cars: 34, hrs: '24/7' },
    { name: 'Wien Flughafen', dist: '18 km', cars: 82, hrs: '05:00 – 23:00' },
    { name: 'Wien Mitte', dist: '2,1 km', cars: 12, hrs: '07:00 – 22:00' },
  ];
  return (
    <div style={{
      margin: '0 20px', background: T.surface, borderRadius: 12,
      border: `1px solid ${T.line}`, overflow: 'hidden',
    }}>
      {locs.map((l, i) => (
        <div key={l.name} style={{
          padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
          borderTop: i > 0 ? `1px solid ${T.line}` : 'none',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: T.accentSoft,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <RxIcon name="location" size={15} color={T.accent} sw={1.8}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: RX_FONT_SANS, fontSize: 14, fontWeight: 500, color: T.text, letterSpacing: -0.1 }}>
              {l.name}
            </div>
            <div style={{ fontFamily: RX_FONT_MONO, fontSize: 10, color: T.textMuted, marginTop: 2, letterSpacing: 0.2 }}>
              {l.dist.toUpperCase()} · {l.cars} FAHRZEUGE · {l.hrs}
            </div>
          </div>
          <RxIcon name="chevron" size={14} color={T.textFaint} sw={1.8}/>
        </div>
      ))}
    </div>
  );
};

// ─── Tab bar ──────────────────────────────────────────────
const RxTabBar = ({ T, platform = 'ios' }) => {
  const tabs = [
    { icon: 'home', label: 'Start', active: true },
    { icon: 'compass', label: 'Flotte' },
    { icon: 'ticket', label: 'Mieten' },
    { icon: 'wallet', label: 'Wallet' },
    { icon: 'user', label: 'Profil' },
  ];
  return (
    <div style={{
      background: T.surface,
      borderTop: `1px solid ${T.line}`,
      padding: platform === 'ios' ? '10px 8px 28px' : '8px 8px 12px',
      display: 'flex', justifyContent: 'space-around',
    }}>
      {tabs.map(t => (
        <div key={t.label} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          color: t.active ? T.accent : T.textMuted, padding: '4px 0',
        }}>
          <RxIcon name={t.icon} size={22} sw={t.active ? 2 : 1.6}/>
          <div style={{
            fontFamily: RX_FONT_SANS, fontSize: 10, fontWeight: t.active ? 600 : 500,
            letterSpacing: 0.1,
          }}>{t.label}</div>
        </div>
      ))}
    </div>
  );
};

Object.assign(window, {
  CarPlaceholder, SectionHead, GreetingBlock, InlineSearch, SearchTrigger,
  CategoryStrip, FleetCarousel, RewardsCard, LocationList, RxTabBar,
});
