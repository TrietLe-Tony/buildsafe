export type Role = 'homeowner' | 'builder' | 'inspector' | 'mediator' | 'admin' | 'attacker';

export type StageId = 'deposit' | 'base' | 'frame' | 'lockup' | 'fixing' | 'completion';

export type StageStatus =
  | 'locked'
  | 'ready'
  | 'claimed'
  | 'inspector_signed'
  | 'owner_signed'
  | 'released'
  | 'disputed';

export interface Sig {
  by: string;
  at: number;
}

export interface Stage {
  id: StageId;
  name: string;
  pct: number;
  amount: number;
  checklist: string[];
  evidence: number[];
  claimedAt?: number;
  inspectorSig?: Sig;
  ownerSig?: Sig;
  mediatorSig?: Sig;
  disputeOpenedAt?: number;
  releasedAt?: number;
  txId?: string;
}

export interface Person {
  name: string;
  title: string;
}

export interface LogEntry {
  id: string;
  at: number;
  role: Role;
  who: string;
  text: string;
  kind: 'ok' | 'refused' | 'info' | 'released';
}

export interface Project {
  name: string;
  address: string;
  contract: number;
  people: Record<Role, Person>;
  inspectorAssigned: string;
  payoutAccount: { name: string; bsb: string; acct: string };
  stages: Stage[];
  log: LogEntry[];
  dayOffset: number;
}

export interface Actor {
  role: Role;
  name: string;
}
