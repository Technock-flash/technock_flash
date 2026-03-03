import { useEffect, useState } from "react";
import { adminApi, type AdminUser } from "../../../services/api/adminApi";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { Pagination } from "../../../shared/ui/Pagination";
import styles from "./AdminTable.module.css";

export function AdminUsersPage() {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    adminApi
      .listUsers({ page, limit: 20 })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch();
  }, [page]);

  const handleRoleChange = (id: string, role: string) => {
    adminApi.updateUserRole(id, role).then(fetch);
  };

  return (
    <PageContainer title="User management">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.emailVerifiedAt ? "Yes" : "No"}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className={styles.select}
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="VENDOR">Vendor</option>
                      <option value="ADMIN">Admin</option>
                    </select>
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
