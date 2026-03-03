import { useEffect, useState } from "react";
import { categoryApi, type Category } from "../../../services/api/categoryApi";

export function useCategoryList(): {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
} {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    categoryApi
      .list()
      .then(setCategories)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed"))
      .finally(() => setIsLoading(false));
  }, []);

  return { categories, isLoading, error };
}
