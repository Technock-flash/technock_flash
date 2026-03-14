import { useEffect, useState, useCallback } from "react";
import { adminApi, type Category } from "../../../services/api/adminApi";
import { CategoryFormModal } from "../components/CategoryFormModal";
import { ConfirmationModal } from "../../../shared/ui/ConfirmationModal";
import styles from "./AdminTable.module.css";

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Delete confirmation state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = useCallback(() => {
    setLoading(true);
    setError(null);
    adminApi
      .listCategories()
      .then(setCategories)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Failed to load categories"
        )
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSave = () => {
    handleCloseModal();
    fetchCategories(); // Refetch categories after saving
  };

  const handleOpenDelete = (category: Category) => {
    setDeletingCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDelete = () => {
    setDeletingCategory(null);
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);

    const originalCategories = [...categories];
    // Optimistically update the UI
    setCategories(categories.filter((c) => c.id !== deletingCategory.id));
    handleCloseDelete();

    try {
      await adminApi.deleteCategory(deletingCategory.id);
    } catch (err) {
      // Revert the UI on error
      setCategories(originalCategories);
      setError(
        err instanceof Error ? err.message : "Failed to delete category."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <div>
      <div className={styles.header}>
        <h1>Category Management</h1>
        <button className={styles.createButton} onClick={handleOpenCreate}>
          Create New Category
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "#e74c3c" }}>{error}</p>}
      {!loading && !error && (
        <>
          {categories.length === 0 ? (
            <p>No categories found. Create one to get started.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Parent</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.slug}</td>
                    <td>{c.parentId ? categoryMap.get(c.parentId) ?? "N/A" : "-"}</td>
                    <td>
                      <button className={styles.btnEdit} onClick={() => handleOpenEdit(c)}>
                        Edit
                      </button>
                      <button
                        className={styles.btnDelete}
                        onClick={() => handleOpenDelete(c)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        category={editingCategory}
        allCategories={categories}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the category "${deletingCategory?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isConfirming={isDeleting}
      />
    </div>
  );
}