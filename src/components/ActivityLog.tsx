import type { LogEntry, Project } from '../types';
import { IconCheck, IconInfo, IconUnlock, IconX } from './Icons';

const ROLE_LABEL: Record<LogEntry['role'], string> = {
  homeowner: 'Homeowner',
  builder: 'Builder',
  inspector: 'Inspector',
  mediator: 'Mediator',
  admin: 'BuildSafe admin',
  attacker: 'Attacker',
};

function when(t: number) {
  const d = new Date(t);
  return (
    d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) +
    ' · ' +
    d.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' })
  );
}

export function ActivityLog({ project }: { project: Project }) {
  return (
    <section className="log card">
      <header className="log-head">
        <h2>Activity</h2>
        <span className="muted small">Every attempt is recorded, signed or refused</span>
      </header>
      <ol>
        {project.log.map((e) => (
          <li key={e.id} className={`log-row log-${e.kind}`}>
            <span className="log-icon">
              {e.kind === 'refused' ? <IconX size={13} /> : e.kind === 'released' ? <IconUnlock size={14} /> : e.kind === 'ok' ? <IconCheck size={13} /> : <IconInfo size={14} />}
            </span>
            <span className="log-when tabular">{when(e.at)}</span>
            <span className="log-who">
              {e.who} <span className="muted">· {ROLE_LABEL[e.role]}</span>
            </span>
            <span className="log-text">{e.text}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
