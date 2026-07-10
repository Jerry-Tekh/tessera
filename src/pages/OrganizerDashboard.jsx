import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listAllEvents, createEvent } from '../lib/organizerApi';
import { messageFor } from '../lib/errors';
import { EVENT_STATUSES, fromDateTimeLocal, optionalText } from '../lib/eventForms';

export default function OrganizerDashboard() {
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [status, setStatus] = useState('draft');
  const [err, setErr] = useState(null);

  const { data: events, isLoading } = useQuery({ queryKey: ['admin-events'], queryFn: listAllEvents });
  const create = useMutation({
    mutationFn: () => createEvent({
      title,
      description: optionalText(description),
      location: optionalText(location),
      startsAt: fromDateTimeLocal(startsAt),
      status,
    }),
    onSuccess: () => {
      setTitle('');
      setDescription('');
      setLocation('');
      setStartsAt('');
      setStatus('draft');
      qc.invalidateQueries({ queryKey: ['admin-events'] });
    },
    onError: (e) => setErr(messageFor(e)),
  });

  return (
    <div className="page reveal">
      <header className="page-hero">
        <span className="eyebrow">Organizer</span>
        <h1>Dashboard</h1>
        <p>Create events, manage inventory, and move quickly into event operations.</p>
      </header>

      <div className="grid-3">
        <div className="section">
          <span className="eyebrow">Events</span>
          <h2 style={{ marginTop: 8 }}>{events?.length ?? 0}</h2>
          <p className="muted">Total managed</p>
        </div>
        <div className="section">
          <span className="eyebrow">Published</span>
          <h2 style={{ marginTop: 8 }}>{(events ?? []).filter((event) => event.status === 'published').length}</h2>
          <p className="muted">Visible to buyers</p>
        </div>
        <div className="section">
          <span className="eyebrow">Drafts</span>
          <h2 style={{ marginTop: 8 }}>{(events ?? []).filter((event) => event.status === 'draft').length}</h2>
          <p className="muted">Awaiting publish</p>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setErr(null); create.mutate(); }}
        className="section form-grid">
        <div style={{ gridColumn: '1 / -1' }}>
          <span className="eyebrow">New event</span>
          <h2 style={{ marginTop: 6 }}>Create event</h2>
        </div>
        <label style={{ flex: '1 1 240px' }}>Event title<input value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
        <label>Location<input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Venue or city" /></label>
        <label>Starts at<input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} /></label>
        <label>Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {EVENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label style={{ gridColumn: '1 / -1' }}>Description<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></label>
        <button className="primary" type="submit" disabled={!title || create.isPending}>{create.isPending ? 'Creating…' : 'Create event'}</button>
      </form>
      {err && <p className="alert danger">{err}</p>}

      <section className="section">
      <div className="between">
        <div>
          <span className="eyebrow">Inventory</span>
          <h2 style={{ marginTop: 6 }}>All events</h2>
        </div>
      </div>
      {isLoading ? <p className="muted">Loading events…</p> : (
        <ul className="data-list" style={{ marginTop: 16 }}>
          {(events ?? []).map((ev) => (
            <li key={ev.id} className="data-row">
              <span>
                <strong>{ev.title}</strong>
                <span className={`badge${ev.status === 'published' ? ' ok' : ''}`} style={{ marginLeft: 10 }}>{ev.status}</span>
              </span>
              <Link to={`/organizer/events/${ev.id}`} className="btn ghost">Manage</Link>
            </li>
          ))}
        </ul>
      )}
      </section>
    </div>
  );
}
