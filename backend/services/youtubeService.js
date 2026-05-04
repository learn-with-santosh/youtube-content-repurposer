const ytdl = require("@distube/ytdl-core");

class YouTubeService {
  /**
   * Extract video ID from various YouTube URL formats
   */
  static extractVideoId(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    throw new Error(
      "Invalid YouTube URL. Please provide a valid YouTube video link.",
    );
  }

  /**
   * Fetch video metadata using ytdl-core (NO API KEY REQUIRED)
   */
  static async getVideoDetails(videoId) {
    try {
      const url = `https://www.youtube.com/watch?v=${videoId}`;
      const info = await ytdl.getBasicInfo(url);
      
      const { videoDetails } = info;

      return {
        id: videoId,
        title: videoDetails.title,
        description: videoDetails.description,
        channelTitle: videoDetails.author.name,
        channelId: videoDetails.author.id,
        publishedAt: videoDetails.publishDate,
        thumbnails: {
          default: { url: videoDetails.thumbnails[0]?.url },
          medium: { url: videoDetails.thumbnails[1]?.url || videoDetails.thumbnails[0]?.url },
          high: { url: videoDetails.thumbnails[videoDetails.thumbnails.length - 1]?.url },
        },
        tags: videoDetails.keywords || [],
        duration: videoDetails.lengthSeconds, // This is already in seconds
        viewCount: parseInt(videoDetails.viewCount || 0),
        likeCount: 0, // ytdl-core might not provide exact like counts easily anymore
        commentCount: 0,
      };
    } catch (error) {
      throw new Error(`Failed to fetch video details: ${error.message}`);
    }
  }

  /**
   * Parse duration - updated for ytdl-core which returns seconds
   */
  static parseDuration(duration) {
    return parseInt(duration) || 0;
  }

  /**
   * Format duration for display
   */
  static formatDuration(seconds) {
    const totalSeconds = parseInt(seconds) || 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${minutes}:${String(s).padStart(2, "0")}`;
  }
}

module.exports = YouTubeService;
