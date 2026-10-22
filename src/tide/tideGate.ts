/**
 * TideGate: the only place BuildSafe decides whether money can move.
 *
 * In production this policy runs as a Forseti contract on the Tide Fabric; each ORK validates it
 * and contributes a partial signature (threshold 14 of 20). BuildSafe's server never holds a
 * signing key. A stage release instruction is only valid with that threshold signature, so if any
 * rule below fails, no signature exists and the payment rail rejects the instruction.
 *
 * In this prototype the Fabric is simulated (allowed by the organisers). The check functions map
 * 1:1 to Forseti's ValidateData / ValidateApprovers / ValidateExecutor steps. To go live, replace
 * `signWithFabric` with a TideCloak signing request carrying the same release instruction and the
 * collected approvals; the UI already shows exactly which rule each node evaluates.
 */
import type { Actor, Project, Stage, StageId } from '../types';
import { money, stageIndex } from '../store';

export type Check = { label: string; ok: boolean; detail?: string };

export type VerdictKind = 'release' | 'claim' | 'signoff' | 'change' | 'dispute';

export type Verdict = {
  ok: boolean;
  kind: VerdictKind;
  title: string;
  checks: Check[];
  nodesSigned: number;
  threshold: 14;
  total: 20;
  reason?: string;
  /** Short headline shown under the node ring. */
  outcome: string;
  /** "With ordinary login..." contrast line, shown for insider and attacker attempts. */
  contrast?: string;
};

export const THRESHOLD = 14 as const;
export const TOTAL_NODES = 20 as const;

export type Change =
  | { type: 'payout_account'; to: { bsb: string; acct: string } }
  | { type: 'stage_amount'; stageId: StageId; amount: number };

/** Simulated Fabric: every node runs the same policy; a signature only exists if all rules pass. */
function signWithFabric(checks: Check[]): number {
  return checks.every((c) => c.ok) ? THRESHOLD : 0;
}

function verdict(
  kind: VerdictKind,
  title: string,
  checks: Check[],
  okOutcome: string,
  refusal: { reason: string; outcome: string; contrast?: string },
  moneyMoves: boolean,
): Verdict {
  const ok = checks.every((c) => c.ok);
  const signed = moneyMoves ? signWithFabric(checks) : 0;
  return {
    ok,
    kind,
    title,
    checks,
    nodesSigned: ok ? signed : 0,
    threshold: THRESHOLD,
    total: TOTAL_NODES,
    reason: ok ? undefined : refusal.reason,
    outcome: ok ? okOutcome : refusal.outcome,
    contrast: ok ? undefined : refusal.contrast,
  };
}

function earlierStages(project: Project, stage: Stage) {
  return project.stages.slice(0, stageIndex(project, stage.id));
}

function orderCheck(project: Project, stage: Stage): Check {
  const pending = earlierStages(project, stage).filter((s) => !s.releasedAt);
  return {
    label: 'Stages completed in order',
    ok: pending.length === 0,
    detail: pending.length ? `${pending.map((s) => s.name).join(', ')} not released yet` : undefined,
  };
}

const CONTRAST: Partial<Record<Actor['role'], string>> = {
  admin:
    'With ordinary login, an admin with the right permission could push this payment. Here no valid signature exists.',
  attacker:
    'With ordinary login, whoever controls the server controls the money. Here the server holds no key to steal.',
};

/** Builder lodges a stage claim (payment request) with evidence. No money moves yet. */
export function evaluateClaim(project: Project, stageId: StageId, actor: Actor, evidence: number[]): Verdict {
  const stage = project.stages[stageIndex(project, stageId)];
  const prev = earlierStages(project, stage).at(-1);
  const prevNeedsInspector = prev && prev.id !== 'deposit';
  const checks: Check[] = [
    {
      label: 'Claimed by the contracted builder',
      ok: actor.role === 'builder',
      detail: actor.role === 'builder' ? undefined : `${actor.name} is not the builder on this contract`,
    },
    orderCheck(project, stage),
    {
      label: 'Previous stage signed off by inspector',
      ok: !prevNeedsInspector || !!prev?.inspectorSig,
      detail: prevNeedsInspector && !prev?.inspectorSig ? `No inspector sign off on ${prev!.name}` : undefined,
    },
    {
      label: 'Site evidence attached',
      ok: evidence.length > 0,
      detail: evidence.length ? undefined : 'No site photos attached',
    },
    { label: `Amount matches contract: ${money(stage.amount)}`, ok: true },
  ];
  return verdict(
    'claim',
    `Claim ${stage.name} · ${money(stage.amount)}`,
    checks,
    `Claim recorded. ${money(stage.amount)} stays locked until the inspector and homeowner sign.`,
    {
      reason: `Stages must be completed in order. ${stage.name} can’t be claimed until ${prev?.name ?? 'the previous stage'} is signed off and released.`,
      outcome: 'Claim refused. Nothing was paid.',
    },
    false,
  );
}

