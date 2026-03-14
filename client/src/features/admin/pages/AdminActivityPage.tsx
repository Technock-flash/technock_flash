import {
  adminApi,
  type ActivityLog,
} from "../../../services/api/adminApi";
import { Pagination } from "../../../shared/ui/Pagination";
import { useAdminTable } from "../hooks/useAdminTable";
import styles from "./AdminTable.module.css";

export function AdminActivityPage() {
  const { items, total, page, loading, error, setPage } = useAdminTable<ActivityLog>(
    adminApi.listActivityLogs,
    {
      limit: 50,
    }
  );

  return (
    <div>
      <h1>System Activity Logs</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "#e74c3c" }}>{error}</p>
      ) : (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Time</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Entity ID</th>
              </tr>
            </thead>
            <tbody>
              {items.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>{log.action}</td>
                  <td>{log.entity}</td>
                  <td>{log.entityId ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={page}
            pageSize={50}
            totalItems={total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
