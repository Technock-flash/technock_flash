import { useEffect, useState } from "react";
import {
  adminApi,
  type ActivityLog,
} from "../../../services/api/adminApi";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { Pagination } from "../../../shared/ui/Pagination";
import styles from "./AdminTable.module.css";

export function AdminActivityPage() {
  const [items, setItems] = useState<ActivityLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .listActivityLogs({ page, limit: 50 })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <PageContainer title="System activity logs">
      {loading ? (
        <p>Loading...</p>
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
    </PageContainer>
  );
}
