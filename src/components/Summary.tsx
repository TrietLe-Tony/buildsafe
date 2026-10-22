import { useCountUp } from '../hooks';
import { money, stageStatus, totals } from '../store';
import type { Project, Role } from '../types';
import { House } from './House';
import { IconLock, IconShield, IconUnlock } from './Icons';

export function Summary({ project, role }: { project: Project; role: Role }) {
  const { held, released, next } = totals(project);
  const heldAnim = useCountUp(held);
  const releasedAnim = useCountUp(released);
  const doneCount = project.stages.filter((s) => s.releasedAt).length;

  return (
    <section className="summary card">
      <div className="summary-money">
        <div className="eyebrow">
          <IconLock size={16} /> {role === 'builder' ? 'Secured for you, held in vault' : 'Held in vault'}
        </div>
        <div className="big-money tabular">{money(heldAnim)}</div>

        <div className="summary-row">
          <div>
            <div className="eyebrow muted">
              <IconUnlock size={14} /> Released to builder
            </div>
            <div className="mid-money tabular green">{money(releasedAnim)}</div>
          </div>
          <div>
            <div className="eyebrow muted">Next stage</div>
            <div className="mid-money tabular">
              {next ? (
                <>
                  {next.name} <span className="orange">{money(next.amount)}</span>
                </>
              ) : (
                'Build complete'
              )}
            </div>
          </div>
          <div>
            <div className="eyebrow muted">Payout account</div>
            <div className="small-strong">
              {project.payoutAccount.name}
              <span className="muted tabular block">
                BSB {project.payoutAccount.bsb} · {project.payoutAccount.acct}
              </span>
            </div>
          </div>
        </div>

        <div className="progress" aria-label="Stage payments">
          {project.stages.map((s) => {
            const st = stageStatus(project, s);
            return (
              <div
                key={s.id}
                className={`progress-seg seg-${st === 'released' ? 'released' : st === 'locked' ? 'locked' : 'active'}`}
                style={{ flexGrow: s.pct }}
                title={`${s.name} ${money(s.amount)}`}
              >
                <span>{s.name.replace(' (slab)', '')}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="summary-board">
        <div className="board-head">
          <span className="eyebrow muted">Site board</span>
          <span className="board-count tabular">
            {doneCount}
            <small>/6 paid</small>
          </span>
        </div>
        <House project={project} />
        <div className="board-caption">
          <IconShield size={14} />
          {next ? `Building now: ${next.name}` : 'Handover complete'}
        </div>
      </div>
    </section>
  );
}

const BANNERS: Record<Role, { title: (p: Project) => string; body: string; tone: string }> = {
  homeowner: {
    title: () => 'You are Priya Sharma, homeowner',
    body: 'Money only moves when you and the independent inspector both sign. Not the builder, not BuildSafe.',
    tone: 'ink',
  },
  builder: {
    title: (p) => `Funds secured for you: ${money(totals(p).held)} locked in the vault`,
    body: 'The homeowner can’t take it back or quietly hold it. Verified work is paid the moment both sign.',
    tone: 'green',
  },
  inspector: {
    title: () => 'You are Mei Lin, registered building surveyor',
    body: 'You are the inspector assigned to this project. Your sign off is one of two signatures every stage needs.',
    tone: 'ink',
  },
  mediator: {
    title: () => 'You are the DBDRV mediator',
    body: 'You can only act on a disputed stage, and only together with the inspector.',
    tone: 'ink',
  },
  admin: {
    title: () => 'You are BuildSafe staff',
    body: 'You can see every project and every account. Try to move this money without the homeowner.',
    tone: 'ink',
  },
  attacker: {
    title: () => 'You have breached BuildSafe’s server',
    body: 'Full access to our database and admin sessions. See what you can steal.',
    tone: 'red',
  },
};

export function RoleBanner({ project, role }: { project: Project; role: Role }) {
  const b = BANNERS[role];
  return (
    <div className={`role-banner tone-${b.tone}`}>
      <strong>{b.title(project)}</strong>
      <span>{b.body}</span>
    </div>
  );
}
