# CLAUDE.md: BuildSafe (RMIT Hackathon 2026, Challenge 2 "UNLOCKED" by Tide)

You are building **BuildSafe** for a hackathon. **Hard deadline: Friday 23 Oct 2026, 10:00 AM Melbourne
time. Submit by 9:30.** It is now about 6:20 AM. Build fast, keep the app runnable at all times, commit
often. The last attempt at this hackathon produced an ugly UI: **design quality matters as much as
working code** (section 6). The user is on **Windows**, using the Claude Desktop Code tab.

---

## 1. Deliverables (from tide.org/unlocked)

1. **Public GitHub repo** with the working prototype.
2. **2 minute demo video** `.mp4`, **under 100 MB**, committed in the repo (the team makes it; you
   provide a clean demo flow to record).
3. `README.md` starting with **"Project overview"**: one sentence + answers to the 5 judging prompts,
   **300 words max**. Setup instructions in a separate section below (draft in section 8).
4. Repo link submitted via Google Form (the team does this).

Judging: Vision & originality 25%, Trust constraint insight 20%, Value & impact 20%, Why TideCloak
matters 20%, Prototype & storytelling 15%.
Organisers' rules to respect:
* "If your app would work exactly the same with ordinary login and backend permissions, develop the
  idea further. TideCloak should change what it can credibly do."
* Do not make it mainly a login demo, a security tool, or a generic access control dashboard.
* "Network trouble? If you simulated TideCloak, you're judged exactly the same. Show where TideCloak
  fits in your app and what it makes possible." → **We build with simulated Tide** (section 5).

---

## 2. The idea

**BuildSafe: pay your builder stage by stage, from money nobody can grab.**

Building a home in Australia means paying a builder big sums up front and per stage. When a builder
collapses, that money is gone. BuildSafe holds the build budget in a **keyless stage vault**: each
stage payment (deposit, base/slab, frame, lock-up, fixing, completion) is released **only when the
homeowner and an independent inspector both sign off that stage**. Nobody holds a key that moves the
money alone: not the builder, not the bank, not BuildSafe's own admins, not a hacker who breaches us.

**Two sided trust (say this in the pitch):**
* Homeowner: money only moves when work is verified done.
* Builder: the money is **visibly there and locked for them**. The homeowner cannot run off with it or
  quietly withhold it. Verified work gets paid immediately (cash flow is why builders collapse).
* Disputes: if the homeowner refuses to sign without reason, the builder opens a dispute. Then the
  inspector **plus an independent mediator** (e.g. Domestic Building Dispute Resolution Victoria) can
  release instead. Still no single party decides.

**Real facts to use (sourced):**
* **Porter Davis** (Victoria) collapsed in **March 2023**: about **1,700 homes** left unfinished in
  Victoria and Queensland, an estimated **800 families uninsured**, average losses of **$30,000 to
  $50,000** per family (Bendigo Advertiser / ACM, Apr 2023).
* **3,472 construction companies became insolvent in FY2025-26**, **24.5%** of all company
  insolvencies in Australia (ASIC figures, via QUT / The Conversation, 2026).
* Bathla (Sydney) collapse: may have taken about 1,000 buyer deposits for stalled homes (same source).
* Honest framing: Victoria already caps deposits and stage payments by law. The problem is that once
  paid, the money sits with the builder and disappears when they collapse.

---

## 3. How Tide fits (this is the 20% "Why TideCloak" criterion; make it visible in the UI)

| Need | Tide capability | In BuildSafe |
|---|---|---|
| Nobody can move money alone | **Threshold signing** by the Tide Fabric (key split across independent nodes, e.g. 14 of 20) | A stage **release instruction** is only valid with a Fabric signature. BuildSafe's server holds no signing key |
| Release only when rules are met | **Forseti policy** (programmable rules checked by every node: ValidateData, ValidateApprovers, ValidateExecutor) | Policy per stage: claimed by the builder · signed by homeowner · signed by an inspector assigned to this project · stage evidence attached · amount ≤ stage amount · stages in order |
| No single admin changes the rules | **Quorum governance** (admin changes need multiple approvals) | Changing the contract (amounts, stages, inspector) needs homeowner + builder; replacing an inspector needs a quorum |
| Identity | **TideCloak login (BYOiD)** with roles | Roles: homeowner, builder, inspector, mediator, BuildSafe admin |

**The ordinary login test (show it on screen and in README):** with normal login, BuildSafe's admin
or anyone who breaches the server could release funds, and an escrow company has to be trusted. With
Tide, the release simply has no valid signature unless the rules are met.

---

## 4. App spec (single page, role switcher)

