import { LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import { toast } from "sonner";
import Loading from "@/components/Loading";
import { useState } from "react";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isUserRoute = location.pathname.startsWith("/user");

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await axiosInstance.post("/auth/logout");
      if (response.data.success) {
        window.location.href = "/";
        toast.success("Logged out successfully");
      }
    } catch (error) {
      toast.error("Logout failed", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleHomeClick = () => {
    if (isAdminRoute) {
      navigate("/admin/dashboard");
    } else if (isUserRoute) {
      navigate("/user/kyc");
    }
  };

  if (isLoggingOut) {
    return <Loading />;
  }

  return (
    <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50 w-full">
      <div className="h-16 flex items-center justify-between w-full">
        <div className="flex items-center gap-8 pl-4 sm:pl-6 lg:pl-8">
          <button
            onClick={handleHomeClick}
            className="flex items-center gap-3 group"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>

            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
              Kyra
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3 pr-4 sm:pr-6 lg:pr-8">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2 border-border hover:bg-red-600"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};
