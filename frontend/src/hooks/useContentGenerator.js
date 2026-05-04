import { useState, useCallback } from "react";
import {
  analyzeVideo,
  generateAllContent,
  generateSingleContent,
} from "../services/api";
import toast from "react-hot-toast";

export const useContentGenerator = () => {
  const [videoData, setVideoData] = useState(null);
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingTypes, setGeneratingTypes] = useState(new Set());
  const [error, setError] = useState(null);

  const analyze = useCallback(async (url) => {
    setAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeVideo(url);
      setVideoData(result.data);
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
  }, []);

  const generateAll = useCallback(async (url) => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateAllContent(url);
      setVideoData((prev) => ({ ...prev, video: result.data.video }));
      setContent(result.data.content);

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
  }, []);

  const generateSingle = useCallback(async (url, contentType) => {
    setGeneratingTypes((prev) => new Set([...prev, contentType]));
    try {
      const result = await generateSingleContent(url, contentType);
      setContent((prev) => ({
        ...prev,
        [contentType]: result.data.content,
        ...(result.data.images && {
          [`${contentType}Images`]: result.data.images,
        }),
      }));
      toast.success(`${contentType} generated!`);
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
  }, []);

  const reset = useCallback(() => {
    setVideoData(null);
    setContent({});
    setError(null);
    setLoading(false);
    setGeneratingTypes(new Set());
  }, []);

  return {
    videoData,
    content,
    loading,
    analyzing,
    generatingTypes,
    error,
    analyze,
    generateAll,
    generateSingle,
    reset,
  };
};
