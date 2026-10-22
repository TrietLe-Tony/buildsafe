[![Built with TideCloak](https://tide.org/badges/built-with-tidecloak.svg)](https://tide.org/tidecloak?utm_source=github&utm_medium=readme&utm_campaign=unlocked)

# BuildSafe

## Project overview

**BuildSafe holds your home build budget in a vault nobody can open alone: each stage is paid only when you and an independent inspector both sign off.**

Built with [TideCloak](https://tide.org/tidecloak?utm_source=github&utm_medium=readme&utm_campaign=unlocked).

### 1. Vision & originality

BuildSafe offers a way to pay for a home build without trusting anyone to hold the money. Today a homeowner either pays the builder directly or trusts an escrow company, a bank or an app admin to hold the funds. BuildSafe replaces that custodian with rules. Stage money moves only when the right people sign: the builder claims the stage, an inspector assigned to the project verifies it, and the homeowner approves.

What makes it distinctive is that no one in the system can hold the money alone, including BuildSafe. The platform has no signing key. Releases are authorised by a threshold signature from the Tide network, which is only issued when the stage's policy is met.

### 2. Trust constraint insight

When a builder collapses, money already paid is gone. Porter Davis left about 1,700 Victorian and Queensland homes unfinished in 2023, with an estimated 800 families uninsured and average losses of $30,000 to $50,000. In FY2025-26, 3,472 construction companies went insolvent, 24.5% of all company insolvencies in Australia.

The usual fix is escrow. But any escrow controlled by a single party only moves the risk to that party. The custodian can fail, be breached, or have an insider who redirects funds. Payment redirection scams work the same way: change the payout account, and the next payment goes to the attacker.

With that constraint removed, stage payments can be secured without trusting a middleman. Money is locked against verified progress, released only when the rules are satisfied, and protected from the platform itself.

### 3. Value & impact

Building a home is the biggest purchase most families make, and it's paid in large chunks long before the house exists. BuildSafe changes who carries that risk.

- **Homeowners** can hire small or new builders with confidence. Money is never paid ahead of verified work, and if a builder collapses, unreleased stage money stays in the vault. An independent inspector checks each stage, so they don't have to judge quality themselves.
- **Builders** can prove the money is secured, helping smaller builders compete with big names. They're paid as soon as work is verified, and a homeowner can't hold back payment indefinitely.
- **Disputes** go to the inspector plus an independent mediator, never to one side.
- **No redirection scams.** Changing the payout account needs both homeowner and builder, so a hacked email or admin account can't send a payment to a criminal.
- **No platform risk.** BuildSafe holds no signing key, so a server breach, a rogue employee, or BuildSafe shutting down can't release or redirect funds.

**Wider impact.** Builder insolvencies hit thousands of Australian families and push good small builders out of the market, because homeowners stick with big names they assume are safer. By making stage payments safe no matter who the builder is, BuildSafe lowers the cost of trust for both sides. The same pattern could later extend to renovations, strata repairs, or any staged project where one side pays upfront and hopes the other delivers.

### 4. Why TideCloak matters

A stage release is only valid with a threshold signature from the Tide network, issued when a policy is met: **stage claimed, inspector assigned to this project signed, homeowner signed**, stages in order. BuildSafe's server holds no key, so neither our admins nor a hacker can release funds or change payout accounts.

| Need | Tide capability | In BuildSafe |
|---|---|---|
| Nobody can move money alone | **Threshold signing** by the Tide Fabric (key split across independent nodes, e.g. 14 of 20) | A stage release is only valid with a Fabric signature. BuildSafe's server holds no signing key |
| Release only when rules are met | **Forseti policy** (rules checked by every node: ValidateData, ValidateApprovers, ValidateExecutor) | Per stage: claimed by the builder · signed by homeowner · signed by an inspector assigned to this project · evidence attached · amount equals stage amount · stages in order |
| No single admin changes the rules | **Quorum governance** (admin changes need multiple approvals) | Changing amounts, stages or the payout account needs homeowner + builder |
| Identity | **TideCloak login (BYOiD)** with roles | Homeowner, builder, inspector, mediator, BuildSafe admin |

**The ordinary login test.** With normal login and backend permissions, a BuildSafe admin, or anyone who breaches our server, could release funds or swap the payout account, and an escrow company would have to be trusted. With Tide, a release that breaks the rules simply has no valid signature. The app shows this on screen whenever the admin or attacker role tries.

### 5. Prototype & storytelling

The prototype is a working, clickable demo of one seeded project: 14 Banksia Crescent, Tarneit VIC, a $420,000 contract. 
- homeowner Priya Sharma
- builder Coastline Homes
- inspector Mei Lin (registered building surveyor)
The deposit has already been released.

Key interactions for judges:

1. **Happy path.** The slab stage is released after both sign-offs. The Tide panel checks every rule, 14 of 20 nodes sign, and $63,000 moves from Held to Released.
2. **Builder claims too early.** The builder claims lock-up before the frame is inspected. Refused: stages must be completed in order.
3. **Insider and attacker.** A BuildSafe admin tries to force a payment: "0 of 20 nodes signed. BuildSafe cannot move your money." An attacker tries to change the payout bank account: refused without homeowner + builder approval.
4. **Dispute (optional).** After 10 days of homeowner silence on a verified stage, a mediator can release the payment together with the inspector's signature.

> **Note:** Tide is simulated in this prototype. See [Simulated Tide](#simulated-tide) below.

## Setup

Requires Node.js 18 or newer (tested on Node 22, Windows 11).

```bash
npm install
npm run dev
```

Open http://localhost:5173 at browser zoom 100% (designed for 1920x1080). No backend is needed: the demo project is seeded in memory and saved to `localStorage`. Use **Reset demo** (top right) to start over.

Production build: `npm run build` (output in `dist/`).

**How it works** (top right) explains the three steps and the ordinary login comparison.

## Simulated Tide

**Tide is simulated in this prototype.** All policy logic lives in `src/tide/tideGate.ts` and mirrors how a Forseti contract would run on the Tide Fabric. To go live, `signWithFabric()` is replaced by a real TideCloak signing request; the rest of the app does not change.

| Function | Who | What the nodes check |
|---|---|---|
| `evaluateClaim` | Builder | Contracted builder, stages in order, previous stage signed off, evidence, amount |
| `evaluateSignoff` | Inspector | Assigned inspector, stage claimed, evidence, checklist complete |
| `evaluateRelease` | Homeowner (or mediator in a dispute) | Role allowed, claimed, in order, evidence, inspector signed, homeowner/mediator signed, amount. Only this and `evaluateChange` produce a signature |
| `evaluateChange` | Anyone | Payout account or contract changes need homeowner + builder quorum |
| `evaluateDispute` | Builder | Inspector signed, homeowner silent for 10+ days |

## Sources

- Porter Davis collapse (March 2023): about 1,700 homes unfinished in Victoria and Queensland, an estimated 800 families uninsured, average losses of $30,000 to $50,000. Bendigo Advertiser / ACM, April 2023.
- 3,472 construction company insolvencies in FY2025-26, 24.5% of all company insolvencies in Australia. ASIC figures, reported by QUT via The Conversation, 2026.
- Stage percentages are an example schedule based on typical Victorian domestic building contract stages.

## Tech

Vite, React 18, TypeScript, hand-written CSS with design tokens. Fonts: Archivo, Public Sans, IBM Plex Mono (Google Fonts). All icons and site photos are inline SVG.