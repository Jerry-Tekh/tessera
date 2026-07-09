import { useQuery } from '@tanstack/react-query';
import { getHealth } from '../lib/systemApi';

export default function SystemHealth() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['system-health'],
    queryFn: getHealth,
    refetchInterval: 30000,
  });

  const ok = data?.status === 'ok';
  const label = isLoading ? 'Checking system' : ok ? 'System online' : 'System degraded';
  const detail = ok ? 'API, database, and Redis ready' : error ? 'Health check unavailable' : 'One or more services need attention';

  return (
    <span className="health-pill" title={detail}>
      <span className={`health-dot${ok ? ' ok' : ''}`} />
      <span>{label}</span>
    </span>
  );
}
