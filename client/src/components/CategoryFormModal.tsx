import { useState, useEffect } from "react";
import type { Category } from "../../../services/api/adminApi";
import styles from "./CategoryFormModal.module.css";

type CategoryFormData = {
  name: string;
  slug: string;
  parentId: string | null;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CategoryFormData) => Promise<void>;
  category: Partial<Category> | null;
  allCategories: Category[];
}

export function CategoryFormModal({
  isOpen,
  onClose,
  onSave,
  category,
  allCategories,
}: Props) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    parentId: "" as string | null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name ?? "",
        slug: category.slug ?? "",
        parentId: category.parentId ?? null,
      });
    } else {
      // Reset for new category
      setFormData({ name: "", slug: "", parentId: null });
    }
    setError(null);
  }, [category, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // Treat empty string from select as null
    setFormData((prev) => ({ ...prev, [name]: value === "" ? null : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await onSave(formData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save category."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  // Prevent a category from being its own parent
  const possibleParents = allCategories.filter((c) => c.id !== category?.id);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{category?.id ? "Edit Category" : "Create New Category"}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Name</label>
            <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="slug">Slug</label>
            <input id="slug" name="slug" type="text" value={formData.slug} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="parentId">Parent Category</label>
            <select id="parentId" name="parentId" value={formData.parentId ?? ""} onChange={handleChange} className={styles.select}>
              <option value="">-- None (Top Level) --</option>
              {possibleParents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
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