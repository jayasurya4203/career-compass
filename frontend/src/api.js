import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export function setToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem("cc_token", token);
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem("cc_token");
  }
}

export function loadStoredToken() {
  const t = localStorage.getItem("cc_token");
  if (t) setToken(t);
}

export default api;
