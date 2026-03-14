import { useState, useEffect, useCallback } from 'react';

interface Entity {
  id: string;
  [key: string]: any;
}

interface Api<T extends Entity> {
  list: () => Promise<T[]>;
  remove: (id: string) => Promise<void>;
  create: (data: Partial<T>) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
}

export const useEntityManagement = <T extends Entity>(api: Api<T>) => {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.list();
      setItems(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleOpenDelete = (item: T) => {
    setItemToDelete(item);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const originalItems = items;
    setItems(prev => prev.filter(i => i.id !== itemToDelete.id)); // Optimistic update
    try {
      await api.remove(itemToDelete.id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete');
      setItems(originalItems); // Rollback
    } finally {
      setItemToDelete(null);
    }
  };

  const handleSave = async (data: Partial<T>, id?: string) => {
    try {
      id ? await api.update(id, data) : await api.create(data);
      await fetchItems(); // Refetch
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    }
  };

  return { items, loading, error, handleOpenDelete, handleConfirmDelete, handleSave };
};