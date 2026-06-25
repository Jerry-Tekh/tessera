import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiGet } from '../lib/api';
import { heroFor } from '../lib/images';

export default function Browse() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['events', 1],
    queryFn: () => apiGet('/events?page=1&pageSize=20'),
  });
  if (isLoading) return <p>Loading events…</p>;
  if (error) return <p>Could not load events.</p>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
      {data.map((ev) => (
        <Link key={ev.id} to={`/events/${ev.id}`} style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
          <img src={heroFor(ev.id)} alt="" style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }} />
          <div style={{ padding: 14 }}>
            <h3 style={{ margin: 0, fontWeight: 800 }}>{ev.title}</h3>
            <p style={{ color: 'var(--muted)', fontSize: 13, margin: '6px 0 0' }}>
              {ev.starts_at ? new Date(ev.starts_at).toLocaleString() : 'Date TBA'}{ev.location ? ` · ${ev.location}` : ''}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
