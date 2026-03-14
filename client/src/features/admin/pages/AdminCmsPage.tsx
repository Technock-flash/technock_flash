import { adminApi, type CmsPage } from "../../../services/api/adminApi";
import { CmsFormModal } from "../components/CmsFormModal";
import { ConfirmationModal } from "../../../shared/ui/ConfirmationModal";
import { useEntityManagement } from "../../../shared/hooks/useEntityManagement";
import styles from "./AdminTable.module.css";

export function AdminCmsPage() {
  const {
    items: pages,
    loading,
    error,
    refetch,
    isFormModalOpen,
    editingItem: editingPage,
    isDeleting,
    isDeleteModalOpen,
    deletingItem: deletingPage,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseFormModal,
    handleOpenDelete,
    handleCloseDeleteModal,
    handleConfirmDelete,
    handleSave,
  } = useEntityManagement<CmsPage>(
    {
      list: adminApi.listCmsPages,
      remove: adminApi.deleteCmsPage,
      create: adminApi.createCmsPage,
      update: adminApi.updateCmsPage,
    },
    "page"
  );

  return (
    <div>
      <div className={styles.header}>
        <h1>CMS Content</h1>
        <button className={styles.createButton} onClick={handleOpenCreate}>
          Create New Page
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "#e74c3c" }}>{error}</p>}
      {!loading && !error && (
        <>
          {pages.length === 0 ? (
            <p>No CMS pages found. Create one to get started.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Slug</th>
                  <th>Title</th>
                  <th>Published</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.id}>
                    <td>{p.slug}</td>
                    <td>{p.title}</td>
                    <td>{p.isPublished ? "Yes" : "No"}</td>
                    <td>
                      <button
                        className={styles.btnEdit}
                        onClick={() => handleOpenEdit(p)}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.btnDelete}
                        onClick={() => handleOpenDelete(p)}
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

      <CmsFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSave={handleSave}
        page={editingPage}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the page "${deletingPage?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isConfirming={isDeleting}
      />
    </div>
  );
}
