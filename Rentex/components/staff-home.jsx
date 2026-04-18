// Rentex staff (Mitarbeiter) home — fleet operations dashboard
// Admin-first: today's tasks, fleet status, overdue items, daily revenue

const StaffGreeting = ({ T }) => (
  <div style={{ padding: '4px 20px 18px' }}>
    <div style={{
      fontFamily: RX_FONT_MONO, fontSize: 10, letterSpacing: 1.2,
      color: T.textFaint, textTransform: 'uppercase', marginBottom: 6,
    }}>Schicht · Mi. 22. Apr · 08:14</div>
    <div style={{ fontFamily: RX_FONT_SANS, fontSize: 26, fontWeight: 600, color: T.text, letterSpacing: -0.6, lineHeight: 1.15 }}>
      Station Wien Hbf.
    </div>
    <div style={{ fontFamily: RX_FONT_SANS, fontSize: 13, color: T.textMuted, marginTop: 4 }}>
      14 Übergaben · 9 Rücknahmen heute
    </div>
  </div>
);

// KPI tiles (live operational numbers only)
const StaffKPIs = ({ T }) => {
  const k = [
    { kicker: 'Verfügbar', value: '23', total: '/ 54', hint: 'Fahrzeuge' },
    { kicker: 'In Vermietung', value: '28', hint: 'davon 4 überfällig', warn: true },
    { kicker: 'Werkstatt', value: '3', hint: 'TÜV fällig: 1' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '0 20px 20px' }}>
      {k.map(x => (
        <div key={x.kicker} style={{
          background: T.surface, border: `1px solid ${T.line}`,
          borderRadius: 10, padding: 12,
        }}>
          <div style={{ fontFamily: RX_FONT_MONO, fontSize: 9, letterSpacing: 0.8, color: T.textFaint, textTransform: 'uppercase' }}>
            {x.kicker}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginTop: 6 }}>
            <div style={{ fontFamily: RX_FONT_MONO, fontSize: 24, fontWeight: 500, color: T.text, letterSpacing: -0.5 }}>
              {x.value}
            </div>
            {x.total && <div style={{ fontFamily: RX_FONT_MONO, fontSize: 11, color: T.textFaint }}>{x.total}</div>}
          </div>
          <div style={{ fontFamily: RX_FONT_SANS, fontSize: 10.5, color: x.warn ? T.warn : T.textMuted, marginTop: 4, lineHeight: 1.3 }}>
            {x.hint}
          </div>
        </div>
      ))}
    </div>
  );
};

// Today's timeline — upcoming handovers / returns
const StaffTimeline = ({ T }) => {
  const items = [
    { time: '09:30', type: 'AUS', who: 'M. Huber', car: 'ŠKODA Octavia · W-2841KM', tag: 'Übergabe', primary: true },
    { time: '10:00', type: 'AUS', who: 'A. Kovač', car: 'VW Passat · W-1902BH', tag: 'Übergabe' },
    { time: '10:15', type: 'EIN', who: 'T. Weber', car: 'BMW 3er · W-5512DF', tag: 'Rücknahme', warn: true, warnMsg: '2 Std. verspätet' },
    { time: '11:45', type: 'AUS', who: 'L. Novak', car: 'Renault Clio · W-4420JK', tag: 'Übergabe' },
  ];
  return (
    <div style={{
      margin: '0 20px', background: T.surface, borderRadius: 12,
      border: `1px solid ${T.line}`, overflow: 'hidden',
    }}>
      {items.map((it, i) => (
        <div key={i} style={{
          display: 'flex', gap: 14, padding: '14px 16px',
          borderTop: i > 0 ? `1px solid ${T.line}` : 'none',
          background: it.primary ? T.accentSoft : 'transparent',
        }}>
          <div style={{ width: 48, flexShrink: 0 }}>
            <div style={{ fontFamily: RX_FONT_MONO, fontSize: 13, fontWeight: 600, color: T.text, letterSpacing: -0.2 }}>
              {it.time}
            </div>
            <div style={{
              fontFamily: RX_FONT_MONO, fontSize: 8, fontWeight: 700, letterSpacing: 0.8,
              color: it.type === 'AUS' ? T.accent : T.ok, marginTop: 2,
            }}>{it.tag.toUpperCase()}</div>
          </div>
          <div style={{ width: 1, background: T.line, flexShrink: 0 }}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: RX_FONT_SANS, fontSize: 14, fontWeight: 500, color: T.text, letterSpacing: -0.1 }}>
              {it.who}
            </div>
            <div style={{ fontFamily: RX_FONT_MONO, fontSize: 10.5, color: T.textMuted, marginTop: 2, letterSpacing: 0.2 }}>
              {it.car}
            </div>
            {it.warn && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                marginTop: 6, padding: '2px 6px', borderRadius: 4,
                background: T.accentSoft, color: T.warn,
                fontFamily: RX_FONT_MONO, fontSize: 9.5, fontWeight: 600, letterSpacing: 0.3,
              }}>
                <RxIcon name="clock" size={10} sw={2}/> {it.warnMsg.toUpperCase()}
              </div>
            )}
          </div>
          <RxIcon name="chevron" size={14} color={T.textFaint} sw={1.8}/>
        </div>
      ))}
    </div>
  );
};

