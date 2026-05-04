import React from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const TweetCard = ({ tweets }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const tweetViaWeb = (text) => {
    const encoded = encodeURIComponent(text);
    window.open(`https://twitter.com/intent/tweet?text=${encoded}`, "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-white">Generated Tweets</h3>
        <span className="text-sm text-gray-400">
          {tweets?.length || 0} tweets
        </span>
      </div>

      {tweets?.map((tweet, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-5 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-gray-600 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <span className="inline-block px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded mb-2">
                {tweet.style}
              </span>
              <p className="text-gray-200 whitespace-pre-line">{tweet.text}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700">
            <span
              className={`text-sm ${tweet.charCount > 280 ? "text-red-400" : "text-gray-500"}`}
            >
              {tweet.charCount || tweet.text?.length}/280 chars
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(tweet.text)}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
              >
                📋 Copy
              </button>
              <button
                onClick={() => tweetViaWeb(tweet.text)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors"
              >
                🐦 Tweet
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TweetCard;
