import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TweetCard from "./TweetCard";
import ThreadCard from "./ThreadCard";
import ArticleCard from "./ArticleCard";
import InfographicCard from "./InfographicCard";
import CarouselCard from "./CarouselCard";
import LinkedInPostCard from "./LinkedInPostCard";
import NewsletterCard from "./NewsletterCard";

const TABS = [
  { id: "summary", label: "📋 Summary", icon: "📋" },
  { id: "tweet", label: "🐦 Tweets", icon: "🐦" },
  { id: "thread", label: "🧵 Thread", icon: "🧵" },
  { id: "article", label: "📝 Article", icon: "📝" },
  { id: "carousel", label: "🎠 Carousel", icon: "🎠" },
  { id: "infographic", label: "📊 Infographic", icon: "📊" },
  { id: "linkedinPost", label: "💼 LinkedIn", icon: "💼" },
  { id: "newsletter", label: "📧 Newsletter", icon: "📧" },
];

const ContentDashboard = ({
  videoData,
  content,
  loading,
  generatingTypes,
  onGenerateSingle,
  url,
}) => {
  const [activeTab, setActiveTab] = useState("summary");

  const renderContent = () => {
    const data = content[activeTab];

    if (generatingTypes.has(activeTab)) {
      return <LoadingState type={activeTab} />;
    }

    if (!data) {
      return (
        <EmptyState
          type={activeTab}
          onGenerate={() => onGenerateSingle(activeTab)}
        />
      );
    }

    switch (activeTab) {
      case "summary":
        return <SummaryView data={data} />;
      case "tweet":
        return <TweetCard tweets={data} />;
      case "thread":
        return <ThreadCard thread={data} />;
      case "article":
        return <ArticleCard article={data} />;
      case "carousel":
        return <CarouselCard carousel={data} images={content.carouselImages} />;
      case "infographic":
        return (
          <InfographicCard
            infographic={data}
            image={content.infographicImage}
          />
        );
      case "linkedinPost":
        return <LinkedInPostCard posts={data} />;
      case "newsletter":
        return <NewsletterCard newsletter={data} />;
      default:
        return <div className="text-gray-400">Select a content type</div>;
    }
  };

  return (
    <div>
      {/* Video Info Bar */}
      {videoData && (
        <div className="mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700 flex items-center gap-4">
          <img
            src={videoData.video?.thumbnail}
            alt=""
            className="w-20 h-auto rounded-lg"
          />
          <div>
            <h3 className="text-white font-semibold">
              {videoData.video?.title}
            </h3>
            <p className="text-gray-400 text-sm">
              {videoData.video?.channelTitle}
            </p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {TABS.map((tab) => {
          const hasContent = !!content[tab.id];
          const isGenerating = generatingTypes.has(tab.id);

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-purple-600 text-white"
                  : hasContent
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-green-500/30"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label.split(" ").slice(1).join(" ")}</span>
              {isGenerating && <Spinner small />}
              {hasContent && !isGenerating && (
                <span className="w-2 h-2 bg-green-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Summary View Component
const SummaryView = ({ data }) => (
  <div className="space-y-6">
    {/* One-liner */}
    <div className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
      <h3 className="text-sm font-medium text-purple-400 mb-2">TL;DR</h3>
      <p className="text-xl text-white font-medium">{data.oneLiner}</p>
    </div>

    {/* Short Summary */}
    <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
      <h3 className="text-sm font-medium text-gray-400 mb-3">Summary</h3>
      <p className="text-gray-300 leading-relaxed whitespace-pre-line">
        {data.shortSummary}
      </p>
    </div>

    {/* Key Points */}
    <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
      <h3 className="text-sm font-medium text-gray-400 mb-3">Key Points</h3>
      <ul className="space-y-2">
        {data.bulletPoints?.map((point, i) => (
          <li key={i} className="flex items-start gap-3 text-gray-300">
            <span className="text-purple-400 mt-1">•</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>

    {/* Quotable Quotes */}
    {data.quotableQuotes?.length > 0 && (
      <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
        <h3 className="text-sm font-medium text-gray-400 mb-3">
          💬 Notable Quotes
        </h3>
        <div className="space-y-3">
          {data.quotableQuotes.map((quote, i) => (
            <blockquote
              key={i}
              className="pl-4 border-l-2 border-purple-500 text-gray-300 italic"
            >
              "{quote}"
            </blockquote>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Loading State
const LoadingState = ({ type }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
    <p className="text-gray-400">Generating {type} content...</p>
    <p className="text-gray-600 text-sm mt-1">This may take 15-30 seconds</p>
  </div>
);

// Empty State
const EmptyState = ({ type, onGenerate }) => (
  <div className="flex flex-col items-center justify-center py-20 bg-gray-800/30 rounded-xl border border-gray-700 border-dashed">
    <p className="text-gray-400 mb-4">No {type} content generated yet</p>
    <button
      onClick={onGenerate}
      className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
    >
      Generate {type}
    </button>
  </div>
);

const Spinner = ({ small }) => (
  <svg
    className={`animate-spin ${small ? "h-3 w-3" : "h-5 w-5"}`}
    viewBox="0 0 24 24"
  >
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
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

export default ContentDashboard;
