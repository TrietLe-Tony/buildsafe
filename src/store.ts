import { seedProject } from './data/seed';
import type { LogEntry, Project, Role, Stage, StageId, StageStatus } from './types';

const KEY = 'buildsafe-demo-v1';
export const DAY = 86_400_000;

export const money = (n: number) => '$' + Math.round(n).toLocaleString('en-AU');

export const stageIndex = (p: Project, id: StageId) => p.stages.findIndex((s) => s.id === id);

/** Simulated clock: real time plus the demo's fast-forward offset. */
export const nowFor = (p: Project) => Date.now() + p.dayOffset * DAY;

export function stageStatus(p: Project, stage: Stage): StageStatus {
  if (stage.releasedAt) return 'released';
  if (stage.disputeOpenedAt) return 'disputed';
  if (stage.inspectorSig) return 'inspector_signed';
  if (stage.ownerSig) return 'owner_signed';
  if (stage.claimedAt) return 'claimed';
  const prev = p.stages.slice(0, stageIndex(p, stage.id));
  return prev.every((s) => s.releasedAt) ? 'ready' : 'locked';
}

export function totals(p: Project) {
  const released = p.stages.filter((s) => s.releasedAt).reduce((a, s) => a + s.amount, 0);
  const next = p.stages.find((s) => !s.releasedAt);
  return { released, held: p.contract - released, next };
}

export function loadProject(): Project {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Project;
  } catch {
    /* storage blocked or corrupt: fall back to seed */
  }
  return seedProject();
}

export function saveProject(p: Project) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function clearSaved() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function updateStage(p: Project, id: StageId, patch: Partial<Stage>): Project {
  return { ...p, stages: p.stages.map((s) => (s.id === id ? { ...s, ...patch } : s)) };
}

export function addLog(p: Project, role: Role, text: string, kind: LogEntry['kind']): Project {
  const entry: LogEntry = {
    id: Math.random().toString(36).slice(2),
    at: nowFor(p),
    role,
    who: p.people[role].name,
    text,
    kind,
  };
  return { ...p, log: [entry, ...p.log].slice(0, 60) };
}

export function fakeTxId() {
  const hex = () => Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
  return `tide:${hex()}…${hex()}`;
}
