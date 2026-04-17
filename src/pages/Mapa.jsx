import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { MapContainer, GeoJSON as LeafletGeoJSON, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ChevronLeft, ChevronRight, X, AlertTriangle, Activity, Info, Heart } from 'lucide-react';
import { DEPARTAMENTO_ESPECIES, ESPECIES } from '../data/especies';
import colombiaGeo from '../data/colombia.geo.json';
import ImagePlaceholder from '../components/ImagePlaceholder';
import ConservationBadge from '../components/ConservationBadge';

// ─── GeoJSON name → species data name ───────────────────────────────────────
const NOMBRE_MAP = {
  'ANTIOQUIA': 'Antioquia',
  'ATLANTICO': 'Atlántico',
  'SANTAFE DE BOGOTA D.C': 'Bogotá D.C.',
  'BOLIVAR': 'Bolívar',
  'BOYACA': 'Boyacá',
  'CALDAS': 'Caldas',
  'CAQUETA': 'Caquetá',
  'CAUCA': 'Cauca',
  'CESAR': 'Cesar',
  'CORDOBA': 'Córdoba',
  'CUNDINAMARCA': 'Cundinamarca',
  'CHOCO': 'Chocó',
  'HUILA': 'Huila',
  'LA GUAJIRA': 'La Guajira',
  'MAGDALENA': 'Magdalena',
  'META': 'Meta',
  'NARIÑO': 'Nariño',
  'NORTE DE SANTANDER': 'Norte de Santander',
  'QUINDIO': 'Quindío',
  'RISARALDA': 'Risaralda',
  'SANTANDER': 'Santander',
  'SUCRE': 'Sucre',
  'TOLIMA': 'Tolima',
  'VALLE DEL CAUCA': 'Valle del Cauca',
  'ARAUCA': 'Arauca',
  'CASANARE': 'Casanare',
  'PUTUMAYO': 'Putumayo',
  'AMAZONAS': 'Amazonas',
  'GUAINIA': 'Guainía',
  'GUAVIARE': 'Guaviare',
  'VAUPES': 'Vaupés',
  'VICHADA': 'Vichada',
};

function normalizeName(geoName) {
  return NOMBRE_MAP[geoName] ?? geoName;
}

function getSpeciesCount(deptName) {
  return (DEPARTAMENTO_ESPECIES[deptName] ?? []).length;
}

function getDeptFill(deptName, isActive) {
  const count = getSpeciesCount(deptName);
  if (count === 0) return '#1e2d3d';
  if (isActive) return '#4fc3f7';
  const alpha = count <= 1 ? 0.25 : count <= 3 ? 0.45 : count <= 5 ? 0.62 : 0.80;
  return `rgba(79,195,247,${alpha})`;
}

function getFeatureStyle(feature, activeDept) {
  const deptName = normalizeName(feature.properties.NOMBRE_DPT);
  const isActive = activeDept === deptName;
  return {
    fillColor: getDeptFill(deptName, isActive),
    fillOpacity: 1,
    color: isActive ? '#4fc3f7' : '#0a1628',
    weight: isActive ? 2 : 0.8,
  };
}

// Centroid = average of the outer ring vertices (works well visually for Colombia's departments)
function computeCentroid(feature) {
  const { type, coordinates } = feature.geometry;
  let ring;
  if (type === 'Polygon') {
    ring = coordinates[0];
  } else if (type === 'MultiPolygon') {
    let maxLen = 0;
    for (const poly of coordinates) {
      if (poly[0].length > maxLen) { maxLen = poly[0].length; ring = poly[0]; }
    }
  }
  if (!ring) return null;
  let sumLon = 0, sumLat = 0;
  for (const [lon, lat] of ring) { sumLon += lon; sumLat += lat; }
  const n = ring.length;
  return [sumLat / n, sumLon / n]; // [lat, lng] for Leaflet
}

// Colombia bounding box [SW, NE]
const COLOMBIA_BOUNDS = [[-4.5, -82], [12.5, -66]];

