import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listAllEvents, createEvent } from '../lib/organizerApi';
import { messageFor } from '../lib/errors';

export default function OrganizerDashboard() {
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('draft');
  const [err, setErr] = useState(null);

  const { data: events, isLoading } = useQuery({ queryKey: ['admin-events'], queryFn: listAllEvents });
  const create = useMutation({
    mutationFn: () => createEvent({ title, status }),
    onSuccess: () => { setTitle(''); qc.invalidateQueries({ queryKey: ['admin-events'] }); },
    onError: (e) => setErr(messageFor(e)),
  });

  return (
    <div className="reveal">
      <span className="eyebrow">Organizer</span>
      <h1 style={{ marginTop: 12 }}>Dashboard</h1>

      <form onSubmit={(e) => { e.preventDefault(); setErr(null); create.mutate(); }}
        style={{ display: 'flex', gap: 12, alignItems: 'end', flexWrap: 'wrap', margin: '24px 0', padding: 20, border: '1px solid var(--border)', background: 'var(--surface)' }}>
        <label style={{ flex: '1 1 240px' }}>Event title<input value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
        <label>Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">draft</option>
            <option value="published">published</option>
          </select>
        </label>
        <button className="primary" type="submit" disabled={!title || create.isPending}>Create event</button>
      </form>
      {err && <p style={{ color: 'var(--danger)' }}>{err}</p>}

      <h2 style={{ marginTop: 8 }}>All events</h2>
      <hr className="rule" style={{ margin: '14px 0' }} />
      {isLoading ? <p className="muted">Loading events…</p> : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {(events ?? []).map((ev) => (
            <li key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 2px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>{ev.title}</span>
                <span className="badge">{ev.status}</span>
              </span>
              <Link to={`/organizer/events/${ev.id}`} className="eyebrow" style={{ color: 'var(--accent)' }}>Manage →</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
