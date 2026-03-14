import { adminApi, type Category } from "../services/api/adminApi";
import { CategoryFormModal } from "../components/CategoryFormModal";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { useEntityManagement } from "./useEntityManagement";
import styles from "../features/admin/pages/AdminTable.module.css";

export function AdminCategoriesPage() {
  const {
    items: categories,
    loading,
    error,
    refetch,
    isFormModalOpen,
    editingItem: editingCategory,
    isDeleting,
    isDeleteModalOpen,
    deletingItem: deletingCategory,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseFormModal,
    handleOpenDelete,
    handleCloseDeleteModal,
    handleConfirmDelete,
    handleSave,
  } = useEntityManagement<Category>(
    {
      list: adminApi.listCategories,
      remove: adminApi.deleteCategory,
      create: adminApi.createCategory,
      update: adminApi.updateCategory,
    },
    "category"
  );

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
                      <button className={styles.btnDelete} onClick={() => handleOpenDelete(c)}>
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

      <CategoryFormModal isOpen={isFormModalOpen} onClose={handleCloseFormModal} onSave={handleSave} category={editingCategory} allCategories={categories} />

      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} onConfirm={handleConfirmDelete} title="Confirm Deletion" message={`Are you sure you want to delete the category "${deletingCategory?.name}"? This action cannot be undone.`} confirmText="Delete" isConfirming={isDeleting} />
    </div>
  );
}