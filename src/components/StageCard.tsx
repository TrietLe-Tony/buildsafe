import { useEffect, useState } from 'react';
import { DAY, money, nowFor, stageStatus } from '../store';
import type { Project, Role, Stage, StageId, StageStatus } from '../types';
import { IconCamera, IconCheck, IconClock, IconLock, IconScale, StageIcon } from './Icons';
import { SitePhoto, photoCaption } from './SitePhoto';

const STATUS_LABEL: Record<StageStatus, string> = {
  locked: 'Locked',
  ready: 'Ready to claim',
  claimed: 'Claimed',
  inspector_signed: 'Inspector signed',
  owner_signed: 'Owner signed',
  released: 'Released',
  disputed: 'Disputed',
};

export type StageHandlers = {
  onClaim: (id: StageId, evidence: number[]) => void;
  onSignoff: (id: StageId, checklist: boolean[]) => void;
  onRelease: (id: StageId) => void;
  onDispute: (id: StageId) => void;
  onFastForward: () => void;
};

type Props = StageHandlers & { project: Project; stage: Stage; role: Role; flash: boolean };

const fmtDate = (t: number) => new Date(t).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });

export function StageCard(props: Props) {
  const { project, stage, flash } = props;
  const status = stageStatus(project, stage);
  const active = status !== 'locked' && status !== 'released';
  const [composerOpen, setComposerOpen] = useState(status === 'ready');
  const [picked, setPicked] = useState<number[]>([]);
  const [checks, setChecks] = useState<boolean[]>(() => stage.checklist.map(() => false));

  // Reset local UI state when the stage moves on (e.g. reset demo, claim accepted).
  useEffect(() => {
    setComposerOpen(status === 'ready');
    setPicked([]);
    setChecks(stage.checklist.map(() => false));
  }, [status, stage.checklist]);

  const waitingDays = stage.inspectorSig ? Math.floor((nowFor(project) - stage.inspectorSig.at) / DAY) : 0;

  return (
    <article className={`stage stage-${status} ${active ? 'is-active' : ''} ${flash ? 'flash' : ''}`}>
      <div className="stage-spine">
        <div className="stage-icon">
          <StageIcon id={stage.id} />
        </div>
      </div>

      <div className="stage-body">
        <header className="stage-head">
          <div>
            <h3>{stage.name}</h3>
            <div className="stage-meta">
              {stage.pct}% of contract
              {stage.releasedAt && <> · released {fmtDate(stage.releasedAt)} · <span className="mono">{stage.txId}</span></>}
              {status === 'locked' && <> · unlocks after the previous stage</>}
            </div>
          </div>
          <span className={`chip chip-${status}`}>
            {status === 'locked' && <IconLock size={13} />}
            {(status === 'released' || status === 'inspector_signed') && <IconCheck size={13} />}
            {status === 'disputed' && <IconScale size={13} />}
            {STATUS_LABEL[status]}
          </span>
          <div className="stage-amount tabular">{money(stage.amount)}</div>
        </header>

        {(active || status === 'released') && stage.id !== 'deposit' && (
          <div className="stage-detail">
            <Signatures project={project} stage={stage} />
            {stage.evidence.length > 0 && (
              <div className="thumbs">
                {stage.evidence.map((v) => (
                  <figure key={v} className="thumb">
                    <SitePhoto stage={stage.id} variant={v} />
                    <figcaption>{photoCaption(stage.id, v)}</figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        )}

        <Actions
          {...props}
          status={status}
          composerOpen={composerOpen}
          setComposerOpen={setComposerOpen}
          picked={picked}
          setPicked={setPicked}
          checks={checks}
          setChecks={setChecks}
          waitingDays={waitingDays}
        />
      </div>
    </article>
  );
}

function Signatures({ project, stage }: { project: Project; stage: Stage }) {
  const disputed = !!stage.disputeOpenedAt;
  const sigs = [
    { label: 'Builder claim', who: project.people.builder.name, sig: stage.claimedAt ? { at: stage.claimedAt } : undefined },
    { label: 'Inspector', who: project.inspectorAssigned, sig: stage.inspectorSig },
    disputed
      ? { label: 'Mediator', who: 'DBDRV', sig: stage.mediatorSig }
      : { label: 'Homeowner', who: project.people.homeowner.name, sig: stage.ownerSig },
  ];
  return (
    <div className="sigs">
      {sigs.map((s) => (
        <div key={s.label} className={`sig ${s.sig ? 'sig-ok' : ''}`}>
          <span className="sig-dot">{s.sig ? <IconCheck size={12} /> : null}</span>
          <span>
            <b>{s.label}</b> {s.who}
          </span>
        </div>
      ))}
    </div>
  );
}

type ActionProps = Props & {
  status: StageStatus;
  composerOpen: boolean;
  setComposerOpen: (v: boolean) => void;
  picked: number[];
  setPicked: (v: number[]) => void;
  checks: boolean[];
  setChecks: (v: boolean[]) => void;
  waitingDays: number;
};

function Actions(p: ActionProps) {
  const { stage, role, status } = p;
  if (stage.id === 'deposit' || status === 'released') return null;

  if (role === 'builder') {
    if (status === 'ready' || status === 'locked') {
      if (!p.composerOpen) {
        return (
          <div className="actions">
            <button className="btn btn-ghost" onClick={() => p.setComposerOpen(true)}>
              Claim this stage
            </button>
          </div>
        );
      }
      const toggle = (v: number) =>
        p.setPicked(p.picked.includes(v) ? p.picked.filter((x) => x !== v) : [...p.picked, v].sort());
      return (
        <div className="composer">
          <div className="composer-label">
            <IconCamera size={16} /> Attach site photos
          </div>
          <div className="photo-pick">
            {[0, 1, 2].map((v) => (
              <button
                key={v}
                className={`pick ${p.picked.includes(v) ? 'picked' : ''}`}
                onClick={() => toggle(v)}
                aria-pressed={p.picked.includes(v)}
              >
                <SitePhoto stage={stage.id} variant={v} />
                <span>{photoCaption(stage.id, v)}</span>
                <i className="pick-tick">
                  <IconCheck size={12} />
                </i>
              </button>
            ))}
          </div>
          <div className="actions">
            <button
              className="btn btn-primary"
              disabled={p.picked.length === 0}
              onClick={() => p.onClaim(stage.id, p.picked)}
            >
              Claim {money(stage.amount)}
            </button>
            <span className="hint">
              {p.picked.length === 0 ? 'Pick at least one photo' : `${p.picked.length} photo${p.picked.length > 1 ? 's' : ''} attached`}
            </span>
          </div>
        </div>
      );
    }
    if (status === 'claimed') return <Waiting text="Waiting for the inspector to sign off" />;
    if (status === 'inspector_signed') {
      const canDispute = p.waitingDays >= 10;
      return (
        <div className="actions">
          <Waiting text={`Waiting for the homeowner · ${p.waitingDays} day${p.waitingDays === 1 ? '' : 's'} since inspector sign off`} />
          <span className="spacer" />
          {!canDispute && (
            <button className="btn btn-ghost btn-sm" onClick={p.onFastForward} title="Demo control">
              <IconClock size={15} /> Fast-forward 10 days
            </button>
          )}
          <button className={`btn ${canDispute ? 'btn-primary' : 'btn-ghost'}`} onClick={() => p.onDispute(stage.id)}>
            <IconScale size={16} /> Open dispute
          </button>
        </div>
      );
    }
    if (status === 'disputed') return <Waiting text="Dispute open · inspector + DBDRV mediator can release" />;
  }

  if (role === 'inspector') {
    if (status === 'claimed') {
      const all = p.checks.every(Boolean);
      return (
        <div className="composer">
          <div className="composer-label">Inspection checklist</div>
          <ul className="checklist">
            {stage.checklist.map((item, i) => (
              <li key={item}>
                <label>
                  <input
                    type="checkbox"
                    checked={p.checks[i]}
                    onChange={() => p.setChecks(p.checks.map((c, j) => (j === i ? !c : c)))}
                  />
                  <span className="box">
                    <IconCheck size={12} />
                  </span>
                  {item}
                </label>
              </li>
            ))}
          </ul>
          <div className="actions">
            <button className="btn btn-primary" disabled={!all} onClick={() => p.onSignoff(stage.id, p.checks)}>
              Sign off stage
            </button>
            <span className="hint">{all ? 'Your signature is 1 of 2' : 'Tick every item you have inspected'}</span>
          </div>
        </div>
      );
    }
    if (status === 'disputed') return <Waiting text="You have signed. Waiting for the DBDRV mediator." />;
    if (status === 'inspector_signed') return <Waiting text="You signed off this stage. Waiting for the homeowner." />;
  }

  if (role === 'homeowner') {
    if (status === 'inspector_signed') {
      return (
        <div className="actions">
          <button className="btn btn-primary btn-lg" onClick={() => p.onRelease(stage.id)}>
            Approve &amp; release {money(stage.amount)}
          </button>
          <span className="hint">
            Mei Lin signed off {p.waitingDays === 0 ? 'today' : `${p.waitingDays} days ago`}. Your signature releases the payment.
          </span>
        </div>
      );
    }
    if (status === 'claimed') return <Waiting text="Claimed by Coastline Homes. Waiting for the inspector before you can approve." />;
    if (status === 'disputed') return <Waiting text="Dispute open. The inspector and DBDRV mediator now decide." />;
  }

  if (role === 'mediator' && status === 'disputed') {
    return (
      <div className="actions">
        <button className="btn btn-primary btn-lg" onClick={() => p.onRelease(stage.id)}>
          Sign as mediator &amp; release {money(stage.amount)}
        </button>
        <span className="hint">Inspector has verified the work. Homeowner silent for {p.waitingDays} days.</span>
      </div>
    );
  }

  return null;
}

function Waiting({ text }: { text: string }) {
  return (
    <div className="waiting">
      <span className="pulse" /> {text}
    </div>
  );
}
