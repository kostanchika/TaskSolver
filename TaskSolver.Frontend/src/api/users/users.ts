import axios from "../axios";
import { GetUsersResult, ProfileDto, UpdateProfileRequest } from "./types";

const api = axios.create({
  baseURL: axios.defaults.baseURL + "/api/users",
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

export const usersApi = {
  getProfilesAdmin(
    email: string,
    profileName: string,
    page: number | null,
    pageSize: number | null
  ) {
    return api.get<GetUsersResult>("/", {
      params: {
        email,
        profileName,
        page,
        pageSize,
      },
    });
  },

  getMyProfile() {
    return api.get<ProfileDto>("/me");
  },

  updateProfile(data: UpdateProfileRequest) {
    return api.put("/me", data);
  },

  updateProfileAdmin(id: string, data: UpdateProfileRequest) {
    return api.put(`/${id}`, data);
  },

  deleteProfile() {
    return api.delete("/me");
  },

  getUserById(id: string) {
    return api.get<ProfileDto>(`/${id}`);
  },

  deleteUser(id: string) {
    return api.delete(`/${id}`);
  },

  updateAvatar(avatar: File) {
    const formData = new FormData();
    formData.append("Avatar", avatar);
    return api.patch("/me/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateAvatarAdmin(id: string, avatar: File) {
    const formData = new FormData();
    formData.append("Avatar", avatar);
    return api.patch(`/${id}/avatar`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteAvatar() {
    return api.delete("/me/avatar");
  },

  deleteUserAvatar(id: string) {
    return api.delete(`/${id}/avatar`);
  },
};
