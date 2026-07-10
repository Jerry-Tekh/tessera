import { useEffect, useRef } from 'react';

// Live camera QR scanner. Lazy-loads html5-qrcode inside the effect so the heavy library
// (and camera APIs) only load when the scanner is actually mounted. Calls onDecode(text)
// for each successful read; onError(err) if the camera can't start.
export default function CameraScanner({ onDecode, onError }) {
  const ref = useRef(null);

  useEffect(() => {
    let scanner;
    let cancelled = false;
    (async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (cancelled || !ref.current) return;
        scanner = new Html5Qrcode(ref.current.id);
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: 250 },
          (text) => onDecode(text),
          () => {}, // per-frame decode failures are normal; ignore
        );
      } catch (e) {
        if (onError) onError(e);
      }
    })();
    return () => {
      cancelled = true;
      if (scanner) scanner.stop().then(() => scanner.clear()).catch(() => {});
    };
  }, [onDecode, onError]);

  return <div id="qr-camera" ref={ref} style={{ width: '100%', maxWidth: 420, overflow: 'hidden', borderRadius: 'var(--radius)' }} />;
}
