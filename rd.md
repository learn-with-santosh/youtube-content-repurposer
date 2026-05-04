# YouTube Content Repurposing Tool - Complete Architecture & Implementation

## 🎯 Overview

I'll build a comprehensive tool that takes YouTube video links, extracts content, and generates multiple content formats using AI.

---

## 📁 Project Structure

```
youtube-content-repurposer/
├── backend/
│   ├── package.json
│   ├── .env
│   ├── server.js
│   ├── config/
│   │   └── config.js
│   ├── services/
│   │   ├── youtubeService.js
│   │   ├── transcriptService.js
│   │   ├── aiService.js
│   │   └── imageService.js
│   ├── controllers/
│   │   └── contentController.js
│   ├── routes/
│   │   └── contentRoutes.js
│   ├── utils/
│   │   └── helpers.js
│   └── templates/
│       ├── carousel.js
│       └── infographic.js
├── frontend/
│   ├── package.json
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.js
│   │   ├── components/
│   │   │   ├── VideoInput.jsx
│   │   │   ├── ContentDashboard.jsx
│   │   │   ├── TweetCard.jsx
│   │   │   ├── ThreadCard.jsx
│   │   │   ├── ArticleCard.jsx
│   │   │   ├── InfographicCard.jsx
│   │   │   ├── CarouselCard.jsx
│   │   │   ├── LinkedInPostCard.jsx
│   │   │   ├── NewsletterCard.jsx
│   │   │   ├── ContentPreview.jsx
│   │   │   └── ExportButton.jsx
│   │   ├── hooks/
│   │   │   └── useContentGenerator.js
│   │   ├── services/
│   │   │   └── api.js
│   │   └── styles/
│   │       └── App.css
│   └── tailwind.config.js
└── README.md
```

---

## 🔧 Backend Implementation

### 1. Package.json

```json
{
  "name": "youtube-content-repurposer-backend",
  "version": "1.0.0",
  "description": "YouTube Content Repurposing Tool",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "openai": "^4.20.0",
    "youtube-transcript": "^1.0.6",
    "ytdl-core": "^4.11.5",
    "googleapis": "^128.0.0",
    "sharp": "^0.33.0",
    "canvas": "^2.11.2",
    "html-pdf-node": "^1.0.8",
    "nodemon": "^3.0.2",
    "express-rate-limit": "^7.1.4",
    "helmet": "^7.1.0"
  }
}
```

### 2. Environment Variables (.env)

```env
PORT=5000
OPENAI_API_KEY=your_openai_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
NODE_ENV=development
MAX_VIDEO_DURATION=7200
ALLOWED_ORIGINS=http://localhost:3000
```

### 3. Config (config/config.js)

```javascript
require("dotenv").config();

module.exports = {
  port: process.env.PORT || 5000,
  openaiApiKey: process.env.OPENAI_API_KEY,
  youtubeApiKey: process.env.YOUTUBE_API_KEY,
  maxVideoDuration: process.env.MAX_VIDEO_DURATION || 7200,
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3000",
  ],

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

  aiModels: {
    default: "gpt-4o-mini",
    advanced: "gpt-4o",
  },
};
```

### 4. Server Entry Point (server.js)

```javascript
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const config = require("./config/config");
const contentRoutes = require("./routes/contentRoutes");

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.allowedOrigins,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per window
  message: { error: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

// Body parser
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api/content", contentRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
});
```

### 5. YouTube Service (services/youtubeService.js)

```javascript
const { google } = require("googleapis");
const config = require("../config/config");

const youtube = google.youtube({
  version: "v3",
  auth: config.youtubeApiKey,
});

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
   * Fetch video metadata from YouTube API
   */
  static async getVideoDetails(videoId) {
    try {
      const response = await youtube.videos.list({
        part: ["snippet", "contentDetails", "statistics"],
        id: [videoId],
      });

      if (!response.data.items || response.data.items.length === 0) {
        throw new Error("Video not found. Please check the URL and try again.");
      }

      const video = response.data.items[0];
      const { snippet, contentDetails, statistics } = video;

      return {
        id: videoId,
        title: snippet.title,
        description: snippet.description,
        channelTitle: snippet.channelTitle,
        channelId: snippet.channelId,
        publishedAt: snippet.publishedAt,
        thumbnails: snippet.thumbnails,
        tags: snippet.tags || [],
        categoryId: snippet.categoryId,
        duration: contentDetails.duration,
        viewCount: parseInt(statistics.viewCount || 0),
        likeCount: parseInt(statistics.likeCount || 0),
        commentCount: parseInt(statistics.commentCount || 0),
      };
    } catch (error) {
      if (error.message.includes("Video not found")) throw error;
      throw new Error(`Failed to fetch video details: ${error.message}`);
    }
  }

  /**
   * Parse ISO 8601 duration to seconds
   */
  static parseDuration(duration) {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);

    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Format duration for display
   */
  static formatDuration(duration) {
    const totalSeconds = this.parseDuration(duration);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }
}

module.exports = YouTubeService;
```

### 6. Transcript Service (services/transcriptService.js)

