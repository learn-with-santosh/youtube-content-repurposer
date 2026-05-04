import React from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const ThreadCard = ({ thread }) => {
  const copyThread = () => {
    const fullThread = thread.tweets
      .map((t) => `${t.position}/ ${t.text}`)
      .join("\n\n");
    navigator.clipboard.writeText(fullThread);
    toast.success("Thread copied to clipboard!");
  };

  const copySingleTweet = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  if (!thread) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">{thread.title}</h3>
          <p className="text-sm text-gray-400">
            {thread.tweets?.length} tweets in thread
          </p>
        </div>
        <button
          onClick={copyThread}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm transition-colors"
        >
          📋 Copy Full Thread
        </button>
      </div>

      <div className="relative">
        {/* Thread line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-700" />

        <div className="space-y-4">
          {thread.tweets?.map((tweet, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative pl-14"
            >
              {/* Thread node */}
              <div className="absolute left-4 top-5 w-5 h-5 bg-purple-600 rounded-full border-2 border-gray-900 z-10 flex items-center justify-center">
                <span className="text-[10px] text-white font-bold">
                  {tweet.position}
                </span>
              </div>

              <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-gray-600 transition-colors">
                <p className="text-gray-200">{tweet.text}</p>
                <div className="flex items-center justify-between mt-3">
                  <span
                    className={`text-xs ${(tweet.charCount || tweet.text?.length) > 280 ? "text-red-400" : "text-gray-500"}`}
                  >
                    {tweet.charCount || tweet.text?.length}/280
                  </span>
                  <button
                    onClick={() => copySingleTweet(tweet.text)}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Hashtags */}
      {thread.hashtags?.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {thread.hashtags.map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThreadCard;
