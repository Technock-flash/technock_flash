import { adminApi, type AdminUser } from "../../../services/api/adminApi";
import { Pagination } from "../../../shared/ui/Pagination";
import { useAdminTable } from "../hooks/useAdminTable";
import { useEntityManagement } from "../../../shared/hooks/useEntityManagement";
import styles from "./AdminTable.module.css";
import { UserFormModal } from "../components/UserFormModal";

export function AdminUsersPage() {
  const { items, total, page, loading, error, search, sortBy, sortOrder, setPage, setSearch, onSort, refetch } =
    useAdminTable<AdminUser>(adminApi.listUsers, { limit: 20 });

  const {
    isFormModalOpen,
    handleOpenCreate,
    handleCloseFormModal,
    handleSave,
  } = useEntityManagement<AdminUser>({
    // list and remove are not needed here as useAdminTable handles it
    create: adminApi.createUser,
    // update is handled by role change inline
  }, "user");

  const renderSortArrow = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === "asc" ? " ▲" : " ▼";
  };

  const SortableHeader = ({ column, label }: { column: string; label: string }) => (
    <th onClick={() => onSort(column)} className={styles.sortableHeader}>
      {label}
      {renderSortArrow(column)}
    </th>
  );

  const handleRoleChange = (id: string, role: string) => {
    adminApi.updateUserRole(id, role).then(refetch);
  };

  return (
    <div>
      <div className={styles.header}>
        <h1>User Management</h1>
        <div className={styles.headerActions}>
          <input
            type="search"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <button className={styles.createButton} onClick={handleOpenCreate}>
            Create User
          </button>
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
                <SortableHeader column="email" label="Email" />
                <SortableHeader column="role" label="Role" />
                <SortableHeader column="emailVerifiedAt" label="Verified" />
                <SortableHeader column="createdAt" label="Joined" />
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.emailVerifiedAt ? "Yes" : "No"}</td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</td>
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
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSave={handleSave}
      />
    </div>
  );
}