```javascript
const { YoutubeTranscript } = require("youtube-transcript");

class TranscriptService {
  /**
   * Fetch transcript/captions for a YouTube video
   */
  static async getTranscript(videoId) {
    try {
      const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);

      if (!transcriptItems || transcriptItems.length === 0) {
        throw new Error("No transcript available for this video.");
      }

      // Build full text
      const fullText = transcriptItems
        .map((item) => item.text)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      // Build timestamped segments
      const segments = this.createSegments(transcriptItems);

      return {
        fullText,
        segments,
        wordCount: fullText.split(/\s+/).length,
        duration: transcriptItems[transcriptItems.length - 1]?.offset || 0,
      };
    } catch (error) {
      if (error.message.includes("No transcript")) throw error;
      throw new Error(
        `Failed to fetch transcript: ${error.message}. The video might not have captions enabled.`,
      );
    }
  }

  /**
   * Create logical segments from transcript items
   * Groups every ~30 seconds of content into segments
   */
  static createSegments(items, segmentDuration = 30) {
    const segments = [];
    let currentSegment = {
      startTime: 0,
      text: "",
      items: [],
    };

    for (const item of items) {
      const itemTime = item.offset / 1000; // Convert ms to seconds

      if (
        itemTime - currentSegment.startTime >= segmentDuration &&
        currentSegment.text
      ) {
        segments.push({
          startTime: currentSegment.startTime,
          endTime: itemTime,
          text: currentSegment.text.trim(),
          timestamp: this.formatTimestamp(currentSegment.startTime),
        });

        currentSegment = {
          startTime: itemTime,
          text: "",
          items: [],
        };
      }

      currentSegment.text += " " + item.text;
      currentSegment.items.push(item);
    }

    // Push final segment
    if (currentSegment.text.trim()) {
      segments.push({
        startTime: currentSegment.startTime,
        endTime: (items[items.length - 1]?.offset || 0) / 1000,
        text: currentSegment.text.trim(),
        timestamp: this.formatTimestamp(currentSegment.startTime),
      });
    }

    return segments;
  }

  /**
   * Format seconds to HH:MM:SS or MM:SS
   */
  static formatTimestamp(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  /**
   * Extract key topics from transcript using simple NLP
   */
  static extractKeyPhrases(text, topN = 10) {
    const stopWords = new Set([
      "the",
      "a",
      "an",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "being",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "shall",
      "can",
      "need",
      "dare",
      "ought",
      "used",
      "to",
      "of",
      "in",
      "for",
      "on",
      "with",
      "at",
      "by",
      "from",
      "as",
      "into",
      "through",
      "during",
      "before",
      "after",
      "above",
      "below",
      "between",
      "out",
      "off",
      "over",
      "under",
      "again",
      "further",
      "then",
      "once",
      "and",
      "but",
      "or",
      "nor",
      "not",
      "so",
      "yet",
      "both",
      "either",
      "neither",
      "each",
      "every",
      "all",
      "any",
      "few",
      "more",
      "most",
      "other",
      "some",
      "such",
      "no",
      "only",
      "own",
      "same",
      "than",
      "too",
      "very",
      "just",
      "because",
      "if",
      "when",
      "where",
      "how",
      "what",
      "which",
      "who",
      "whom",
      "this",
      "that",
      "these",
      "those",
      "i",
      "me",
      "my",
      "myself",
      "we",
      "our",
      "ours",
      "you",
      "your",
      "yours",
      "he",
      "him",
      "his",
      "she",
      "her",
      "hers",
      "it",
      "its",
      "they",
      "them",
      "their",
      "theirs",
      "about",
      "up",
      "going",
      "really",
      "like",
      "know",
      "think",
      "want",
      "get",
      "got",
      "right",
      "well",
      "also",
      "yeah",
      "okay",
      "um",
      "uh",
      "ah",
      "oh",
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 3 && !stopWords.has(word));

    const freq = {};
    words.forEach((word) => {
      freq[word] = (freq[word] || 0) + 1;
    });

    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([word, count]) => ({ word, count }));
  }
}

module.exports = TranscriptService;
```

### 7. AI Service (services/aiService.js)

```javascript
const OpenAI = require("openai");
const config = require("../config/config");

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

class AIService {
  /**
   * Generate content using OpenAI
   */
  static async generate(prompt, options = {}) {
    const {
      model = config.aiModels.default,
      maxTokens = 2000,
      temperature = 0.7,
      systemPrompt = "You are an expert content repurposing specialist who creates engaging social media and written content from video transcripts.",
    } = options;

    try {
      const response = await openai.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        max_tokens: maxTokens,
        temperature,
      });

      return response.choices[0].message.content;
    } catch (error) {
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  /**
   * Generate a single tweet (≤280 chars)
   */
  static async generateTweet(videoData, transcript) {
    const prompt = `
Create 5 engaging tweets based on this YouTube video.

Video Title: "${videoData.title}"
Channel: ${videoData.channelTitle}
Key Content: ${transcript.fullText.substring(0, 3000)}

Requirements:
- Each tweet MUST be under 280 characters
- Make them attention-grabbing and shareable
- Include relevant emojis
- Include 2-3 relevant hashtags per tweet
- Vary the style: hook, insight, quote, stat, question
- Do NOT include the video link (user will add it)

Return as JSON array:
[
  {
    "text": "tweet text here",
    "style": "hook|insight|quote|stat|question",
    "charCount": 123
  }
]

Return ONLY valid JSON, no markdown.`;

    const result = await this.generate(prompt, { temperature: 0.8 });
    return JSON.parse(result);
  }

  /**
   * Generate a Twitter/X thread
   */
  static async generateThread(videoData, transcript) {
    const prompt = `
Create an engaging Twitter/X thread based on this YouTube video.

Video Title: "${videoData.title}"
Channel: ${videoData.channelTitle}
Description: ${videoData.description?.substring(0, 500)}
Full Transcript: ${transcript.fullText.substring(0, 6000)}

Requirements:
- Create 8-12 tweets in a thread format
- First tweet should be a compelling hook
- Last tweet should be a call-to-action / summary
- Each tweet MUST be under 280 characters
- Use numbering (1/, 2/, etc.)
- Include relevant emojis
- Make it educational and value-packed
- Include hashtags only in the last tweet

Return as JSON:
{
  "title": "Thread title/topic",
  "tweets": [
    {
      "position": 1,
      "text": "tweet text",
      "charCount": 123
    }
  ],
  "hashtags": ["#tag1", "#tag2"]
}

Return ONLY valid JSON, no markdown.`;

    const result = await this.generate(prompt, {
      maxTokens: 3000,
      temperature: 0.7,
    });
    return JSON.parse(result);
  }

  /**
   * Generate a full article/blog post
   */
  static async generateArticle(videoData, transcript) {
    const prompt = `
Write a comprehensive, well-structured article based on this YouTube video.

Video Title: "${videoData.title}"
Channel: ${videoData.channelTitle}
Description: ${videoData.description?.substring(0, 500)}
Full Transcript: ${transcript.fullText.substring(0, 8000)}

Requirements:
- Write a 800-1200 word article
- Include a compelling headline (different from video title)
- Include a meta description (150-160 chars)
- Structure with clear sections: Introduction, Main Body (3-5 sections with subheadings), Conclusion
- Write in a professional but engaging tone
- Add key takeaways as bullet points
- Include a TL;DR at the top
- Make it SEO-friendly

