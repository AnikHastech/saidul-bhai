// ============================================================
//  FlashCountdown — exact flash-deals countdown (Ends in HH:MM:SS).
//  Seeded from a server-provided startMs so SSR and first client
//  paint match; then ticks each second against the live clock.
// ============================================================
import { useEffect, useState } from 'react';

interface Props {
  endsAt: string;
  startMs: number;
}

function parts(msLeft: number) {
  const total = Math.floor(Math.max(0, msLeft) / 1000);
  return {
    h: Math.floor(total / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}
const pad = (n: number) => String(n).padStart(2, '0');

export default function FlashCountdown({ endsAt, startMs }: Props) {
  const end = new Date(endsAt).getTime();
  const [t, setT] = useState(() => parts(end - startMs));

  useEffect(() => {
    const tick = () => setT(parts(end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [end]);

  return (
    <div className="flash-countdown">
      <span className="lbl">Ends in</span>
      <div className="timer">
        <div className="unit">
          <div className="num">{pad(t.h)}</div>
          <div className="lbl2">Hours</div>
        </div>
        <span className="colon">:</span>
        <div className="unit">
          <div className="num">{pad(t.m)}</div>
          <div className="lbl2">Mins</div>
        </div>
        <span className="colon">:</span>
        <div className="unit">
          <div className="num">{pad(t.s)}</div>
          <div className="lbl2">Secs</div>
        </div>
      </div>
    </div>
  );
}
