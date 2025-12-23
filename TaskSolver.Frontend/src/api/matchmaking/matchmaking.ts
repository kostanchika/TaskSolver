import axios from "../axios";
import { MatchDto, QueueInfoDto } from "./types";

const api = axios.create({
  baseURL: axios.defaults.baseURL + "/api/matchmaking",
  withCredentials: true,
});

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

export const matchmakingApi = {
  getMatchById(matchId: string) {
    return api.get<MatchDto>(`/${matchId}`);
  },

  sendMatchTaskSolution(
    matchId: string,
    taskId: string,
    languageId: string,
    code: string
  ) {
    return api.post(`/${matchId}/${taskId}`, {
      languageId,
      code,
    });
  },

  getQueueInfo() {
    return api.get<QueueInfoDto>(`queue`);
  },

  joinQueue() {
    return api.post(`/queue/participants`);
  },

  leaveQueue() {
    return api.delete(`/queue/participants`);
  },
};
