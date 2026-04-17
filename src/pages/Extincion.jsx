import { useState, useEffect, useRef, useCallback } from 'react';
import { Search } from 'lucide-react';
import { ESPECIES } from '../data/especies';
import ImagePlaceholder from '../components/ImagePlaceholder';
import ConservationBadge from '../components/ConservationBadge';

// Tasa IDEAM: 170.000 ha/año → m²/segundo
const HA_POR_ANIO = 170_000;
const M2_POR_ANIO = HA_POR_ANIO * 10_000;
const M2_POR_SEG  = M2_POR_ANIO / (365.25 * 24 * 3600); // ≈ 5.39 m²/s

const EQUIVALENCIAS = [
  (m2) => `${(m2 / 7140).toFixed(1)} canchas de fútbol`,
  (m2) => `${(m2 / 10000).toFixed(1)} hectáreas`,
  (m2) => `${(m2 / 42530).toFixed(1)} estadios Atanasio Girardot`,
  (m2) => `${(m2 / 3000).toFixed(1)} manzanas de ciudad colombiana`,
  (m2) => `${(m2 / 8000).toFixed(1)} bloques de Manhattan`,
];

const FRASES_PERDIDA = {
  'carpintero-buchon':      'Sin esta especie, 40 especies de aves y mamíferos pierden sus únicos sitios de anidación en el Chocó.',
  'tangara-multicolor':     'Su extinción eliminaría el único dispersor de semillas de Miconia en la cordillera Occidental.',
  'aguila-arpia':           'El desequilibrio de primates arborícolas desencadenaría una crisis de herbivoría en el dosel amazónico.',
  'colibri-pico-espada':    '8 especies de flores de corola profunda quedarían sin polinizador en los Andes colombianos.',
  'tucan-choco':            'La regeneración del dosel del Chocó perdería su principal dispersor de semillas de gran tamaño.',
  'puercoespin-andino':     'Sin herbivoría controlada en el sotobosque, ciertas plantas dominarían y desplazarían la diversidad andina.',
  'murcielago-nariz-lanza': 'Más de 60 especies de plantas, incluyendo el cacao silvestre, perderían su único polinizador nocturno.',
  'cabassous-centroamericano': 'Los ecosistemas de termitas del Caribe colombiano quedarían sin su principal regulador natural.',
  'rata-colorada':          'Serpientes, rapaces y carnívoros del Pacífico perderían una presa clave. El bosque perdería su dispersor de esporas.',
  'musarana-andina':        '18 millones de colombianos dependen del agua que estos páramos producen, y el frailejón la necesita para florecer.',
  'caiman-llanero':         'Sin depredador tope, la ictiofauna del Orinoco colapsa. Los pozos de sequía desaparecen con él.',
  'tortuga-morrocoy':       '20 especies de árboles tropicales perderían el único animal capaz de germinar sus semillas.',
  'gecko-cotudo':           'El suelo del Chocó acumularía microartrópodos sin control, colapso de la descomposición orgánica.',
  'rana-cohete':            'Bioindicador de calidad del agua: su ausencia significa que el Chocó ya no puede detectar su propia contaminación.',
  'serpiente-coral-andina': 'La superpoblación de serpientes pequeñas destruiría a las musarañas y colapsaría la cadena hacia los rapaces.',
  'fraileton':              'Bogotá y 5 millones de personas perderían la esponja hídrica que regula el agua que beben cada día.',
  'helecho-arboreo':        'Más de 200 especies de epífitas perderían su hábitat. La recuperación de bosques tras deslizamientos sería imposible.',
  'bromelia-andina':        '12 especies de ranas miniatura de los Andes no tienen otro lugar donde reproducirse en todo Colombia.',
  'arbol-caucho':           'El Amazonas colombiano perdería uno de sus principales secuestradores de carbono y su ecosistema de insectos especialistas.',
  'victoria-amazonica':     'Tortugas, peces y aves acuáticas del Amazonas pierden su refugio y zonas de crianza más importantes.',
  'rana-cristal-choco':     'Las quebradas del Chocó quedarían sin su principal indicador biológico de calidad del agua.',
  'colibri-chiribiquete':   'La flora endémica de la Serranía de Chiribiquete quedaría sin polinizador en este ecosistema único e irreemplazable.',
  'pez-guitarra-magdalena': '2 millones de pescadores ribereños del Magdalena perderían una fuente clave de proteína y de sustento económico.',
  'orquidea-dracula':       'La pérdida de la Dracula eliminaría el engaño evolutivo más elaborado de la flora colombiana, irrepetible.',
  'titi-cabeciblanco':      'Colombia perdería su único primate endémico. Los bosques secos del Caribe quedarían sin su único dispersor de semillas del dosel.',
};

function formatM2(value) {
  // Show as large integer with thousands separator, plus 2 decimals
  const intPart = Math.floor(value).toLocaleString('es-CO');
  const dec = (value % 1).toFixed(2).slice(1); // ".XX"
  return intPart + dec;
}

