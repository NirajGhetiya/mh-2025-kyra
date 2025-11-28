import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import axiosInstance from "./api/axiosInstance";
import Loading from "@/components/Loading";

interface ProtectedRouteProps {
  children: JSX.Element;
}

export const verify = async () => {
  const response = await axiosInstance.get("/auth/verify");
  return response.data;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["verifyToken"],
    queryFn: verify,
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !data?.data?.user_id) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;