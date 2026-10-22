# BuildSafe

**BuildSafe holds your home build budget in a vault nobody can open alone: each stage is paid only when you and an independent inspector both sign off.**

## Project overview

**Vision & originality.** Building payments without trusting anyone with the money. Today a homeowner pays a builder, or trusts an escrow company, a bank or an app admin to hold it. BuildSafe replaces that custodian with rules: stage money moves only when the right people sign.

**Trust constraint insight.** When a builder collapses, money already paid is gone. Porter Davis left about 1,700 Victorian and Queensland homes unfinished in 2023, with an estimated 800 families uninsured and $30,000 to $50,000 lost on average. 3,472 construction companies went insolvent in FY2025-26. Any escrow that a single party controls just moves the risk to that party.

**Value & impact.** Homeowners can hire small or new builders with confidence. Builders see their money is secured and get paid the moment work is verified, which protects their cash flow. Disputes go to the inspector plus an independent mediator, never one side.

**Why TideCloak matters.** A stage release is only valid with a threshold signature from the Tide network, issued when a policy is met: stage claimed, inspector assigned to this project signed, homeowner signed, stages in order. BuildSafe's server holds no key, so neither our admins nor a hacker can release funds or change payout accounts. With ordinary login and backend permissions, they could.

**Prototype & storytelling.** Watch the slab stage released after both sign-offs; the builder claiming lock-up early, refused; and a BuildSafe admin trying to force a payment: "0 of 20 nodes signed".

## Setup

Requires Node.js 18 or newer (tested on Node 22, Windows 11).

```bash
npm install
npm run dev
```

Open http://localhost:5173 at browser zoom 100% (designed for 1920x1080). No backend is needed: the demo project is seeded in memory and saved to `localStorage`. Use **Reset demo** (top right) to start over.

Production build: `npm run build` (output in `dist/`).

## Demo script (about 2 minutes)

Seeded project: 14 Banksia Crescent, Tarneit VIC, $420,000 contract. Homeowner Priya Sharma, builder Coastline Homes, inspector Mei Lin (registered building surveyor). Deposit already released.

1. **Happy path.** *Builder*: on Base (slab), pick site photos and click **Claim $63,000**. *Inspector*: tick the checklist and click **Sign off stage**. *Homeowner*: click **Approve & release $63,000**. The Tide panel checks every rule, 14 of 20 nodes sign, and the money moves from Held to Released.
2. **Builder claims too early.** *Builder*: on Lock-up, click **Claim this stage**, pick a photo, click **Claim $105,000**. Refused: stages must be completed in order, no inspector sign off on Frame.
3. **Insider and attacker.** *BuildSafe admin*: **Force release Frame ($84,000)**. Refused, "0 of 20 nodes signed. BuildSafe cannot move your money." *Attacker*: **Change payout bank account**. Refused, it needs homeowner + builder approval (this is how payment redirection scams work).
4. **Dispute (optional).** With a stage signed by the inspector, *Builder* clicks **Fast-forward 10 days**, then **Open dispute**. A *Mediator* role appears and can release together with the inspector's signature.

**How it works** (top right) explains the three steps and the ordinary login comparison.

## Simulated Tide

**Tide is simulated in this prototype (allowed by the organisers).** All policy logic lives in [`src/tide/tideGate.ts`](src/tide/tideGate.ts). In production this policy runs as a Forseti contract on the Tide Fabric: each ORK validates it and contributes a partial signature (threshold 14 of 20). BuildSafe's server never holds a signing key. To go live, `signWithFabric()` is replaced by a TideCloak signing request carrying the same release instruction and approvals. The rest of the app does not change.

| Need | Tide capability | In BuildSafe |
|---|---|---|
| Nobody can move money alone | **Threshold signing** by the Tide Fabric (key split across independent nodes, e.g. 14 of 20) | A stage release instruction is only valid with a Fabric signature. BuildSafe's server holds no signing key |
| Release only when rules are met | **Forseti policy** (programmable rules checked by every node: ValidateData, ValidateApprovers, ValidateExecutor) | Policy per stage: claimed by the builder · signed by homeowner · signed by an inspector assigned to this project · stage evidence attached · amount equals stage amount · stages in order |
| No single admin changes the rules | **Quorum governance** (admin changes need multiple approvals) | Changing the contract (amounts, stages, payout account) needs homeowner + builder |
| Identity | **TideCloak login (BYOiD)** with roles | Roles: homeowner, builder, inspector, mediator, BuildSafe admin |

The functions in `tideGate.ts`:

| Function | Who | What the nodes check |
|---|---|---|
| `evaluateClaim` | Builder | Contracted builder, stages in order, previous stage signed off, evidence, amount |
| `evaluateSignoff` | Inspector | Assigned inspector, stage claimed, evidence, checklist complete |
| `evaluateRelease` | Homeowner (or mediator in a dispute) | Role allowed, claimed, in order, evidence, inspector signed, homeowner/mediator signed, amount. Only this and `evaluateChange` produce a signature |
| `evaluateChange` | Anyone | Payout account or contract changes need homeowner + builder quorum |
| `evaluateDispute` | Builder | Inspector signed, homeowner silent for 10+ days |

**The ordinary login test.** With normal login and backend permissions, a BuildSafe admin, or anyone who breaches our server, could release funds or swap the payout account, and an escrow company has to be trusted. With Tide, a release that breaks the rules simply has no valid signature. The app shows this on screen whenever the admin or attacker role tries.

## Sources

- Porter Davis collapse (March 2023): about 1,700 homes unfinished in Victoria and Queensland, an estimated 800 families uninsured, average losses of $30,000 to $50,000. Bendigo Advertiser / ACM, April 2023.
- 3,472 construction company insolvencies in FY2025-26, 24.5% of all company insolvencies in Australia. ASIC figures, reported by QUT via The Conversation, 2026.
- Stage percentages are an example schedule based on typical Victorian domestic building contract stages.

## Tech

Vite, React 18, TypeScript, hand-written CSS with design tokens. Fonts: Archivo, Public Sans, IBM Plex Mono (Google Fonts). All icons and site photos are inline SVG.