Return as JSON:
{
  "headline": "Article headline",
  "metaDescription": "SEO meta description",
  "tldr": "Brief summary in 2-3 sentences",
  "sections": [
    {
      "heading": "Section heading",
      "content": "Section content in markdown format"
    }
  ],
  "keyTakeaways": ["takeaway 1", "takeaway 2"],
  "suggestedTags": ["tag1", "tag2"],
  "wordCount": 1000
}

Return ONLY valid JSON, no markdown wrapper.`;

    const result = await this.generate(prompt, {
      maxTokens: 4000,
      temperature: 0.6,
      model: config.aiModels.advanced,
    });
    return JSON.parse(result);
  }

  /**
   * Generate infographic content structure
   */
  static async generateInfographic(videoData, transcript) {
    const prompt = `
Create content for a visually appealing infographic based on this YouTube video.

Video Title: "${videoData.title}"
Channel: ${videoData.channelTitle}
Full Transcript: ${transcript.fullText.substring(0, 5000)}

Requirements:
- Create a structured infographic with 5-7 sections
- Include a catchy title
- Extract key statistics, facts, and data points
- Create short, punchy text blocks
- Suggest icons/visual elements for each section
- Include a flow or progression

Return as JSON:
{
  "title": "Infographic title",
  "subtitle": "Brief subtitle",
  "colorScheme": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex"
  },
  "sections": [
    {
      "order": 1,
      "heading": "Section heading",
      "content": "Brief content (max 50 words)",
      "icon": "suggested emoji/icon name",
      "type": "stat|fact|tip|step|quote",
      "highlight": "Key number or phrase to emphasize"
    }
  ],
  "footer": "Source or call-to-action text",
  "suggestedLayout": "vertical|horizontal|circular"
}

Return ONLY valid JSON, no markdown.`;

    const result = await this.generate(prompt, { temperature: 0.7 });
    return JSON.parse(result);
  }

  /**
   * Generate carousel slides (Instagram/LinkedIn)
   */
  static async generateCarousel(videoData, transcript) {
    const prompt = `
Create content for a social media carousel (Instagram/LinkedIn) based on this YouTube video.

Video Title: "${videoData.title}"
Channel: ${videoData.channelTitle}
Full Transcript: ${transcript.fullText.substring(0, 5000)}

Requirements:
- Create 7-10 carousel slides
- Slide 1: Eye-catching title/hook slide
- Slides 2-8: Content slides with one key point each
- Last slide: Call-to-action / summary
- Each slide should have minimal text (max 30 words)
- Include a subtitle or supporting text for each slide
- Make it educational and visually structured

Return as JSON:
{
  "title": "Carousel title",
  "platform": "instagram",
  "slides": [
    {
      "slideNumber": 1,
      "type": "cover|content|cta",
      "headline": "Main text on slide",
      "subtext": "Supporting text (optional)",
      "emoji": "relevant emoji",
      "backgroundColor": "#hex",
      "textColor": "#hex",
      "tip": "Design tip for this slide"
    }
  ],
  "hashtags": ["#tag1", "#tag2"],
  "caption": "Suggested post caption"
}

Return ONLY valid JSON, no markdown.`;

    const result = await this.generate(prompt, {
      maxTokens: 3000,
      temperature: 0.7,
    });
    return JSON.parse(result);
  }

  /**
   * Generate LinkedIn post
   */
  static async generateLinkedInPost(videoData, transcript) {
    const prompt = `
Create an engaging LinkedIn post based on this YouTube video.

Video Title: "${videoData.title}"
Channel: ${videoData.channelTitle}
Full Transcript: ${transcript.fullText.substring(0, 5000)}

