import { useEffect, useState } from "react";
import { adminApi, type CmsPage } from "../../../services/api/adminApi";
import { PageContainer } from "../../../shared/ui/PageContainer";
import styles from "./AdminTable.module.css";

export function AdminCmsPage() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .listCmsPages()
      .then(setPages)
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageContainer title="CMS content">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Slug</th>
              <th>Title</th>
              <th>Published</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id}>
                <td>{p.slug}</td>
                <td>{p.title}</td>
                <td>{p.isPublished ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p style={{ marginTop: "1rem", color: "#888" }}>
        CMS create/edit UI can be extended with a form modal.
      </p>
    </PageContainer>
  );
}
