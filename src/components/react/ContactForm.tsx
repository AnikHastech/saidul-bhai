// ============================================================
//  ContactForm — name / email / subject / message. POSTs to
//  /api/contact and shows an inline status. Client-validated.
// ============================================================
import { useState } from 'react';
import { Send } from 'lucide-react';
import Spinner from './Spinner';

type Status = 'idle' | 'loading' | 'ok' | 'err';
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !EMAIL_RE.test(form.email.trim()) || form.message.trim().length < 10) {
      setStatus('err');
      setMessage('Please add your name, a valid email and a message (10+ characters).');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus('ok');
        setMessage(data.message ?? "Thanks — we'll get back to you within one business day.");
        setForm({ name: '', email: '', subject: '', message: '' });
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
    <form className="cform" onSubmit={submit} noValidate>
      <div className="cform__row">
        <div className="cform__field">
          <label className="cform__label" htmlFor="cf-name">Name</label>
          <input id="cf-name" className="cform__input" value={form.name} onChange={set('name')} required />
        </div>
        <div className="cform__field">
          <label className="cform__label" htmlFor="cf-email">Email</label>
          <input id="cf-email" type="email" className="cform__input" value={form.email} onChange={set('email')} required />
        </div>
      </div>
      <div className="cform__field">
        <label className="cform__label" htmlFor="cf-subject">Subject</label>
        <input id="cf-subject" className="cform__input" value={form.subject} onChange={set('subject')} placeholder="Order, product question, partnership…" />
      </div>
      <div className="cform__field">
        <label className="cform__label" htmlFor="cf-message">Message</label>
        <textarea id="cf-message" className="cform__textarea" value={form.message} onChange={set('message')} required />
      </div>
      <button type="submit" className="cform__btn" disabled={status === 'loading'}>
        {status === 'loading' ? <Spinner size={18} /> : (<>Send message <Send size={16} strokeWidth={2} /></>)}
      </button>
      <p className={`cform__msg ${status === 'ok' ? 'is-ok' : status === 'err' ? 'is-err' : ''}`} role="status" aria-live="polite">
        {message}
      </p>
    </form>
  );
}
