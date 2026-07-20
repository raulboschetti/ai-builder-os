export function BlueprintMark() {
  return (
    <svg
      viewBox="0 0 420 320"
      fill="none"
      className="w-full max-w-md text-grid-400"
      aria-hidden="true"
    >
      {/* Floor plan half */}
      <rect
        x="20"
        y="40"
        width="160"
        height="240"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <line
        x1="20"
        y1="140"
        x2="180"
        y2="140"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <line
        x1="100"
        y1="140"
        x2="100"
        y2="280"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />

      {/* Dimension line */}
      <line
        x1="20"
        y1="24"
        x2="180"
        y2="24"
        stroke="currentColor"
        strokeWidth="1"
      />
      <line x1="20" y1="18" x2="20" y2="30" stroke="currentColor" strokeWidth="1" />
      <line x1="180" y1="18" x2="180" y2="30" stroke="currentColor" strokeWidth="1" />

      {/* Morph connector */}
      <path
        d="M180 100 C 220 100, 200 60, 240 60"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="3 5"
      />

      {/* App wireframe half — the "built" result */}
      <rect
        x="240"
        y="30"
        width="150"
        height="260"
        rx="10"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="255"
        y="50"
        width="120"
        height="14"
        rx="3"
        className="text-amber-400"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="255"
        y="78"
        width="120"
        height="60"
        rx="4"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="3 4"
      />
      <rect
        x="255"
        y="150"
        width="56"
        height="56"
        rx="4"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="3 4"
      />
      <rect
        x="319"
        y="150"
        width="56"
        height="56"
        rx="4"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="3 4"
      />
      <rect
        x="255"
        y="220"
        width="120"
        height="34"
        rx="17"
        className="text-cyan-400"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* Node markers */}
      <circle cx="100" cy="140" r="3" className="text-amber-400" fill="currentColor" />
      <circle cx="240" cy="60" r="3" className="text-amber-400" fill="currentColor" />
    </svg>
  );
}
