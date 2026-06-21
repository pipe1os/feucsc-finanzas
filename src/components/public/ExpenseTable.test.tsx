/* eslint-disable */
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ExpenseTable from './ExpenseTable';
import React from 'react';
import userEvent from '@testing-library/user-event';

// Mock matchMedia for HeroUI
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Next.js navigation
const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/gastos',
  useSearchParams: () => mockSearchParams,
}));

describe('ExpenseTable', () => {
  const defaultProps = {
    transacciones: [
      { id: '1', fecha: '2023-05-01', concepto: 'Test Gasto 1', categoria: 'Comida', monto: 100, comprobante: '' },
      { id: '2', fecha: '2023-05-02', concepto: 'Test Gasto 2', categoria: 'Transporte', monto: 200, comprobante: '' }
    ],
    totalRecords: 2,
    uniqueCategories: ['Comida', 'Transporte'],
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders correctly with given props', () => {
    render(<ExpenseTable {...defaultProps} />);
    
    expect(screen.getByText('Gastos Recientes')).toBeInTheDocument();
    expect(screen.getByText('2 registros encontrados')).toBeInTheDocument();
    // Desktop and Mobile tables might render the concept twice depending on screen size
    const testGasto = screen.getAllByText('Test Gasto 1');
    expect(testGasto.length).toBeGreaterThan(0);
  });

  it('renders skeleton when isLoading is true', () => {
    const { container } = render(<ExpenseTable {...defaultProps} isLoading={true} />);
    // Check if the actual table header is NOT there
    expect(screen.queryByText('Gastos Recientes')).not.toBeInTheDocument();
  });

  it('handles search input and debounces URL update', async () => {
    render(<ExpenseTable {...defaultProps} />);
    
    const searchInputs = screen.getAllByPlaceholderText(/buscar/i);
    // Usually there's one for mobile, one for desktop or one global
    const searchInput = searchInputs[0];

    fireEvent.change(searchInput, { target: { value: 'pizza' } });

    // Should not push immediately due to debounce (300ms)
    expect(mockPush).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Now it should have pushed to router
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/gastos?search=pizza&page=1', { scroll: false });
  });

  it('handles clearing all filters', () => {
    mockSearchParams = new URLSearchParams('search=pizza&categoria=Comida&mes=2023-05');
    
    render(<ExpenseTable {...defaultProps} />);
    
    const clearButton = screen.getByText(/Limpiar Filtros/i);
    fireEvent.click(clearButton);

    expect(mockPush).toHaveBeenCalledWith('/gastos?page=1', { scroll: false });
  });
});
