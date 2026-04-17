import { useState, useMemo } from 'react';
import { getImagePathWithFallback } from '../utils/imageResolver';

const EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export default function ImagePlaceholder({ especie, className = '', style = {} }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [currentExtIndex, setCurrentExtIndex] = useState(0);

  const bg = especie?.colorDept ?? '#1e2d3d';
  const nombreCientifico = especie?.nombreCientifico ?? '';

  const imageSrc = useMemo(() => {
    const basePath = especie?.imagen;
    if (!basePath) return '';

    // Si ya tiene extensión, devolverla
    if (/\.(jpg|jpeg|png|webp)$/i.test(basePath)) {
      return basePath;
    }

    // Construir ruta con extensión actual
    return `${basePath}${EXTENSIONS[currentExtIndex]}`;
  }, [especie?.imagen, currentExtIndex]);

  const handleImageError = () => {
    const nextExtIndex = currentExtIndex + 1;
    if (nextExtIndex < EXTENSIONS.length) {
      setCurrentExtIndex(nextExtIndex);
    } else {
      setError(true);
    }
  };

  if (!error) {
    return (
      <div className={`relative overflow-hidden ${className}`} style={style}>
        {!loaded && (
          <Placeholder bg={bg} nombre={nombreCientifico} />
        )}
        {imageSrc && (
          <img
            key={imageSrc}
            src={imageSrc}
            alt={especie?.nombre}
            onLoad={() => setLoaded(true)}
            onError={handleImageError}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      <Placeholder bg={bg} nombre={nombreCientifico} />
    </div>
  );
}

function Placeholder({ bg, nombre }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${bg} 0%, #0a1628 100%)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 30% 40%, rgba(79,195,247,0.06) 0%, transparent 60%)',
        }}
      />
      <span
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontSize: '0.75rem',
          fontWeight: 400,
          color: 'rgba(240,244,248,0.35)',
          textAlign: 'center',
          padding: '0 1rem',
          letterSpacing: '0.02em',
          lineHeight: 1.4,
          position: 'relative',
        }}
      >
        {nombre}
      </span>
    </div>
  );
}
