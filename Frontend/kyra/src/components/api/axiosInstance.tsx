import axios from "axios";
import { useLoading } from "@/contexts/LoadingContext";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

let loadingSetter: ((v: boolean) => void) | null = null;
export const registerLoadingSetter = (fn: (v: boolean) => void) => {
  loadingSetter = fn;
};

axiosInstance.interceptors.request.use(
  (config) => {
    loadingSetter?.(true);
    return config;
  },
  (error) => {
    loadingSetter?.(false);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    loadingSetter?.(false);
    return response;
  },
  (error) => {
    loadingSetter?.(false);
    return Promise.reject(error);
  }
);

export default axiosInstance;