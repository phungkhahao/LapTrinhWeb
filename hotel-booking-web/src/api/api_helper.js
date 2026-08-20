import axios from "axios";

const axiosApi = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});
axiosApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("hotel_booking_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) {
    if (typeof config.headers.setContentType === "function")
      config.headers.setContentType(false);
    else {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }
  }
  return config;
});

export const get = (url, config = {}) =>
  axiosApi.get(url, config).then((response) => response.data);
export const getWithParams = (url, config = {}) =>
  axiosApi.get(url, config).then((response) => response.data);
export const post = (url, data, config = {}) =>
  axiosApi.post(url, data, config).then((response) => response.data);
export const put = (url, data, config = {}) =>
  axiosApi.put(url, data, config).then((response) => response.data);
export const del = (url, config = {}) =>
  axiosApi.delete(url, config).then((response) => response.data);
