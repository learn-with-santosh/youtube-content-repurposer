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

export const generateAllContent = async (url, force = false) => {
  const response = await api.post("/content/generate", {
    url,
    contentTypes: ["all"],
    force,
  });
  return response.data;
};

export const generateSingleContent = async (url, contentType, force = false) => {
  const response = await api.post("/content/generate/single", {
    url,
    contentType,
    force,
  });
  return response.data;
};

export const generateSelectedContent = async (url, contentTypes, force = false) => {
  const response = await api.post("/content/generate", {
    url,
    contentTypes,
    force,
  });
  return response.data;
};


export const fetchHistory = async () => {
  const response = await api.get("/content/history");
  return response.data;
};

export default api;

