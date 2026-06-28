import { useState, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiGet } from '../lib/api';
import { heroFor } from '../lib/images';

const PAGE = 8;
const fmtDate = (s) => (s ? new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBA');

export default function Browse() {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('date');

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['events'],
    queryFn: ({ pageParam }) => apiGet(`/events?page=${pageParam}&pageSize=${PAGE}`),
    initialPageParam: 1,
    getNextPageParam: (last, all) => (last.length === PAGE ? all.length + 1 : undefined),
  });

  const events = useMemo(() => {
    const all = (data?.pages ?? []).flat();
    const needle = q.trim().toLowerCase();
    const filtered = needle
      ? all.filter((e) => `${e.title} ${e.location ?? ''}`.toLowerCase().includes(needle))
      : all;
    return [...filtered].sort((a, b) => {
      if (sort === 'name') return a.title.localeCompare(b.title);
      return (a.starts_at || '9999').localeCompare(b.starts_at || '9999'); // date asc, undated last
    });
  }, [data, q, sort]);

  return (
    <div>
      <header className="reveal" style={{ marginBottom: 34, maxWidth: 760 }}>
        <span className="eyebrow">Now on sale</span>
        <h1 style={{ marginTop: 14 }}>Nights worth<br />remembering.</h1>
        <p className="muted" style={{ fontSize: '1.05rem', maxWidth: 520 }}>
          Concerts, festivals and one-off happenings. Secure seats in seconds — guest checkout, instant QR tickets.
        </p>
      </header>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 26 }}>
        <input
          aria-label="Search events"
          placeholder="Search events or venues…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: '1 1 280px', maxWidth: 420 }}
        />
        <select aria-label="Sort events" value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: 'auto' }}>
          <option value="date">Soonest first</option>
          <option value="name">A–Z</option>
        </select>
      </div>

      {isLoading && <p className="muted">Loading events…</p>}
      {error && <p className="muted">Could not load events.</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 22 }}>
        {events.map((ev, i) => (
          <Link
            key={ev.id}
            to={`/events/${ev.id}`}
            className="reveal"
            style={{ display: 'block', position: 'relative', aspectRatio: '4 / 5', overflow: 'hidden', border: '1px solid var(--border)', animationDelay: `${(i % PAGE) * 70}ms` }}
          >
            <img src={heroFor(ev.id)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,11,0.92) 8%, rgba(10,10,11,0.25) 45%, rgba(10,10,11,0.05) 100%)' }} />
            <div style={{ position: 'absolute', left: 18, right: 18, bottom: 18 }}>
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--accent)', letterSpacing: '0.08em' }}>
                {fmtDate(ev.starts_at)}{ev.location ? `  ·  ${ev.location}` : ''}
              </span>
              <h2 style={{ margin: '8px 0 0', fontSize: '1.7rem', lineHeight: 1.05 }}>{ev.title}</h2>
              <span style={{ display: 'inline-block', marginTop: 14, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text)' }}>
                Get tickets →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {!isLoading && !error && events.length === 0 && (
        <p className="muted">{q ? `No events match “${q}”.` : 'No published events yet — check back soon.'}</p>
      )}

      {hasNextPage && !q && (
        <div style={{ textAlign: 'center', marginTop: 34 }}>
          <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading…' : 'Load more events'}
          </button>
        </div>
      )}
    </div>
  );
}
