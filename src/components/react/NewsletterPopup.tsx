// ============================================================
//  NewsletterPopup — "Join the Inner Circle" two-panel modal
//  (port of the magazine HTML template). Shows once on exit-intent
//  (desktop) or after a delay, remembers dismissal for 30 days,
//  closes on Esc / overlay / submit. Submits to /api/newsletter.
// ============================================================
import { useEffect, useState } from 'react';
import { useFocusTrap } from './useFocusTrap';

const KEY = 'asmaz:nl-dismissed';
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
const DELAY = 18000;

type Status = 'idle' | 'loading' | 'ok' | 'err';

export default function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const dialogRef = useFocusTrap<HTMLDivElement>(open);

  useEffect(() => {
    // Respect a recent dismissal.
    try {
      const ts = Number(localStorage.getItem(KEY) || 0);
      if (ts && Date.now() - ts < THIRTY_DAYS) return;
    } catch {
      /* ignore */
    }

    let shown = false;
    const show = () => {
      if (shown) return;
      shown = true;
      setOpen(true);
      cleanup();
    };
    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0) show();
    };
    const timer = window.setTimeout(show, DELAY);
    document.addEventListener('mouseout', onMouseOut);
    function cleanup() {
      window.clearTimeout(timer);
      document.removeEventListener('mouseout', onMouseOut);
    }
    return cleanup;
  }, []);

  const dismiss = () => {
    setOpen(false);
    try {
      localStorage.setItem(KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  };

  // Esc to close + lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && dismiss();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      setStatus('err');
      setError('Please enter a valid email address.');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: value }),
      });
      if (res.ok) {
        setStatus('ok');
        setEmail('');
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus('err');
        setError(data.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('err');
      setError('Network error. Please try again.');
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="nl-pop-overlay" onClick={dismiss} />
      <div ref={dialogRef} className="nl-pop" role="dialog" aria-modal="true" aria-labelledby="nlPopupTitle">
        <div className="nl-box">
          <div className="nl-content">
            <button type="button" className="nl-close-btn" onClick={dismiss} aria-label="Close newsletter popup">
              &#10005;
            </button>

            {status === 'ok' ? (
              <div className="nl-success">
                <h2 className="nl-success-head" id="nlPopupTitle">You're <em>in.</em></h2>
                <p className="nl-success-sub">Check your inbox — your welcome code is on the way.</p>
              </div>
            ) : (
              <>
                <span className="nl-eyebrow">Exclusive Offer</span>
                <h2 className="nl-headline" id="nlPopupTitle">
                  Join the<br /><em>Inner Circle.</em>
                </h2>
                <p className="nl-sub">
                  Get early access to drops, member-only deals, and tech editorial — straight to your inbox. No spam, ever.
                </p>
                <form onSubmit={submit} noValidate>
                  <div className="nl-form-row">
                    <input
                      type="email"
                      className="nl-email-input"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      aria-label="Email address"
                      required
                    />
                    <button type="submit" className="nl-submit" disabled={status === 'loading'}>
                      {status === 'loading' ? 'Joining…' : 'Subscribe'}
                    </button>
                  </div>
                  {status === 'err' && <p className="nl-error" role="alert">{error}</p>}
                  <button type="button" className="nl-no-thanks" onClick={dismiss}>
                    No thanks, I don't want deals
                  </button>
                  <p className="nl-privacy">By subscribing you agree to our Privacy Policy. Unsubscribe anytime.</p>
                </form>
              </>
            )}
          </div>

          <div className="nl-visual" aria-hidden="true">
            <div className="nl-visual-bg" />
            <div className="nl-visual-badge">Members Only</div>
            <div className="nl-visual-dots" />
            <div className="nl-visual-offer">
              <span className="nl-offer-pct">10%</span>
              <span className="nl-offer-label">Off Your First Order</span>
              <span className="nl-offer-terms">Code sent instantly after sign-up</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
