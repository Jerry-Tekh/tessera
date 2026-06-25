import { describe, it, expect } from 'vitest';
import { messageFor } from './errors';
import { ApiError } from './api';

describe('messageFor', () => {
  it('maps known codes to friendly text', () => {
    expect(messageFor(new ApiError('SOLD_OUT', 409, 'x'))).toMatch(/sold out|not enough/i);
  });
  it('falls back to the server message for unknown codes', () => {
    expect(messageFor(new ApiError('WEIRD', 500, 'boom'))).toBe('boom');
  });
});
