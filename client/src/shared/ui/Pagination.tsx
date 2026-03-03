import { memo } from "react";
import styles from "./Pagination.module.css";

interface Props {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export const Pagination = memo<Props>(
  ({ page, pageSize, totalItems, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const hasPrev = page > 1;
    const hasNext = page < totalPages;

    return (
      <nav className={styles.root} aria-label="Pagination">
        <button
          type="button"
          disabled={!hasPrev}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <span className={styles.info}>
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </nav>
    );
  }
);
