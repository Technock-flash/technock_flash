import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useEntityManagement } from './useEntityManagement';

describe('useEntityManagement Hook', () => {
  const mockItems = [{ id: '1', name: 'Item 1' }, { id: '2', name: 'Item 2' }];
  
  const mockApi = {
    list: vi.fn().mockResolvedValue(mockItems),
    remove: vi.fn().mockResolvedValue(undefined),
    create: vi.fn().mockResolvedValue({ id: '3', name: 'New Item' }),
    update: vi.fn().mockResolvedValue({ id: '1', name: 'Updated Item' }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch items on mount', async () => {
    const { result } = renderHook(() => useEntityManagement(mockApi));

    expect(result.current.loading).toBe(true);
    
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.items).toEqual(mockItems);
    expect(mockApi.list).toHaveBeenCalledTimes(1);
  });

  it('should handle optimistic updates on delete', async () => {
    const { result } = renderHook(() => useEntityManagement(mockApi));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.handleOpenDelete(mockItems[0]);
    });

    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('2');
    expect(mockApi.remove).toHaveBeenCalledWith('1');
  });

  it('should handle creation of new entities', async () => {
    const { result } = renderHook(() => useEntityManagement(mockApi));
    await waitFor(() => expect(result.current.loading).toBe(false));

    const newData = { name: 'New Item' };
    
    await act(async () => {
      await result.current.handleSave(newData);
    });

    expect(mockApi.create).toHaveBeenCalledWith(newData);
    await waitFor(() => expect(mockApi.list).toHaveBeenCalledTimes(2));
  });

  it('should handle API errors gracefully', async () => {
    const errorApi = {
      list: vi.fn().mockRejectedValue(new Error('Fetch failed')),
    };

    const { result } = renderHook(() => useEntityManagement(errorApi));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Fetch failed');
  });
});