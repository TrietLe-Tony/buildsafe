import type { Project } from '../types';

/** The site board: a house that builds itself as each stage is released. */
export function House({ project }: { project: Project }) {
  const done = new Set(project.stages.filter((s) => s.releasedAt).map((s) => s.id));
  const studs = [64, 88, 112, 136, 160, 184, 208, 232, 256];

  return (
    <svg viewBox="0 28 320 152" className="house" role="img" aria-label={`${done.size} of 6 stages released`}>
      {/* blueprint ghost of the finished home */}
      <g className="house-ghost">
        <path d="M44 92 L160 40 L276 92" />
        <rect x="60" y="90" width="200" height="60" />
        <rect x="50" y="150" width="220" height="10" />
        <rect x="148" y="112" width="24" height="38" />
        <rect x="80" y="104" width="34" height="24" />
        <rect x="206" y="104" width="34" height="24" />
      </g>

      <path d="M10 160 H310" stroke="var(--ink-3)" strokeWidth="1.5" />

      {done.has('deposit') && (
        <g className="layer-in" key="deposit">
          <path d="M50 158 V146 M270 158 V146" stroke="#8A6B45" strokeWidth="3" />
          <path d="M50 148 H270" stroke="var(--orange)" strokeWidth="1.2" strokeDasharray="4 3" />
        </g>
      )}

      {done.has('base') && (
        <g className="layer-in" key="base">
          <rect x="50" y="150" width="220" height="10" fill="#A3A7AA" />
          <rect x="50" y="150" width="220" height="2.5" fill="#BFC3C5" />
        </g>
      )}

      {done.has('frame') && (
        <g className="layer-in" key="frame" stroke="#C08A4E" strokeWidth="3" fill="none" strokeLinecap="round">
          {studs.map((x) => (
            <path key={x} d={`M${x} 150 V92`} />
          ))}
          <path d="M60 92 H260 M60 121 H260" />
          <path d="M44 92 L160 40 L276 92 M102 66 V92 M160 40 V92 M218 66 V92" />
        </g>
      )}

      {done.has('lockup') && (
        <g className="layer-in" key="lockup">
          <rect x="60" y="90" width="200" height="60" fill="#B5654A" />
          <path d="M60 104 H260 M60 118 H260 M60 132 H260" stroke="#A3573E" strokeWidth="1" />
          <path d="M40 94 L160 38 L280 94 Z" fill="#3E4A5C" />
          <rect x="148" y="112" width="24" height="38" fill="var(--ink)" />
          <rect x="80" y="104" width="34" height="24" fill="#CBD7DE" />
          <rect x="206" y="104" width="34" height="24" fill="#CBD7DE" />
        </g>
      )}

      {done.has('fixing') && (
        <g className="layer-in" key="fixing">
          <rect x="80" y="104" width="34" height="24" fill="#F6E3A8" />
          <rect x="206" y="104" width="34" height="24" fill="#F6E3A8" />
          <path d="M97 104 V128 M80 116 H114 M223 104 V128 M206 116 H240" stroke="#FBFAF7" strokeWidth="2" />
          <path d="M40 94 H280" stroke="#2A3445" strokeWidth="3" />
        </g>
      )}

      {done.has('completion') && (
        <g className="layer-in" key="completion">
          <rect x="148" y="112" width="24" height="38" fill="var(--orange)" />
          <circle cx="167" cy="132" r="1.6" fill="#fff" />
          <path d="M152 160 L140 178 H180 L168 160 Z" fill="#D3CBBC" />
          <circle cx="296" cy="122" r="16" fill="var(--green)" />
          <circle cx="288" cy="132" r="10" fill="#4E9A76" />
          <rect x="294" y="134" width="4" height="26" fill="#7A5C3C" />
          <circle cx="24" cy="140" r="11" fill="#4E9A76" />
          <rect x="22" y="146" width="3" height="14" fill="#7A5C3C" />
        </g>
      )}
    </svg>
  );
}
