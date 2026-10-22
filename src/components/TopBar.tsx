import { money } from '../store';
import type { Project, Role } from '../types';
import { IconInfo, IconReset, Logo } from './Icons';

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
