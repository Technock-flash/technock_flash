import { useEffect, useState } from "react";
import { adminApi, type ProductForModeration } from "../../../services/api/adminApi";
import { formatPrice } from "../../../shared/utils/format";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { Pagination } from "../../../shared/ui/Pagination";
import styles from "./AdminTable.module.css";

export function AdminProductsPage() {
  const [items, setItems] = useState<ProductForModeration[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("PENDING");
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    adminApi
      .listProductsForModeration({ status, page, limit: 20 })
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
    adminApi.approveProduct(id).then(fetch);
  };

  const handleReject = (id: string) => {
    adminApi.rejectProduct(id).then(fetch);
  };

  return (
    <PageContainer title="Product moderation">
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
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Vendor</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
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
