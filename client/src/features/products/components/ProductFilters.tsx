import { memo } from "react";
import type { Category } from "../../../services/api/categoryApi";
import styles from "./ProductFilters.module.css";

export interface FilterState {
  categoryId: string;
  sort: string;
}

interface Props {
  categories: Category[];
  value: FilterState;
  onChange: (next: Partial<FilterState>) => void;
}

export const ProductFilters = memo<Props>(({ categories, value, onChange }) => {
  return (
    <div className={styles.root}>
      <label>
        Category
        <select
          value={value.categoryId}
          onChange={(e) => onChange({ categoryId: e.target.value })}
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          {categories.flatMap((c) =>
            (c.children ?? []).map((child) => (
              <option key={child.id} value={child.id}>
                — {child.name}
              </option>
            ))
          )}
        </select>
      </label>
      <label>
        Sort
        <select
          value={value.sort}
          onChange={(e) => onChange({ sort: e.target.value })}
        >
          <option value="featured">Featured</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </label>
    </div>
  );
});
