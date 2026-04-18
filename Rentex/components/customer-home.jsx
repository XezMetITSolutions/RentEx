// Rentex customer home — top-level screens for iOS & Android
// Uses CustomerBlocks: GreetingBlock, InlineSearch, SearchTrigger, CategoryStrip,
// FleetCarousel, RewardsCard, LocationList, RxTabBar, SectionHead

// ─── Custom top bar (replaces IOSNavBar/AndroidAppBar) ─────
const RxTopBar = ({ T, platform = 'ios' }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: platform === 'ios' ? '54px 20px 0' : '6px 16px 0',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 7,
        background: T.accent, color: T.accentInk,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: RX_FONT_MONO, fontSize: 15, fontWeight: 700, letterSpacing: -0.5,
      }}>R</div>
      <div>
        <div style={{ fontFamily: RX_FONT_SANS, fontSize: 15, fontWeight: 600, color: T.text, letterSpacing: -0.2 }}>
          Rentex
        </div>
        <div style={{ fontFamily: RX_FONT_MONO, fontSize: 8.5, color: T.textFaint, letterSpacing: 1, textTransform: 'uppercase', marginTop: -1 }}>
          Wien · AT
        </div>
      </div>
    </div>
    <div style={{ display: 'flex', gap: 6 }}>
      <div style={{
        width: 38, height: 38, borderRadius: 9,
        background: T.surface, border: `1px solid ${T.line}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: T.text, position: 'relative',
      }}>
        <RxIcon name="bell" size={18} sw={1.6}/>
        <div style={{
          position: 'absolute', top: 8, right: 10, width: 6, height: 6,
          borderRadius: '50%', background: T.accent, border: `1.5px solid ${T.surface}`,
        }}/>
      </div>
      <div style={{
        width: 38, height: 38, borderRadius: 9,
        background: T.text, color: T.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: RX_FONT_SANS, fontSize: 12, fontWeight: 600,
      }}>LK</div>
    </div>
  </div>
);

// ─── Bottom sheet overlay (Variation B) ─────────────────────
const SearchSheet = ({ T, open, onClose }) => {
  if (!open) return null;
  const step = (kicker, value, sub, icon, filled = false) => (
    <button style={{
      width: '100%', textAlign: 'left', cursor: 'pointer',
      background: filled ? T.surface : 'transparent',
      border: `1px solid ${filled ? T.text : T.line}`,
      borderRadius: 10, padding: '14px 14px',
      display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10,
    }}>
      <div style={{ color: filled ? T.accent : T.textMuted }}>
        <RxIcon name={icon} size={18} sw={1.7}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: RX_FONT_MONO, fontSize: 9, letterSpacing: 0.8, color: T.textFaint, textTransform: 'uppercase', marginBottom: 2 }}>
          {kicker}
        </div>
        <div style={{ fontFamily: RX_FONT_SANS, fontSize: 15, fontWeight: filled ? 600 : 400, color: filled ? T.text : T.textMuted, letterSpacing: -0.1 }}>
          {value}
        </div>
        {sub && <div style={{ fontFamily: RX_FONT_SANS, fontSize: 11, color: T.textMuted, marginTop: 2 }}>{sub}</div>}
      </div>
    </button>
  );
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 80,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      background: 'rgba(0,0,0,0.35)',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: T.bg, borderRadius: '20px 20px 0 0',
        padding: '10px 20px 28px', boxShadow: '0 -8px 30px rgba(0,0,0,0.12)',
      }}>
        <div style={{
          width: 36, height: 4, borderRadius: 2, background: T.lineStrong,
          margin: '6px auto 16px',
        }}/>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontFamily: RX_FONT_SANS, fontSize: 19, fontWeight: 600, color: T.text, letterSpacing: -0.3 }}>
            Fahrzeug suchen
          </div>
          <div onClick={onClose} style={{ fontFamily: RX_FONT_SANS, fontSize: 13, color: T.textMuted, cursor: 'pointer' }}>
            Abbrechen
          </div>
        </div>
        {step('Abholort', 'Wien Hauptbahnhof', 'Station 04 · 24/7', 'location', true)}
        {step('Rückgabeort', 'Selber Ort wie Abholung', null, 'location', true)}
        {step('Abholung', 'Mi. 22. Apr. 2026', '10:00 Uhr', 'calendar', true)}
        {step('Rückgabe', 'Fr. 24. Apr. 2026', '10:00 Uhr · 2 Tage', 'calendar', true)}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.line}`,
        }}>
          <div>
            <div style={{ fontFamily: RX_FONT_MONO, fontSize: 9, letterSpacing: 0.8, color: T.textFaint, textTransform: 'uppercase' }}>
              Ab
            </div>
            <div style={{ fontFamily: RX_FONT_MONO, fontSize: 22, fontWeight: 500, color: T.text }}>
              € 58<span style={{ fontSize: 12, color: T.textFaint }}>/Tag</span>
            </div>
          </div>
          <button style={{
            padding: '14px 22px', borderRadius: 10,
            background: T.accent, color: T.accentInk, border: 'none',
            fontFamily: RX_FONT_SANS, fontSize: 15, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            28 Ergebnisse anzeigen
            <RxIcon name="arrow" size={15} sw={2} color={T.accentInk}/>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Home body (variation-aware) ────────────────────────
const CustomerHomeBody = ({ T, variation, onOpenSheet, activeField, setActiveField, platform }) => (
  <>
    <GreetingBlock T={T} name="Lukas Berger" km={1240}/>
    {variation === 'inline' ? (
      <InlineSearch T={T} activeField={activeField} setActiveField={setActiveField}/>
    ) : (
      <SearchTrigger T={T} onOpen={onOpenSheet}/>
    )}

    <SectionHead T={T} kicker="Fahrzeugklassen" title="Nach Klasse stöbern"/>
    <CategoryStrip T={T}/>

    <div style={{ height: 28 }}/>
    <SectionHead T={T} kicker="Für dich ausgewählt" title="Beliebte Fahrzeuge" action="Alle →"/>
    <FleetCarousel T={T}/>

    <div style={{ height: 28 }}/>
    <RewardsCard T={T}/>

    <div style={{ height: 28 }}/>
    <SectionHead T={T} kicker="In deiner Nähe" title="Stationen" action="Karte →"/>
    <LocationList T={T}/>

    <div style={{ height: 32 }}/>
  </>
);

Object.assign(window, { RxTopBar, SearchSheet, CustomerHomeBody });
