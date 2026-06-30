// ============================================================
//  NewsletterForm — email capture. POSTs to /api/newsletter and
//  shows an inline status message. Progressive: works as a normal
//  form, enhanced with async submit + validation.
// ============================================================
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Spinner from './Spinner';

type Status = 'idle' | 'loading' | 'ok' | 'err';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      setStatus('err');
      setMessage('Please enter a valid email address.');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus('ok');
        setMessage(data.message ?? "You're in — watch your inbox for the next drop.");
        setEmail('');
      } else {
        setStatus('err');
        setMessage(data.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('err');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <form className="nl-form" onSubmit={submit} noValidate>
      <div className="nl-form__row">
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="nl-form__input"
          aria-label="Email address"
          required
        />
        <button type="submit" className="nl-form__btn" disabled={status === 'loading'}>
          {status === 'loading' ? (
            <Spinner size={18} />
          ) : (
            <>
              Subscribe
              <ArrowRight size={16} strokeWidth={2} />
            </>
          )}
        </button>
      </div>
      <p
        className={`nl-form__msg ${status === 'ok' ? 'is-ok' : status === 'err' ? 'is-err' : ''}`}
        role="status"
        aria-live="polite"
      >
        {message}
      </p>
      <p className="nl-form__fine">No spam. Unsubscribe anytime. We respect your inbox.</p>
    </form>
  );
}
