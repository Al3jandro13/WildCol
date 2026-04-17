import { useState, useCallback, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { ECOSISTEMAS } from '../data/ecosistemas';

const ROL_COLOR = {
  'Productor':             { bg: 'rgba(79,195,247,0.18)',  border: 'rgba(79,195,247,0.4)',  text: '#4fc3f7'              },
  'Consumidor primario':   { bg: 'rgba(130,180,220,0.15)', border: 'rgba(130,180,220,0.35)', text: 'rgba(240,244,248,0.8)' },
  'Consumidor secundario': { bg: 'rgba(100,140,180,0.13)', border: 'rgba(100,140,180,0.3)',  text: 'rgba(240,244,248,0.7)' },
  'Depredador tope':       { bg: 'rgba(239,154,154,0.12)', border: 'rgba(239,154,154,0.3)',  text: 'rgba(239,154,154,0.9)' },
};

const COLLAPSED_STYLE = {
  bg: 'rgba(30,45,61,0.3)',
  border: 'rgba(240,244,248,0.08)',
  text: 'rgba(240,244,248,0.2)',
};

const AFFECTED_STYLE = {
  bg: 'rgba(180,100,100,0.12)',
  border: 'rgba(200,100,100,0.3)',
  text: 'rgba(239,154,154,0.6)',
};

// SVG node size
const W = 90, H = 44;

function getNodeStyle(node, collapsed, affected) {
  if (collapsed.has(node.id)) return COLLAPSED_STYLE;
  if (affected.has(node.id)) return AFFECTED_STYLE;
  return ROL_COLOR[node.rol] ?? ROL_COLOR['Consumidor primario'];
}

function getLinkOpacity(link, collapsed, affected) {
  if (collapsed.has(link.origen) || collapsed.has(link.destino)) return 0.1;
  if (affected.has(link.origen) || affected.has(link.destino)) return 0.25;
  return 0.7;
}

function SimuladorSVG({ eco, collapsed, affected, onToggleNode }) {
  const svgRef = useRef(null);
  // Convert percentage positions to SVG pixels: viewBox 0 0 400 320
  const nodes = eco.nodos.map(n => ({
    ...n,
    px: (n.x / 100) * 400,
    py: (n.y / 100) * 320,
  }));

  const getNode = (id) => nodes.find(n => n.id === id);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 320"
      style={{ width: '100%', display: 'block' }}
    >
      {/* Links */}
      {eco.enlaces.map((link, i) => {
        const from = getNode(link.origen);
        const to = getNode(link.destino);
        if (!from || !to) return null;
        const opacity = getLinkOpacity(link, collapsed, affected);
        const broken = collapsed.has(link.origen) || collapsed.has(link.destino);
        return (
          <line
            key={i}
            x1={from.px} y1={from.py}
            x2={to.px}   y2={to.py}
            stroke="#4fc3f7"
            strokeWidth={1.2}
            strokeDasharray={broken ? '4 6' : '6 3'}
            opacity={opacity}
            style={{
              transition: 'opacity 0.5s ease, stroke-dasharray 0.4s ease',
            }}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map(node => {
        const s = getNodeStyle(node, collapsed, affected);
        const isCollapsed = collapsed.has(node.id);
        const isAffected = affected.has(node.id);
        return (
          <g
            key={node.id}
            transform={`translate(${node.px - W / 2}, ${node.py - H / 2})`}
            onClick={() => onToggleNode(node)}
            style={{ cursor: 'pointer' }}
          >
            <rect
              width={W}
              height={H}
              rx={8}
              fill={s.bg}
              stroke={s.border}
              strokeWidth={isCollapsed ? 0.5 : 1.2}
              style={{ transition: 'all 0.45s ease', opacity: isCollapsed ? 0.4 : 1 }}
            />
            <text
              x={W / 2}
              y={16}
              textAnchor="middle"
              style={{
                fontSize: '9px',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                fill: s.text,
                pointerEvents: 'none',
                transition: 'fill 0.4s',
                opacity: isCollapsed ? 0.3 : 1,
              }}
            >
              {node.nombre.length > 14 ? node.nombre.slice(0, 13) + '…' : node.nombre}
            </text>
            <text
              x={W / 2}
              y={30}
              textAnchor="middle"
              style={{
                fontSize: '7px',
                fontFamily: "'DM Sans', sans-serif",
                fill: isCollapsed ? 'rgba(240,244,248,0.15)' : 'rgba(240,244,248,0.4)',
                pointerEvents: 'none',
                transition: 'fill 0.4s',
              }}
            >
              {isCollapsed ? '— eliminado —' : node.rol.slice(0, 18)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Simulador() {
  const [ecoIdx, setEcoIdx] = useState(0);
  const [collapsed, setCollapsed] = useState(new Set());
  const [affected, setAffected] = useState(new Set());
  const [efectos, setEfectos] = useState([]);
  const [animStep, setAnimStep] = useState(0);

  const eco = ECOSISTEMAS[ecoIdx];

  const reset = useCallback(() => {
    setCollapsed(new Set());
    setAffected(new Set());
    setEfectos([]);
    setAnimStep(0);
  }, []);

  const handleEcoChange = useCallback((idx) => {
    setEcoIdx(idx);
    setCollapsed(new Set());
    setAffected(new Set());
    setEfectos([]);
    setAnimStep(0);
  }, []);

  const handleToggleNode = useCallback((node) => {
    if (collapsed.has(node.id)) return; // already eliminated

    const newCollapsed = new Set(collapsed);
    newCollapsed.add(node.id);

    // Find effects
    const efectosDelNodo = eco.efectosColapso[node.id] ?? [];
    const newAffected = new Set(affected);
    efectosDelNodo.forEach(e => {
      if (!newCollapsed.has(e.afectado)) newAffected.add(e.afectado);
    });

    setCollapsed(newCollapsed);
    setAffected(newAffected);
    setAnimStep(0);

    // Animate effects in sequence
    if (efectosDelNodo.length > 0) {
      setEfectos([]);
      efectosDelNodo.forEach((ef, i) => {
        setTimeout(() => {
          setEfectos(prev => [...prev, { ...ef, nodoEliminado: node.nombre }]);
        }, 300 + i * 500);
      });
    }
  }, [collapsed, affected, eco]);

  // Color legend
  const legend = Object.entries(ROL_COLOR).map(([rol, s]) => ({ rol, color: s.border }));

  return (
    <div style={{ minHeight: '100%', background: '#0a1628', paddingBottom: 24 }}>
      {/* Header */}
      <div style={{ padding: '28px 20px 16px' }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', fontWeight: 500, color: '#4fc3f7', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>Wild Col</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.9rem', fontWeight: 600, color: '#f0f4f8', lineHeight: 1.1, marginBottom: 8 }}>
          Simulador de cadena
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', color: 'rgba(240,244,248,0.45)', lineHeight: 1.5 }}>
          Toca una especie para eliminarla y observa el colapso en cadena del ecosistema.
        </p>
      </div>

      {/* Ecosystem tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '0 20px 20px', overflowX: 'auto' }} className="no-scrollbar">
        {ECOSISTEMAS.map((e, i) => (
          <button
            key={e.id}
            onClick={() => handleEcoChange(i)}
            style={{
              flexShrink: 0,
              padding: '8px 18px',
              borderRadius: 8,
              border: `1px solid ${ecoIdx === i ? '#4fc3f7' : 'rgba(240,244,248,0.12)'}`,
              background: ecoIdx === i ? 'rgba(79,195,247,0.12)' : 'transparent',
              color: ecoIdx === i ? '#4fc3f7' : 'rgba(240,244,248,0.5)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.82rem',
              fontWeight: ecoIdx === i ? 500 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {e.nombre}
          </button>
        ))}
        <button
          onClick={reset}
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 8,
            border: '1px solid rgba(240,244,248,0.12)',
            background: 'transparent',
            color: 'rgba(240,244,248,0.4)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.82rem',
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          <RefreshCw size={14} strokeWidth={1.5} /> Reset
        </button>
      </div>

      {/* Ecosystem description */}
      <div style={{ padding: '0 20px 12px' }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: 'rgba(240,244,248,0.35)', letterSpacing: '0.04em' }}>
          {eco.descripcion}
        </p>
      </div>

      {/* Legend */}
      <div style={{ padding: '0 20px 16px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {legend.map(({ rol, color }) => (
          <div key={rol} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', border: `1.5px solid ${color}` }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', color: 'rgba(240,244,248,0.4)' }}>{rol}</span>
          </div>
        ))}
      </div>

      {/* SVG */}
      <div style={{ padding: '0 8px', background: 'rgba(10,22,40,0.6)', margin: '0 12px', borderRadius: 12, border: '1px solid rgba(79,195,247,0.08)' }}>
        <SimuladorSVG
          eco={eco}
          collapsed={collapsed}
          affected={affected}
          onToggleNode={handleToggleNode}
        />
      </div>

      {/* Status bar */}
      {(collapsed.size > 0 || affected.size > 0) && (
        <div style={{ margin: '16px 16px 0', padding: '12px 16px', background: 'rgba(30,45,61,0.6)', borderRadius: 10, border: '1px solid rgba(239,154,154,0.15)', display: 'flex', gap: 20 }}>
          <div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1.4rem', fontWeight: 300, color: 'rgba(239,154,154,0.8)' }}>{collapsed.size}</span>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', color: 'rgba(240,244,248,0.35)', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Eliminadas</p>
          </div>
          <div style={{ width: 1, background: 'rgba(240,244,248,0.08)' }} />
          <div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1.4rem', fontWeight: 300, color: 'rgba(239,154,154,0.5)' }}>{affected.size}</span>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', color: 'rgba(240,244,248,0.35)', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>En colapso</p>
          </div>
          <div style={{ width: 1, background: 'rgba(240,244,248,0.08)' }} />
          <div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1.4rem', fontWeight: 300, color: '#4fc3f7' }}>{eco.nodos.length - collapsed.size - affected.size}</span>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', color: 'rgba(240,244,248,0.35)', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Estables</p>
          </div>
        </div>
      )}

      {/* Cascade effects */}
      {efectos.length > 0 && (
        <div style={{ margin: '16px 16px 0' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', fontWeight: 600, color: 'rgba(240,244,248,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
            Consecuencias en cadena
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {efectos.map((ef, i) => (
              <div
                key={i}
                className="animate-slide-up"
                style={{
                  background: 'rgba(30,45,61,0.7)',
                  border: '1px solid rgba(239,154,154,0.15)',
                  borderLeft: '3px solid rgba(239,154,154,0.4)',
                  borderRadius: '0 8px 8px 0',
                  padding: '12px 14px',
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: 'rgba(239,154,154,0.8)', marginBottom: 4 }}>
                  {ef.afectado.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: 'rgba(240,244,248,0.6)', lineHeight: 1.55, margin: 0 }}>
                  {ef.efecto}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instruction when no interaction yet */}
      {collapsed.size === 0 && (
        <div style={{ margin: '20px 20px 0', textAlign: 'center' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', color: 'rgba(240,244,248,0.25)', lineHeight: 1.6 }}>
            Toca cualquier nodo del ecosistema para simular su desaparición y ver el efecto dominó en tiempo real.
          </p>
        </div>
      )}
    </div>
  );
}
