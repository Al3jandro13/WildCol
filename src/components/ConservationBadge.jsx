const ESTADOS = {
  LC: { label: 'LC · Preocupación menor',    short: 'LC', cls: 'badge-lc'  },
  NT: { label: 'NT · Casi amenazado',        short: 'NT', cls: 'badge-nt'  },
  VU: { label: 'VU · Vulnerable',            short: 'VU', cls: 'badge-vu'  },
  EN: { label: 'EN · En peligro',            short: 'EN', cls: 'badge-en'  },
  CR: { label: 'CR · En peligro crítico',    short: 'CR', cls: 'badge-cr'  },
  EW: { label: 'EW · Extinto en estado silvestre', short: 'EW', cls: 'badge-cr' },
  EX: { label: 'EX · Extinto',              short: 'EX', cls: 'badge-cr'  },
};

export default function ConservationBadge({ estado, short = false, className = '' }) {
  const info = ESTADOS[estado] ?? { label: estado, short: estado, cls: 'badge-nt' };
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium tracking-wide uppercase ${info.cls} ${className}`}
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif", letterSpacing: '0.06em' }}
    >
      {short ? info.short : info.label}
    </span>
  );
}
