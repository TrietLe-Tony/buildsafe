import { useLayoutEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../hooks';
import type { Verdict } from '../tide/tideGate';
import { IconCheck, IconNodes, IconX } from './Icons';

export type TideRun = { id: number; verdict: Verdict; who: string; roleLabel: string };

type Phase = 'checks' | 'nodes' | 'done';

const ROW_MS = 380;
const NODE_MS = 65;

export function TidePanel({ run, onDone }: { run: TideRun | null; onDone: (id: number) => void }) {
  const [shown, setShown] = useState(0);
  const [phase, setPhase] = useState<Phase>('done');
  const [filled, setFilled] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  // Layout effect so a new run never paints with the previous run's finished state.
  useLayoutEffect(() => {
    if (!run) return;
    const v = run.verdict;
    const reduced = prefersReducedMotion();
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, reduced ? 0 : ms));

    setShown(0);
    setFilled(0);
    setPhase('checks');

    v.checks.forEach((_, i) => at(250 + (i + 1) * ROW_MS, () => setShown(i + 1)));
    let t = 250 + v.checks.length * ROW_MS + 250;
    if (v.ok && v.nodesSigned > 0) {
      at(t, () => setPhase('nodes'));
      for (let n = 1; n <= v.nodesSigned; n++) at(t + n * NODE_MS, () => setFilled(n));
      t += v.nodesSigned * NODE_MS + 300;
    }
    at(t, () => {
      setPhase('done');
      doneRef.current(run.id);
    });
    return () => timers.forEach(clearTimeout);
  }, [run]);

  return (
    <aside className="tide card">
      <header className="tide-head">
        <div className="tide-title">
          <IconNodes size={20} />
          <h2>Tide network check</h2>
        </div>
        <p>Every payment needs a threshold signature: 14 of 20 independent nodes must each check the policy. BuildSafe holds no key.</p>
      </header>

      {!run ? <Idle /> : <RunView run={run} shown={shown} phase={phase} filled={filled} />}
    </aside>
  );
}

function Idle() {
  const rules = [
    'Claimed by the builder, with site evidence',
    'Earlier stages released, in order',
    'Signed by the inspector assigned to this project',
    'Signed by the homeowner (or mediator in a dispute)',
    'Amount matches the contract',
  ];
  return (
    <div className="tide-idle">
      <NodeRing filled={0} state="idle" />
      <div className="policy">
        <div className="policy-name">
          Policy <span className="mono">buildsafe.stage-release.v1</span>
        </div>
        <ul>
          {rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <p className="muted small">Waiting for an action. Pick a role above and try to move money.</p>
      </div>
    </div>
  );
}

function RunView({ run, shown, phase, filled }: { run: TideRun; shown: number; phase: Phase; filled: number }) {
  const v = run.verdict;
  const done = phase === 'done';
  const movesMoney = v.kind === 'release' || v.kind === 'change';
  const ringState = !done ? (phase === 'nodes' ? 'signing' : 'waiting') : v.ok ? (movesMoney ? 'ok' : 'none') : 'refused';

  return (
    <div className="tide-run" key={run.id}>
      <div className="request">
        <div className="eyebrow muted">Request</div>
        <div className="request-title">{v.title}</div>
        <div className="muted small">
          from {run.who} · {run.roleLabel}
        </div>
      </div>

      <ol className="checks">
        {v.checks.map((c, i) => {
          const state = i < shown ? (c.ok ? 'ok' : 'bad') : i === shown && !done ? 'running' : 'pending';
          return (
            <li key={i} className={`check check-${state}`}>
              <span className="check-icon">
                {state === 'ok' && <IconCheck size={14} />}
                {state === 'bad' && <IconX size={14} />}
              </span>
              <span className="check-text">
                {c.label}
                {state === 'bad' && c.detail && <em>{c.detail}</em>}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="tide-result">
        <NodeRing filled={v.ok ? filled : 0} state={ringState} />
        {done && <Outcome v={v} movesMoney={movesMoney} />}
        {!done && <div className="muted small evaluating">Nodes evaluating policy…</div>}
      </div>
    </div>
  );
}

function Outcome({ v, movesMoney }: { v: Verdict; movesMoney: boolean }) {
  if (v.ok && !movesMoney) {
    return (
      <div className="outcome outcome-neutral">
        <div className="outcome-line">
          <IconCheck size={18} /> Policy check passed
        </div>
        <p>{v.outcome}</p>
      </div>
    );
  }
  if (v.ok) {
    return (
      <div className="outcome outcome-ok">
        <div className="outcome-line">
          <span className="tabular">
            {v.nodesSigned} of {v.total}
          </span>{' '}
          nodes signed <IconCheck size={18} />
        </div>
        <p className="strong">{v.outcome}</p>
        {v.note && <p>{v.note}</p>}
      </div>
    );
  }
  return (
    <div className="outcome outcome-bad shake">
      <div className="outcome-line">
        <span className="tabular">0 of {v.total}</span> nodes signed <IconX size={18} /> Refused
      </div>
      <p className="strong">{v.outcome}</p>
      {v.reason && <p>{v.reason}</p>}
      {v.contrast && <p className="contrast">{v.contrast}</p>}
    </div>
  );
}

function NodeRing({ filled, state }: { filled: number; state: 'idle' | 'none' | 'waiting' | 'signing' | 'ok' | 'refused' }) {
  const n = 20;
  const r = 62;
  return (
    <svg viewBox="0 0 160 160" className={`ring ring-${state}`} aria-label={`${filled} of 20 nodes signed`}>
      <circle cx="80" cy="80" r={r} className="ring-track" />
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const x = 80 + r * Math.cos(a);
        const y = 80 + r * Math.sin(a);
        return <circle key={i} cx={x} cy={y} r="6.5" className={`node ${i < filled ? 'node-on' : ''}`} style={{ animationDelay: `${i * 60}ms` }} />;
      })}
      <text x="80" y="78" textAnchor="middle" className="ring-num">
        {state === 'idle' ? '14/20' : state === 'none' ? '–' : `${filled}/20`}
      </text>
      <text x="80" y="98" textAnchor="middle" className="ring-label">
        {state === 'idle' ? 'threshold' : state === 'none' ? 'no payment' : state === 'refused' ? 'no signature' : 'signed'}
      </text>
    </svg>
  );
}
