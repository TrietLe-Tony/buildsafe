import type { Project, Stage } from '../types';

const CONTRACT = 420_000;

// Example schedule, following typical Victorian domestic building contract stages.
const stage = (id: Stage['id'], name: string, pct: number, checklist: string[]): Stage => ({
  id,
  name,
  pct,
  amount: Math.round((CONTRACT * pct) / 100),
  checklist,
  evidence: [],
});

export function seedProject(now = Date.now()): Project {
  const day = 86_400_000;
  const stages: Stage[] = [
    stage('deposit', 'Deposit', 5, []),
    stage('base', 'Base (slab)', 15, ['Slab poured to engineer’s design', 'Footings set out to plan', 'Termite barrier installed']),
    stage('frame', 'Frame', 20, ['Frame plumb, square and braced', 'Tie-downs and bracing fixed', 'Frame inspection passed']),
    stage('lockup', 'Lock-up', 25, ['External walls clad', 'Roof covering installed', 'Windows and external doors fitted']),
    stage('fixing', 'Fixing', 20, ['Internal linings fixed', 'Cabinets and internal doors hung', 'Wet areas waterproofed']),
    stage('completion', 'Completion', 15, ['Occupancy permit issued', 'Defects list closed', 'Final clean and handover']),
  ];

  stages[0] = {
    ...stages[0],
    evidence: [0],
    claimedAt: now - 42 * day,
    ownerSig: { by: 'Priya Sharma', at: now - 41 * day },
    releasedAt: now - 41 * day,
    txId: 'tide:7f3a…c21e',
  };

  return {
    name: '14 Banksia Crescent',
    address: '14 Banksia Crescent, Tarneit VIC',
    contract: CONTRACT,
    people: {
      homeowner: { name: 'Priya Sharma', title: 'Homeowner' },
      builder: { name: 'Coastline Homes', title: 'Builder · Dan, site manager' },
      inspector: { name: 'Mei Lin', title: 'Registered building surveyor' },
      mediator: { name: 'DBDRV', title: 'Domestic Building Dispute Resolution Victoria' },
      admin: { name: 'BuildSafe staff', title: 'BuildSafe admin' },
      attacker: { name: 'Unknown session', title: 'Attacker with server access' },
    },
    inspectorAssigned: 'Mei Lin',
    payoutAccount: { name: 'Coastline Homes Pty Ltd', bsb: '063-182', acct: '•••• 4417' },
    stages,
    log: [
      {
        id: 'seed-2',
        at: now - 41 * day,
        role: 'homeowner',
        who: 'Priya Sharma',
        text: 'Deposit $21,000 released to Coastline Homes. 14 of 20 Tide nodes signed.',
        kind: 'released',
      },
      {
        id: 'seed-1',
        at: now - 42 * day,
        role: 'homeowner',
        who: 'Priya Sharma',
        text: 'Contract signed. $420,000 build budget locked in the stage vault.',
        kind: 'info',
      },
    ],
    dayOffset: 0,
  };
}
