import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listScannableEvents, scanTicket } from '../lib/scanApi';
import { messageFor } from '../lib/errors';
import CameraScanner from '../components/CameraScanner.jsx';

export default function Scanner() {
  const [eventId, setEventId] = useState('');
  const [token, setToken] = useState('');
  const [result, setResult] = useState(null); // { ok: boolean, message: string }
  const [busy, setBusy] = useState(false);
  const [camera, setCamera] = useState(false);
  const events = useQuery({
    queryKey: ['scanner-events'],
    queryFn: listScannableEvents,
  });

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
    <div className="scanner-shell page">
      <header className="page-hero" style={{ textAlign: 'center', margin: '0 auto' }}>
        <span className="eyebrow" style={{ justifyContent: 'center' }}>Event-day gate</span>
        <h1>Scanner</h1>
      </header>

      {result && (
        <div role="status" className={`scanner-result reveal ${result.ok ? 'ok' : 'danger'}`}>
          {result.message}
        </div>
      )}

      <form className="panel stack" onSubmit={(e) => { e.preventDefault(); doScan(token); }} style={{ padding: 22 }}>
        <label>Event
          <select value={eventId} onChange={(e) => setEventId(e.target.value)} disabled={events.isLoading}>
            <option value="">Select an event</option>
            {(events.data ?? []).map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.title}{ev.location ? ` — ${ev.location}` : ''}</option>
            ))}
          </select>
        </label>
        {events.data?.length === 0 && (
          <p className="muted" style={{ marginTop: -8 }}>
            No assigned events yet. Ask an organizer to add this staff account to an event.
          </p>
        )}
        <label>Event ID<input value={eventId} onChange={(e) => setEventId(e.target.value)} required placeholder="event uuid" /></label>
        <label>Ticket code<input value={token} onChange={(e) => setToken(e.target.value)} required autoFocus placeholder="paste or scan" /></label>
        <button className="primary" type="submit" disabled={busy || !eventId || !token}>Scan</button>
      </form>

      <button type="button" className="ghost" onClick={() => setCamera((c) => !c)} disabled={!eventId} style={{ width: '100%' }}>
        {camera ? 'Stop camera' : 'Use camera'}
      </button>
      {camera && <div className="camera-frame"><CameraScanner onDecode={onDecode} onError={onCamError} /></div>}
    </div>
  );
}
