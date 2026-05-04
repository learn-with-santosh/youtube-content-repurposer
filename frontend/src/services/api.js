import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 600000, // 10 minutes timeout for slow local AI generation
  headers: {
    "Content-Type": "application/json",
  },
});


export const analyzeVideo = async (url) => {
  const response = await api.post("/content/analyze", { url });
  return response.data;
};

export const generateAllContent = async (url) => {
  const response = await api.post("/content/generate", {
    url,
    contentTypes: ["all"],
  });
  return response.data;
};

export const generateSingleContent = async (url, contentType) => {
  const response = await api.post("/content/generate/single", {
    url,
    contentType,
  });
  return response.data;
};

export const generateSelectedContent = async (url, contentTypes) => {
  const response = await api.post("/content/generate", {
    url,
    contentTypes,
  });
  return response.data;
};

export default api;
