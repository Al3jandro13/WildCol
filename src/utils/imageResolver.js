const EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export async function getAvailableImagePath(basePath) {
  // Si la ruta ya incluye extensión, devuelverla como está
  if (/\.(jpg|jpeg|png|webp)$/i.test(basePath)) {
    return basePath;
  }

  // Intentar cargar con cada extensión en orden de preferencia
  for (const ext of EXTENSIONS) {
    const fullPath = `${basePath}${ext}`;
    try {
      const response = await fetch(fullPath, { method: 'HEAD' });
      if (response.ok) {
        return fullPath;
      }
    } catch {
      // Continuar con la siguiente extensión
    }
  }

  // Si ninguna extensión funciona, devolver la ruta original
  return basePath;
}

// Para uso síncrono en renders: intenta cargar fallback a extensiones comunes
export function getImagePathWithFallback(basePath) {
  if (/\.(jpg|jpeg|png|webp)$/i.test(basePath)) {
    return basePath;
  }

  // Devolver un array de rutas para intentar en orden
  return EXTENSIONS.map(ext => `${basePath}${ext}`);
}
