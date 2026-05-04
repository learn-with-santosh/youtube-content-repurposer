import React, { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const LinkedInPostCard = ({ posts }) => {
  const [activePost, setActivePost] = useState(0);

  if (!posts?.posts) return null;

  const currentPost = posts.posts[activePost];

  const copyPost = (post) => {
    const fullPost = `${post.body}\n\n${post.hashtags?.join(" ") || ""}`;
    navigator.clipboard.writeText(fullPost);
    toast.success("LinkedIn post copied!");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">LinkedIn Posts</h3>
        <div className="flex gap-2">
          {posts.posts.map((post, i) => (
            <button
              key={i}
              onClick={() => setActivePost(i)}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                i === activePost
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {post.style}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={activePost}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto"
      >
        {/* LinkedIn-style preview */}
        <div className="bg-white rounded-xl overflow-hidden shadow-xl">
          {/* Post header */}
          <div className="p-4 flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              You
            </div>
            <div>
              <p className="font-semibold text-gray-900">Your Name</p>
              <p className="text-xs text-gray-500">Your Headline • 1st</p>
              <p className="text-xs text-gray-500">Just now • 🌐</p>
            </div>
          </div>

          {/* Post content */}
          <div className="px-4 pb-4">
            <p className="text-gray-800 whitespace-pre-line text-sm leading-relaxed">
              {currentPost.body?.replace(/\\n/g, "\n")}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {currentPost.hashtags?.map((tag, i) => (
                <span key={i} className="text-blue-600 text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Post actions */}
          <div className="px-4 py-2 border-t border-gray-200 flex justify-between">
            <span className="text-xs text-gray-500">👍 ❤️ 💡 42</span>
            <span className="text-xs text-gray-500">5 comments</span>
          </div>
          <div className="px-4 py-2 border-t border-gray-200 flex justify-around">
            {["👍 Like", "💬 Comment", "🔄 Repost", "📤 Send"].map(
              (action, i) => (
                <button
                  key={i}
                  className="text-xs text-gray-600 font-medium py-2 px-4 hover:bg-gray-100 rounded"
                >
                  {action}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={() => copyPost(currentPost)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm"
          >
            📋 Copy Post
          </button>
          <span className="text-gray-500 text-sm self-center">
            {currentPost.wordCount} words
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default LinkedInPostCard;
