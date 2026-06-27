import { useState } from 'react';
import { scanTicket } from '../lib/scanApi';
import { messageFor } from '../lib/errors';

export default function Scanner() {
  const [eventId, setEventId] = useState('');
  const [token, setToken] = useState('');
  const [result, setResult] = useState(null); // { ok: boolean, message: string }
  const [busy, setBusy] = useState(false);

  async function onScan(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await scanTicket(eventId, token);
      setResult({ ok: true, message: 'Admitted ✓' });
    } catch (ex) {
      setResult({ ok: false, message: messageFor(ex) });
    } finally {
      setBusy(false);
      setToken('');
    }
  }

  return (
    <div style={{ maxWidth: 460 }}>
      <h1>Gate scanner</h1>
      {result && (
        <div role="status" style={{ padding: 16, marginBottom: 16, fontWeight: 800, color: result.ok ? '#052e16' : '#fff', background: result.ok ? '#22c55e' : '#dc2626' }}>
          {result.message}
        </div>
      )}
      <form onSubmit={onScan} style={{ display: 'grid', gap: 12 }}>
        <label>Event ID<br /><input value={eventId} onChange={(e) => setEventId(e.target.value)} required /></label>
        <label>Ticket code<br /><input value={token} onChange={(e) => setToken(e.target.value)} required autoFocus /></label>
        <button className="primary" type="submit" disabled={busy || !eventId || !token}>Scan</button>
      </form>
    </div>
  );
}
