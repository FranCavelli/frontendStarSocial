const TOKEN_KEY = "starsocial_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = "GET", body, formData, auth = true } = {}) {
  const headers = {};
  if (auth) {
    const t = getToken();
    if (t) headers["Authorization"] = `Bearer ${t}`;
  }
  let payload;
  if (formData) {
    payload = formData;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(path, { method, headers, body: payload });
  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const err = new Error((data && data.error) || `Error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  register: (payload) => request("/api/auth/register", { method: "POST", body: payload, auth: false }),
  login: (payload) => request("/api/auth/login", { method: "POST", body: payload, auth: false }),
  me: () => request("/api/me"),
  feed: () => request("/api/feed"),
  user: (username) => request(`/api/users/${username}`),
  users: () => request("/api/users"),
  createPost: (formData) => request("/api/posts", { method: "POST", formData }),
  ratePost: (id, stars) => request(`/api/posts/${id}/rate`, { method: "POST", body: { stars } }),
  deletePost: (id) => request(`/api/posts/${id}`, { method: "DELETE" }),
  uploadAvatar: (formData) => request("/api/profile/avatar", { method: "POST", formData }),
  updateProfile: (payload) => request("/api/profile", { method: "PATCH", body: payload }),
};
