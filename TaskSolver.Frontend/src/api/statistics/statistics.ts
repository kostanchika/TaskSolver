import axios from "axios";
import { ServerStatus, SolveStatisticsDto, StatisticsDto } from "./types";
import { ProgrammingTaskDto } from "../programming-tasks/types";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/statistics`,
  withCredentials: true,
});

// Интерцепторы для обработки токенов (как у вас уже есть)
const getAccessToken = () => localStorage.getItem("accessToken");
const setAccessToken = (t: string | null) => {
  if (t) localStorage.setItem("accessToken", t);
  else localStorage.removeItem("accessToken");
};

let isRefreshing = false;
let refreshQueue: {
  resolve: (value: unknown) => void;
  reject: (reason: string) => void;
}[] = [];

const enqueueRequest = () => {
  return new Promise((resolve, reject) => {
    refreshQueue.push({ resolve, reject });
  });
};

const processQueue = (error: string | null, token = null) => {
  refreshQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  refreshQueue = [];
};

api.interceptors.request.use(
  async (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (!error.response || error.response.status !== 401)
      return Promise.reject(error);

    if (originalRequest._retry) return Promise.reject(error);
    originalRequest._retry = true;

    try {
      if (isRefreshing) {
        const newToken = await enqueueRequest();
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return api(originalRequest);
      }

      isRefreshing = true;

      const refreshResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
        { refreshToken: localStorage.getItem("refreshToken") }
      );

      const newAccessToken = refreshResponse.data.accessToken;
      setAccessToken(newAccessToken);

      processQueue(null, newAccessToken);

      originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue("", null);
      setAccessToken(null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export const solutionsApi = {
  getLeaderboard() {
    return api.get<StatisticsDto[]>(`/`);
  },

  getByUserId(userId: string) {
    return api.get<StatisticsDto>(`/${userId}`);
  },

  getMy() {
    return api.get<StatisticsDto[]>(`/my`);
  },

  getRecommendedTask() {
    return api.get<ProgrammingTaskDto>(`/my/recommendation`);
  },

  getSolveStatistics() {
    return api.get<SolveStatisticsDto>(`/admin`);
  },

  getServerResources() {
    return api.get<ServerStatus>(`/resources`);
  },

  getLogs() {
    return api.get<string>(`/logs`);
  },
};
