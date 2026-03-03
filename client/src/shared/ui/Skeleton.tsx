import { memo } from "react";
import styles from "./Skeleton.module.css";

interface Props {
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton = memo<Props>(({ className = "", style }) => (
  <div className={`${styles.skeleton} ${className}`.trim()} style={style} />
));