export default function Extincion() {
  const startRef   = useRef(Date.now());
  const [m2, setM2]               = useState(0);
  const [equivIdx, setEquivIdx]   = useState(0);
  const [especie, setEspecie]     = useState(null);
  const [especieIdx, setEspecieIdx] = useState(0);
  const [showCard, setShowCard]   = useState(false);
  const rafRef = useRef(null);

  // Counter
  useEffect(() => {
    const tick = () => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      setM2(elapsed * M2_POR_SEG);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Rotate equivalencies every 10 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setEquivIdx(i => (i + 1) % EQUIVALENCIAS.length);
    }, 10_000);
    return () => clearInterval(id);
  }, []);

  // "Ver qué había aquí" — cycle through all species before repeating
  const handleVerEspecie = useCallback(() => {
    const nextIdx = (especieIdx) % ESPECIES.length;
    setEspecie(ESPECIES[nextIdx]);
    setEspecieIdx(nextIdx + 1);
    setShowCard(true);
  }, [especieIdx]);

  const equiv = EQUIVALENCIAS[equivIdx](m2);

  return (
    <div
      style={{
        minHeight: '100%',
        background: '#0a1628',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 20px 32px',
      }}
    >
      {/* Header */}
      <div style={{ width: '100%', paddingTop: '28px', paddingBottom: '8px' }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', fontWeight: 500, color: '#4fc3f7', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>Wild Col</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.9rem', fontWeight: 600, color: '#f0f4f8', lineHeight: 1.1, marginBottom: 8 }}>
          Reloj de extinción
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', color: 'rgba(240,244,248,0.4)', lineHeight: 1.5 }}>
          Metros cuadrados de hábitat colombiano destruidos desde que abriste esta página.
        </p>
      </div>

      {/* Rate tag */}
      <div style={{ alignSelf: 'flex-start', background: 'rgba(79,195,247,0.08)', border: '1px solid rgba(79,195,247,0.2)', borderRadius: 6, padding: '4px 12px', marginBottom: 32 }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', color: '#4fc3f7', letterSpacing: '0.06em' }}>
          Fuente IDEAM · 170.000 ha/año · {M2_POR_SEG.toFixed(2)} m²/s
        </span>
      </div>

      {/* Giant counter */}
      <div style={{ textAlign: 'center', marginBottom: 12, width: '100%' }}>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(2.4rem, 11vw, 4.2rem)',
            fontWeight: 600,
            color: '#f0f4f8',
            lineHeight: 1,
            letterSpacing: '-0.02em',
            tabularNums: 'tabular-nums',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatM2(m2)}
        </div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: 'rgba(240,244,248,0.4)', marginTop: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          metros cuadrados
        </p>
      </div>

      {/* Equivalence */}
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          textAlign: 'center',
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 40,
        }}
      >
        <p
          key={equivIdx}
          className="animate-fade-in"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontSize: '1.15rem',
            color: 'rgba(240,244,248,0.5)',
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          equivale a {equiv}
        </p>
      </div>

      {/* CTA button */}
      <button
        onClick={handleVerEspecie}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 28px',
          borderRadius: 12,
          background: 'rgba(79,195,247,0.1)',
          border: '1px solid rgba(79,195,247,0.35)',
          color: '#4fc3f7',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '0.88rem',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s',
          letterSpacing: '0.02em',
          marginBottom: 40,
        }}
        className="animate-pulse-accent"
      >
        <Search size={18} strokeWidth={1.5} />
        Ver qué había aquí
      </button>

      {/* Visual scale bar */}
      <div style={{ width: '100%', maxWidth: 380, marginBottom: 40 }}>
        <div style={{ height: 2, background: 'rgba(240,244,248,0.06)', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${Math.min(100, (m2 / (M2_POR_ANIO / 100)) * 100)}%`,
              background: 'linear-gradient(90deg, rgba(79,195,247,0.5), rgba(239,154,154,0.6))',
              borderRadius: 2,
              transition: 'width 0.5s ease',
              maxWidth: '100%',
            }}
          />
        </div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', color: 'rgba(240,244,248,0.2)', marginTop: 6, textAlign: 'right' }}>
          de una tasa anual de 170.000 ha
        </p>
      </div>

      {/* Species card */}
      {showCard && especie && (
        <div
          className="animate-slide-up"
          style={{
            width: '100%',
            maxWidth: 400,
            background: 'rgba(30,45,61,0.8)',
            border: '1px solid rgba(79,195,247,0.15)',
            borderRadius: 14,
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'relative', height: 180 }}>
            <ImagePlaceholder especie={especie} style={{ width: '100%', height: 180 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(30,45,61,0.95) 0%, transparent 50%)' }} />
            <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16 }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', fontWeight: 600, color: '#f0f4f8', margin: '0 0 2px', lineHeight: 1.1 }}>
                {especie.nombre}
              </h3>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontSize: '0.82rem', color: 'rgba(240,244,248,0.5)', margin: 0 }}>
                {especie.nombreCientifico}
              </p>
            </div>
          </div>

          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {especie.departamentos.slice(0, 3).map(d => (
                  <span key={d} style={{ background: 'rgba(79,195,247,0.06)', border: '1px solid rgba(79,195,247,0.15)', borderRadius: 4, padding: '2px 8px', fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', color: 'rgba(240,244,248,0.45)' }}>{d}</span>
                ))}
                {especie.departamentos.length > 3 && (
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', color: 'rgba(240,244,248,0.3)', alignSelf: 'center' }}>+{especie.departamentos.length - 3}</span>
                )}
              </div>
              <ConservationBadge estado={especie.estadoUICN} short />
            </div>

            <div style={{ borderLeft: '2px solid rgba(239,154,154,0.4)', paddingLeft: 12, marginBottom: 0 }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', fontWeight: 600, color: 'rgba(239,154,154,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                Si desaparece
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: 'rgba(240,244,248,0.7)', lineHeight: 1.6, margin: 0 }}>
                {FRASES_PERDIDA[especie.id] ?? especie.importanciaEcologica}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom note */}
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', color: 'rgba(240,244,248,0.18)', textAlign: 'center', marginTop: 32, lineHeight: 1.7, maxWidth: 320 }}>
        Este contador nunca se detiene. En Colombia se pierden 170.000 hectáreas de bosque cada año según datos del IDEAM 2022.
      </p>
    </div>
  );
}
