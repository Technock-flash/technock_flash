import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useEntityManagement } from './useEntityManagement';

describe('useEntityManagement Hook', () => {
  const mockItems = [{ id: '1', name: 'Item 1' }, { id: '2', name: 'Item 2' }];
  
  const mockApi = {
    list: vi.fn().mockResolvedValue(mockItems), // Use mockResolvedValue so we can reset it
    remove: vi.fn().mockResolvedValue(undefined),
    create: vi.fn().mockResolvedValue({ id: '3', name: 'New Item' }),
    update: vi.fn().mockResolvedValue({ id: '1', name: 'Updated Item' }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.list.mockResolvedValue([...mockItems]);
  });

  it('should fetch items on mount', async () => {
    const { result } = renderHook(() => useEntityManagement(mockApi));

    expect(result.current.loading).toBe(true);
    
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.items).toEqual(mockItems);
    expect(mockApi.list).toHaveBeenCalledTimes(1);
  });

  it('should handle optimistic updates on delete and not refetch', async () => {
    const { result } = renderHook(() => useEntityManagement(mockApi));
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Ensure list was only called on mount
    expect(mockApi.list).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.handleOpenDelete(mockItems[0]);
    });

    // The UI should update synchronously upon calling handleConfirmDelete
    await act(async () => {
      result.current.handleConfirmDelete();
    });

    // Check optimistic update
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('2');
    
    // Check that the API was called
    expect(mockApi.remove).toHaveBeenCalledWith('1');
    
    // Ensure no full refetch was triggered
    expect(mockApi.list).toHaveBeenCalledTimes(1);
  });

  it('should revert state if optimistic delete fails', async () => {
    const deleteError = new Error('API Error');
    mockApi.remove.mockRejectedValueOnce(deleteError);

    const { result } = renderHook(() => useEntityManagement(mockApi));
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    expect(result.current.items).toEqual(mockItems);

    await act(async () => {
      result.current.handleOpenDelete(mockItems[0]);
      await result.current.handleConfirmDelete();
    });

    // State should be reverted
    await waitFor(() => {
      expect(result.current.items).toEqual(mockItems);
    });
    expect(result.current.error).toContain('Failed to delete');
  });

  it('should handle creation of new entities without refetching', async () => {
    const { result } = renderHook(() => useEntityManagement(mockApi));
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Reset list mock calls after initial fetch
    mockApi.list.mockClear();

    const newData = { name: 'New Item' };    
    const savePromise = act(async () => {
      await result.current.handleSave(newData)
    });

    // Check isSaving state during the operation
    await waitFor(() => {
      expect(result.current.isSaving).toBe(true);
    });

    await savePromise;

    // Check isSaving is reset
    expect(result.current.isSaving).toBe(false);
    expect(mockApi.create).toHaveBeenCalledWith(newData);
    expect(mockApi.list).not.toHaveBeenCalled(); // IMPORTANT: check that we don't refetch
    expect(result.current.items).toHaveLength(3);
    expect(result.current.items[2]).toEqual({ id: '3', name: 'New Item' });
  });

  it('should set isSaving to false on save failure', async () => {
    const saveError = new Error('Save failed');
    mockApi.create.mockRejectedValueOnce(saveError);
    const { result } = renderHook(() => useEntityManagement(mockApi, 'item'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    const newData = { name: 'New Item' };
    
    await act(async () => {
      await result.current.handleSave(newData);
    });

    expect(result.current.isSaving).toBe(false);
    expect(result.current.error).toContain('Failed to save item');
  });
});