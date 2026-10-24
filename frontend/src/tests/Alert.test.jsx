import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Alert from '../components/Alert';

describe('Alert Component', () => {
  it('renders message and triggers dismiss when close button clicked', () => {
    const handleClose = vi.fn();
    render(<Alert type="error" message="Test error message" onClose={handleClose} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Test error message');
    const closeBtn = screen.getByLabelText(/dismiss alert/i);
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when message is empty', () => {
    const { container } = render(<Alert message="" />);
    expect(container.firstChild).toBeNull();
  });
});
