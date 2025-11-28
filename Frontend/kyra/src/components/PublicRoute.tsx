import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import axiosInstance from "./api/axiosInstance";
import Loading from "@/components/Loading";

interface PublicRouteProps {
  children: JSX.Element;
  redirectTo?: string;
}

export const verify = async () => {
  const response = await axiosInstance.get("/auth/verify");
  return response.data;
};

const PublicRoute = ({
  children,
  redirectTo = "/admin/dashboard",
}: PublicRouteProps) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["verifyToken"],
    queryFn: verify,
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (data?.data?.user_id) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default PublicRoute;
