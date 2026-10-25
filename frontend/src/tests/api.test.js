import { it, expect, vi, afterEach } from 'vitest';
import api from '../services/api';

afterEach(() => { vi.unstubAllGlobals(); localStorage.clear(); });

it('clears expired sessions and signals the login dialog', async () => {
  localStorage.setItem('auth_token', 'test-session');
  const expired = vi.fn();
  window.addEventListener('auth:expired', expired);
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({ message: 'Expired' }) }));
  try {
    await expect(api.getMe()).rejects.toThrow('Expired');
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(expired).toHaveBeenCalledOnce();
  } finally { window.removeEventListener('auth:expired', expired); }
});

it('does not clear a newer login when an old request returns 401', async () => {
  localStorage.setItem('auth_token', 'old-test-session');
  let finish;
  vi.stubGlobal('fetch', vi.fn().mockImplementation(() => new Promise(resolve => { finish = resolve; })));
  const pending = api.getMe();
  localStorage.setItem('auth_token', 'new-test-session');
  finish({ ok: false, status: 401, json: async () => ({ message: 'Expired' }) });
  await expect(pending).rejects.toThrow('Expired');
  expect(localStorage.getItem('auth_token')).toBe('new-test-session');
});
