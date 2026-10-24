import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterBar from '../components/FilterBar';

describe('FilterBar Component', () => {
  const defaultFilters = {
    make: '',
    model: '',
    category: 'All',
    minPrice: '',
    maxPrice: '',
  };

  it('renders all filter input fields and category pills', () => {
    render(
      <FilterBar
        filters={defaultFilters}
        setFilters={vi.fn()}
        onReset={vi.fn()}
        totalCount={10}
        resultCount={10}
      />
    );

    expect(screen.getByLabelText(/make/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/model/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/min price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/max price/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'SUV' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Electric' })).toBeInTheDocument();
  });

  it('updates make filter when user types in the make input', () => {
    const setFilters = vi.fn();
    render(
      <FilterBar
        filters={defaultFilters}
        setFilters={setFilters}
        onReset={vi.fn()}
        totalCount={10}
        resultCount={5}
      />
    );

    const makeInput = screen.getByLabelText(/make/i);
    fireEvent.change(makeInput, { target: { value: 'BMW' } });

    expect(setFilters).toHaveBeenCalled();
  });

  it('shows reset button when filters are active and triggers onReset when clicked', () => {
    const handleReset = vi.fn();
    render(
      <FilterBar
        filters={{ ...defaultFilters, make: 'Ford' }}
        setFilters={vi.fn()}
        onReset={handleReset}
        totalCount={10}
        resultCount={3}
      />
    );

    const resetBtn = screen.getByRole('button', { name: /reset/i });
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});
