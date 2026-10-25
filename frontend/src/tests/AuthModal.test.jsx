import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthModal from '../components/AuthModal';
const auth = vi.hoisted(() => ({ authModalOpen: true, authModalTab: 'register', closeAuthModal: vi.fn(), setAuthModalTab: vi.fn(), register: vi.fn(), login: vi.fn() }));
vi.mock('../context/AuthContext', () => ({ useAuth: () => auth }));

it('provides labeled authentication inputs and renders server validation errors', async () => {
  auth.register.mockRejectedValue(new Error('Email already exists'));
  render(<AuthModal />);
  const dialog = screen.getByRole('dialog', { name: 'Register' });
  fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Test User' } });
  fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.test' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Test-only-password!' } });
  fireEvent.submit(dialog.querySelector('form'));
  expect(await screen.findByText('Email already exists')).toBeInTheDocument();
});
