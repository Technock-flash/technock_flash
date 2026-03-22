import {
  adminApi,
  type RefundWithOrder,
} from "../../../services/api/adminApi";
import { formatPrice } from "../../../shared/utils/format";
import { Pagination } from "../../../shared/ui/Pagination";
import { useAdminTable } from "./useAdminTable";
import styles from "./AdminTable.module.css";

export function AdminRefundsPage() {
  const { items, total, page, status, loading, error, setPage, setStatus, refetch } =
    useAdminTable<RefundWithOrder>(adminApi.listRefunds, {
      limit: 20,
      initialStatus: "PENDING",
    });

  const handleApprove = (id: string) => {
    adminApi.approveRefund(id).then(refetch);
  };

  const handleReject = (id: string) => {
    adminApi.rejectRefund(id).then(refetch);
  };

  return (
    <div>
      <h1>Refund Handling</h1>
      <div className={styles.filters}>
        {["PENDING", "APPROVED", "REJECTED", "COMPLETED"].map((s) => (
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
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "#e74c3c" }}>{error}</p>
      ) : (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td>{r.order?.orderNumber ?? r.orderId}</td>
                  <td>{formatPrice(r.amountCents)}</td>
                  <td>{r.reason ?? "-"}</td>
                  <td>{r.status}</td>
                  <td>
                    {r.status === "PENDING" && (
                      <>
                        <button
                          type="button"
                          className={styles.btnApprove}
                          onClick={() => handleApprove(r.id)}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className={styles.btnReject}
                          onClick={() => handleReject(r.id)}
                        >
                          Reject
                        </button>
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
    </div>
  );
}
