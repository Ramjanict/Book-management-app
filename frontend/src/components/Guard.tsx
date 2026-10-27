import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../app/store";
import { useMeQuery } from "../features/api";
import type { Role } from "../types";
import { PageLoader } from "./ui";

export function RequireAuth({ roles }: { roles?: Role[] }) {
  const { accessToken, user } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const { isLoading } = useMeQuery(undefined, { skip: !accessToken });

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!user && isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/forbidden" replace />;
  return <Outlet />;
}
