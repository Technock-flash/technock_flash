import { useState, useEffect, useCallback } from "react";
import { vendorApi, type VendorOrder } from "../../../services/api/vendorApi";
import { formatPrice } from "../../../shared/utils/format";
import styles from "../../admin/pages/VendorTable.module.css";

export function VendorOrdersPage() {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    setError(null);
    vendorApi.getMyOrders()
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div>
      <div className={styles.header}>
        <h1>My Orders</h1>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "#e74c3c" }}>{error}</p>}
      {!loading && !error && (
        <>
          {orders.length === 0 ? (
            <p>You do not have any orders yet.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.orderNumber}</td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>{o.customerName}</td>
                    <td>{formatPrice(o.totalCents)}</td>
                    <td>{o.status}</td>
                    <td>
                      {/* Actions like "View Details" or "Update Status" can go here */}
                      <button className={styles.btnEdit} disabled>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}