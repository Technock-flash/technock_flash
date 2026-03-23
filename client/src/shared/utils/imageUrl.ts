const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return "";

  const trimmed = String(path).trim();
  if (!trimmed) return "";

  if (/^(https?:)?\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return `${API_BASE_URL}${trimmed}`;
  }

  return `${API_BASE_URL}/${trimmed}`;
};
