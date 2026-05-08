import { useState, useCallback, useEffect } from "react";
import {
  analyzeVideo,
  generateAllContent,
  generateSingleContent,
  fetchHistory,
} from "../services/api";
import toast from "react-hot-toast";

export const useContentGenerator = () => {
  const [videoData, setVideoData] = useState(null);
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingTypes, setGeneratingTypes] = useState(new Set());
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const loadHistory = useCallback(async () => {
    try {
      const result = await fetchHistory();
      setHistory(result.data);
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const analyze = useCallback(async (url) => {
    setAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeVideo(url);
      setVideoData(result.data);
      // Refresh history in background
      loadHistory();
      toast.success("Video analyzed successfully!");
      return result.data;
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setAnalyzing(false);
    }
  }, [loadHistory]);

  const generateAll = useCallback(async (url) => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateAllContent(url);
      setVideoData((prev) => ({ ...prev, video: result.data.video }));
      setContent(result.data.content);
      loadHistory();

      if (result.data.errors) {
        Object.entries(result.data.errors).forEach(([type, msg]) => {
          toast.error(`Failed to generate ${type}: ${msg}`);
        });
      }

      toast.success("Content generated successfully!");
      return result.data;
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadHistory]);

  const generateSingle = useCallback(async (url, contentType, force = false) => {
    setGeneratingTypes((prev) => new Set([...prev, contentType]));
    try {
      const result = await generateSingleContent(url, contentType, force);
      setContent((prev) => ({
        ...prev,
        [contentType]: result.data.content,
        ...(result.data.images && {
          [`${contentType}Images`]: result.data.images,
        }),
      }));
      loadHistory();
      toast.success(`${contentType} ${force ? 're-generated' : 'generated'}!`);
      return result.data;
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      toast.error(`Failed to generate ${contentType}: ${message}`);
      throw err;
    } finally {
      setGeneratingTypes((prev) => {
        const next = new Set(prev);
        next.delete(contentType);
        return next;
      });
    }
  }, [loadHistory]);


  const generateAllSequentially = useCallback(async (url, types) => {
    setLoading(true);
    for (const type of types) {
      try {
        await generateSingle(url, type);
      } catch (err) {
        // Error is already handled inside generateSingle toast
      }
    }
    setLoading(false);
  }, [generateSingle]);

  const reset = useCallback(() => {
    setVideoData(null);
    setContent({});
    setError(null);
    setLoading(false);
    setGeneratingTypes(new Set());
    loadHistory();
  }, [loadHistory]);

  return {
    videoData,
    content,
    loading,
    analyzing,
    generatingTypes,
    error,
    history,
    analyze,
    generateAll,
    generateSingle,
    generateAllSequentially,
    reset,
    loadHistory,
  };
};
