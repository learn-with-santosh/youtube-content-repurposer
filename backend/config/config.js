require("dotenv").config();

module.exports = {
  port: process.env.PORT || 5000,
  maxVideoDuration: process.env.MAX_VIDEO_DURATION || 7200,

  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3000",
  ],

  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    model: process.env.OLLAMA_MODEL || "llama3",
  },

  contentTypes: {
    TWEET: "tweet",
    THREAD: "thread",
    ARTICLE: "article",
    INFOGRAPHIC: "infographic",
    CAROUSEL: "carousel",
    LINKEDIN_POST: "linkedin_post",
    NEWSLETTER: "newsletter",
    BLOG_POST: "blog_post",
    SUMMARY: "summary",
    QUOTES: "quotes",
  },
};

