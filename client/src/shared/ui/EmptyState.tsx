interface Props {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: Props) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "3rem 1rem",
        color: "#888",
      }}
    >
      <h3 style={{ margin: "0 0 0.5rem", color: "#aaa" }}>{title}</h3>
      {description && <p style={{ margin: "0 0 1rem" }}>{description}</p>}
      {action}
    </div>
  );
}
