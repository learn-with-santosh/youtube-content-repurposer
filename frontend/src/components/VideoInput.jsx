import React, { useState } from "react";
import { motion } from "framer-motion";

const CONTENT_TYPES = [
  { id: "tweet", label: "🐦 Tweets", description: "Viral-worthy tweets" },
  { id: "thread", label: "🧵 Thread", description: "Twitter/X thread" },
  { id: "article", label: "📝 Article", description: "Blog post / article" },
  {
    id: "infographic",
    label: "📊 Infographic",
    description: "Visual infographic",
  },
  {
    id: "carousel",
    label: "🎠 Carousel",
    description: "Instagram/LinkedIn slides",
  },
  { id: "linkedin_post", label: "💼 LinkedIn", description: "LinkedIn post" },
  { id: "newsletter", label: "📧 Newsletter", description: "Email newsletter" },
  { id: "summary", label: "📋 Summary", description: "Key points summary" },
];

const VideoInput = ({
  onAnalyze,
  onGenerate,
  videoData,
  analyzing,
  loading,
  error,
}) => {
  const [url, setUrl] = useState("");
  const [selectedTypes, setSelectedTypes] = useState(
    new Set(CONTENT_TYPES.map((t) => t.id)),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    if (!videoData) {
      await onAnalyze(url);
    } else {
      await onGenerate(url, Array.from(selectedTypes));
    }
  };

  const toggleType = (id) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () =>
    setSelectedTypes(new Set(CONTENT_TYPES.map((t) => t.id)));
  const selectNone = () => setSelectedTypes(new Set());

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-5xl font-bold text-white mb-4">
          Transform YouTube Videos into
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {" "}
            Multi-Platform Content
          </span>
        </h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Paste a YouTube link and get tweets, threads, articles, infographics,
          carousel posts, and more — all AI-powered.
        </p>
      </motion.div>

      {/* URL Input */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
        className="mb-8"
      >
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube video URL here..."
              className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              required
            />
            {url && (
              <button
                type="button"
                onClick={() => {
                  setUrl("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={analyzing || loading || !url.trim()}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
          >
            {analyzing ? (
              <span className="flex items-center gap-2">
                <Spinner /> Analyzing...
              </span>
            ) : loading ? (
              <span className="flex items-center gap-2">
                <Spinner /> Generating...
              </span>
            ) : videoData ? (
              "🚀 Generate Content"
            ) : (
              "🔍 Analyze Video"
            )}
          </button>
        </div>
      </motion.form>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400"
        >
          ⚠️ {error}
        </motion.div>
      )}

      {/* Video Preview */}
      {videoData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl"
        >
          <div className="flex gap-6">
            <img
              src={videoData.video.thumbnails?.medium?.url}
              alt={videoData.video.title}
              className="w-48 h-auto rounded-lg"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">
                {videoData.video.title}
              </h3>
              <p className="text-gray-400 text-sm mb-3">
                {videoData.video.channelTitle} •{" "}
                {videoData.video.formattedDuration}
              </p>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>👁 {formatNumber(videoData.video.viewCount)} views</span>
                <span>👍 {formatNumber(videoData.video.likeCount)} likes</span>
                <span>
                  📝 {videoData.transcript.wordCount.toLocaleString()} words
                </span>
                <span>📄 {videoData.transcript.segmentCount} segments</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {videoData.keyPhrases?.slice(0, 6).map((phrase, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                  >
                    {phrase.word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Content Type Selection */}
      {videoData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Select Content Types to Generate
            </h3>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                Select All
              </button>
              <span className="text-gray-600">|</span>
              <button
                onClick={selectNone}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CONTENT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => toggleType(type.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedTypes.has(type.id)
                    ? "border-purple-500 bg-purple-500/10 text-white"
                    : "border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600"
                }`}
              >
                <div className="text-lg mb-1">{type.label}</div>
                <div className="text-xs opacity-70">{type.description}</div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Spinner component
const Spinner = () => (
  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num?.toString() || "0";
};

export default VideoInput;