Requirements:
- Create 3 different LinkedIn post versions
- Each should be 150-300 words
- Start with a strong hook (first line is crucial)
- Use line breaks for readability
- Include relevant emojis (but don't overuse)
- End with a question to encourage engagement
- Include 3-5 relevant hashtags
- Professional but conversational tone

Return as JSON:
{
  "posts": [
    {
      "style": "storytelling|listicle|insight",
      "hook": "First line hook",
      "body": "Full post text with line breaks (use \\n)",
      "hashtags": ["#tag1", "#tag2"],
      "wordCount": 200
    }
  ]
}

Return ONLY valid JSON, no markdown.`;

    const result = await this.generate(prompt, { temperature: 0.8 });
    return JSON.parse(result);
  }

  /**
   * Generate newsletter content
   */
  static async generateNewsletter(videoData, transcript) {
    const prompt = `
Create a newsletter edition based on this YouTube video.

Video Title: "${videoData.title}"
Channel: ${videoData.channelTitle}
Full Transcript: ${transcript.fullText.substring(0, 6000)}

Requirements:
- Catchy subject line (and 2 alternatives)
- Preview text (40-90 chars)
- Greeting/intro paragraph
- 3-4 main content sections with headers
- Key quotes or highlights in callout boxes
- Action items or takeaways
- Closing with CTA

Return as JSON:
{
  "subjectLines": ["Subject 1", "Subject 2", "Subject 3"],
  "previewText": "Email preview text",
  "greeting": "Opening paragraph",
  "sections": [
    {
      "heading": "Section heading",
      "content": "Section content in markdown",
      "callout": "Optional highlighted quote or stat"
    }
  ],
  "actionItems": ["Action 1", "Action 2"],
  "closing": "Closing paragraph with CTA",
  "ps": "Optional P.S. line"
}

Return ONLY valid JSON, no markdown.`;

    const result = await this.generate(prompt, {
      maxTokens: 3000,
      temperature: 0.6,
    });
    return JSON.parse(result);
  }

  /**
   * Generate a concise summary
   */
  static async generateSummary(videoData, transcript) {
    const prompt = `
Create a comprehensive summary of this YouTube video.

Video Title: "${videoData.title}"
Channel: ${videoData.channelTitle}
Full Transcript: ${transcript.fullText.substring(0, 8000)}

Return as JSON:
{
  "oneLiner": "One sentence summary",
  "shortSummary": "2-3 paragraph summary (200 words)",
  "bulletPoints": ["Key point 1", "Key point 2", "..."],
  "timestamps": [
    {
      "topic": "Topic discussed",
      "description": "Brief description"
    }
  ],
  "quotableQuotes": ["Notable quote 1", "Notable quote 2"],
  "targetAudience": "Who would benefit from this content",
  "mainTopics": ["topic1", "topic2"]
}

Return ONLY valid JSON, no markdown.`;

    const result = await this.generate(prompt, { temperature: 0.5 });
    return JSON.parse(result);
  }

  /**
   * Generate all content types at once
   */
  static async generateAll(videoData, transcript) {
    const generators = {
      tweet: () => this.generateTweet(videoData, transcript),
      thread: () => this.generateThread(videoData, transcript),
      article: () => this.generateArticle(videoData, transcript),
      infographic: () => this.generateInfographic(videoData, transcript),
      carousel: () => this.generateCarousel(videoData, transcript),
      linkedinPost: () => this.generateLinkedInPost(videoData, transcript),
      newsletter: () => this.generateNewsletter(videoData, transcript),
      summary: () => this.generateSummary(videoData, transcript),
    };

    const results = {};
    const errors = {};

    // Run all generators in parallel with error handling for each
    await Promise.allSettled(
      Object.entries(generators).map(async ([key, generator]) => {
        try {
          results[key] = await generator();
        } catch (error) {
          console.error(`Error generating ${key}:`, error.message);
          errors[key] = error.message;
        }
      }),
    );

    return { results, errors };
  }
}

module.exports = AIService;
```

### 8. Image/Visual Service (services/imageService.js)

```javascript
const { createCanvas, registerFont } = require("canvas");
const sharp = require("sharp");

class ImageService {
  /**
   * Generate carousel slide images
   */
  static async generateCarouselImages(carouselData) {
    const slides = [];
    const width = 1080;
    const height = 1080;

    for (const slide of carouselData.slides) {
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Background
      ctx.fillStyle = slide.backgroundColor || "#1a1a2e";
      ctx.fillRect(0, 0, width, height);

      // Add decorative elements
      this.addDecorativeElements(ctx, width, height, slide.backgroundColor);

      // Emoji
      if (slide.emoji) {
        ctx.font = "80px Arial";
        ctx.textAlign = "center";
        ctx.fillText(slide.emoji, width / 2, 200);
      }

      // Headline
      ctx.fillStyle = slide.textColor || "#ffffff";
      ctx.font = "bold 48px Arial";
      ctx.textAlign = "center";
      this.wrapText(ctx, slide.headline, width / 2, 350, width - 120, 60);

      // Subtext
      if (slide.subtext) {
        ctx.fillStyle = (slide.textColor || "#ffffff") + "CC";
        ctx.font = "28px Arial";
        this.wrapText(ctx, slide.subtext, width / 2, 600, width - 160, 40);
      }

      // Slide number
      ctx.fillStyle = (slide.textColor || "#ffffff") + "80";
      ctx.font = "24px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        `${slide.slideNumber} / ${carouselData.slides.length}`,
        width / 2,
        height - 60,
      );

      // Convert to buffer
      const buffer = canvas.toBuffer("image/png");
      const optimized = await sharp(buffer).png({ quality: 90 }).toBuffer();

      slides.push({
        slideNumber: slide.slideNumber,
        image: optimized.toString("base64"),
        mimeType: "image/png",
      });
    }

    return slides;
  }

  /**
   * Generate infographic image
   */
  static async generateInfographicImage(infographicData) {
    const width = 800;
    const sectionHeight = 200;
    const headerHeight = 300;
    const footerHeight = 100;
    const height =
      headerHeight +
      infographicData.sections.length * sectionHeight +
      footerHeight;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const colors = infographicData.colorScheme || {
      primary: "#667eea",
      secondary: "#764ba2",
      accent: "#f093fb",
      background: "#0f0f23",
    };

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, colors.background);
    gradient.addColorStop(1, this.darkenColor(colors.background, 20));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Header
    ctx.fillStyle = colors.primary;
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    this.wrapText(ctx, infographicData.title, width / 2, 80, width - 80, 45);

    ctx.fillStyle = "#ffffffCC";
    ctx.font = "20px Arial";
    this.wrapText(
      ctx,
      infographicData.subtitle || "",
      width / 2,
      180,
      width - 80,
      30,
    );

    // Divider
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 220);
    ctx.lineTo(width - 100, 220);
    ctx.stroke();

    // Sections
    infographicData.sections.forEach((section, index) => {
      const y = headerHeight + index * sectionHeight;

      // Section background
      if (index % 2 === 0) {
        ctx.fillStyle = "#ffffff08";
        ctx.fillRect(40, y, width - 80, sectionHeight - 20);
      }

      // Icon/Emoji
      ctx.font = "40px Arial";
      ctx.textAlign = "left";
      ctx.fillText(section.icon || "📌", 60, y + 50);

      // Heading
      ctx.fillStyle = colors.primary;
      ctx.font = "bold 24px Arial";
      ctx.fillText(section.heading, 120, y + 45);

      // Content
      ctx.fillStyle = "#ffffffCC";
      ctx.font = "18px Arial";
      this.wrapText(ctx, section.content, 120, y + 80, width - 200, 24, "left");

      // Highlight
      if (section.highlight) {
        ctx.fillStyle = colors.accent;
        ctx.font = "bold 28px Arial";
        ctx.textAlign = "right";
        ctx.fillText(section.highlight, width - 60, y + 50);
        ctx.textAlign = "left";
      }
    });

    // Footer
    const footerY = height - footerHeight;
    ctx.fillStyle = "#ffffff60";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(infographicData.footer || "", width / 2, footerY + 50);

    const buffer = canvas.toBuffer("image/png");
    const optimized = await sharp(buffer).png({ quality: 90 }).toBuffer();

    return {
      image: optimized.toString("base64"),
      mimeType: "image/png",
      width,
      height,
    };
  }

  /**
   * Helper: Wrap text on canvas
   */
  static wrapText(ctx, text, x, y, maxWidth, lineHeight, align = "center") {
    ctx.textAlign = align;
    const words = text.split(" ");
    let line = "";
    let currentY = y;

    for (const word of words) {
      const testLine = line + word + " ";
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && line !== "") {
        ctx.fillText(line.trim(), x, currentY);
        line = word + " ";
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
  }

  /**
   * Helper: Add decorative elements
   */
  static addDecorativeElements(ctx, width, height, bgColor) {
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = "#ffffff";

    // Circles
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 100 + 50,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  /**
   * Helper: Darken a hex color
   */
  static darkenColor(hex, percent) {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max(((num >> 8) & 0x00ff) - amt, 0);
    const B = Math.max((num & 0x0000ff) - amt, 0);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  }
}

module.exports = ImageService;
```

### 9. Content Controller (controllers/contentController.js)

```javascript
const YouTubeService = require("../services/youtubeService");
const TranscriptService = require("../services/transcriptService");
const AIService = require("../services/aiService");
const ImageService = require("../services/imageService");
const config = require("../config/config");

class ContentController {
  /**
   * POST /api/content/analyze
   * Analyze a YouTube video and return metadata + transcript
   */
  static async analyzeVideo(req, res, next) {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({ error: "YouTube URL is required" });
      }

      const videoId = YouTubeService.extractVideoId(url);
      const videoData = await YouTubeService.getVideoDetails(videoId);

      // Check video duration
      const durationSeconds = YouTubeService.parseDuration(videoData.duration);
      if (durationSeconds > config.maxVideoDuration) {
        return res.status(400).json({
          error: `Video is too long (${YouTubeService.formatDuration(videoData.duration)}). Maximum allowed duration is ${config.maxVideoDuration / 60} minutes.`,
        });
      }

      const transcript = await TranscriptService.getTranscript(videoId);
      const keyPhrases = TranscriptService.extractKeyPhrases(
        transcript.fullText,
      );

      res.json({
        success: true,
        data: {
          video: {
            ...videoData,
            formattedDuration: YouTubeService.formatDuration(
              videoData.duration,
            ),
          },
          transcript: {
            wordCount: transcript.wordCount,
            segmentCount: transcript.segments.length,
            preview: transcript.fullText.substring(0, 500) + "...",
          },
          keyPhrases,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/content/generate
   * Generate specific content type(s) from a YouTube video
   */
  static async generateContent(req, res, next) {
    try {
      const { url, contentTypes = ["all"] } = req.body;

      if (!url) {
        return res.status(400).json({ error: "YouTube URL is required" });
      }

      // Step 1: Extract video info
      const videoId = YouTubeService.extractVideoId(url);
      const videoData = await YouTubeService.getVideoDetails(videoId);

      // Step 2: Get transcript
      const transcript = await TranscriptService.getTranscript(videoId);

      // Step 3: Generate requested content
      let results = {};
      let errors = {};

      if (contentTypes.includes("all")) {
        const allContent = await AIService.generateAll(videoData, transcript);
        results = allContent.results;
        errors = allContent.errors;
      } else {
        const generatorMap = {
          tweet: () => AIService.generateTweet(videoData, transcript),
          thread: () => AIService.generateThread(videoData, transcript),
          article: () => AIService.generateArticle(videoData, transcript),
          infographic: () =>
            AIService.generateInfographic(videoData, transcript),
          carousel: () => AIService.generateCarousel(videoData, transcript),
          linkedin_post: () =>
            AIService.generateLinkedInPost(videoData, transcript),
          newsletter: () => AIService.generateNewsletter(videoData, transcript),
          summary: () => AIService.generateSummary(videoData, transcript),
        };

        await Promise.allSettled(
          contentTypes.map(async (type) => {
            const generator = generatorMap[type];
            if (generator) {
              try {
                results[type] = await generator();
              } catch (error) {
                errors[type] = error.message;
              }
            } else {
              errors[type] = `Unknown content type: ${type}`;
            }
          }),
        );
      }

      // Step 4: Generate images if applicable
      if (results.carousel) {
        try {
          results.carouselImages = await ImageService.generateCarouselImages(
            results.carousel,
          );
        } catch (e) {
          errors.carouselImages = e.message;
        }
      }

      if (results.infographic) {
        try {
          results.infographicImage =
            await ImageService.generateInfographicImage(results.infographic);
        } catch (e) {
          errors.infographicImage = e.message;
        }
      }

      res.json({
        success: true,
        data: {
          video: {
            id: videoData.id,
            title: videoData.title,
            channelTitle: videoData.channelTitle,
            thumbnail: videoData.thumbnails?.high?.url,
            formattedDuration: YouTubeService.formatDuration(
              videoData.duration,
            ),
          },
          content: results,
          errors: Object.keys(errors).length > 0 ? errors : undefined,
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/content/generate/single
   * Generate a single content type (for lazy loading)
   */
  static async generateSingleContent(req, res, next) {
    try {
      const { url, contentType } = req.body;

      if (!url || !contentType) {
        return res.status(400).json({
          error: "YouTube URL and contentType are required",
        });
      }

      const videoId = YouTubeService.extractVideoId(url);
      const videoData = await YouTubeService.getVideoDetails(videoId);
      const transcript = await TranscriptService.getTranscript(videoId);

      const generatorMap = {
        tweet: () => AIService.generateTweet(videoData, transcript),
        thread: () => AIService.generateThread(videoData, transcript),
        article: () => AIService.generateArticle(videoData, transcript),
        infographic: () => AIService.generateInfographic(videoData, transcript),
        carousel: () => AIService.generateCarousel(videoData, transcript),
        linkedin_post: () =>
          AIService.generateLinkedInPost(videoData, transcript),
        newsletter: () => AIService.generateNewsletter(videoData, transcript),
        summary: () => AIService.generateSummary(videoData, transcript),
      };

      const generator = generatorMap[contentType];
      if (!generator) {
        return res
          .status(400)
          .json({ error: `Unknown content type: ${contentType}` });
      }

      const content = await generator();

      // Generate images if applicable
      let images = null;
      if (contentType === "carousel") {
        images = await ImageService.generateCarouselImages(content);
      } else if (contentType === "infographic") {
        images = await ImageService.generateInfographicImage(content);
      }

      res.json({
        success: true,
        data: {
          contentType,
          content,
          images,
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ContentController;
```

### 10. Routes (routes/contentRoutes.js)

```javascript
const express = require("express");
const router = express.Router();
const ContentController = require("../controllers/contentController");

// Analyze video (get metadata + transcript info)
router.post("/analyze", ContentController.analyzeVideo);

// Generate all or multiple content types
router.post("/generate", ContentController.generateContent);

// Generate single content type
router.post("/generate/single", ContentController.generateSingleContent);

module.exports = router;
```

### 11. Helpers (utils/helpers.js)

```javascript
class Helpers {
  static truncate(text, maxLength = 280) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
  }

  static sanitizeForJSON(text) {
    return text
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t");
  }

  static estimateReadingTime(wordCount) {
    const wordsPerMinute = 200;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  }

  static formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  }
}

module.exports = Helpers;
```

---

## 🎨 Frontend Implementation

### 1. Package.json

```json
{
  "name": "youtube-content-repurposer-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "axios": "^1.6.2",
    "react-markdown": "^9.0.1",
    "react-hot-toast": "^2.4.1",
    "lucide-react": "^0.294.0",
    "html2canvas": "^1.4.1",
    "file-saver": "^2.0.5",
    "framer-motion": "^10.16.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}
```

### 2. API Service (src/services/api.js)

```javascript
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes timeout for AI generation
  headers: {
    "Content-Type": "application/json",
  },
});

export const analyzeVideo = async (url) => {
  const response = await api.post("/content/analyze", { url });
  return response.data;
};

export const generateAllContent = async (url) => {
  const response = await api.post("/content/generate", {
    url,
    contentTypes: ["all"],
  });
  return response.data;
};

export const generateSingleContent = async (url, contentType) => {
  const response = await api.post("/content/generate/single", {
    url,
    contentType,
  });
  return response.data;
};

export const generateSelectedContent = async (url, contentTypes) => {
  const response = await api.post("/content/generate", {
    url,
    contentTypes,
  });
  return response.data;
};

export default api;
```

### 3. Custom Hook (src/hooks/useContentGenerator.js)

```javascript
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
```

### 4. Main App Component (src/App.jsx)

```jsx
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
```

### 5. Video Input Component (src/components/VideoInput.jsx)

```jsx
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
```

### 6. Content Dashboard (src/components/ContentDashboard.jsx)

```jsx
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
```

### 7. Tweet Card (src/components/TweetCard.jsx)

```jsx
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
```

### 8. Thread Card (src/components/ThreadCard.jsx)

```jsx
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
```

### 9. Article Card (src/components/ArticleCard.jsx)

```jsx
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";

const ArticleCard = ({ article }) => {
  const [viewMode, setViewMode] = useState("preview"); // preview | raw

  if (!article) return null;

  const copyArticle = () => {
    const fullArticle = [
      `# ${article.headline}`,
      "",
      `> ${article.tldr}`,
      "",
      ...article.sections.map((s) => `## ${s.heading}\n\n${s.content}`),
      "",
      "## Key Takeaways",
      ...article.keyTakeaways.map((t) => `- ${t}`),
    ].join("\n");

    navigator.clipboard.writeText(fullArticle);
    toast.success("Article copied as Markdown!");
  };

  const copyHTML = () => {
    // Simple markdown to HTML (basic)
    const html = `
      <article>
        <h1>${article.headline}</h1>
        <blockquote>${article.tldr}</blockquote>
        ${article.sections.map((s) => `<h2>${s.heading}</h2><div>${s.content}</div>`).join("")}
        <h2>Key Takeaways</h2>
        <ul>${article.keyTakeaways.map((t) => `<li>${t}</li>`).join("")}</ul>
      </article>
    `;
    navigator.clipboard.writeText(html);
    toast.success("Article copied as HTML!");
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("preview")}
            className={`px-3 py-1.5 rounded-lg text-sm ${viewMode === "preview" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400"}`}
          >
            Preview
          </button>
          <button
            onClick={() => setViewMode("raw")}
            className={`px-3 py-1.5 rounded-lg text-sm ${viewMode === "raw" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400"}`}
          >
            Markdown
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyArticle}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm"
          >
            📋 Copy MD
          </button>
          <button
            onClick={copyHTML}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm"
          >
            🌐 Copy HTML
          </button>
        </div>
      </div>

      {/* Meta Info */}
      <div className="mb-6 p-4 bg-gray-800/30 rounded-xl border border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Meta Description:</span>
            <p className="text-gray-300 mt-1">{article.metaDescription}</p>
          </div>
          <div>
            <span className="text-gray-500">Tags:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {article.suggestedTags?.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="p-8 bg-gray-800/50 border border-gray-700 rounded-xl">
        {viewMode === "preview" ? (
          <article className="prose prose-invert prose-purple max-w-none">
            <h1 className="text-3xl font-bold text-white mb-4">
              {article.headline}
            </h1>

            <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-400 mb-6">
              {article.tldr}
            </blockquote>

            {article.sections?.map((section, i) => (
              <div key={i} className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-3">
                  {section.heading}
                </h2>
                <div className="text-gray-300 leading-relaxed">
                  <ReactMarkdown>{section.content}</ReactMarkdown>
                </div>
              </div>
            ))}

            <div className="mt-8 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">
                📌 Key Takeaways
              </h3>
              <ul className="space-y-2">
                {article.keyTakeaways?.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300">
                    <span className="text-purple-400">✓</span>
                    {takeaway}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ) : (
          <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono overflow-x-auto">
            {`# ${article.headline}

> ${article.tldr}

${article.sections?.map((s) => `## ${s.heading}\n\n${s.content}`).join("\n\n")}

## Key Takeaways
${article.keyTakeaways?.map((t) => `- ${t}`).join("\n")}`}
          </pre>
        )}
      </div>
    </div>
  );
};

export default ArticleCard;
```

### 10. Carousel Card (src/components/CarouselCard.jsx)

```jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const CarouselCard = ({ carousel, images }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!carousel) return null;

  const slides = carousel.slides || [];

  const nextSlide = () =>
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

  const downloadSlide = (index) => {
    if (images?.[index]) {
      const link = document.createElement("a");
      link.href = `data:${images[index].mimeType};base64,${images[index].image}`;
      link.download = `slide-${index + 1}.png`;
      link.click();
      toast.success(`Slide ${index + 1} downloaded!`);
    }
  };

  const downloadAll = () => {
    images?.forEach((img, i) => {
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = `data:${img.mimeType};base64,${img.image}`;
        link.download = `carousel-slide-${i + 1}.png`;
        link.click();
      }, i * 500);
    });
    toast.success("Downloading all slides...");
  };

  const copyCaption = () => {
    navigator.clipboard.writeText(carousel.caption || "");
    toast.success("Caption copied!");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">{carousel.title}</h3>
        <div className="flex gap-2">
          {images && (
            <button
              onClick={downloadAll}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm"
            >
              ⬇️ Download All
            </button>
          )}
        </div>
      </div>

      {/* Carousel Preview */}
      <div className="flex gap-8">
        {/* Slide Preview */}
        <div className="flex-1">
          <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-square max-w-md mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-8"
                style={{
                  backgroundColor:
                    slides[currentSlide]?.backgroundColor || "#1a1a2e",
                  color: slides[currentSlide]?.textColor || "#ffffff",
                }}
              >
                {images?.[currentSlide] ? (
                  <img
                    src={`data:${images[currentSlide].mimeType};base64,${images[currentSlide].image}`}
                    alt={`Slide ${currentSlide + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <span className="text-5xl mb-4">
                      {slides[currentSlide]?.emoji}
                    </span>
                    <h4 className="text-2xl font-bold text-center mb-3">
                      {slides[currentSlide]?.headline}
                    </h4>
                    {slides[currentSlide]?.subtext && (
                      <p className="text-center opacity-80 text-sm">
                        {slides[currentSlide].subtext}
                      </p>
                    )}
                    <span className="absolute bottom-4 text-xs opacity-50">
                      {currentSlide + 1} / {slides.length}
                    </span>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white disabled:opacity-30"
            >
              ‹
            </button>
            <button
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white disabled:opacity-30"
            >
              ›
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentSlide ? "bg-purple-500" : "bg-gray-600"
                }`}
              />
            ))}
          </div>

          {images?.[currentSlide] && (
            <div className="flex justify-center mt-3">
              <button
                onClick={() => downloadSlide(currentSlide)}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm"
              >
                ⬇️ Download This Slide
              </button>
            </div>
          )}
        </div>

        {/* Slide List */}
        <div className="w-72 space-y-2 max-h-[500px] overflow-y-auto">
          {slides.map((slide, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                i === currentSlide
                  ? "bg-purple-600/20 border border-purple-500"
                  : "bg-gray-800 border border-gray-700 hover:border-gray-600"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-gray-500">
                  #{i + 1}
                </span>
                <span>{slide.emoji}</span>
                <span className="text-xs px-1.5 py-0.5 bg-gray-700 rounded text-gray-400">
                  {slide.type}
                </span>
              </div>
              <p className="text-gray-300 text-xs line-clamp-2">
                {slide.headline}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Caption */}
      {carousel.caption && (
        <div className="mt-6 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-400">
              Suggested Caption
            </h4>
            <button
              onClick={copyCaption}
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              📋 Copy
            </button>
          </div>
          <p className="text-gray-300 text-sm whitespace-pre-line">
            {carousel.caption}
          </p>
          {carousel.hashtags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {carousel.hashtags.map((tag, i) => (
                <span key={i} className="text-blue-400 text-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CarouselCard;
```

### 11. Infographic Card (src/components/InfographicCard.jsx)

```jsx
import React from "react";
import toast from "react-hot-toast";

const InfographicCard = ({ infographic, image }) => {
  if (!infographic) return null;

  const downloadImage = () => {
    if (image) {
      const link = document.createElement("a");
      link.href = `data:${image.mimeType};base64,${image.image}`;
      link.download = "infographic.png";
      link.click();
      toast.success("Infographic downloaded!");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">
          {infographic.title}
        </h3>
        {image && (
          <button
            onClick={downloadImage}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm"
          >
            ⬇️ Download Image
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Preview */}
        {image && (
          <div className="flex justify-center">
            <img
              src={`data:${image.mimeType};base64,${image.image}`}
              alt="Infographic"
              className="max-w-full rounded-xl shadow-2xl"
              style={{ maxHeight: "700px" }}
            />
          </div>
        )}

        {/* Content Structure */}
        <div className="space-y-4">
          <p className="text-gray-400">{infographic.subtitle}</p>

          {infographic.sections?.map((section, i) => (
            <div
              key={i}
              className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{section.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white">
                      {section.heading}
                    </h4>
                    {section.highlight && (
                      <span className="text-purple-400 font-bold">
                        {section.highlight}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-1">
                    {section.content}
                  </p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-gray-700 text-gray-400 rounded text-xs">
                    {section.type}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Color Scheme */}
          <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
            <h4 className="text-sm font-medium text-gray-400 mb-3">
              Color Scheme
            </h4>
            <div className="flex gap-3">
              {Object.entries(infographic.colorScheme || {}).map(
                ([name, color]) => (
                  <div key={name} className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg border border-gray-600"
                      style={{ backgroundColor: color }}
                    />
                    <div>
                      <span className="text-xs text-gray-500 block">
                        {name}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        {color}
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfographicCard;
```

### 12. LinkedIn Post Card (src/components/LinkedInPostCard.jsx)

```jsx
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
```

### 13. Newsletter Card (src/components/NewsletterCard.jsx)

```jsx
import React from "react";
import toast from "react-hot-toast";

const NewsletterCard = ({ newsletter }) => {
  if (!newsletter) return null;

  const copyNewsletter = () => {
    const text = [
      `Subject: ${newsletter.subjectLines?.[0]}`,
      "",
      newsletter.greeting,
      "",
      ...newsletter.sections.map(
        (s) =>
          `## ${s.heading}\n\n${s.content}${s.callout ? `\n\n> ${s.callout}` : ""}`,
      ),
      "",
      "## Action Items",
      ...newsletter.actionItems.map((a) => `- ${a}`),
      "",
      newsletter.closing,
      newsletter.ps ? `\nP.S. ${newsletter.ps}` : "",
    ].join("\n");

    navigator.clipboard.writeText(text);
    toast.success("Newsletter copied!");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Newsletter Draft</h3>
        <button
          onClick={copyNewsletter}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm"
        >
          📋 Copy Newsletter
        </button>
      </div>

      {/* Subject Lines */}
      <div className="mb-6 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
        <h4 className="text-sm font-medium text-gray-400 mb-3">
          📧 Subject Line Options
        </h4>
        {newsletter.subjectLines?.map((subject, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0"
          >
            <p className="text-gray-200">{subject}</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(subject);
                toast.success("Subject copied!");
              }}
              className="text-xs text-gray-500 hover:text-gray-300"
            >
              Copy
            </button>
          </div>
        ))}
        {newsletter.previewText && (
          <p className="text-xs text-gray-500 mt-2">
            Preview: {newsletter.previewText}
          </p>
        )}
      </div>

      {/* Email Preview */}
      <div className="max-w-2xl mx-auto bg-white rounded-xl overflow-hidden shadow-xl">
        {/* Email header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-center">
          <h2 className="text-2xl font-bold text-white">
            {newsletter.subjectLines?.[0]}
          </h2>
        </div>

        {/* Email body */}
        <div className="p-8">
          <p className="text-gray-700 mb-6 leading-relaxed">
            {newsletter.greeting}
          </p>

          {newsletter.sections?.map((section, i) => (
            <div key={i} className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {section.heading}
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
              {section.callout && (
                <div className="mt-4 p-4 bg-purple-50 border-l-4 border-purple-500 rounded-r-lg">
                  <p className="text-purple-800 italic">{section.callout}</p>
                </div>
              )}
            </div>
          ))}

          {/* Action Items */}
          <div className="my-8 p-6 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              ✅ Action Items
            </h3>
            <ul className="space-y-2">
              {newsletter.actionItems?.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700">
                  <span>☐</span> {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-gray-600 leading-relaxed">{newsletter.closing}</p>

          {newsletter.ps && (
            <p className="mt-6 text-sm text-gray-500 italic">
              P.S. {newsletter.ps}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsletterCard;
```

### 14. Styles (src/styles/App.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #1f2937;
}

::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Prose overrides for dark mode */
.prose-invert h1,
.prose-invert h2,
.prose-invert h3 {
  color: #f3f4f6;
}

.prose-invert p {
  color: #d1d5db;
}

.prose-invert blockquote {
  color: #9ca3af;
  border-left-color: #8b5cf6;
}

.prose-invert ul li {
  color: #d1d5db;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

/* Line clamp */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

---

## 🚀 How to Run

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys
npm run dev
```

### Frontend Setup

```bash
cd frontend
npx create-react-app . --template minimal
# Or use the existing package.json
npm install
npx tailwindcss init -p
npm start
```

### Tailwind Config (frontend/tailwind.config.js)

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gray: {
          850: "#1a1d2e",
        },
      },
    },
  },
  plugins: [],
};
```

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│                                                          │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Video    │  │   Content    │  │   Export/Download  │  │
│  │  Input    │──│  Dashboard   │──│   Components      │  │
│  └──────────┘  └──────────────┘  └───────────────────┘  │
│                       │                                   │
│              ┌────────┴────────┐                          │
│              │   API Service   │                          │
│              └────────┬────────┘                          │
└───────────────────────┼──────────────────────────────────┘
                        │ HTTP/REST
┌───────────────────────┼──────────────────────────────────┐
│                 BACKEND (Node.js/Express)                  │
│                        │                                   │
│              ┌─────────┴─────────┐                        │
│              │  Content Routes   │                        │
│              └─────────┬─────────┘                        │
│                        │                                   │
│              ┌─────────┴─────────┐                        │
│              │Content Controller │                        │
│              └──┬─────┬─────┬───┘                        │
│                 │     │     │                              │
│  ┌──────────┐ ┌┴─────┴┐ ┌──┴────────┐ ┌──────────────┐  │
│  │ YouTube  │ │Trans- │ │    AI     │ │   Image      │  │
│  │ Service  │ │cript  │ │  Service  │ │   Service    │  │
│  └────┬─────┘ │Service│ └─────┬─────┘ └──────┬───────┘  │
│       │       └───┬───┘       │               │          │
└───────┼───────────┼───────────┼───────────────┼──────────┘
        │           │           │               │
   ┌────┴────┐ ┌────┴────┐ ┌───┴─────┐  ┌──────┴──────┐
   │YouTube  │ │YouTube  │ │ OpenAI  │  │   Canvas    │
   │Data API │ │Transcript│ │  GPT-4  │  │   Sharp     │
   └─────────┘ └─────────┘ └─────────┘  └─────────────┘
```

---

## 🔑 API Endpoints

| Method | Endpoint                       | Description                              |
| ------ | ------------------------------ | ---------------------------------------- |
| `POST` | `/api/content/analyze`         | Analyze video, get metadata & transcript |
| `POST` | `/api/content/generate`        | Generate multiple content types          |
| `POST` | `/api/content/generate/single` | Generate a single content type           |
| `GET`  | `/api/health`                  | Health check                             |

### Request Examples

```bash
# Analyze
curl -X POST http://localhost:5000/api/content/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'

# Generate all content
curl -X POST http://localhost:5000/api/content/generate \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "contentTypes": ["all"]}'

# Generate specific types
curl -X POST http://localhost:5000/api/content/generate \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "contentTypes": ["tweet", "thread", "article"]}'
```

---

## ✨ Key Features

| Feature                 | Description                                                     |
| ----------------------- | --------------------------------------------------------------- |
| 🎬 **Video Analysis**   | Extracts metadata, stats, transcript, key phrases               |
| 🐦 **Tweets**           | 5 viral tweets in different styles (hook, insight, quote, etc.) |
| 🧵 **Thread**           | 8-12 tweet thread with hook and CTA                             |
| 📝 **Article**          | Full 800-1200 word SEO-optimized blog post                      |
| 📊 **Infographic**      | Structured data with auto-generated visual                      |
| 🎠 **Carousel**         | 7-10 slide carousel with downloadable images                    |
| 💼 **LinkedIn**         | 3 LinkedIn post variants (storytelling, listicle, insight)      |
| 📧 **Newsletter**       | Complete email with subject lines, sections, CTAs               |
| 📋 **Summary**          | One-liner, bullet points, quotes, key topics                    |
| 🖼️ **Image Generation** | Auto-generated carousel slides & infographic images             |
| 📋 **Copy/Export**      | One-click copy, download images, Markdown/HTML export           |
