// Minimal icon set — 24px stroke, monoline, DACH corporate feel

const RxIcon = ({ name, size = 20, color = 'currentColor', sw = 1.6 }) => {
  const p = { fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const icons = {
    search: <><circle cx="11" cy="11" r="7" {...p}/><path d="M16 16l4 4" {...p}/></>,
    location: <><path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z" {...p}/><circle cx="12" cy="10" r="2.5" {...p}/></>,
    calendar: <><rect x="3.5" y="5" width="17" height="15" rx="2" {...p}/><path d="M3.5 10h17M8 3v4M16 3v4" {...p}/></>,
    car: <><path d="M3 14l2-6a2 2 0 012-1.5h10A2 2 0 0119 8l2 6" {...p}/><path d="M3 14h18v4a1 1 0 01-1 1h-2a1 1 0 01-1-1v-1H7v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-4z" {...p}/><circle cx="7" cy="16.5" r="1.2" fill={color} stroke="none"/><circle cx="17" cy="16.5" r="1.2" fill={color} stroke="none"/></>,
    bell: <><path d="M6 16V11a6 6 0 1112 0v5l1.5 2h-15L6 16z" {...p}/><path d="M10 20a2 2 0 004 0" {...p}/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" {...p}/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" {...p}/></>,
    clock: <><circle cx="12" cy="12" r="8" {...p}/><path d="M12 8v4l3 2" {...p}/></>,
    shield: <><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3z" {...p}/><path d="M9 12l2 2 4-4" {...p}/></>,
    star: <><path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8l-5.8 3.1L7.3 14.4 2.6 9.8l6.5-.9L12 3z" {...p}/></>,
    user: <><circle cx="12" cy="8" r="4" {...p}/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" {...p}/></>,
    settings: <><circle cx="12" cy="12" r="3" {...p}/><path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" {...p}/></>,
    key: <><circle cx="8" cy="15" r="4" {...p}/><path d="M11 12l9-9M17 6l2 2M15 8l2 2" {...p}/></>,
    gauge: <><path d="M4 18a8 8 0 1116 0" {...p}/><path d="M12 18l4-4" {...p}/><circle cx="12" cy="18" r="1" fill={color} stroke="none"/></>,
    plus: <><path d="M12 5v14M5 12h14" {...p}/></>,
    chevron: <><path d="M9 6l6 6-6 6" {...p}/></>,
    check: <><path d="M5 12l5 5L20 7" {...p}/></>,
    swap: <><path d="M7 7h13l-3-3M17 17H4l3 3" {...p}/></>,
    fuel: <><path d="M5 21V5a2 2 0 012-2h7a2 2 0 012 2v16" {...p}/><path d="M3 21h14M16 11h2a2 2 0 012 2v4a1 1 0 001 1M20 8l-2-2" {...p}/></>,
    home: <><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9z" {...p}/></>,
    compass: <><circle cx="12" cy="12" r="9" {...p}/><path d="M15 9l-1.5 4.5L9 15l1.5-4.5L15 9z" {...p}/></>,
    wallet: <><rect x="3" y="6" width="18" height="13" rx="2" {...p}/><path d="M3 10h18M16 14h2" {...p}/></>,
    ticket: <><path d="M3 9a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 000-4V9z" {...p}/><path d="M13 7v10" strokeDasharray="2 2" {...p}/></>,
    seat: <><path d="M6 20v-4h12v4M7 16l1-8h8l1 8M4 20h16" {...p}/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>
      {icons[name]}
    </svg>
  );
};

Object.assign(window, { RxIcon });
