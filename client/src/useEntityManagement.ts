import { useState, useEffect, useCallback } from "react";

interface ApiConfig<T> {
  list: () => Promise<T[]>;
  create: (data: any) => Promise<T>;
  update: (id: string, data: any) => Promise<T>;
  remove: (id: string) => Promise<void>;
}

interface UseEntityManagementReturn<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isFormModalOpen: boolean;
  editingItem: T | null;
  isSaving: boolean;
  isDeleting: boolean;
  isDeleteModalOpen: boolean;
  deletingItem: T | null;
  handleOpenCreate: () => void;
  handleOpenEdit: (item: T) => void;
  handleCloseFormModal: () => void;
  handleOpenDelete: (item: T) => void;
  handleCloseDeleteModal: () => void;
  handleConfirmDelete: () => Promise<void>;
  handleSave: (data: any) => Promise<void>;
}

export function useEntityManagement<T extends { id: string }>(
  apiConfig: ApiConfig<T>,
  entityName: string = "item"
): UseEntityManagementReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiConfig.list();
      setItems(data);
    } catch (err: any) {
      setError(err.message || `Failed to fetch ${entityName}s`);
    } finally {
      setLoading(false);
    }
  }, [apiConfig, entityName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const handleSave = async (data: any) => {
    setIsSaving(true);
    setError(null);
    try {
      if (editingItem) {
        const updatedItem = await apiConfig.update(editingItem.id, data);
        setItems((prevItems) =>
          prevItems.map((item) => (item.id === updatedItem.id ? updatedItem : item))
        );
      } else {
        const newItem = await apiConfig.create(data);
        setItems((prevItems) => [...prevItems, newItem]);
      }
      handleCloseFormModal();
    } catch (err: any) {
      setError(`Failed to save ${entityName}.`);
      console.error(err);
      // Do not close modal on error, so user can retry.
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDelete = (item: T) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingItem(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    setIsDeleting(true);
    const originalItems = [...items];

    // Optimistically update the UI
    setItems(items.filter((item) => item.id !== deletingItem.id));
    handleCloseDeleteModal();

    try {
      await apiConfig.remove(deletingItem.id);
    } catch (err: any) {
      // If the item is not found (404), it's already deleted. Do not revert.
      if (err.response?.status === 404) {
        return;
      }

      // On error, revert the state
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Unknown error";
      setError(`Failed to delete ${entityName}: ${errorMessage}. The item has been restored.`);
      setItems(originalItems);
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    items,
    loading,
    error,
    refetch: fetchData,
    isFormModalOpen,
    editingItem,
    isSaving,
    isDeleting,
    isDeleteModalOpen,
    deletingItem,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseFormModal,
    handleOpenDelete,
    handleCloseDeleteModal,
    handleConfirmDelete,
    handleSave,
  };
}