import { useState, useEffect, useMemo } from "react";
import { vendorApi, type VendorProduct } from "../services/api/vendorApi";
import { formatPrice } from "../shared/utils/format";
import { ProductFormModal } from "../features/products/components/ProductFormModal";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { useEntityManagement } from "../useEntityManagement";
import styles from "../features/admin/pages/VendorTable.module.css";

export function ProductManagement() {
  const apiConfig = useMemo(() => ({
    list: vendorApi.getMyProducts,
    remove: vendorApi.deleteProduct,
    create: vendorApi.createProduct,
    update: vendorApi.updateProduct,
  }), []);

  const {
    items: products,
    loading,
    error,
    refetch,
    isFormModalOpen,
    editingItem: editingProduct,
    isSaving,
    isDeleting,
    isDeleteModalOpen,
    deletingItem: deletingProduct,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseFormModal,
    handleOpenDelete,
    handleCloseDeleteModal,
    handleConfirmDelete,
    handleSave: handleProductSave,
  } = useEntityManagement<VendorProduct>(
    apiConfig, "product"
  );

  const handleSave = (data: any) => {
    // ProductFormModal already builds the JSON payload the backend expects.
    return handleProductSave(data);
  };

  return (
    <div>
      <div className={styles.header}>
        <h1>My Products</h1>
        <button className={styles.createButton} onClick={handleOpenCreate}>
          Create New Product
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "#e74c3c" }}>{error}</p>}
      {!loading && !error && (
        <>
          {products.length === 0 ? (
            <p>You haven't created any products yet. Get started by creating one!</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{formatPrice(p.priceCents)}</td>
                    <td>{p.stock}</td>
                    <td>{p.moderationStatus}</td>
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

      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSave={handleSave}
        product={editingProduct}
        isSaving={isSaving}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the product "${deletingProduct?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isConfirming={isDeleting}
      />
    </div>
  );
}