/** Assigned inspector signs off a claimed stage. */
export function evaluateSignoff(project: Project, stageId: StageId, actor: Actor, checklistDone: boolean[]): Verdict {
  const stage = project.stages[stageIndex(project, stageId)];
  const done = checklistDone.filter(Boolean).length;
  const isAssigned = actor.role === 'inspector' && actor.name === project.inspectorAssigned;
  const checks: Check[] = [
    {
      label: `Signed by the inspector assigned to this project`,
      ok: isAssigned,
      detail: isAssigned ? undefined : `${actor.name} is not the assigned inspector`,
    },
    { label: 'Stage claimed by the builder', ok: !!stage.claimedAt, detail: stage.claimedAt ? undefined : 'No claim lodged' },
    { label: 'Site evidence attached', ok: stage.evidence.length > 0 },
    {
      label: `Inspection checklist complete (${done} of ${stage.checklist.length})`,
      ok: done === stage.checklist.length,
    },
  ];
  return verdict(
    'signoff',
    `Inspector sign off · ${stage.name}`,
    checks,
    stage.disputeOpenedAt
      ? 'Inspector signature recorded. Waiting for the mediator.'
      : 'Inspector signature recorded (1 of 2). Waiting for the homeowner.',
    { reason: 'Inspection is not complete.', outcome: 'Sign off refused.' },
    false,
  );
}

/** Release a stage payment to the builder. This is the instruction the Fabric must sign. */
export function evaluateRelease(project: Project, stageId: StageId, actor: Actor): Verdict {
  const stage = project.stages[stageIndex(project, stageId)];
  const disputed = !!stage.disputeOpenedAt;
  const roleOk = actor.role === 'homeowner' || (disputed && actor.role === 'mediator');
  const inspectorOk = !!stage.inspectorSig && stage.inspectorSig.by === project.inspectorAssigned;
  const secondOk = disputed
    ? !!stage.mediatorSig || actor.role === 'mediator'
    : !!stage.ownerSig || actor.role === 'homeowner';

  const roleDetail: Record<string, string> = {
    admin: 'BuildSafe staff are not a party to this contract',
    attacker: 'Request came from an unverified server session',
    builder: 'The builder cannot pay themselves',
    inspector: 'The inspector signs off work but cannot release money',
    mediator: 'The mediator can only release a disputed stage',
  };

  const checks: Check[] = [
    {
      label: disputed ? 'Requested by homeowner or dispute mediator' : 'Requested by the homeowner',
      ok: roleOk,
      detail: roleOk ? undefined : roleDetail[actor.role],
    },
    { label: 'Stage claimed by the builder', ok: !!stage.claimedAt, detail: stage.claimedAt ? undefined : `${stage.name} has not been claimed` },
    orderCheck(project, stage),
    { label: 'Site evidence attached', ok: stage.evidence.length > 0, detail: stage.evidence.length ? undefined : 'No site photos' },
    {
      label: `Signed by ${project.inspectorAssigned}, assigned inspector`,
      ok: inspectorOk,
      detail: inspectorOk ? undefined : 'No inspector sign off',
    },
    disputed
      ? { label: 'Signed by independent mediator (DBDRV)', ok: secondOk, detail: secondOk ? undefined : 'No mediator signature' }
      : { label: `Signed by ${project.people.homeowner.name}, homeowner`, ok: secondOk, detail: secondOk ? undefined : 'No homeowner signature' },
    { label: `Amount matches contract: ${money(stage.amount)}`, ok: true },
  ];

  const missing = [!secondOk && (disputed ? 'mediator' : 'homeowner'), !inspectorOk && 'inspector'].filter(Boolean);
  const outsider = actor.role === 'admin' || actor.role === 'attacker';
  const reason = missing.length
    ? `Release needs ${disputed ? 'mediator' : 'homeowner'} + inspector signatures.`
    : !roleOk
      ? roleDetail[actor.role] + '.'
      : checks.find((c) => !c.ok)?.detail ?? 'Policy not met.';

  return verdict(
    'release',
    `Release ${stage.name} · ${money(stage.amount)}`,
    checks,
    'Release instruction valid',
    {
      reason,
      outcome:
        actor.role === 'admin'
          ? 'BuildSafe cannot move your money.'
          : actor.role === 'attacker'
            ? 'A breached server cannot move your money.'
            : 'Release refused. Nothing was paid.',
      contrast: outsider ? CONTRAST[actor.role] : undefined,
    },
    true,
  );
}

