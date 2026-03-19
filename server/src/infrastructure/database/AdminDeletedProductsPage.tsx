import { useState, useEffect, useCallback } from "react";
import { adminApi } from "../../services/api/adminApi";
import { ConfirmationModal } from "../../core/shared/ui/ConfirmationModal";
import styles from "./AdminTable.module.css";

// Define a type for the deleted product, including vendor info
interface DeletedProduct {
  id: string;
  name: string;
  deletedAt: string;
  vendor: {
    name: string;
  };
}

export function AdminDeletedProductsPage() {
  const [products, setProducts] = useState<DeletedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for confirmation modals
  const [itemToRestore, setItemToRestore] = useState<DeletedProduct | null>(null);
  const [itemToDelete, setItemToDelete] = useState<DeletedProduct | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchDeletedProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.listDeletedProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch deleted products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeletedProducts();
  }, [fetchDeletedProducts]);

  const handleRestore = async () => {
    if (!itemToRestore) return;
    setIsProcessing(true);
    try {
      await adminApi.restoreProduct(itemToRestore.id);
      setProducts(products.filter((p) => p.id !== itemToRestore.id));
    } catch (err: any) {
      setError(err.message || "Failed to restore product.");
    } finally {
      setIsProcessing(false);
      setItemToRestore(null);
    }
  };

  const handlePermanentDelete = async () => {
    if (!itemToDelete) return;
    setIsProcessing(true);
    try {
      await adminApi.hardDeleteProduct(itemToDelete.id);
      setProducts(products.filter((p) => p.id !== itemToDelete.id));
    } catch (err: any) {
      setError(err.message || "Failed to permanently delete product.");
    } finally {
      setIsProcessing(false);
      setItemToDelete(null);
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <h1>Deleted Products</h1>
        <button onClick={fetchDeletedProducts} disabled={loading} className={styles.createButton}>
          Refresh
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "#e74c3c" }}>{error}</p>}
      {!loading && !error && (
        <>
          {products.length === 0 ? (
            <p>No deleted products found.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Vendor</th>
                  <th>Deleted On</th>
                  <th style={{ width: "250px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.vendor?.name || "N/A"}</td>
                    <td>{new Date(p.deletedAt).toLocaleString()}</td>
                    <td>
                      <button className={styles.btnEdit} onClick={() => setItemToRestore(p)}>
                        Restore
                      </button>
                      <button className={styles.btnDelete} onClick={() => setItemToDelete(p)}>
                        Delete Permanently
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      <ConfirmationModal
        isOpen={!!itemToRestore}
        onClose={() => setItemToRestore(null)}
        onConfirm={handleRestore}
        title="Confirm Restore"
        message={`Are you sure you want to restore the product "${itemToRestore?.name}"?`}
        confirmText="Restore"
        isConfirming={isProcessing}
      />

      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handlePermanentDelete}
        title="Confirm Permanent Deletion"
        message={`This action is irreversible. Are you sure you want to permanently delete "${itemToDelete?.name}"?`}
        confirmText="Delete Permanently"
        isConfirming={isProcessing}
      />
    </div>
  );
}