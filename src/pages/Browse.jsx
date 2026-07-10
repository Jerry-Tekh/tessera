import { useState, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiGet } from '../lib/api';
import { heroFor } from '../lib/images';

const PAGE = 8;
const fmtDate = (s) => (s ? new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Date TBA');
const fmtFullDate = (s) => (s ? new Date(s).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBA');

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
    <div className="page">
      <header className="page-hero reveal">
        <span className="eyebrow">Now on sale</span>
        <h1>Find your next live moment.</h1>
        <p>
          Concerts, festivals and one-off happenings. Secure seats in seconds — guest checkout, instant QR tickets.
        </p>
      </header>

      <section className="panel" style={{ padding: 18 }}>
        <div className="row" style={{ alignItems: 'end' }}>
        <label style={{ flex: '1 1 300px' }}>Search
        <input
          aria-label="Search events"
          placeholder="Search events or venues…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        </label>
        <label style={{ width: 190 }}>Sort
        <select aria-label="Sort events" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="date">Soonest first</option>
          <option value="name">A–Z</option>
        </select>
        </label>
        </div>
        <div className="row" style={{ marginTop: 14 }}>
          {['All', 'Music', 'Culture', 'Festival'].map((item) => <span key={item} className="badge">{item}</span>)}
        </div>
      </section>

      {isLoading && <p className="muted">Loading events…</p>}
      {error && <p className="muted">Could not load events.</p>}

      <div className="event-grid">
        {events.map((ev, i) => (
          <Link
            key={ev.id}
            to={`/events/${ev.id}`}
            className="event-card reveal"
            style={{ animationDelay: `${(i % PAGE) * 70}ms` }}
          >
            <div className="event-card-media">
              <img src={heroFor(ev.id)} alt="" />
              <span className="date-chip">{fmtDate(ev.starts_at)}</span>
            </div>
            <div className="event-card-body">
              <h2 className="event-card-title">{ev.title}</h2>
              <p className="event-meta">{fmtFullDate(ev.starts_at)}{ev.location ? ` · ${ev.location}` : ''}</p>
              <div className="between" style={{ marginTop: 4 }}>
                <span className="badge ok">On sale</span>
                <span style={{ color: 'var(--accent)', fontWeight: 800 }}>Get tickets</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {!isLoading && !error && events.length === 0 && (
        <p className="muted">{q ? `No events match “${q}”.` : 'No published events yet — check back soon.'}</p>
      )}

      {hasNextPage && !q && (
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading…' : 'Load more events'}
          </button>
        </div>
      )}
    </div>
  );
}
