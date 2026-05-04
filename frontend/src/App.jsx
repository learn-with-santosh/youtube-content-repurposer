import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import VideoInput from "./components/VideoInput";
import ContentDashboard from "./components/ContentDashboard";
import { useContentGenerator } from "./hooks/useContentGenerator";
import "./styles/App.css";

function App() {
  const [url, setUrl] = useState("");
  const [step, setStep] = useState("input"); // input | dashboard

  const {
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
  } = useContentGenerator();

  const handleAnalyze = async (videoUrl) => {
    setUrl(videoUrl);
    await analyze(videoUrl);
  };

  const handleGenerate = async (videoUrl, selectedTypes) => {
    setUrl(videoUrl);
    await generateAll(videoUrl);
    setStep("dashboard");
  };

  const handleGenerateSingle = async (contentType) => {
    await generateSingle(url, contentType);
  };

  const handleReset = () => {
    reset();
    setUrl("");
    setStep("input");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1f2937",
            color: "#f3f4f6",
            border: "1px solid #374151",
          },
        }}
      />

      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-xl">🎬</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">ContentForge</h1>
              <p className="text-xs text-gray-400">
                YouTube → Multi-format Content
              </p>
            </div>
          </div>

          {step === "dashboard" && (
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
            >
              ← New Video
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {step === "input" && (
          <VideoInput
            onAnalyze={handleAnalyze}
            onGenerate={handleGenerate}
            videoData={videoData}
            analyzing={analyzing}
            loading={loading}
            error={error}
          />
        )}

        {step === "dashboard" && (
          <ContentDashboard
            videoData={videoData}
            content={content}
            loading={loading}
            generatingTypes={generatingTypes}
            onGenerateSingle={handleGenerateSingle}
            url={url}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          ContentForge — Transform any YouTube video into multi-platform content
        </div>
      </footer>
    </div>
  );
}

export default App;
