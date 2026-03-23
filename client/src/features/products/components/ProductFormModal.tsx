import { useState, useEffect } from "react";
import LazyImage from "../../../components/LazyImage";
import styles from "./ProductFormModal.module.css";
import type { Product } from "../../../services/api/productApi";

export type ProductFormData = {
  name: string;
  description: string;
  price: number; // dollars in form
  inStock: number;
  categoryId: string;
  images: File[];
  imagesToRemove?: string[];
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  product: Partial<Product> | null;
}

const INITIAL_STATE: ProductFormData = {
  name: "",
  description: "",
  price: 0,
  inStock: 0,
  categoryId: "",
  images: [],
};

const predefinedCategories = [
  {
    name: "Electronics",
    subcategories: [
      "Smartphones", "Laptops", "Tablets", "Smartwatches", "Headphones & Earbuds",
      "Gaming Consoles", "Cameras", "Computer Accessories", "Networking Devices", "Storage Devices",
    ],
  },
  {
    name: "Fashion",
    subcategories: [
      "Men's Clothing", "Women's Clothing", "Kids Clothing", "Shoes",
      "Watches", "Bags", "Sunglasses", "Jewelry",
    ],
  },
  // ... rest of categories
];

import { getImageUrl } from "../../../shared/utils/imageUrl";

export function ProductFormModal({ isOpen, onClose, onSave, product }: Props) {
  const [formData, setFormData] = useState<ProductFormData>(INITIAL_STATE);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          name: product.name ?? "",
          description: product.description ?? "",
          price: product.priceCents ? product.priceCents / 100 : 0,
          inStock: product.stock ?? 0,
          categoryId: product.categoryId ?? "",
          images: [],
        });
      } else {
        setFormData(INITIAL_STATE);
      }
      setImagesToRemove([]);
      setError(null);
    }
  }, [product, isOpen]);

  // Create client-side thumbnails for newly selected images.
  useEffect(() => {
    const urls = formData.images.map((file) => URL.createObjectURL(file));
    setImagePreviews(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
    // formData.images is the source of truth for previews.
  }, [formData.images]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "price" || name === "inStock" ? Number(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...newFiles] }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const toggleImageForRemoval = (url: string) => {
    setImagesToRemove(prev => (prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]));
  };

  const buildPayload = () => {
    const fd = new FormData();
    fd.append("name", formData.name);
    if (formData.description) fd.append("description", formData.description);
    fd.append("priceCents", String(Math.round(formData.price * 100)));
    fd.append("inStock", String(Math.max(0, Math.floor(formData.inStock))));
    if (formData.categoryId) fd.append("categoryId", formData.categoryId);

    // New images selected in this session.
    formData.images.forEach((file) => fd.append("images", file));

    // Existing image URLs the user marked for deletion.
    imagesToRemove.forEach((url) => fd.append("imagesToRemove", url));

    return fd;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const payload = buildPayload();
      console.log("Submitting product payload:", payload);
      await onSave(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} style={{ maxHeight: "90vh", overflowY: "auto" }}>
        <h2>{product?.id ? "Edit Product" : "Create New Product"}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Product Name</label>
            <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="price">Price (USD)</label>
            <input id="price" name="price" type="number" value={formData.price} onChange={handleChange} min={0} step={0.01} required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="inStock">Stock</label>
            <input
              id="inStock"
              name="inStock"
              type="number"
              value={formData.inStock}
              onChange={handleChange}
              min={0}
              step={1}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="categoryId">Category</label>
            <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange} required>
              <option value="" disabled>-- Select a subcategory --</option>
              {predefinedCategories.map(cat => (
                <optgroup label={cat.name} key={cat.name}>
                  {cat.subcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {product?.images && product.images.length > 0 && (
            <div className={styles.formGroup}>
              <label>Existing Images</label>
              <div className={styles.existingImagesGrid}>
                {product.images.map(url => (
                  <div key={url} className={`${styles.existingImageWrapper} ${imagesToRemove.includes(url) ? styles.markedForRemoval : ""}`}>
                    <LazyImage
                      src={getImageUrl(url)}
                      alt={`Existing product image ${url}`}
                      className={styles.existingImage}
                      placeholder="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect width='200' height='150' fill='%23eceff1'/%3E%3C/svg%3E"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=Not+Found";
                      }}
                    />
                    <button type="button" onClick={() => toggleImageForRemoval(url)} className={styles.removeBtn}>
                      {imagesToRemove.includes(url) ? "Undo" : "×"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="images">Product Images</label>
            <input id="images" type="file" accept="image/*" multiple onChange={handleImageChange} />
            {imagePreviews.length > 0 && (
              <div className={styles.existingImagesGrid}>
                {imagePreviews.map((url, i) => (
                  <div key={`${url}-${i}`} className={styles.existingImageWrapper}>
                    <LazyImage
                      src={url}
                      alt={`New product preview ${i + 1}`}
                      className={styles.existingImage}
                      placeholder="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect width='200' height='150' fill='%23eceff1'/%3E%3C/svg%3E"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=Not+Found";
                      }}
                    />
                    <button type="button" onClick={() => removeImage(i)} className={styles.removeBtn}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" onClick={onClose} disabled={isSaving}>Cancel</button>
            <button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductFormModal;