export function SpainSkyline() {
  return (
    <svg
      viewBox="0 0 240 70"
      fill="none"
      className="w-full text-grid-400"
      aria-hidden="true"
    >
      {/* Silueta genérica de edificios, estilo plano/blueprint */}
      <rect x="10" y="30" width="18" height="40" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
      <rect x="32" y="15" width="22" height="55" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
      <polygon points="43,4 32,15 54,15" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" fill="none" />
      <rect x="58" y="38" width="16" height="32" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
      <rect x="78" y="22" width="20" height="48" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
      <circle cx="88" cy="14" r="6" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
      <rect x="102" y="34" width="18" height="36" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
      <rect x="124" y="10" width="24" height="60" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="136" y1="10" x2="136" y2="0" stroke="currentColor" strokeWidth="1" />
      <rect x="152" y="26" width="18" height="44" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
      <rect x="174" y="40" width="16" height="30" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
      <rect x="194" y="20" width="20" height="50" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
      <rect x="218" y="32" width="14" height="38" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />

      <line x1="4" y1="70" x2="236" y2="70" className="text-amber-400" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
