import { useEffect } from "react";
import { registerLoadingSetter } from "./api/axiosInstance";
import Loading from "./Loading";
import { useLoading } from "@/contexts/LoadingContext";

const GlobalLoading = () => {
  const { loading, setLoading } = useLoading();

  useEffect(() => {
    registerLoadingSetter(setLoading);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <Loading />
    </div>
  );
};

export default GlobalLoading;