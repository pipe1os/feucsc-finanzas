
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { useGastos } from './useGastos';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
 supabase: {
 from: vi.fn(),
 },
}));

// We also need to mock SWR if we don't want cache leaks, but let's clear cache instead
// or wrap in SWRConfig with empty cache.
import { SWRConfig } from 'swr';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => (
 <SWRConfig value={{ provider: () => new Map() }}>
 {children}
 </SWRConfig>
);

interface MockQuery {
 select: Mock;
 eq: Mock;
 like: Mock;
 or: Mock;
 order: Mock;
 range: Mock;
 then?: Mock;
}

describe('useGastos', () => {
 let mockQuery: MockQuery;

 beforeEach(() => {
 vi.clearAllMocks();
 
 // Setup a clean mock query chain for each test
 mockQuery = {
 select: vi.fn().mockReturnThis(),
 eq: vi.fn().mockReturnThis(),
 like: vi.fn().mockReturnThis(),
 or: vi.fn().mockReturnThis(),
 order: vi.fn().mockReturnThis(),
 range: vi.fn().mockReturnThis(),
 };
 
 // We make the chain awaitable by giving it a then method
 mockQuery.then = vi.fn().mockImplementation(function(resolve: (value: unknown) => void) {
 resolve({ data: [], count: 0, error: null });
 });

 (supabase.from as Mock).mockReturnValue(mockQuery);
 });

 it('fetches gastos without filters with default ordering', async () => {
 const mockData = [{ id: '1', descripcion: 'Test', monto: 100 }];
 mockQuery.then!.mockImplementation((resolve: (value: unknown) => void) => resolve({ data: mockData, count: 1, error: null }));

 const { result } = renderHook(() => useGastos(), { wrapper });

 expect(result.current.isLoading).toBe(true);

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false);
 });

 expect(result.current.gastos).toEqual(mockData);
 expect(result.current.totalCount).toBe(1);
 
 expect(supabase.from).toHaveBeenCalledWith('gastos');
 expect(mockQuery.select).toHaveBeenCalledWith('*', { count: 'exact' });
 expect(mockQuery.order).toHaveBeenCalledWith('fecha', { ascending: false });
 });

 it('applies category filter correctly', async () => {
 const { result } = renderHook(() => useGastos({ selectedCategory: 'Comida' }), { wrapper });

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false);
 });

 expect(mockQuery.eq).toHaveBeenCalledWith('categoria', 'Comida');
 });

 it('applies month filter correctly', async () => {
 const { result } = renderHook(() => useGastos({ selectedMonth: '2023-05' }), { wrapper });

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false);
 });

 expect(mockQuery.like).toHaveBeenCalledWith('fecha', '%-2023-05-%');
 });

 it('applies text search filter correctly for string', async () => {
 const { result } = renderHook(() => useGastos({ searchQuery: 'pizza' }), { wrapper });

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false);
 });

 expect(mockQuery.or).toHaveBeenCalledWith('descripcion.ilike.%pizza%,categoria.ilike.%pizza%');
 });

 it('applies numeric search filter correctly for numbers', async () => {
 const { result } = renderHook(() => useGastos({ searchQuery: '500' }), { wrapper });

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false);
 });

 expect(mockQuery.or).toHaveBeenCalledWith('descripcion.ilike.%500%,categoria.ilike.%500%,monto.eq.500');
 });

 it('applies pagination correctly', async () => {
 const { result } = renderHook(() => useGastos({ page: 2, pageSize: 10 }), { wrapper });

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false);
 });

 // page 2 with 10 size -> from 10 to 19
 expect(mockQuery.range).toHaveBeenCalledWith(10, 19);
 });

 it('applies sorting correctly', async () => {
 const { result } = renderHook(() => useGastos({ 
 sortDescriptor: { column: 'monto', direction: 'ascending' } 
 }), { wrapper });

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false);
 });

 expect(mockQuery.order).toHaveBeenCalledWith('monto', { ascending: true });
 });

 it('returns error state if supabase fails', async () => {
 mockQuery.then!.mockImplementation((resolve: (value: unknown) => void) => resolve({ data: null, count: null, error: new Error('DB Error') }));

 const { result } = renderHook(() => useGastos(), { wrapper });

 await waitFor(() => {
 expect(result.current.error).toBeTruthy();
 });

 expect(result.current.error.message).toBe('DB Error');
 });
});
