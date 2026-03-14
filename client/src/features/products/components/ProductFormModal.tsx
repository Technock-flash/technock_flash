import { useState, useEffect } from "react";
import styles from "./ProductFormModal.module.css";

type Product = {
  id: string;
  name: string;
  description?: string;
  priceCents: number;
  stock: number;
  categoryId?: string;
  imageUrls?: string[];
};

type ProductFormData = {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  images: File[];
  imagesToRemove?: string[];
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProductFormData) => Promise<void>;
  product: Partial<Product> | null;
}

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
  {
    name: "Home & Living",
    subcategories: [
      "Furniture", "Kitchen Appliances", "Home Decor", "Bedding",
      "Lighting", "Storage",
    ],
  },
  {
    name: "Beauty & Health",
    subcategories: [
      "Skincare", "Haircare", "Makeup", "Fragrances",
      "Personal Care", "Health Supplements",
    ],
  },
  {
    name: "Groceries",
    subcategories: [
      "Fresh Produce", "Beverages", "Snacks", "Dairy", "Frozen Foods",
    ],
  },
  {
    name: "Sports & Outdoor",
    subcategories: [
      "Fitness Equipment", "Camping Gear", "Bicycles", "Outdoor Clothing", "Sports Accessories",
    ],
  },
  {
    name: "Automotive",
    subcategories: [
      "Car Accessories", "Car Electronics", "Motorbike Accessories", "Tires", "Car Care",
    ],
  },
  {
    name: "Baby & Kids",
    subcategories: [
      "Baby Clothing", "Toys", "Baby Care", "Strollers", "School Supplies",
    ],
  },
  {
    name: "Books & Stationery",
    subcategories: [
      "Fiction", "Non-Fiction", "Educational", "Office Supplies", "Art Supplies",
    ],
  },
  {
    name: "Digital Products",
    subcategories: [
      "Software", "Online Courses", "Ebooks", "Digital Art",
    ],
  },
];

const INITIAL_STATE = {
  name: "",
  description: "",
  price: 0,
  stock: 0,
  categoryId: "",
  images: [] as File[],
};

export function ProductFormModal({ isOpen, onClose, onSave, product }: Props) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          name: product.name ?? "",
          description: product.description ?? "",
          price: product.priceCents ? product.priceCents / 100 : 0, // Convert cents to dollars for form
          stock: product.stock ?? 0,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newFiles],
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const toggleImageForRemoval = (url: string) => {
    setImagesToRemove((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await onSave({
        ...formData,
        imagesToRemove,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product.");
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
        <h2>{product?.id ? "Edit Product" : "Create New Product"}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}><label htmlFor="name">Product Name</label><input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required /></div>
          <div className={styles.formGroup}><label htmlFor="description">Description</label><textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} /></div>
          <div className={styles.formGroup}><label htmlFor="price">Price (in dollars)</label><input id="price" name="price" type="number" value={formData.price} onChange={handleChange} required min="0" step="0.01" /></div>
          <div className={styles.formGroup}><label htmlFor="stock">Stock</label><input id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} required min="0" /></div>
          <div className={styles.formGroup}>
            <label htmlFor="categoryId">Category</label>
            <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange} required>
              <option value="" disabled>-- Select a subcategory --</option>
              {predefinedCategories.map((category) => (
                <optgroup label={category.name} key={category.name}>
                  {category.subcategories.map((subcategory) => (
                    <option key={subcategory} value={subcategory}>{subcategory}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          
          {product?.imageUrls && product.imageUrls.length > 0 && (
            <div className={styles.formGroup}>
              <label>Existing Images</label>
              <div className={styles.existingImagesGrid}>
                {product.imageUrls.map((url) => (
                  <div key={url} className={`${styles.existingImageWrapper} ${imagesToRemove.includes(url) ? styles.markedForRemoval : ''}`}>
                    <img src={url} alt="Product" className={styles.existingImage} />
                    <button type="button" onClick={() => toggleImageForRemoval(url)} className={styles.removeBtn}>
                      {imagesToRemove.includes(url) ? 'Undo' : '×'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="images">Product Images</label>
            <input
              id="images"
              name="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className={styles.fileInput}
            />
            {formData.images.length > 0 && (
              <ul className={styles.fileList}>
                {formData.images.map((file, index) => (
                  <li key={index}>{file.name} <button type="button" onClick={() => removeImage(index)} className={styles.removeBtn}>×</button></li>
                ))}
              </ul>
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