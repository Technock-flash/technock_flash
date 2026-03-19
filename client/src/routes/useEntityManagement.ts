import { useState, useEffect, useCallback } from "react";

export interface ApiConfig<T> {
  list: () => Promise<T[]>;
  create: (data: any) => Promise<T>;
  update: (id: string, data: any) => Promise<T>;
  remove: (id: string) => Promise<void>;
}

export interface UseEntityManagementReturn<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isFormModalOpen: boolean;
  editingItem: T | null;
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
    setError(null);
    try {
      if (editingItem) {
        // UPDATE path
        const updated = await apiConfig.update(editingItem.id, data);
        setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        // CREATE path
        const created = await apiConfig.create(data);
        setItems((prev) => [...prev, created]);
      }
      handleCloseFormModal();
    } catch (err: any) {
      setError(`Failed to save ${entityName}: ${err.message ?? err}`);
      console.error(err);
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
    try {
      await apiConfig.remove(deletingItem.id);
      await fetchData();
      handleCloseDeleteModal();
    } catch (err: any) {
      setError(`Failed to delete ${entityName}: ${err.message ?? err}`);
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