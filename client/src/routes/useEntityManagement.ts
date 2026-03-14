import { useState, useCallback, useEffect } from "react";

type Entity = { id: string; [key: string]: any };

interface EntityApi<T extends Entity> {
  list?: () => Promise<T[]>;
  remove?: (id: string) => Promise<void>;
  create?: (data: Partial<T> | FormData) => Promise<T>;
  update?: (id: string, data: Partial<T> | FormData) => Promise<T>;
}

export function useEntityManagement<T extends Entity>(
  api: EntityApi<T>,
  entityName: string = "item"
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);

  // Delete confirmation state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchItems = useCallback(() => {
    if (!api.list) return;
    setLoading(true);
    setError(null);
    api
      .list()
      .then(setItems)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : `Failed to load ${entityName}s.`
        )
      )
      .finally(() => setLoading(false));
  }, [api, entityName]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Form modal handlers
  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: T) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingItem(null);
  };

  // Delete modal handlers
  const handleOpenDelete = (item: T) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeletingItem(null);
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem || !api.remove) return;

    setIsDeleting(true);
    const originalItems = [...items];
    // Optimistic UI update
    setItems(items.filter((i) => i.id !== deletingItem.id));
    handleCloseDeleteModal();

    try {
      await api.remove(deletingItem.id);
    } catch (err) {
      // Revert on error
      setItems(originalItems);
      setError(
        err instanceof Error ? err.message : `Failed to delete ${entityName}.`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async (data: Partial<T> | FormData) => {
    setIsSaving(true);
    setError(null);
    try {
      if (editingItem?.id) {
        if (!api.update) throw new Error("Update function not provided to hook");
        await api.update(editingItem.id, data);
      } else {
        if (!api.create) throw new Error("Create function not provided to hook");
        await api.create(data);
      }
      handleCloseFormModal();
      fetchItems(); // refetch list
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Failed to save ${entityName}.`
      );
      // Re-throw so the form can catch it
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    items, loading, error, isSaving, refetch: fetchItems,
    isFormModalOpen, editingItem,
    handleOpenCreate, handleOpenEdit, handleCloseFormModal,
    isDeleteModalOpen, deletingItem, isDeleting,
    handleOpenDelete, handleCloseDeleteModal, handleConfirmDelete,
    handleSave,
  };
}