// Action row — common quick tasks
const StaffActions = ({ T }) => {
  const acts = [
    { icon: 'key', label: 'Übergabe starten' },
    { icon: 'shield', label: 'Schaden erfassen' },
    { icon: 'gauge', label: 'Fahrtenbuch' },
    { icon: 'ticket', label: 'Strafzettel' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, padding: '0 20px 20px' }}>
      {acts.map(a => (
        <div key={a.label} style={{
          background: T.surface, border: `1px solid ${T.line}`,
          borderRadius: 10, padding: '14px 6px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: T.accentSoft, color: T.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <RxIcon name={a.icon} size={16} sw={1.8}/>
          </div>
          <div style={{
            fontFamily: RX_FONT_SANS, fontSize: 10.5, fontWeight: 500,
            color: T.text, textAlign: 'center', lineHeight: 1.2,
          }}>{a.label}</div>
        </div>
      ))}
    </div>
  );
};

// Alerts (Mahnung, overdue, damage pending)
const StaffAlerts = ({ T }) => {
  const alerts = [
    { kind: 'MAHNUNG', title: '2. Mahnung — R. Schmidt', sub: 'Rechnung #AT-48213 · 14 Tage', amt: '€ 412,00', danger: true },
    { kind: 'STRAFZETTEL', title: 'Radarstrafe weiterleiten', sub: 'VW Passat · W-2841KM · 19.04', amt: '€ 70,00' },
  ];
  return (
    <div style={{ margin: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {alerts.map((a, i) => (
        <div key={i} style={{
          background: T.surface, borderRadius: 10,
          border: `1px solid ${a.danger ? T.danger : T.line}`,
          borderLeft: `3px solid ${a.danger ? T.danger : T.warn}`,
          padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: RX_FONT_MONO, fontSize: 9, fontWeight: 700, letterSpacing: 0.8,
              color: a.danger ? T.danger : T.warn, marginBottom: 3,
            }}>{a.kind}</div>
            <div style={{ fontFamily: RX_FONT_SANS, fontSize: 13.5, fontWeight: 500, color: T.text, letterSpacing: -0.1 }}>
              {a.title}
            </div>
            <div style={{ fontFamily: RX_FONT_MONO, fontSize: 10, color: T.textMuted, marginTop: 2, letterSpacing: 0.2 }}>
              {a.sub}
            </div>
          </div>
          <div style={{ fontFamily: RX_FONT_MONO, fontSize: 14, fontWeight: 500, color: T.text }}>
            {a.amt}
          </div>
        </div>
      ))}
    </div>
  );
};

// Staff tab bar
const StaffTabBar = ({ T, platform = 'ios' }) => {
  const tabs = [
    { icon: 'home', label: 'Heute', active: true },
    { icon: 'car', label: 'Flotte' },
    { icon: 'ticket', label: 'Mieten' },
    { icon: 'shield', label: 'Schäden' },
    { icon: 'settings', label: 'Mehr' },
  ];
  return (
    <div style={{
      background: T.surface, borderTop: `1px solid ${T.line}`,
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
          }}>{t.label}</div>
        </div>
      ))}
    </div>
  );
};

const StaffHomeBody = ({ T }) => (
  <>
    <StaffGreeting T={T}/>
    <StaffKPIs T={T}/>
    <SectionHead T={T} kicker="Heute" title="Übergabe & Rücknahme" action="Kalender →"/>
    <StaffTimeline T={T}/>
    <div style={{ height: 24 }}/>
    <SectionHead T={T} kicker="Schnellzugriff" title="Aktionen"/>
    <StaffActions T={T}/>
    <SectionHead T={T} kicker="Offen" title="Benachrichtigungen" action="Alle →"/>
    <StaffAlerts T={T}/>
    <div style={{ height: 32 }}/>
  </>
);

Object.assign(window, { StaffHomeBody, StaffTabBar });
