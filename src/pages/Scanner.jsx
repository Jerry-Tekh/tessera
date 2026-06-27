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
    <div style={{ maxWidth: 460 }}>
      <h1>Gate scanner</h1>
      {result && (
        <div role="status" style={{ padding: 16, marginBottom: 16, fontWeight: 800, color: result.ok ? '#052e16' : '#fff', background: result.ok ? '#22c55e' : '#dc2626' }}>
          {result.message}
        </div>
      )}
      <form onSubmit={(e) => { e.preventDefault(); doScan(token); }} style={{ display: 'grid', gap: 12 }}>
        <label>Event ID<br /><input value={eventId} onChange={(e) => setEventId(e.target.value)} required /></label>
        <label>Ticket code<br /><input value={token} onChange={(e) => setToken(e.target.value)} required autoFocus /></label>
        <button className="primary" type="submit" disabled={busy || !eventId || !token}>Scan</button>
      </form>

      <button type="button" onClick={() => setCamera((c) => !c)} disabled={!eventId} style={{ marginTop: 12 }}>
        {camera ? 'Stop camera' : 'Use camera'}
      </button>
      {camera && <div style={{ marginTop: 12 }}><CameraScanner onDecode={onDecode} onError={onCamError} /></div>}
    </div>
  );
}
