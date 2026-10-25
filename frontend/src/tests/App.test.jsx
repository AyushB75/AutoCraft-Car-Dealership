import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from '../App';
import api from '../services/api';

vi.mock('../services/api', () => ({ default: { getVehicles: vi.fn(), searchVehicles: vi.fn(), createVehicle: vi.fn(), updateVehicle: vi.fn() } }));
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ isAdmin: true, isAuthenticated: true }) }));
vi.mock('../components/AuthModal', () => ({ default: () => null }));
vi.mock('../components/Navbar', () => ({ default: ({ onOpenAddModal }) => <button onClick={onOpenAddModal}>Add vehicle</button> }));

const car = { id: 'one', make: 'Toyota', model: 'Camry', category: 'Sedan', price: 100, quantity: 1 };
beforeEach(() => { vi.clearAllMocks(); api.getVehicles.mockResolvedValue({ vehicles: [car, { ...car, id: 'two', make: 'Honda' }] }); });

describe('Inventory requests', () => {
  it('ignores late responses from previous filters and preserves total count', async () => {
    let resolveOld;
    api.searchVehicles.mockImplementation(({ make }) => make === 'old' ? new Promise(resolve => { resolveOld = resolve; }) : Promise.resolve({ vehicles: [car] }));
    render(<App />);
    await screen.findByText('Honda Camry');
    fireEvent.change(screen.getByLabelText('Make'), { target: { value: 'old' } });
    await waitFor(() => expect(resolveOld).toBeDefined());
    fireEvent.change(screen.getByLabelText('Make'), { target: { value: 'Toyota' } });
    await screen.findByText('Toyota Camry');
    await act(async () => resolveOld({ vehicles: [{ ...car, make: 'Outdated' }] }));
    expect(screen.queryByText('Outdated Camry')).not.toBeInTheDocument();
    expect(screen.getByText(/Showing/)).toHaveTextContent('Showing 1 of 2');
  });

  it('shows an inventory error without a misleading empty-results message', async () => {
    api.getVehicles.mockRejectedValue(new Error('Connection unavailable'));
    render(<App />);
    await screen.findByText('Connection unavailable');
    expect(screen.queryByText('No Vehicles Found')).not.toBeInTheDocument();
  });

  it('refetches active filters after adding a vehicle', async () => {
    api.searchVehicles.mockResolvedValue({ vehicles: [car] });
    api.createVehicle.mockResolvedValue({ vehicle: { ...car, id: 'new', make: 'Ford' } });
    render(<App />);
    await screen.findByText('Toyota Camry');
    fireEvent.change(screen.getByLabelText('Make'), { target: { value: 'Toyota' } });
    await waitFor(() => expect(api.searchVehicles).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByText('Add vehicle'));
    const dialog = screen.getByRole('dialog', { name: 'Add New Vehicle' });
    const inputs = dialog.querySelectorAll('input');
    for (const [index, value] of ['Ford', 'Focus', '100', '1'].entries()) fireEvent.change(inputs[index], { target: { value } });
    fireEvent.submit(dialog.querySelector('form'));
    await waitFor(() => expect(api.searchVehicles).toHaveBeenCalledTimes(2));
    expect(screen.queryByText('Ford Focus')).not.toBeInTheDocument();
  });
});
