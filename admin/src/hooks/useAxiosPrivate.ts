import { useEffect } from "react";
import { adminApi } from "@/lib/config";
import useAuthStore from "@/store/useAuthStore";

export const useAxiosPrivate = () => {
  const { logout } = useAuthStore();

  useEffect(() => {
    // The auth interceptor is already configured in the adminApi instance
    // We just need to handle the logout on 401 errors if needed
    const responseIntercept = adminApi.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          logout();
          // Redirect to login (this is also handled in the main config)
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );

    return () => {
      adminApi.interceptors.response.eject(responseIntercept);
    };
  }, [logout]);

  return adminApi;
};
