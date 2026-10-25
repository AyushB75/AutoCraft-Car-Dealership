import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminModal from '../components/AdminModal';

it('labels the dialog and form, moves focus inside, and closes on Escape', () => {
  const close = vi.fn();
  render(<AdminModal isOpen mode="add" onClose={close} onSubmit={vi.fn()} />);
  const dialog = screen.getByRole('dialog', { name: 'Add New Vehicle' });
  expect(screen.getByLabelText('Make')).toBeInTheDocument();
  expect(screen.getByLabelText('Model')).toBeInTheDocument();
  expect(dialog.contains(document.activeElement)).toBe(true);
  fireEvent.keyDown(dialog, { key: 'Escape' });
  expect(close).toHaveBeenCalledTimes(1);
});
