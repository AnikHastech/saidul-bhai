// ============================================================
//  Countdown — flash-deal timer. Counts down to an ISO `endsAt`.
//  The initial render is seeded from a server-provided `startMs`
//  so SSR and the first client paint match (no hydration mismatch);
//  it then ticks each second against the live clock.
// ============================================================
import { useEffect, useState } from 'react';

interface Props {
  endsAt: string; // ISO timestamp
  startMs: number; // server render time (ms) — keeps SSR/CSR seed identical
  label?: string;
}

function breakdown(msLeft: number) {
  const total = Math.floor(Math.max(0, msLeft) / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    mins: Math.floor((total % 3600) / 60),
    secs: total % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

export default function Countdown({ endsAt, startMs, label = 'Ends in' }: Props) {
  const end = new Date(endsAt).getTime();
  const [t, setT] = useState(() => breakdown(end - startMs));

  useEffect(() => {
    const tick = () => setT(breakdown(end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [end]);

  const units: Array<[number, string]> = [
    [t.days, 'Days'],
    [t.hours, 'Hrs'],
    [t.mins, 'Min'],
    [t.secs, 'Sec'],
  ];

  return (
    <div
      className="countdown"
      role="timer"
      aria-label={`${label} ${t.days}d ${t.hours}h ${t.mins}m ${t.secs}s`}
    >
      <span className="countdown__lbl">{label}</span>
      <div className="countdown__timer">
        {units.map(([value, name], i) => (
          <Unit key={name} value={value} name={name} showColon={i < units.length - 1} />
        ))}
      </div>
    </div>
  );
}

function Unit({ value, name, showColon }: { value: number; name: string; showColon: boolean }) {
  return (
    <>
      <span className="countdown__unit">
        <span className="countdown__num">{pad(value)}</span>
        <span className="countdown__lbl2">{name}</span>
      </span>
      {showColon && <span className="countdown__colon">:</span>}
    </>
  );
}
