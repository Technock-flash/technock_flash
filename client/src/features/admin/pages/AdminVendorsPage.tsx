import { useEffect, useState } from "react";
import {
  adminApi,
  type VendorWithOwner,
} from "../../../services/api/adminApi";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { Pagination } from "../../../shared/ui/Pagination";
import styles from "./AdminTable.module.css";

export function AdminVendorsPage() {
  const [items, setItems] = useState<VendorWithOwner[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("PENDING");
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    adminApi
      .listVendors({ status, page, limit: 20 })
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
    adminApi.approveVendor(id).then(fetch);
  };

  const handleReject = (id: string) => {
    adminApi.rejectVendor(id).then(fetch);
  };

  return (
    <PageContainer title="Vendor approval">
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
                <th>Name</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((v) => (
                <tr key={v.id}>
                  <td>{v.name}</td>
                  <td>{v.owner?.email ?? "-"}</td>
                  <td>{v.status}</td>
                  <td>
                    {v.status === "PENDING" && (
                      <>
                        <button
                          type="button"
                          className={styles.btnApprove}
                          onClick={() => handleApprove(v.id)}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className={styles.btnReject}
                          onClick={() => handleReject(v.id)}
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
