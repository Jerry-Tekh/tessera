import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import Countdown from './Countdown.jsx';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('Countdown', () => {
  it('shows remaining mm:ss and calls onExpire at zero', () => {
    const onExpire = vi.fn();
    const deadline = new Date(Date.now() + 2000).toISOString();
    render(<Countdown deadline={deadline} onExpire={onExpire} />);
    expect(screen.getByText(/0:0[12]/)).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(2100); });
    expect(onExpire).toHaveBeenCalledTimes(1);
  });
});
