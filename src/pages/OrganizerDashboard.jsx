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
    <div>
      <h1>Organizer dashboard</h1>

      <form onSubmit={(e) => { e.preventDefault(); setErr(null); create.mutate(); }}
        style={{ display: 'flex', gap: 10, alignItems: 'end', margin: '16px 0', flexWrap: 'wrap' }}>
        <label>Event title<br /><input value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
        <label>Status<br />
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: 8, background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}>
            <option value="draft">draft</option>
            <option value="published">published</option>
          </select>
        </label>
        <button className="primary" type="submit" disabled={!title || create.isPending}>Create event</button>
      </form>
      {err && <p style={{ color: '#f87171' }}>{err}</p>}

      {isLoading ? <p>Loading events…</p> : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {(events ?? []).map((ev) => (
            <li key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid var(--border)', padding: 12, marginBottom: 8 }}>
              <span>{ev.title} <small style={{ color: 'var(--muted)' }}>· {ev.status}</small></span>
              <Link to={`/organizer/events/${ev.id}`} style={{ color: 'var(--accent)' }}>Manage →</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
