import styles from "./PageContainer.module.css";

interface Props {
  title?: string;
  children?: React.ReactNode;
  isLoading?: boolean;
}

export function PageContainer({ title, children, isLoading }: Props) {
  return (
    <div className={styles.root}>
      {title && <h1 className={styles.title}>{title}</h1>}
      {isLoading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        children ?? null
      )}
    </div>
  );
}