Stack: **Vite + React + TypeScript + Tailwind**, or plain HTML/CSS/JS if faster for you. No backend
needed: all state in memory with a seeded demo project, plus `localStorage` (wrapped in try/catch) so
a refresh does not lose the demo. Must run with `npm install && npm run dev` on Windows.

### Seeded demo project
* Project: **"14 Banksia Crescent, Tarneit VIC"**, single storey, contract **$420,000**.
* People: homeowner **Priya Sharma**, builder **Coastline Homes Pty Ltd** (contact: Dan), inspector
  **Mei Lin, registered building surveyor** (assigned), mediator **DBDRV** (dispute only),
  **BuildSafe admin** (staff).
* Stages (percentages follow typical Victorian contract stages; label them "example schedule"):

| Stage | % | Amount | Initial state |
|---|---|---|---|
| Deposit | 5% | $21,000 | Released |
| Base (slab) | 15% | $63,000 | **Ready to claim** |
| Frame | 20% | $84,000 | Locked |
| Lock-up | 25% | $105,000 | Locked |
| Fixing | 20% | $84,000 | Locked |
| Completion | 15% | $63,000 | Locked |

### Layout
* **Top bar:** BuildSafe wordmark, project name, and a **role switcher** (segmented control):
  Homeowner · Builder · Inspector · BuildSafe admin · Attacker. Switching role changes which buttons
  are available; the vault data is the same.
* **Left/main:** the **Stage vault**: a vertical "build timeline" with the 6 stages as cards showing
  amount, status chip (Locked / Ready to claim / Claimed / Inspector signed / Owner signed /
  Released / Disputed), evidence thumbnails (placeholder site photos as simple SVG illustrations or
  gradients, no external images), and the signatures collected (✓ owner, ✓ inspector).
* **Top summary:** "Held in vault $399,000 · Released $21,000 · Next: Base (slab) $63,000".
* **Right panel: "Tide network check"** (always visible, key for video). For every release or action
  attempt, animate a check list row by row, green ✓ or red ✗, ending with
  "**14 of 20 nodes signed ✓ Release instruction valid**" or "**0 of 20 nodes signed ✗ Refused**",
  plus the policy rule that failed in plain words.
* **Bottom: activity log** (who did what, when, signed or refused).

### Flows
1. **Builder** claims "Base (slab)": uploads evidence (pick a placeholder photo), clicks "Claim $63,000".
2. **Inspector** opens the claim, ticks a short checklist (slab poured, footings to plan, termite
   barrier), clicks "Sign off stage".
3. **Homeowner** sees "Inspector signed ✓", clicks "Approve & release".
4. Tide panel runs the checks → all ✓ → "14 of 20 nodes signed" → stage turns **Released**, money moves
   from "Held" to "Released" with a satisfying number animation, log entry.

### The 3 demo moments (P0, must be perfect)
1. **Happy path:** the flow above.
2. **Builder claims too early:** builder tries to claim **"Lock-up ($105,000)"** while only the slab is
   done → Tide panel: ✗ "Stages must be completed in order" + ✗ "No inspector sign off" → refused.
3. **Insider tries to move money:** switch to **BuildSafe admin**, click "Force release Frame
   ($84,000)" → ✗ "Release needs homeowner + inspector signatures" → "0 of 20 nodes signed. BuildSafe
   cannot move your money." Then **Attacker** role: "Change payout bank account" → ✗ needs homeowner +
   builder approval (mention payment redirection scams).

### P1 (after P0 works)
* **Dispute flow:** homeowner doesn't sign for 10 days (fast-forward button) → builder clicks "Open
  dispute" → inspector + mediator sign → released. Shows two sided fairness.
* **Builder view banner:** "Funds secured for you: $399,000 locked in vault" (two sided trust).
* **"How it works" drawer**: 3 steps with the Tide explanation, used as the README screenshot.
* **Reset demo** button (top right) to restart the recording quickly.

---

## 5. Simulated Tide: the `TideGate` module

Put all Tide logic in `src/tide/tideGate.ts` so it is obvious where TideCloak plugs in:

```ts
export type Check = { label: string; ok: boolean };
export type Verdict = { ok: boolean; checks: Check[]; nodesSigned: number; threshold: 14; total: 20; reason?: string };
export function evaluateRelease(project, stageId, actor): Verdict   // runs the Forseti-style policy
export function evaluateChange(project, change, actor): Verdict     // quorum for contract/bank/inspector changes
```

* Policy checks (each a row in the panel): actor role allowed · stage claimed by the builder ·
  previous stages released · evidence attached · inspector assigned to this project signed · homeowner
  signed (or mediator + inspector if disputed) · amount equals stage amount.
* Animate nodes signing (e.g. 20 small dots filling green up to 14) only when all checks pass.
* Header comment in `tideGate.ts` explaining: "In production this policy runs as a Forseti contract on
  the Tide Fabric; each ORK validates it and contributes a partial signature (threshold 14 of 20).
  BuildSafe's server never holds a signing key."
