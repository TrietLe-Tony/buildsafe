import { useEffect, useRef, useState } from 'react';
import { ActivityLog } from './components/ActivityLog';
import { HowItWorks } from './components/HowItWorks';
import { FAKE_ACCOUNT, RoleConsole } from './components/RoleConsole';
import { StageCard } from './components/StageCard';
import { RoleBanner, Summary } from './components/Summary';
import { TidePanel, type TideRun } from './components/TidePanel';
import { ROLE_LABELS, TopBar } from './components/TopBar';
import { seedProject } from './data/seed';
import { addLog, clearSaved, fakeTxId, loadProject, money, nowFor, saveProject, updateStage } from './store';
import {
  evaluateChange,
  evaluateClaim,
  evaluateDispute,
  evaluateRelease,
  evaluateSignoff,
  type Verdict,
} from './tide/tideGate';
import type { Project, Role, Stage, StageId } from './types';

const ROLE_KEY = 'buildsafe-role-v1';
type Apply = (p: Project) => Project;

function loadRole(): Role {
  try {
    const r = localStorage.getItem(ROLE_KEY) as Role | null;
    if (r && r in ROLE_LABELS) return r;
  } catch {
    /* ignore */
  }
  return 'homeowner';
}

export default function App() {
  const [project, setProject] = useState<Project>(loadProject);
  const [role, setRole] = useState<Role>(loadRole);
  const [run, setRun] = useState<TideRun | null>(null);
  const [flashId, setFlashId] = useState<StageId | null>(null);
  const [howOpen, setHowOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const pending = useRef<{ id: number; apply: Apply; after?: () => void } | null>(null);

  useEffect(() => saveProject(project), [project]);
  useEffect(() => {
    try {
      localStorage.setItem(ROLE_KEY, role);
    } catch {
      /* ignore */
    }
  }, [role]);

  const actor = { role, name: project.people[role].name };
  const stageOf = (id: StageId) => project.stages.find((s) => s.id === id)!;

  /** Every action goes through TideGate. State only changes once the panel finishes its check. */
  function submit(verdict: Verdict, onOk: Apply, onRefused: Apply, after?: () => void) {
    // One check at a time: a second click mid-animation would be judged against stale state.
    if (pending.current) return;
    const id = Date.now();
    pending.current = { id, apply: verdict.ok ? onOk : onRefused, after: verdict.ok ? after : undefined };
    setBusy(true);
    setRun({ id, verdict, who: actor.name, roleLabel: ROLE_LABELS[role] });
  }

  function flush() {
    const p = pending.current;
    if (!p) return;
    pending.current = null;
    setBusy(false);
    setProject(p.apply);
    p.after?.();
  }

  const onDone = (id: number) => {
    if (pending.current?.id === id) flush();
  };

  const refusedLog = (text: string, v: Verdict): Apply => (p) => addLog(p, role, `${text} Refused: ${v.reason}`, 'refused');

  function claim(id: StageId, evidence: number[]) {
    const s = stageOf(id);
    const v = evaluateClaim(project, id, actor, evidence);
    submit(
      v,
      (p) =>
        addLog(
          updateStage(p, id, { claimedAt: nowFor(p), evidence }),
          'builder',
          `Claimed ${s.name} ${money(s.amount)} with ${evidence.length} site photo${evidence.length > 1 ? 's' : ''}.`,
          'ok',
        ),
      refusedLog(`Tried to claim ${s.name} ${money(s.amount)}.`, v),
    );
  }

  function signoff(id: StageId, checklist: boolean[]) {
    const s = stageOf(id);
    const v = evaluateSignoff(project, id, actor, checklist);
    submit(
      v,
      (p) =>
        addLog(
          updateStage(p, id, { inspectorSig: { by: actor.name, at: nowFor(p) } }),
          'inspector',
          `Signed off ${s.name} on site. Checklist ${checklist.length} of ${s.checklist.length} complete.`,
          'ok',
        ),
      refusedLog(`Tried to sign off ${s.name}.`, v),
    );
  }

  function release(id: StageId) {
    const s = stageOf(id);
    const v = evaluateRelease(project, id, actor);
    submit(
      v,
      (p) => {
        const at = nowFor(p);
        const sig = { by: actor.name, at };
        const patch = role === 'mediator' ? { mediatorSig: sig } : { ownerSig: sig };
        return addLog(
          updateStage(p, id, { ...patch, releasedAt: at, txId: fakeTxId() }),
          role,
          `${s.name} ${money(s.amount)} released to Coastline Homes. 14 of 20 Tide nodes signed.`,
          'released',
        );
      },
      refusedLog(`Tried to release ${s.name} ${money(s.amount)}.`, v),
      () => {
        setFlashId(id);
        window.setTimeout(() => setFlashId(null), 2400);
      },
    );
  }

  function dispute(id: StageId) {
    const s = stageOf(id);
    const v = evaluateDispute(project, id, actor);
    submit(
      v,
      (p) =>
        addLog(
          updateStage(p, id, { disputeOpenedAt: nowFor(p) }),
          'builder',
          `Opened a dispute on ${s.name}: inspector signed, homeowner silent. DBDRV mediator notified.`,
          'info',
        ),
      refusedLog(`Tried to open a dispute on ${s.name}.`, v),
    );
  }

  function forceRelease(s: Stage) {
    release(s.id);
  }

  function changeAmount(s: Stage) {
    const amount = s.amount + 36_000;
    const v = evaluateChange(project, { type: 'stage_amount', stageId: s.id, amount }, actor);
    submit(v, (p) => p, refusedLog(`Tried to change ${s.name} to ${money(amount)}.`, v));
  }

  function changePayout() {
    const v = evaluateChange(project, { type: 'payout_account', to: FAKE_ACCOUNT }, actor);
    submit(v, (p) => p, refusedLog(`Tried to change the payout account to BSB ${FAKE_ACCOUNT.bsb}.`, v));
  }

  function fastForward() {
    setProject((p) => ({ ...p, dayOffset: p.dayOffset + 10 }));
  }

  function reset() {
    pending.current = null;
    setBusy(false);
    clearSaved();
    setProject(seedProject());
    setRun(null);
    setFlashId(null);
    setRole('homeowner');
  }

  const hasDispute = project.stages.some((s) => s.disputeOpenedAt && !s.releasedAt);
  const roles: Role[] = ['homeowner', 'builder', 'inspector', ...(hasDispute || role === 'mediator' ? (['mediator'] as Role[]) : []), 'admin', 'attacker'];
  const consoleTarget = project.stages.slice(2).find((s) => !s.releasedAt);

  return (
    <div className={`app role-${role}`}>
      <TopBar project={project} role={role} roles={roles} onRole={setRole} onReset={reset} onHow={() => setHowOpen(true)} />

      <main className={`layout ${busy ? 'is-busy' : ''}`} aria-busy={busy}>
        <div className="col-main">
          <Summary project={project} role={role} />
          <RoleBanner project={project} role={role} />
          <RoleConsole
            project={project}
            role={role}
            target={consoleTarget}
            onForceRelease={forceRelease}
            onChangeAmount={changeAmount}
            onChangePayout={changePayout}
          />

          <section className="vault">
            <div className="section-head">
              <h2>Stage vault</h2>
              <span className="muted small">Example schedule, following typical Victorian contract stages</span>
            </div>
            <div className="timeline">
              {project.stages.map((s) => (
                <StageCard
                  key={s.id}
                  project={project}
                  stage={s}
                  role={role}
                  flash={flashId === s.id}
                  onClaim={claim}
                  onSignoff={signoff}
                  onRelease={release}
                  onDispute={dispute}
                  onFastForward={fastForward}
                />
              ))}
            </div>
          </section>

          <ActivityLog project={project} />
        </div>

        <div className="col-side">
          <TidePanel run={run} onDone={onDone} />
        </div>
      </main>

      <HowItWorks open={howOpen} onClose={() => setHowOpen(false)} />
    </div>
  );
}
