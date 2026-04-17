import { useState, useRef, useCallback } from 'react';
import { TreeDeciduous, Crosshair, Building2, Wind, X, ChevronRight } from 'lucide-react';
import { TIMELINE_EVENTOS } from '../data/timeline';
import { ESPECIES } from '../data/especies';
import ImagePlaceholder from '../components/ImagePlaceholder';
import ConservationBadge from '../components/ConservationBadge';

const TIPOS = [
  { id: 'todos',         label: 'Todos',         icon: null        },
  { id: 'deforestacion', label: 'Deforestación',  icon: TreeDeciduous },
  { id: 'caza',          label: 'Caza',           icon: Crosshair   },
  { id: 'urbanizacion',  label: 'Urbanización',   icon: Building2   },
  { id: 'contaminacion', label: 'Contaminación',  icon: Wind        },
];

const TIPO_COLOR = {
  deforestacion: '#4fc3f7',
  caza:          'rgba(239,154,154,0.9)',
  urbanizacion:  'rgba(180,190,200,0.8)',
  contaminacion: 'rgba(130,210,180,0.7)',
};

const DECADAS = [1900, 1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

// Vertical position of event dots on the track
const DOT_Y = 48;
// Track starts at x=80, each decade = 80px
const TRACK_START = 80;
const DECADE_W = 80;

function yearToX(año) {
  const decade = Math.floor(año / 10) * 10;
  const decadeIdx = DECADAS.indexOf(decade);
  if (decadeIdx < 0) return TRACK_START;
  const offset = (año - decade) / 10;
  return TRACK_START + (decadeIdx + offset) * DECADE_W;
}

const TRACK_WIDTH = TRACK_START + DECADAS.length * DECADE_W + 40;

export default function Timeline() {
  const [filtro, setFiltro] = useState('todos');
  const [selected, setSelected] = useState(null);
  const scrollRef = useRef(null);

  const eventos = filtro === 'todos'
    ? TIMELINE_EVENTOS
    : TIMELINE_EVENTOS.filter(e => e.tipo === filtro);

  const getEspecie = useCallback((id) => ESPECIES.find(e => e.id === id), []);

  return (
    <div style={{ minHeight: '100%', background: '#0a1628', paddingBottom: 24 }}>
      {/* Header */}
      <div style={{ padding: '28px 20px 16px' }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', fontWeight: 500, color: '#4fc3f7', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>Wild Col</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.9rem', fontWeight: 600, color: '#f0f4f8', lineHeight: 1.1, marginBottom: 8 }}>
          Línea de tiempo
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', color: 'rgba(240,244,248,0.45)', lineHeight: 1.5 }}>
          20 eventos documentados que marcaron la biodiversidad colombiana desde 1900.
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, padding: '0 20px 20px', overflowX: 'auto' }} className="no-scrollbar">
        {TIPOS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setFiltro(id)}
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '7px 14px',
              borderRadius: 8,
              border: `1px solid ${filtro === id ? (TIPO_COLOR[id] ?? '#4fc3f7') : 'rgba(240,244,248,0.12)'}`,
              background: filtro === id ? 'rgba(79,195,247,0.1)' : 'transparent',
              color: filtro === id ? (TIPO_COLOR[id] ?? '#4fc3f7') : 'rgba(240,244,248,0.45)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {Icon && <Icon size={13} strokeWidth={1.5} />}
            {label}
          </button>
        ))}
      </div>

      {/* Timeline scroll area */}
      <div
        ref={scrollRef}
        style={{ overflowX: 'auto', paddingBottom: 8, cursor: 'grab', WebkitOverflowScrolling: 'touch' }}
        className="no-scrollbar"
      >
        <svg
          width={TRACK_WIDTH}
          height={120}
          style={{ display: 'block', userSelect: 'none' }}
        >
          {/* Track line */}
          <line
            x1={TRACK_START - 20} y1={DOT_Y}
            x2={TRACK_WIDTH - 20} y2={DOT_Y}
            stroke="rgba(79,195,247,0.2)"
            strokeWidth={1}
          />

          {/* Decade markers */}
          {DECADAS.map((dec, i) => {
            const x = TRACK_START + i * DECADE_W;
            return (
              <g key={dec}>
                <line x1={x} y1={DOT_Y - 6} x2={x} y2={DOT_Y + 6} stroke="rgba(79,195,247,0.3)" strokeWidth={1} />
                <text
                  x={x} y={DOT_Y + 22}
                  textAnchor="middle"
                  style={{ fontSize: '9px', fontFamily: "'DM Sans', sans-serif", fill: 'rgba(240,244,248,0.3)' }}
                >
                  {dec}
                </text>
              </g>
            );
          })}

          {/* Events */}
          {TIMELINE_EVENTOS.map(ev => {
            const x = yearToX(ev.año);
            const active = filtro === 'todos' || ev.tipo === filtro;
            const isSelected = selected?.id === ev.id;
            const color = TIPO_COLOR[ev.tipo] ?? '#4fc3f7';
            return (
              <g
                key={ev.id}
                onClick={() => setSelected(ev)}
                style={{ cursor: 'pointer' }}
              >
                {/* Connector line */}
                <line
                  x1={x} y1={DOT_Y - 8}
                  x2={x} y2={DOT_Y - 24}
                  stroke={active ? color : 'rgba(240,244,248,0.08)'}
                  strokeWidth={active ? 1.2 : 0.5}
                  style={{ transition: 'stroke 0.3s, opacity 0.3s' }}
                />
                {/* Dot */}
                <circle
                  cx={x} cy={DOT_Y - 8}
                  r={isSelected ? 7 : 5}
                  fill={active ? color : 'rgba(240,244,248,0.08)'}
                  stroke={isSelected ? '#f0f4f8' : 'none'}
                  strokeWidth={1.5}
                  style={{ transition: 'all 0.25s ease', opacity: active ? 1 : 0.2 }}
                />
                {/* Year label */}
                <text
                  x={x} y={DOT_Y - 30}
                  textAnchor="middle"
                  style={{
                    fontSize: '8px',
                    fontFamily: "'DM Sans', sans-serif",
                    fill: active ? color : 'rgba(240,244,248,0.1)',
                    transition: 'fill 0.3s, opacity 0.3s',
                    opacity: active ? 1 : 0.3,
                  }}
                >
                  {ev.año}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, padding: '4px 20px 16px', flexWrap: 'wrap' }}>
        {Object.entries(TIPO_COLOR).map(([tipo, color]) => (
          <div key={tipo} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', color: 'rgba(240,244,248,0.35)', textTransform: 'capitalize' }}>{tipo}</span>
          </div>
        ))}
      </div>

      {/* Selected event card */}
      {selected ? (
        <EventCard evento={selected} getEspecie={getEspecie} onClose={() => setSelected(null)} />
      ) : (
        /* Event list */
        <div style={{ padding: '0 16px' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', color: 'rgba(240,244,248,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
            {eventos.length} evento{eventos.length !== 1 ? 's' : ''} · Toca un punto o una tarjeta
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {eventos.map(ev => {
              const color = TIPO_COLOR[ev.tipo] ?? '#4fc3f7';
              const esp = getEspecie(ev.especieId);
              return (
                <button
                  key={ev.id}
                  onClick={() => setSelected(ev)}
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                    padding: '14px',
                    background: 'rgba(30,45,61,0.5)',
                    border: '1px solid rgba(240,244,248,0.06)',
                    borderLeft: `3px solid ${color}`,
                    borderRadius: '0 10px 10px 0',
                    textAlign: 'left',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 6, overflow: 'hidden' }}>
                    <ImagePlaceholder especie={esp} style={{ width: 44, height: 44 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: color, fontWeight: 600 }}>{ev.año}</span>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', color: 'rgba(240,244,248,0.3)', textTransform: 'capitalize' }}>{ev.tipo}</span>
                    </div>
                    <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1rem', fontWeight: 600, color: '#f0f4f8', margin: '0 0 3px', lineHeight: 1.2 }}>{ev.titulo}</p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: 'rgba(240,244,248,0.4)', margin: 0 }}>{ev.especieNombre}</p>
                  </div>
                  <ChevronRight size={16} strokeWidth={1.5} style={{ color: 'rgba(240,244,248,0.2)', flexShrink: 0, marginTop: 2 }} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function EventCard({ evento: ev, getEspecie, onClose }) {
  const especie = getEspecie(ev.especieId);
  const color = TIPO_COLOR[ev.tipo] ?? '#4fc3f7';

  return (
    <div className="panel-enter" style={{ margin: '0 16px', borderRadius: 12, border: '1px solid rgba(79,195,247,0.15)', background: 'rgba(30,45,61,0.7)', overflow: 'hidden' }}>
      {/* Card image */}
      <div style={{ position: 'relative', height: 160 }}>
        <ImagePlaceholder especie={especie} style={{ width: '100%', height: 160 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,22,40,0.9) 0%, transparent 60%)' }} />
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(10,22,40,0.7)', border: 'none', borderRadius: 6, padding: 6, color: 'rgba(240,244,248,0.6)', cursor: 'pointer' }}
        >
          <X size={16} strokeWidth={1.5} />
        </button>
        <div style={{ position: 'absolute', bottom: 12, left: 14 }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', fontWeight: 600, color: color, display: 'block', marginBottom: 2, textTransform: 'capitalize' }}>
            {ev.año} · {ev.tipo}
          </span>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem', fontWeight: 600, color: '#f0f4f8', margin: 0, lineHeight: 1.2 }}>{ev.titulo}</h2>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Species + status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(240,244,248,0.06)' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: 'rgba(240,244,248,0.6)', margin: 0, flex: 1 }}>{ev.especieNombre}</p>
          {ev.estadoAntes && (
            <>
              <ConservationBadge estado={ev.estadoAntes} short />
              <span style={{ color: 'rgba(240,244,248,0.2)', fontSize: 12 }}>→</span>
            </>
          )}
          <ConservationBadge estado={ev.estadoDespues} short />
        </div>

        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: 'rgba(240,244,248,0.7)', lineHeight: 1.65, marginBottom: 14 }}>{ev.descripcion}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ background: 'rgba(10,22,40,0.5)', borderRadius: 8, padding: '10px 12px' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', fontWeight: 600, color: color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Causa</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', color: 'rgba(240,244,248,0.65)', margin: 0, lineHeight: 1.55 }}>{ev.causa}</p>
          </div>
          <div style={{ background: 'rgba(10,22,40,0.5)', borderRadius: 8, padding: '10px 12px' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', fontWeight: 600, color: 'rgba(239,154,154,0.7)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Consecuencia</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', color: 'rgba(240,244,248,0.65)', margin: 0, lineHeight: 1.55 }}>{ev.consecuencia}</p>
          </div>
        </div>

        {ev.departamentos?.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {ev.departamentos.map(d => (
              <span key={d} style={{ background: 'rgba(79,195,247,0.06)', border: '1px solid rgba(79,195,247,0.15)', borderRadius: 4, padding: '2px 8px', fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', color: 'rgba(240,244,248,0.45)' }}>{d}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
