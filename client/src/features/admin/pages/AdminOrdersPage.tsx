import { adminApi, type AdminOrder } from "../../../services/api/adminApi";
import { formatPrice } from "../../../shared/utils/format";
import { Pagination } from "../../../shared/ui/Pagination";
import { useAdminTable } from "./useAdminTable";
import styles from "./AdminTable.module.css";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export function AdminOrdersPage() {
  const {
    items,
    total,
    page,
    status,
    loading,
    error,
    sortBy,
    sortOrder,
    setPage,
    setStatus,
    onSort,
    refetch,
  } = useAdminTable<AdminOrder>(adminApi.listAllOrders, { limit: 20 });

  const renderSortArrow = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === "asc" ? " \u25b2" : " \u25bc";
  };

  const SortableHeader = ({
    column,
    label,
  }: {
    column: string;
    label: string;
  }) => (
    <th onClick={() => onSort(column)} className={styles.sortableHeader}>
      {label}
      {renderSortArrow(column)}
    </th>
  );

  const handleStatusChange = (id: string, newStatus: string) => {
    adminApi.updateOrderStatus(id, newStatus).then(refetch);
  };

  return (
    <div>
      <div className={styles.header}>
        <h1>Order Management</h1>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <button
            type="button"
            className={!status ? styles.active : ""}
            onClick={() => setStatus(undefined as any)}
          >
            All
          </button>
          {ORDER_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={status === s ? styles.active : ""}
              onClick={() => setStatus(s as any)}
            >
              {STATUS_LABELS[s]}
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
                <SortableHeader column="orderNumber" label="Order #" />
                <SortableHeader column="customer" label="Customer" />
                <SortableHeader column="totalCents" label="Total" />
                <SortableHeader column="status" label="Status" />
                <SortableHeader column="createdAt" label="Date" />
                <th style={{ width: 160 }}>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", color: "#718096", padding: "2rem" }}
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                items.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.orderNumber}</strong>
                    </td>
                    <td>{order.customer?.email ?? "-"}</td>
                    <td>{formatPrice(order.totalCents)}</td>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.2rem 0.6rem",
                          borderRadius: "999px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          background:
                            order.status === "DELIVERED"
                              ? "#e6fffa"
                              : order.status === "CANCELLED"
                              ? "#fff5f5"
                              : order.status === "SHIPPED"
                              ? "#ebf8ff"
                              : "#fefcbf",
                          color:
                            order.status === "DELIVERED"
                              ? "#2c7a7b"
                              : order.status === "CANCELLED"
                              ? "#c53030"
                              : order.status === "SHIPPED"
                              ? "#2b6cb0"
                              : "#744210",
                        }}
                      >
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </td>
                    <td>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                        className={styles.select}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
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
    </div>
  );
}
