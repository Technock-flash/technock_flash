import { useEffect, useState } from "react";
import {
  adminApi,
  type RefundWithOrder,
} from "../../../services/api/adminApi";
import { formatPrice } from "../../../shared/utils/format";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { Pagination } from "../../../shared/ui/Pagination";
import styles from "./AdminTable.module.css";

export function AdminRefundsPage() {
  const [items, setItems] = useState<RefundWithOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("PENDING");
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    adminApi
      .listRefunds({ status, page, limit: 20 })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch();
  }, [status, page]);

  const handleApprove = (id: string) => {
    adminApi.approveRefund(id).then(fetch);
  };

  const handleReject = (id: string) => {
    adminApi.rejectRefund(id).then(fetch);
  };

  return (
    <PageContainer title="Refund handling">
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
    </PageContainer>
  );
}
