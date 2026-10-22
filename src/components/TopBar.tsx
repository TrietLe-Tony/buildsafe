import { money } from '../store';
import type { Project, Role } from '../types';
import { IconInfo, IconReset, IconShield, IconX, Logo } from './Icons';

export const ROLE_LABELS: Record<Role, string> = {
  homeowner: 'Homeowner',
  builder: 'Builder',
  inspector: 'Inspector',
  mediator: 'Mediator',
  admin: 'BuildSafe admin',
  attacker: 'Attacker',
};

type Props = {
  project: Project;
  role: Role;
  roles: Role[];
  onRole: (r: Role) => void;
  onReset: () => void;
  onHow: () => void;
};

/**
 * Simulated TideCloak sign-in (BYOiD). In production each person signs in through TideCloak and the
 * role comes from their token; the attacker has no TideCloak session at all, only a stolen server one.
 */
function Session({ project, role }: { project: Project; role: Role }) {
  if (role === 'attacker') {
    return (
      <div className="session session-bad" title="No TideCloak session: the attacker only has a hijacked server session">
        <IconX size={15} />
        <div>
          <span className="session-label">No TideCloak sign-in</span>
          <strong>Hijacked server session</strong>
        </div>
      </div>
    );
  }
  const person = project.people[role];
  return (
    <div className="session" title="Simulated TideCloak sign-in (BYOiD). Role comes from the TideCloak token.">
      <IconShield size={15} />
      <div>
        <span className="session-label">Signed in with TideCloak</span>
        <strong>
          {person.name} <span className="session-role">· {ROLE_LABELS[role].toLowerCase()}</span>
        </strong>
      </div>
    </div>
  );
}

export function TopBar({ project, role, roles, onRole, onReset, onHow }: Props) {
  return (
    <header className="topbar">
      <div className="brand">
        <Logo />
        <span className="wordmark">BuildSafe</span>
        <span className="divider" />
        <div className="project">
          <strong>{project.address}</strong>
          <span>Single storey · contract {money(project.contract)}</span>
        </div>
      </div>

      <Session project={project} role={role} />

      <nav className="roles" aria-label="View as">
        <span className="roles-label">View as</span>
        <div className="segmented" role="tablist">
          {roles.map((r) => (
            <button
              key={r}
              role="tab"
              aria-selected={role === r}
              className={`seg ${role === r ? 'on' : ''} ${r === 'attacker' ? 'seg-attacker' : ''}`}
              onClick={() => onRole(r)}
            >
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </nav>

      <div className="top-actions">
        <button className="btn btn-ghost-light btn-sm" onClick={onHow}>
          <IconInfo size={16} /> How it works
        </button>
        <button className="btn btn-ghost-light btn-sm" onClick={onReset}>
          <IconReset size={16} /> Reset demo
        </button>
      </div>
    </header>
  );
}
