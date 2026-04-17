export const ECOSISTEMAS = [
  {
    id: 'andes',
    nombre: 'Andes',
    descripcion: 'Cordillera Central y Oriental entre 1800 y 3500 msnm',
    nodos: [
      { id: 'fraileton',         nombre: 'Frailejón',            rol: 'Productor',             x: 50,  y: 15 },
      { id: 'bromelia-andina',   nombre: 'Bromelia Andina',      rol: 'Productor',             x: 85,  y: 20 },
      { id: 'helecho-arboreo',   nombre: 'Helecho Arbóreo',      rol: 'Productor',             x: 20,  y: 30 },
      { id: 'musarana-andina',   nombre: 'Musaraña Andina',      rol: 'Consumidor primario',   x: 30,  y: 55 },
      { id: 'puercoespin-andino',nombre: 'Puercoespín Andino',   rol: 'Consumidor primario',   x: 68,  y: 50 },
      { id: 'colibri-pico-espada',nombre:'Colibrí Pico Espada',  rol: 'Consumidor primario',   x: 88,  y: 50 },
      { id: 'serpiente-coral-andina', nombre: 'Coral Andina',    rol: 'Consumidor secundario', x: 38,  y: 75 },
      { id: 'aguila-arpia',      nombre: 'Águila Arpía',         rol: 'Depredador tope',       x: 60,  y: 88 },
    ],
    enlaces: [
      { origen: 'fraileton',          destino: 'musarana-andina',        tipo: 'consume' },
      { origen: 'fraileton',          destino: 'puercoespin-andino',     tipo: 'consume' },
      { origen: 'bromelia-andina',    destino: 'colibri-pico-espada',    tipo: 'consume' },
      { origen: 'bromelia-andina',    destino: 'musarana-andina',        tipo: 'consume' },
      { origen: 'helecho-arboreo',    destino: 'musarana-andina',        tipo: 'consume' },
      { origen: 'musarana-andina',    destino: 'serpiente-coral-andina', tipo: 'consume' },
      { origen: 'puercoespin-andino', destino: 'aguila-arpia',           tipo: 'consume' },
      { origen: 'serpiente-coral-andina', destino: 'aguila-arpia',       tipo: 'consume' },
      { origen: 'colibri-pico-espada',    destino: 'aguila-arpia',       tipo: 'consume' },
    ],
    efectosColapso: {
      'fraileton': [
        { afectado: 'musarana-andina',    efecto: 'Pierde el 60% de su fuente de alimento. Declive poblacional severo.' },
        { afectado: 'puercoespin-andino', efecto: 'Sin brotes y frutos de frailejón, la población cae un 40%.' },
        { afectado: 'serpiente-coral-andina', efecto: 'Colapso de presas → abandona la zona en busca de hábitat.' },
        { afectado: 'aguila-arpia',       efecto: 'Reducción de presas disponibles en la cadena. Área de forrajeo se triplica.' },
      ],
      'musarana-andina': [
        { afectado: 'serpiente-coral-andina', efecto: 'Sin presa principal, la población de corales colapsa en 2 generaciones.' },
        { afectado: 'aguila-arpia',       efecto: 'Pierde una fuente secundaria de proteína. Presión aumenta sobre el puercoespín.' },
      ],
      'puercoespin-andino': [
        { afectado: 'aguila-arpia',       efecto: 'Sin esta presa grande, el Águila Arpía necesita el doble del territorio.' },
        { afectado: 'fraileton',          efecto: 'Sin herbivoría controlada, el frailejón superpobla ciertas zonas y desplaza otras plantas.' },
      ],
      'aguila-arpia': [
        { afectado: 'puercoespin-andino', efecto: 'Sin depredador tope, la población se multiplica 4x. Sobreherbivoría del frailejón.' },
        { afectado: 'serpiente-coral-andina', efecto: 'Superpoblación de corales. Colapso local de musarañas y roedores pequeños.' },
      ],
      'serpiente-coral-andina': [
        { afectado: 'musarana-andina',    efecto: 'Sin depredador, la musaraña superpobla. Colapso de artrópodos del suelo.' },
      ],
      'colibri-pico-espada': [
        { afectado: 'bromelia-andina',    efecto: 'Sin polinizador exclusivo, la bromelia deja de reproducirse. Pérdida de epífitas en cascada.' },
      ],
    },
  },
  {
    id: 'amazonia',
    nombre: 'Amazonía',
    descripcion: 'Selva tropical de tierras bajas entre 0 y 500 msnm',
    nodos: [
      { id: 'arbol-caucho',       nombre: 'Árbol de Caucho',     rol: 'Productor',             x: 18,  y: 12 },
      { id: 'victoria-amazonica', nombre: 'Victoria Amazónica',  rol: 'Productor',             x: 55,  y: 10 },
      { id: 'tortuga-morrocoy',   nombre: 'Morrocoy',            rol: 'Consumidor primario',   x: 25,  y: 42 },
      { id: 'titi-cabeciblanco',  nombre: 'Tití Cabeciblanco',   rol: 'Consumidor primario',   x: 60,  y: 38 },
      { id: 'murcielago-nariz-lanza', nombre: 'Murciélago NL',   rol: 'Consumidor secundario', x: 42,  y: 62 },
      { id: 'cabassous-centroamericano', nombre: 'Cabassous',    rol: 'Consumidor secundario', x: 78,  y: 58 },
      { id: 'caiman-llanero',     nombre: 'Caimán Llanero',      rol: 'Depredador tope',       x: 55,  y: 85 },
    ],
    enlaces: [
      { origen: 'arbol-caucho',       destino: 'titi-cabeciblanco',      tipo: 'consume' },
      { origen: 'arbol-caucho',       destino: 'tortuga-morrocoy',       tipo: 'consume' },
      { origen: 'victoria-amazonica', destino: 'tortuga-morrocoy',       tipo: 'consume' },
      { origen: 'titi-cabeciblanco',  destino: 'murcielago-nariz-lanza', tipo: 'consume' },
      { origen: 'titi-cabeciblanco',  destino: 'cabassous-centroamericano', tipo: 'consume' },
      { origen: 'tortuga-morrocoy',   destino: 'caiman-llanero',         tipo: 'consume' },
      { origen: 'murcielago-nariz-lanza', destino: 'caiman-llanero',     tipo: 'consume' },
      { origen: 'cabassous-centroamericano', destino: 'caiman-llanero',  tipo: 'consume' },
    ],
    efectosColapso: {
      'arbol-caucho': [
        { afectado: 'titi-cabeciblanco',  efecto: 'Sin frutos del caucho, el tití pierde el 50% de su dieta. Migración forzada.' },
        { afectado: 'tortuga-morrocoy',   efecto: 'Reducción de alimento disponible. Competencia interespecífica aumenta.' },
        { afectado: 'murcielago-nariz-lanza', efecto: 'Sin el dosel del caucho para refugio, la colonia abandona el sector.' },
      ],
      'victoria-amazonica': [
        { afectado: 'tortuga-morrocoy',   efecto: 'Pierde zona de alimentación y refugio acuático. Exposición a depredadores aumenta.' },
      ],
      'titi-cabeciblanco': [
        { afectado: 'murcielago-nariz-lanza', efecto: 'Reducción de competencia por frutos. Población crece temporalmente pero sin control.' },
        { afectado: 'arbol-caucho',       efecto: 'Sin dispersor de semillas, el caucho no se regenera en zonas abiertas.' },
      ],
      'caiman-llanero': [
        { afectado: 'tortuga-morrocoy',   efecto: 'Sin depredador tope, superpoblación. Sobreconsumo de vegetación acuática.' },
        { afectado: 'murcielago-nariz-lanza', efecto: 'Sin control, la colonia crece y agota insectos de la zona en pocas semanas.' },
        { afectado: 'cabassous-centroamericano', efecto: 'Superpoblación de cabassous. Colapso de termiteros y hormigas de la zona.' },
      ],
      'tortuga-morrocoy': [
        { afectado: 'arbol-caucho',       efecto: 'Sin dispersor, la regeneración de plántulas de caucho cae un 70% en zonas alejadas.' },
        { afectado: 'caiman-llanero',     efecto: 'Pierde una presa accesible. Presión aumenta sobre el murciélago y el tití.' },
      ],
    },
  },
  {
    id: 'choco',
    nombre: 'Chocó',
    descripcion: 'Bosque húmedo del Pacífico entre 0 y 1500 msnm',
    nodos: [
      { id: 'helecho-arboreo',     nombre: 'Helecho Arbóreo',    rol: 'Productor',             x: 22,  y: 12 },
      { id: 'bromelia-andina',     nombre: 'Bromelia',           rol: 'Productor',             x: 72,  y: 15 },
      { id: 'rana-cohete',         nombre: 'Rana Cohete',        rol: 'Consumidor primario',   x: 18,  y: 42 },
      { id: 'rana-cristal-choco',  nombre: 'Rana de Cristal',    rol: 'Consumidor primario',   x: 50,  y: 38 },
      { id: 'rata-colorada',       nombre: 'Rata Colorada',      rol: 'Consumidor primario',   x: 82,  y: 42 },
      { id: 'gecko-cotudo',        nombre: 'Gecko Cotudo',       rol: 'Consumidor secundario', x: 30,  y: 65 },
      { id: 'tangara-multicolor',  nombre: 'Tangara Multicolor', rol: 'Consumidor secundario', x: 65,  y: 62 },
      { id: 'carpintero-buchon',   nombre: 'Carpintero Buchón',  rol: 'Consumidor secundario', x: 88,  y: 68 },
      { id: 'tucan-choco',         nombre: 'Tucán del Chocó',    rol: 'Depredador tope',       x: 52,  y: 88 },
    ],
    enlaces: [
      { origen: 'helecho-arboreo',    destino: 'rana-cohete',           tipo: 'consume' },
      { origen: 'helecho-arboreo',    destino: 'gecko-cotudo',          tipo: 'consume' },
      { origen: 'bromelia-andina',    destino: 'rana-cristal-choco',    tipo: 'consume' },
      { origen: 'bromelia-andina',    destino: 'tangara-multicolor',    tipo: 'consume' },
      { origen: 'rana-cohete',        destino: 'gecko-cotudo',          tipo: 'consume' },
      { origen: 'rana-cristal-choco', destino: 'gecko-cotudo',          tipo: 'consume' },
      { origen: 'rata-colorada',      destino: 'carpintero-buchon',     tipo: 'consume' },
      { origen: 'rata-colorada',      destino: 'tucan-choco',           tipo: 'consume' },
      { origen: 'gecko-cotudo',       destino: 'tucan-choco',           tipo: 'consume' },
      { origen: 'tangara-multicolor', destino: 'tucan-choco',           tipo: 'consume' },
    ],
    efectosColapso: {
      'helecho-arboreo': [
        { afectado: 'rana-cohete',     efecto: 'Sin microhábitat de hojarasca, el 80% de los sitios de anidación desaparecen.' },
        { afectado: 'gecko-cotudo',    efecto: 'Sin refugio húmedo, los geckos mueren de desecación en pocas horas.' },
      ],
      'bromelia-andina': [
        { afectado: 'rana-cristal-choco', efecto: 'Sin fitotelmatas para reproducirse, la población colapsa en una generación.' },
        { afectado: 'tangara-multicolor', efecto: 'Pierde sitios de anidación y frutos de bromelia. Migración forzada.' },
      ],
      'rana-cristal-choco': [
        { afectado: 'gecko-cotudo',    efecto: 'Pérdida de presa del sotobosque. El gecko busca presas menores con menor valor energético.' },
      ],
      'gecko-cotudo': [
        { afectado: 'tucan-choco',     efecto: 'Sin esta presa del sotobosque, el tucán depende exclusivamente de ratas y frutos.' },
        { afectado: 'rana-cohete',     efecto: 'Sin depredador, superpoblación. Colapso de insectos acuáticos de los que se alimenta.' },
      ],
      'tucan-choco': [
        { afectado: 'rata-colorada',   efecto: 'Sin depredador tope, superpoblación. Colapso de semillas del suelo forestal.' },
        { afectado: 'tangara-multicolor', efecto: 'Sin control del tucán, compite sin restricción. Desequilibrio en dispersión de semillas.' },
        { afectado: 'helecho-arboreo', efecto: 'Sin dispersión de esporas a larga distancia, la regeneración del helecho cae un 60%.' },
      ],
      'rata-colorada': [
        { afectado: 'carpintero-buchon', efecto: 'Sin presa principal, el carpintero abandona el territorio en 1–2 temporadas.' },
        { afectado: 'tucan-choco',      efecto: 'Reduce presa clave. El tucán compensa con mayor depredación de aves pequeñas.' },
      ],
    },
  },
];