// ── Detail panel for a single species ──────────────────────────────────────
function EspecieDetalle({ especie, onClose, onPrev, onNext, hasPrev, hasNext }) {
  return (
    <div
      className="panel-enter"
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: '#0a1628',
        overflowY: 'auto',
        paddingBottom: '80px',
      }}
    >
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(10,22,40,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(79,195,247,0.1)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(240,244,248,0.6)', background: 'none', border: 'none', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
          <X size={16} strokeWidth={1.5} /> Cerrar
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onPrev} disabled={!hasPrev} style={{ background: hasPrev ? 'rgba(79,195,247,0.1)' : 'transparent', border: '1px solid rgba(79,195,247,0.2)', borderRadius: 6, padding: '6px 10px', color: hasPrev ? '#4fc3f7' : 'rgba(240,244,248,0.2)', cursor: hasPrev ? 'pointer' : 'default' }}>
            <ChevronLeft size={16} strokeWidth={1.5} />
          </button>
          <button onClick={onNext} disabled={!hasNext} style={{ background: hasNext ? 'rgba(79,195,247,0.1)' : 'transparent', border: '1px solid rgba(79,195,247,0.2)', borderRadius: 6, padding: '6px 10px', color: hasNext ? '#4fc3f7' : 'rgba(240,244,248,0.2)', cursor: hasNext ? 'pointer' : 'default' }}>
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Image */}
      <ImagePlaceholder
        especie={especie}
        className="w-full"
        style={{ height: '220px' }}
      />

      {/* Content */}
      <div style={{ padding: '20px 16px', maxWidth: 500, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.7rem', fontWeight: 600, color: '#f0f4f8', lineHeight: 1.1 }}>
            {especie.nombre}
          </h1>
          <ConservationBadge estado={especie.estadoUICN} short style={{ flexShrink: 0, marginTop: 4 }} />
        </div>
        <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontSize: '0.9rem', color: 'rgba(240,244,248,0.5)', marginBottom: 8 }}>
          {especie.nombreCientifico}
        </p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', color: 'rgba(240,244,248,0.4)', marginBottom: 16, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {especie.clase} · {especie.habitat}
        </p>
        <ConservationBadge estado={especie.estadoUICN} />
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: 'rgba(240,244,248,0.75)', lineHeight: 1.65, marginTop: 16, marginBottom: 20 }}>
          {especie.descripcionLarga}
        </p>

        {/* Dato curioso */}
        <div style={{ borderLeft: '2px solid #4fc3f7', background: 'rgba(79,195,247,0.06)', borderRadius: '0 8px 8px 0', padding: '14px 14px 14px 16px', marginBottom: 16, display: 'flex', gap: 10 }}>
          <Info size={16} strokeWidth={1.5} style={{ color: '#4fc3f7', flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: 'rgba(240,244,248,0.8)', lineHeight: 1.6, margin: 0 }}>
            {especie.datoCurioso}
          </p>
        </div>

        {/* Importancia ecológica */}
        <div style={{ background: 'rgba(30,45,61,0.6)', borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <Activity size={16} strokeWidth={1.5} style={{ color: '#4fc3f7' }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', fontWeight: 600, color: '#4fc3f7', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Rol ecológico</span>
          </div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: 'rgba(240,244,248,0.75)', lineHeight: 1.6, margin: 0 }}>{especie.importanciaEcologica}</p>
        </div>

        {/* Amenazas */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', fontWeight: 600, color: 'rgba(240,244,248,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Amenazas</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {especie.amenazas.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <AlertTriangle size={14} strokeWidth={1.5} style={{ color: 'rgba(239,154,154,0.7)', flexShrink: 0, marginTop: 3 }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: 'rgba(240,244,248,0.65)', lineHeight: 1.5 }}>{a}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conservación */}
        <div style={{ background: 'rgba(30,45,61,0.6)', borderRadius: 8, padding: '14px 16px', display: 'flex', gap: 10 }}>
          <Heart size={16} strokeWidth={1.5} style={{ color: '#4fc3f7', flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: 'rgba(240,244,248,0.75)', lineHeight: 1.6, margin: 0 }}>{especie.conservacion}</p>
        </div>

        {/* Departamentos */}
        <div style={{ marginTop: 16 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', fontWeight: 600, color: 'rgba(240,244,248,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Distribución en Colombia</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {especie.departamentos.map(d => (
              <span key={d} style={{ background: 'rgba(79,195,247,0.08)', border: '1px solid rgba(79,195,247,0.2)', borderRadius: 4, padding: '3px 10px', fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: 'rgba(240,244,248,0.6)' }}>{d}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Department panel ────────────────────────────────────────────────────────
function DeptPanel({ dept, onClose, onSelectEspecie }) {
  const especies = DEPARTAMENTO_ESPECIES[dept] ?? [];
  return (
    <div
      className="panel-enter"
      style={{
        position: 'fixed', bottom: 60, left: 0, right: 0, zIndex: 80,
        background: '#1e2d3d',
        borderTop: '1px solid rgba(79,195,247,0.2)',
        borderRadius: '16px 16px 0 0',
        maxHeight: '55vh',
        overflowY: 'auto',
      }}
    >
      <div style={{ padding: '16px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#1e2d3d', zIndex: 2, borderBottom: '1px solid rgba(79,195,247,0.08)' }}>
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: '#f0f4f8', margin: 0 }}>{dept}</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: 'rgba(240,244,248,0.4)', marginTop: 2 }}>
            {especies.length} {especies.length === 1 ? 'especie registrada' : 'especies registradas'}
          </p>
        </div>
        <button onClick={onClose} style={{ background: 'rgba(240,244,248,0.08)', border: 'none', borderRadius: 8, padding: 8, color: 'rgba(240,244,248,0.5)' }}>
          <X size={18} strokeWidth={1.5} />
        </button>
      </div>
      <div style={{ padding: '8px 0 16px' }}>
        {especies.map(esp => (
          <button
            key={esp.id}
            onClick={() => onSelectEspecie(esp)}
            style={{ width: '100%', display: 'flex', gap: 12, alignItems: 'center', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', borderBottom: '1px solid rgba(240,244,248,0.05)', cursor: 'pointer' }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
              <ImagePlaceholder especie={esp} className="w-full h-full" style={{ width: 52, height: 52 }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '0.9rem', color: '#f0f4f8', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{esp.nombre}</p>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontSize: '0.78rem', color: 'rgba(240,244,248,0.45)', margin: '2px 0 6px' }}>{esp.nombreCientifico}</p>
              <ConservationBadge estado={esp.estadoUICN} short />
            </div>
            <ChevronRight size={16} strokeWidth={1.5} style={{ color: 'rgba(79,195,247,0.5)', flexShrink: 0 }} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function Mapa() {
  const [activeDept, setActiveDept] = useState(null);
  const [especieDetalle, setEspecieDetalle] = useState(null);
  const [especieIdx, setEspecieIdx] = useState(0);
  const geoJsonRef = useRef(null);

  const deptEspecies = activeDept ? (DEPARTAMENTO_ESPECIES[activeDept] ?? []) : [];

  const handleDeptClick = useCallback((deptName) => {
    const count = getSpeciesCount(deptName);
    if (count === 0) return;
    setActiveDept(deptName);
    setEspecieDetalle(null);
  }, []);

  const handleSelectEspecie = useCallback((esp) => {
    const lista = DEPARTAMENTO_ESPECIES[activeDept] ?? [];
    const idx = lista.findIndex(e => e.id === esp.id);
    setEspecieIdx(idx >= 0 ? idx : 0);
    setEspecieDetalle(esp);
  }, [activeDept]);

  const handlePrev = useCallback(() => {
    const idx = Math.max(0, especieIdx - 1);
    setEspecieIdx(idx);
    setEspecieDetalle(deptEspecies[idx]);
  }, [especieIdx, deptEspecies]);

  const handleNext = useCallback(() => {
    const idx = Math.min(deptEspecies.length - 1, especieIdx + 1);
    setEspecieIdx(idx);
    setEspecieDetalle(deptEspecies[idx]);
  }, [especieIdx, deptEspecies]);

  // Reactively update polygon styles when active department changes
  useEffect(() => {
    if (geoJsonRef.current) {
      geoJsonRef.current.setStyle(feature => getFeatureStyle(feature, activeDept));
    }
  }, [activeDept]);

  // Bind click handlers to each GeoJSON feature once on mount
  const onEachFeature = useCallback((feature, layer) => {
    const deptName = normalizeName(feature.properties.NOMBRE_DPT);
    if (getSpeciesCount(deptName) > 0) {
      layer.on('click', () => handleDeptClick(deptName));
    }
  }, [handleDeptClick]);

  // Precompute species-count markers (DivIcon at each department's centroid)
  const countMarkers = useMemo(() =>
    colombiaGeo.features
      .map(feature => {
        const deptName = normalizeName(feature.properties.NOMBRE_DPT);
        const count = getSpeciesCount(deptName);
        if (count === 0) return null;
        const centroid = computeCentroid(feature);
        if (!centroid) return null;
        const icon = L.divIcon({
          html: `<div style="pointer-events:none;display:flex;align-items:center;justify-content:center;width:18px;height:18px"><span style="display:inline-flex;align-items:center;justify-content:center;background:rgba(10,22,40,0.7);color:rgba(240,244,248,0.9);border-radius:50%;width:18px;height:18px;font-size:9px;font-weight:600;font-family:sans-serif;border:1px solid rgba(79,195,247,0.35)">${count}</span></div>`,
          className: '',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        return (
          <Marker key={deptName} position={centroid} icon={icon} interactive={false} />
        );
      })
      .filter(Boolean),
  []);

  return (
    <div style={{ minHeight: '100%', background: '#0a1628' }}>
      {/* Header */}
      <div style={{ padding: '28px 20px 16px', animation: 'fadeUp 0.5s ease forwards' }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', fontWeight: 500, color: '#4fc3f7', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>Wild Col</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.9rem', fontWeight: 600, color: '#f0f4f8', lineHeight: 1.1, marginBottom: 8 }}>
          Mapa de especies
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', color: 'rgba(240,244,248,0.45)', lineHeight: 1.5 }}>
          Toca un departamento resaltado para explorar sus especies endémicas.
        </p>
      </div>

      {/* Legend */}
      <div style={{ padding: '0 20px 16px', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[
          { label: '1 especie', alpha: 0.25 },
          { label: '2–3 especies', alpha: 0.45 },
          { label: '4–5 especies', alpha: 0.62 },
          { label: '6+ especies', alpha: 0.80 },
        ].map(({ label, alpha }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: `rgba(79,195,247,${alpha})` }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', color: 'rgba(240,244,248,0.4)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Leaflet map */}
      <div style={{ padding: '0 12px', animation: 'fadeIn 0.6s ease 0.1s both' }}>
        <MapContainer
          bounds={COLOMBIA_BOUNDS}
          boundsOptions={{ padding: [10, 10] }}
          style={{ height: '500px', width: '100%', background: '#0a1628' }}
          zoomControl={false}
          attributionControl={false}
          scrollWheelZoom={false}
        >
          <LeafletGeoJSON
            ref={geoJsonRef}
            data={colombiaGeo}
            style={feature => getFeatureStyle(feature, null)}
            onEachFeature={onEachFeature}
          />
          {countMarkers}
        </MapContainer>
      </div>

      {/* Total */}
      <div style={{ textAlign: 'center', padding: '8px 20px 24px' }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: 'rgba(240,244,248,0.3)' }}>
          {ESPECIES.length} especies · {Object.keys(DEPARTAMENTO_ESPECIES).length} departamentos
        </span>
      </div>

      {/* Department panel */}
      {activeDept && !especieDetalle && (
        <>
          <div
            onClick={() => setActiveDept(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(10,22,40,0.5)' }}
          />
          <DeptPanel
            dept={activeDept}
            onClose={() => setActiveDept(null)}
            onSelectEspecie={handleSelectEspecie}
          />
        </>
      )}

      {/* Species detail */}
      {especieDetalle && (
        <EspecieDetalle
          especie={especieDetalle}
          onClose={() => { setEspecieDetalle(null); }}
          onPrev={handlePrev}
          onNext={handleNext}
          hasPrev={especieIdx > 0}
          hasNext={especieIdx < deptEspecies.length - 1}
        />
      )}
    </div>
  );
}
