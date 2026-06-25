import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet, apiPost } from '../../lib/api';
import { messageFor } from '../../lib/errors';
import Countdown from '../../components/Countdown.jsx';

export default function Checkout({ category, onClose }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [reservation, setReservation] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [err, setErr] = useState(null);

  async function reserve() {
    setErr(null);
    try {
      const r = await apiPost('/reservations',
        { categoryId: category.id, quantity: 1, holder: { kind: 'guest', email } }, { idempotency: true });
      setReservation(r.reservation);
    } catch (e) { setErr(messageFor(e)); }
  }

  async function pay() {
    setErr(null);
    try {
      const r = await apiPost('/orders', { reservationId: reservation.id }, { idempotency: true });
      setOrderId(r.order.id);
    } catch (e) { setErr(messageFor(e)); }
  }

  const poll = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => apiGet(`/orders/${orderId}`),
    enabled: !!orderId,
    refetchInterval: (q) => (q.state.data?.status === 'paid' ? false : 1500),
  });
  const paid = poll.data?.status === 'paid';
  useEffect(() => {
    if (paid && orderId) navigate(`/orders/${orderId}`);
  }, [paid, orderId, navigate]);

  return (
    <div role="dialog" style={{ border: '1px solid var(--accent)', background: 'var(--surface)', padding: 18, marginTop: 16 }}>
      <button onClick={onClose} style={{ float: 'right' }}>✕</button>
      <h3>Checkout — {category.name}</h3>
      {err && <p style={{ color: '#f87171' }}>{err}</p>}

      {!reservation && (
        <div>
          <label>Email<br /><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" /></label>
          <div><button className="primary" disabled={!email} onClick={reserve}>Reserve</button></div>
        </div>
      )}

      {reservation && !orderId && (
        <div>
          <p>Hold expires in <Countdown deadline={reservation.expires_at} onExpire={() => { setReservation(null); setErr('Your hold expired. Please start again.'); }} /></p>
          <button className="primary" onClick={pay}>Pay</button>
        </div>
      )}

      {orderId && <p>{paid ? 'Paid — redirecting…' : 'Finalizing your order…'}</p>}
    </div>
  );
}
