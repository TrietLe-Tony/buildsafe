import { money } from '../store';
import type { Project, Role, Stage } from '../types';
import { IconBank, IconUnlock } from './Icons';

type Props = {
  project: Project;
  role: Role;
  target?: Stage;
  onForceRelease: (s: Stage) => void;
  onChangeAmount: (s: Stage) => void;
  onChangePayout: () => void;
};

export const FAKE_ACCOUNT = { bsb: '082-991', acct: '5530 1187' };

/** Consoles for people who should NOT be able to move money: BuildSafe staff and an attacker. */
export function RoleConsole({ project, role, target, onForceRelease, onChangeAmount, onChangePayout }: Props) {
  if (role === 'admin') {
    return (
      <section className="console console-admin">
        <div className="console-head">
          <span className="console-tag">Staff console</span>
          <h3>Full admin access to every BuildSafe project</h3>
        </div>
        <div className="console-actions">
          {target && (
            <button className="btn btn-danger" onClick={() => onForceRelease(target)}>
              <IconUnlock size={16} /> Force release {target.name} ({money(target.amount)})
            </button>
          )}
          {target && (
            <button className="btn btn-ghost-light" onClick={() => onChangeAmount(target)}>
              Raise {target.name} to {money(target.amount + 36_000)}
            </button>
          )}
        </div>
      </section>
    );
  }

  if (role === 'attacker') {
    return (
      <section className="console console-attacker">
        <div className="console-head">
          <span className="console-tag">Breached session</span>
          <h3>You control BuildSafe’s server, database and an admin login</h3>
        </div>
        <div className="redirect">
          <div>
            <div className="eyebrow">Builder payout account</div>
            <div className="tabular">
              BSB {project.payoutAccount.bsb} · {project.payoutAccount.acct}
            </div>
          </div>
          <span className="arrow">→</span>
          <div>
            <div className="eyebrow">Your mule account</div>
            <div className="tabular">
              BSB {FAKE_ACCOUNT.bsb} · {FAKE_ACCOUNT.acct}
            </div>
          </div>
        </div>
        <div className="console-actions">
          <button className="btn btn-danger" onClick={onChangePayout}>
            <IconBank size={16} /> Change payout bank account
          </button>
          {target && (
            <button className="btn btn-ghost-light" onClick={() => onForceRelease(target)}>
              Release {target.name} from the database
            </button>
          )}
        </div>
        <p className="console-note">
          Payment redirection scams swap the bank details in a hacked email or account just before a big payment.
        </p>
      </section>
    );
  }

  return null;
}