* README states clearly: **"Tide is simulated in this prototype (allowed by the organisers)"** and
  shows the mapping table from section 3.

**Optional, only if P0 and P1 are done before 8:00 AM:** add real TideCloak login using the Tide MCP
(`.mcp.json` with `cmd /c npx -y @tideorg/mcp`) and the TideCloak quickstart (Docker + Next.js
template). If it is not working by 8:30, drop it. Never break the working demo for this.

---

## 6. Design direction (do not ship a generic dashboard)

* **Concept: "site board meets bank vault".** Calm, trustworthy, Australian residential building
  site. Not a crypto app, not neon.
* **Palette:** warm concrete off-white background (#F3F0EA family) and a deep ink navy (#14213D family)
  for text; **safety orange** accent (#F26B1D family) used sparingly for the next action; **eucalyptus
  green** for released / signed ✓; **brick red** for refused ✗. Define tokens once in CSS variables.
* **Type:** a sturdy display face for headings (e.g. "Archivo" 700/800 from Google Fonts), a clean body
  face (e.g. "Public Sans"), **monospaced digits for money** (e.g. "IBM Plex Mono" or
  `font-variant-numeric: tabular-nums`). Big, confident money figures.
* **Signature visual:** the stage timeline drawn like a building going up: small line icons per stage
  (slab, frame, roof, door, finished house) that fill in as stages are released. A thin hazard stripe
  only on the "Refused" state.
* **Motion:** number count-up on release, check rows ticking in the Tide panel, a short shake on
  refusal. Respect `prefers-reduced-motion`.
* Must look great at **1920x1080** for screen recording, browser zoom 100%. Generous spacing, rounded
  but not bubbly (8 to 12px radius), real hierarchy, no emoji as icons (use inline SVG).

---

## 7. Timeline (Melbourne time)

| Time | Goal |
|---|---|
| 6:20 to 6:40 | Scaffold, tokens, seeded data, layout skeleton |
| 6:40 to 7:40 | P0: happy path + 2 refusal demos + Tide panel animation |
| 7:40 to 8:15 | P1: dispute flow, builder banner, reset, polish |
| **8:15** | **Feature freeze.** Team records the app demo |
| 8:15 to 9:00 | README, final fixes only, `git push`, repo **public** |
| **9:15 to 9:30** | **Submit Google Form** |

---

## 8. README.md (paste at the top; keep the overview under 300 words)

```markdown
# BuildSafe

**BuildSafe holds your home build budget in a vault nobody can open alone: each stage is paid only when you and an independent inspector both sign off.**

## Project overview

**Vision & originality.** Building payments without trusting anyone with the money. Today a homeowner pays a builder, or trusts an escrow company, a bank or an app admin to hold it. BuildSafe replaces that custodian with rules: stage money moves only when the right people sign.

**Trust constraint insight.** When a builder collapses, money already paid is gone. Porter Davis left about 1,700 Victorian and Queensland homes unfinished in 2023, with an estimated 800 families uninsured and $30,000 to $50,000 lost on average. 3,472 construction companies went insolvent in FY2025-26. Any escrow that a single party controls just moves the risk to that party.

**Value & impact.** Homeowners can hire small or new builders with confidence. Builders see their money is secured and get paid the moment work is verified, which protects their cash flow. Disputes go to the inspector plus an independent mediator, never one side.

**Why TideCloak matters.** A stage release is only valid with a threshold signature from the Tide network, issued when a policy is met: stage claimed, inspector assigned to this project signed, homeowner signed, stages in order. BuildSafe's server holds no key, so neither our admins nor a hacker can release funds or change payout accounts. With ordinary login and backend permissions, they could.

**Prototype & storytelling.** Watch the slab stage released after both sign-offs; the builder claiming lock-up early, refused; and a BuildSafe admin trying to force a payment: "0 of 20 nodes signed".
```

Then `## Setup` (`npm install`, `npm run dev`), `## Simulated Tide` (the mapping table from section 3
and where `tideGate.ts` would call TideCloak), `## Sources` (Porter Davis article, ASIC/QUT article).
Check the overview word count after edits.

---

## 9. Working rules for you (Claude Code)

* Build P0 first; do not start P1 until all 3 demo moments work.
* After each feature: run it, fix errors, commit with a short message.
* Keep `npm run dev` working at all times. On Windows use PowerShell friendly commands.
* Ask the user before installing global tools, touching Docker, or deleting files.
* Copy text in the UI: short, plain English, from the user's side ("Approve & release $63,000").
* At the end, run a production build (`npm run build`) to be sure it compiles.
