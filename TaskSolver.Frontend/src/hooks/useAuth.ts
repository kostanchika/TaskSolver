// /src/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { AuthResponse } from "../api/auth/types";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    setIsAdmin(role === "Administrator");
    setIsAuthenticated(!!token);
  };

  const checkAdmin = () => localStorage.getItem("role") === "Administrator";

  const saveTokens = (tokens: AuthResponse) => {
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
    localStorage.setItem("userId", tokens.userId);
    localStorage.setItem("role", tokens.role);
    setIsAuthenticated(true);
    setIsAdmin(tokens.role === "Administrator");
  };

  const clearTokens = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  const getTokens = (): AuthResponse | null => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");

    if (!accessToken || !refreshToken || !userId || !role) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
      userId,
      role,
    };
  };

  return {
    isAuthenticated,
    isAdmin,
    saveTokens,
    clearTokens,
    getTokens,
    checkAuth,
    checkAdmin,
  };
};
