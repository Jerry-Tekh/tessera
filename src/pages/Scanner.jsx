import { useState, useCallback } from 'react';
import { scanTicket } from '../lib/scanApi';
import { messageFor } from '../lib/errors';
import CameraScanner from '../components/CameraScanner.jsx';

export default function Scanner() {
  const [eventId, setEventId] = useState('');
  const [token, setToken] = useState('');
  const [result, setResult] = useState(null); // { ok: boolean, message: string }
  const [busy, setBusy] = useState(false);
  const [camera, setCamera] = useState(false);

  const doScan = useCallback(async (tok) => {
    if (!eventId || !tok) return;
    setBusy(true);
    try {
      await scanTicket(eventId, tok);
      setResult({ ok: true, message: 'Admitted ✓' });
    } catch (ex) {
      setResult({ ok: false, message: messageFor(ex) });
    } finally {
      setBusy(false);
      setToken('');
    }
  }, [eventId]);

  const onDecode = useCallback((text) => { doScan(text); }, [doScan]);
  const onCamError = useCallback(() => {
    setResult({ ok: false, message: 'Camera unavailable — enter the code manually.' });
    setCamera(false);
  }, []);

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <span className="eyebrow">Event-day gate</span>
      <h1 style={{ marginTop: 12 }}>Scanner</h1>

      {result && (
        <div role="status" className="reveal" style={{
          padding: '26px 20px', margin: '18px 0', textAlign: 'center',
          fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 600,
          color: result.ok ? 'var(--accent-ink)' : '#fff',
          background: result.ok ? 'var(--accent)' : 'var(--danger)',
          border: `1px solid ${result.ok ? 'var(--accent)' : 'var(--danger)'}`,
        }}>
          {result.message}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); doScan(token); }} style={{ display: 'grid', gap: 16, marginTop: 8 }}>
        <label>Event ID<input value={eventId} onChange={(e) => setEventId(e.target.value)} required placeholder="event uuid" /></label>
        <label>Ticket code<input value={token} onChange={(e) => setToken(e.target.value)} required autoFocus placeholder="paste or scan" /></label>
        <button className="primary" type="submit" disabled={busy || !eventId || !token}>Scan</button>
      </form>

      <button type="button" onClick={() => setCamera((c) => !c)} disabled={!eventId} style={{ marginTop: 14, width: '100%' }}>
        {camera ? 'Stop camera' : 'Use camera'}
      </button>
      {camera && <div style={{ marginTop: 14 }}><CameraScanner onDecode={onDecode} onError={onCamError} /></div>}
    </div>
  );
}
