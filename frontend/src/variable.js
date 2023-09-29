import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_BASED_URL,
  timeout: 100000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
