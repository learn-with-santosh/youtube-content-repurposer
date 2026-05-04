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

        // Process selected types one by one
        for (const type of contentTypes) {
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
        }

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
