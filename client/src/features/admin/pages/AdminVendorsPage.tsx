import {
  adminApi,
  type VendorWithOwner,
} from "../../../services/api/adminApi";
import { Pagination } from "../../../shared/ui/Pagination";
import { useAdminTable } from "../hooks/useAdminTable";
import styles from "./AdminTable.module.css";

export function AdminVendorsPage() {
  const { items, total, page, status, loading, error, setPage, setStatus, refetch } =
    useAdminTable<VendorWithOwner>(adminApi.listVendors, {
      limit: 20,
      initialStatus: "PENDING",
    });

  const handleApprove = (id: string) => {
    adminApi.approveVendor(id).then(refetch);
  };

  const handleReject = (id: string) => {
    adminApi.rejectVendor(id).then(refetch);
  };

  return (
    <div>
      <h1>Vendor Approval</h1>
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
      ) : error ? (
        <p style={{ color: "#e74c3c" }}>{error}</p>
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
    </div>
  );
}