/** Contract and payout changes need a quorum of the contract parties: homeowner + builder. */
export function evaluateChange(project: Project, change: Change, actor: Actor): Verdict {
  const party = actor.role === 'homeowner' || actor.role === 'builder';
  const proposerDetail: Record<string, string> = {
    admin: 'BuildSafe staff are not a party to this contract',
    attacker: 'Request came from an unverified server session',
    inspector: 'Inspectors cannot change the contract',
    mediator: 'Mediators cannot change the contract',
  };
  const what =
    change.type === 'payout_account'
      ? 'Change payout bank account'
      : `Change ${project.stages[stageIndex(project, change.stageId)].name} amount to ${money(change.amount)}`;

  const checks: Check[] = [
    { label: 'Proposed by a party to the contract', ok: party, detail: party ? undefined : proposerDetail[actor.role] },
    {
      label: `Approved by ${project.people.homeowner.name}, homeowner`,
      ok: actor.role === 'homeowner',
      detail: actor.role === 'homeowner' ? undefined : 'No homeowner approval',
    },
    {
      label: `Approved by ${project.people.builder.name}, builder`,
      ok: actor.role === 'builder',
      detail: actor.role === 'builder' ? undefined : 'No builder approval',
    },
    { label: 'Quorum reached (2 of 2 parties)', ok: false, detail: `${party ? 1 : 0} of 2 approvals` },
  ];

  const isPayout = change.type === 'payout_account';
  return verdict(
    'change',
    what,
    checks,
    'Change approved',
    {
      reason: isPayout
        ? 'Changing the payout account needs homeowner + builder approval.'
        : 'Changing the contract needs homeowner + builder approval.',
      outcome:
        actor.role === 'attacker'
          ? 'Payment redirection blocked.'
          : actor.role === 'admin'
            ? 'BuildSafe cannot rewrite your contract.'
            : 'Change refused.',
      contrast: CONTRAST[actor.role],
    },
    true,
  );
}

/** Builder opens a dispute when a verified stage is left unsigned for 10+ days. */
export function evaluateDispute(project: Project, stageId: StageId, actor: Actor): Verdict {
  const stage = project.stages[stageIndex(project, stageId)];
  const waitingDays = stage.inspectorSig
    ? Math.floor((Date.now() + project.dayOffset * 86_400_000 - stage.inspectorSig.at) / 86_400_000)
    : 0;
  const checks: Check[] = [
    { label: 'Opened by the contracted builder', ok: actor.role === 'builder' },
    { label: 'Inspector signed off the work', ok: !!stage.inspectorSig, detail: stage.inspectorSig ? undefined : 'No inspector sign off' },
    {
      label: `Homeowner silent for 10+ days (${waitingDays} days)`,
      ok: waitingDays >= 10 && !stage.ownerSig,
      detail: waitingDays >= 10 ? undefined : 'Homeowner still has time to respond',
    },
  ];
  return verdict(
    'dispute',
    `Open dispute · ${stage.name}`,
    checks,
    'Dispute opened. Inspector + DBDRV mediator can now release.',
    { reason: 'A dispute can only be opened 10 days after inspector sign off.', outcome: 'Dispute refused.' },
    false,
  );
}
