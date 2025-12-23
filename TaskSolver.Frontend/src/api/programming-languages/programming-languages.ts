import axios from "../axios";
import {
  ProgrammingLanguageDto,
  CreateProgrammingLanguageRequest,
  UpdateProgrammingLanguageRequest,
} from "./types";

const api = axios.create({
  baseURL: axios.defaults.baseURL + "/api/languages",
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

export const programmingLanguagesApi = {
  getAll() {
    return api.get<ProgrammingLanguageDto[]>("/");
  },

  getById(id: string) {
    return api.get<ProgrammingLanguageDto>(`/${id}`);
  },

  create(data: CreateProgrammingLanguageRequest) {
    const formData = new FormData();
    formData.append("Name", data.Name);
    formData.append("Version", data.Version);
    formData.append("Extra", data.Extra);
    formData.append("Icon", data.Icon);
    formData.append("FileExtension", data.FileExtension);
    formData.append("Interpretor", data.Interpretor);

    return api.post<ProgrammingLanguageDto>("/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  update(id: string, data: UpdateProgrammingLanguageRequest) {
    const formData = new FormData();
    if (data.Name) formData.append("Name", data.Name);
    if (data.Version) formData.append("Version", data.Version);
    if (data.Extra) formData.append("Extra", data.Extra);
    if (data.Icon) formData.append("Icon", data.Icon);
    formData.append("FileExtension", data.FileExtension);
    formData.append("Interpretor", data.Interpretor);

    return api.put<ProgrammingLanguageDto>(`/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  delete(id: string) {
    return api.delete(`/${id}`);
  },
};
