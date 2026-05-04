import React from "react";
import { motion } from "framer-motion";

const VideoHistory = ({ history, onSelect }) => {
  if (!history || history.length === 0) return null;

  return (
    <div className="mt-16">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-1 bg-purple-500 rounded-full" />
        <h3 className="text-xl font-bold text-white">Recently Processed</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(video.url)}
            className="group cursor-pointer bg-gray-800/40 hover:bg-gray-800/60 border border-gray-700/50 hover:border-purple-500/50 rounded-2xl overflow-hidden transition-all"
          >
            <div className="relative aspect-video">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-[10px] font-bold rounded backdrop-blur-sm">
                {video.formattedDuration}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />
            </div>
            
            <div className="p-4">
              <h4 className="text-white font-medium line-clamp-2 group-hover:text-purple-400 transition-colors mb-2">
                {video.title}
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{video.channelTitle}</span>
                <span className="text-[10px] text-gray-600">
                  {new Date(video.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default VideoHistory;
