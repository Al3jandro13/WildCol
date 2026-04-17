import { NavLink } from 'react-router-dom';
import { Map, Zap, Clock, Timer } from 'lucide-react';

const NAV = [
  { to: '/mapa',      icon: Map,   label: 'Mapa'       },
  { to: '/simulador', icon: Zap,   label: 'Simulador'  },
  { to: '/timeline',  icon: Clock, label: 'Timeline'   },
  { to: '/extincion', icon: Timer, label: 'Extinción'  },
];

export default function BottomNav() {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'rgba(10,22,40,0.96)',
        borderTop: '1px solid rgba(79,195,247,0.12)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        height: '60px',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {NAV.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px', textDecoration: 'none' }}
        >
          {({ isActive }) => (
            <>
              <Icon
                size={20}
                strokeWidth={1.5}
                style={{ color: isActive ? '#4fc3f7' : 'rgba(240,244,248,0.35)', transition: 'color 0.2s' }}
              />
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontWeight: isActive ? 500 : 400,
                  letterSpacing: '0.05em',
                  color: isActive ? '#4fc3f7' : 'rgba(240,244,248,0.35)',
                  transition: 'color 0.2s',
                }}
              >
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
