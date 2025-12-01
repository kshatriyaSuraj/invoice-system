import axios from "axios";

const url = process.env.API_URL || process.env.API_URP || "/api";

console.log(url);
const api = axios.create({
  baseURL: url,
  headers: {
    "Content-type": "application/json",
  },
});

export default api;
