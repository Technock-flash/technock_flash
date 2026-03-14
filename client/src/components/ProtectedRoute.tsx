import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../core/hooks/useAppSelector";
import { PageLoader } from "./PageLoader";

type Role = "CUSTOMER" | "VENDOR" | "ADMIN";

interface Props {
  children: React.ReactNode;
  roles?: Role[];
}

export function ProtectedRoute({ children, roles }: Props) {
  const { user, isHydrated } = useAppSelector((s) => s.auth);
  const location = useLocation();

  if (!isHydrated) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user.role as Role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
