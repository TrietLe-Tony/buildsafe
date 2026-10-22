import { IconCheck, IconNodes, IconShield, IconX } from './Icons';

export function HowItWorks({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div className={`drawer-wrap ${open ? 'open' : ''}`} aria-hidden={!open}>
      <div className="drawer-scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label="How BuildSafe works">
        <header className="drawer-head">
          <h2>How BuildSafe works</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            Close
          </button>
        </header>

        <ol className="steps">
          <li>
            <span className="step-num">1</span>
            <div>
              <h3>The budget goes into a keyless vault</h3>
              <p>
                Your $420,000 is locked stage by stage. No one holds a key that moves it alone: not the builder, not the bank,
                not BuildSafe.
              </p>
            </div>
          </li>
          <li>
            <span className="step-num">2</span>
            <div>
              <h3>Each stage needs two signatures</h3>
              <p>
                The builder claims a stage with site photos. The independent inspector signs off the work, then you approve. In a
                dispute, the inspector and a DBDRV mediator decide.
              </p>
            </div>
          </li>
          <li>
            <span className="step-num">3</span>
            <div>
              <h3>The Tide network signs, or nothing moves</h3>
              <p>
                20 independent Tide nodes each check the policy. When 14 agree, they produce the only valid release signature.
                If a rule fails, no signature exists.
              </p>
            </div>
          </li>
        </ol>

        <div className="compare">
          <div className="compare-col">
            <h4>
              <IconX size={15} /> Ordinary login + backend permissions
            </h4>
            <ul>
              <li>An admin with the right role can release funds</li>
              <li>A hacker who breaches the server can swap the payout account</li>
              <li>You must trust an escrow company to behave</li>
            </ul>
          </div>
          <div className="compare-col good">
            <h4>
              <IconCheck size={15} /> BuildSafe with TideCloak
            </h4>
            <ul>
              <li>A release is only valid with a 14 of 20 Tide signature</li>
              <li>Signatures only exist when the policy is met</li>
              <li>BuildSafe’s server holds no key, so there is nothing to steal</li>
            </ul>
          </div>
        </div>

        <p className="drawer-foot">
          <IconNodes size={15} /> <IconShield size={15} /> Tide is simulated in this prototype (allowed by the organisers). All policy
          logic lives in <span className="mono">src/tide/tideGate.ts</span>, where TideCloak plugs in.
        </p>
      </aside>
    </div>
  );
}
