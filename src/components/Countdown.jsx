import { useEffect, useRef, useState } from 'react';

export default function Countdown({ deadline, onExpire }) {
  const end = new Date(deadline).getTime();
  const [now, setNow] = useState(() => Date.now());
  const fired = useRef(false);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);
  const remaining = Math.max(0, end - now);
  useEffect(() => {
    if (remaining <= 0 && !fired.current) { fired.current = true; if (onExpire) onExpire(); }
  }, [remaining, onExpire]);
  const s = Math.ceil(remaining / 1000);
  return <span>{Math.floor(s / 60)}:{String(s % 60).padStart(2, '0')}</span>;
}
