import axios from "axios";

// Prefer `API_URL` in env, keep `API_URP` as a fallback for older setups
const url =
  process.env.API_URL ||
  process.env.API_URP ||
  "https://invoice-system-phi.vercel.app/api";

const api = axios.create({
  baseURL: url,
  headers: {
    "Content-type": "application/json",
  },
});

export default api;
