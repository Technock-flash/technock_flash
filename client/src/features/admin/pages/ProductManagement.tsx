import { useState, useEffect, useCallback } from "react";
import { vendorApi, type VendorProduct } from "../../../services/api/vendorApi";
import { categoryApi, type Category } from "../../../services/api/categoryApi";
import { formatPrice } from "../../../shared/utils/format";
import { ProductFormModal } from "../../products/components/ProductFormModal";
import { ConfirmationModal } from "../../../shared/ui/ConfirmationModal";
import styles from "./VendorTable.module.css";

export function ProductManagement() {
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<VendorProduct | null>(null);

  // Delete confirmation state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<VendorProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    setError(null);
    vendorApi.getMyProducts()
      .then(setProducts)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchProducts();
    categoryApi.list().then(setCategories);
  }, [fetchProducts]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: VendorProduct) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSave = () => {
    handleCloseModal();
    fetchProducts(); // Refetch products after saving
  };

  const handleOpenDelete = (product: VendorProduct) => {
    setDeletingProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDelete = () => {
    setDeletingProduct(null);
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);

    const originalProducts = [...products];
    // Optimistically update the UI
    setProducts(products.filter((p) => p.id !== deletingProduct.id));
    handleCloseDelete();

    try {
      // Assuming a `deleteProduct` method exists on the vendorApi
      await vendorApi.deleteProduct(deletingProduct.id);
    } catch (err) {
      setProducts(originalProducts);
      setError(err instanceof Error ? err.message : "Failed to delete product.");
    } finally {
      setIsDeleting(false);
    }
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
                      <button className={styles.btnEdit} onClick={() => handleOpenEdit(p)}>
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
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        product={editingProduct}
        categories={categories}
        userRole="VENDOR"
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the product "${deletingProduct?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isConfirming={isDeleting}
      />
    </div>
  );
}