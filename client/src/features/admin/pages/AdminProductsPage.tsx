import {
  adminApi,
  type ProductForModeration,
} from "../../../services/api/adminApi";
import { formatPrice } from "../../../shared/utils/format";
import { Pagination } from "../../../shared/ui/Pagination";
import { useAdminTable } from "../hooks/useAdminTable";
import { useEntityManagement } from "../../../shared/hooks/useEntityManagement";
import { ProductFormModal } from "../../products/components/ProductFormModal";
import { ConfirmationModal } from "../../../shared/ui/ConfirmationModal";
import styles from "./AdminTable.module.css";

export function AdminProductsPage() {
  const { items, total, page, status, loading, error, search, sortBy, sortOrder, setPage, setStatus, setSearch, onSort, refetch } =
    useAdminTable<ProductForModeration>(adminApi.listProductsForModeration, {
      limit: 20,
      initialStatus: "PENDING",
    });

  const {
    isFormModalOpen,
    editingItem: editingProduct,
    isDeleteModalOpen,
    deletingItem: deletingProduct,
    isDeleting,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseFormModal,
    handleOpenDelete,
    handleCloseDeleteModal,
    handleConfirmDelete: confirmDelete,
    handleSave: handleEntitySave,
  } = useEntityManagement<ProductForModeration>({
      // The list() is handled by useAdminTable, so we provide a dummy function
      list: () => Promise.resolve([]),
      remove: adminApi.deleteProduct,
      create: adminApi.createProduct,
      update: adminApi.updateProduct,
    }, "product");

  const renderSortArrow = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === "asc" ? " ▲" : " ▼";
  };

  const SortableHeader = ({ column, label }: { column: string; label: string }) => (
    <th onClick={() => onSort(column)} className={styles.sortableHeader}>
      {label}
      {renderSortArrow(column)}
    </th>
  );

  const handleApprove = (id: string) => {
    adminApi.approveProduct(id).then(refetch);
  };

  const handleReject = (id: string) => {
    adminApi.rejectProduct(id).then(refetch);
  };

  const handleSave = (data: any) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("priceCents", String(Math.round(Number(data.price) * 100)));
    formData.append("stock", String(data.stock));
    formData.append("categoryId", data.categoryId);

    if (data.images && data.images.length > 0) {
      data.images.forEach((file: File) => {
        formData.append("images", file);
      });
    }

    if (data.imagesToRemove && data.imagesToRemove.length > 0) {
      data.imagesToRemove.forEach((url: string) => {
        formData.append("imagesToRemove[]", url);
      });
    }
    return handleEntitySave(formData);
  };

  const handleConfirmDelete = async () => {
    try {
      await confirmDelete();
      refetch();
    } finally {
      // isDeleting is handled by the hook
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <h1>Product Moderation</h1>
        <div className={styles.headerActions}>
          <input
            type="search"
            placeholder="Search by product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <button className={styles.createButton} onClick={handleOpenCreate}>Create Product</button>
        </div>
      </div>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {["PENDING", "APPROVED", "REJECTED"].map((s) => (
            <button
              key={s}
              type="button"
              className={status === s ? styles.active : ""}
              onClick={() => setStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "#e74c3c" }}>{error}</p>
      ) : (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <SortableHeader column="name" label="Product" />
                <SortableHeader column="vendor" label="Vendor" />
                <SortableHeader column="priceCents" label="Price" />
                <SortableHeader column="moderationStatus" label="Status" />
                <th style={{ width: 150 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.vendor?.name ?? "-"}</td>
                  <td>{formatPrice(p.priceCents)}</td>
                  <td>{p.moderationStatus}</td>
                  <td>
                    {p.moderationStatus === "PENDING" && (
                      <>
                        <button
                          type="button"
                          className={styles.btnApprove}
                          onClick={() => handleApprove(p.id)}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className={styles.btnReject}
                          onClick={() => handleReject(p.id)}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {p.moderationStatus !== "PENDING" && (
                      <>
                        <button type="button" className={styles.btnEdit} onClick={() => handleOpenEdit(p)}>Edit</button>
                        <button type="button" className={styles.btnDelete} onClick={() => handleOpenDelete(p)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={page}
            pageSize={20}
            totalItems={total}
            onPageChange={setPage}
          />
        </>
      )}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSave={handleSave}
        product={editingProduct}
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
