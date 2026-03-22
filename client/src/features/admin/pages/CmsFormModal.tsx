import { useState, useEffect } from "react";
import type { CmsPage } from "../../../services/api/adminApi";
import styles from "./CmsFormModal.module.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<CmsPage, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  page: Partial<CmsPage> | null;
}

export function CmsFormModal({ isOpen, onClose, onSave, page }: Props) {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    isPublished: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (page) {
      setFormData({
        title: page.title ?? "",
        slug: page.slug ?? "",
        content: page.content ?? "",
        isPublished: page.isPublished ?? false,
      });
    } else {
      // Reset for new page
      setFormData({
        title: "",
        slug: "",
        content: "",
        isPublished: false,
      });
    }
    setError(null); // Reset error when modal opens/page changes
  }, [page, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
     const { name, value } = e.target;
    if (e.target instanceof HTMLInputElement && e.target.type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await onSave(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save page.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{page?.id ? "Edit Page" : "Create New Page"}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="slug">Slug</label>
            <input
              id="slug"
              name="slug"
              type="text"
              value={formData.slug}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="content">Content (Markdown)</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={10}
            />
          </div>
          <div className={styles.formGroupCheck}>
            <input
              id="isPublished"
              name="isPublished"
              type="checkbox"
              checked={formData.isPublished}
              onChange={handleChange}
            />
            <label htmlFor="isPublished">Published</label>
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.actions}>
            <button type="button" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CmsFormModal;