import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VehicleCard from '../components/VehicleCard';

describe('VehicleCard Component', () => {
  const inStockVehicle = {
    id: 'veh-1',
    make: 'Toyota',
    model: 'Camry',
    category: 'Sedan',
    price: 26000,
    quantity: 5,
  };

  const outOfStockVehicle = {
    id: 'veh-2',
    make: 'Tesla',
    model: 'Model S',
    category: 'Electric',
    price: 89000,
    quantity: 0,
  };

  it('renders vehicle information, price, and in-stock badge properly', () => {
    render(
      <VehicleCard
        vehicle={inStockVehicle}
        onPurchase={vi.fn()}
        onEdit={vi.fn()}
        onRestock={vi.fn()}
        onDelete={vi.fn()}
        isAdmin={false}
      />
    );

    expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    expect(screen.getByText('Sedan')).toBeInTheDocument();
    expect(screen.getByText('$26,000')).toBeInTheDocument();
    expect(screen.getByTestId('badge-in-stock')).toHaveTextContent('5 in stock');
  });

  it('has an enabled purchase button when vehicle is in stock', () => {
    const handlePurchase = vi.fn();
    render(
      <VehicleCard
        vehicle={inStockVehicle}
        onPurchase={handlePurchase}
        onEdit={vi.fn()}
        onRestock={vi.fn()}
        onDelete={vi.fn()}
        isAdmin={false}
      />
    );

    const purchaseBtn = screen.getByTestId('purchase-btn-veh-1');
    expect(purchaseBtn).toBeEnabled();
    expect(purchaseBtn).toHaveTextContent('Purchase Vehicle');

    fireEvent.click(purchaseBtn);
    expect(handlePurchase).toHaveBeenCalledWith(inStockVehicle);
  });

  it('strictly disables the purchase button and shows out-of-stock badge when quantity is zero', () => {
    const handlePurchase = vi.fn();
    render(
      <VehicleCard
        vehicle={outOfStockVehicle}
        onPurchase={handlePurchase}
        onEdit={vi.fn()}
        onRestock={vi.fn()}
        onDelete={vi.fn()}
        isAdmin={false}
      />
    );

    const purchaseBtn = screen.getByTestId('purchase-btn-veh-2');
    expect(purchaseBtn).toBeDisabled();
    expect(purchaseBtn).toHaveTextContent('Sold Out');
    expect(screen.getByTestId('badge-out-of-stock')).toHaveTextContent('Out of Stock');

    fireEvent.click(purchaseBtn);
    expect(handlePurchase).not.toHaveBeenCalled();
  });

  it('renders admin controls (Edit, Restock, Delete) only when isAdmin is true', () => {
    const { rerender } = render(
      <VehicleCard
        vehicle={inStockVehicle}
        onPurchase={vi.fn()}
        onEdit={vi.fn()}
        onRestock={vi.fn()}
        onDelete={vi.fn()}
        isAdmin={false}
      />
    );

    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Restock')).not.toBeInTheDocument();

    rerender(
      <VehicleCard
        vehicle={inStockVehicle}
        onPurchase={vi.fn()}
        onEdit={vi.fn()}
        onRestock={vi.fn()}
        onDelete={vi.fn()}
        isAdmin={true}
      />
    );

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Restock')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete Toyota Camry')).toBeInTheDocument();
  });
});
