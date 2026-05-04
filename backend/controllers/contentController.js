const YouTubeService = require("../services/youtubeService");
const TranscriptService = require("../services/transcriptService");
const AIService = require("../services/aiService");
const ImageService = require("../services/imageService");
const DBService = require("../services/dbService");
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
      
      // Check cache
      const cachedVideo = DBService.getVideo(videoId);
      if (cachedVideo) {
        return res.json({
          success: true,
          data: {
            video: {
              id: cachedVideo.id,
              title: cachedVideo.title,
              description: cachedVideo.description,
              channelTitle: cachedVideo.channel_title,
              thumbnail: cachedVideo.thumbnail_url,
              formattedDuration: YouTubeService.formatDuration(cachedVideo.duration),
              viewCount: cachedVideo.view_count,
            },
            transcript: {
              wordCount: cachedVideo.transcript.wordCount,
              segmentCount: cachedVideo.transcript.segments.length,
              preview: cachedVideo.transcript.fullText.substring(0, 500) + "...",
            },
            cached: true
          },
        });
      }

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

      // Step 1: Check cache first
      const videoId = YouTubeService.extractVideoId(url);
      const cachedVideo = DBService.getVideo(videoId);
      const cachedContent = DBService.getAllContent(videoId);

      let videoData = cachedVideo;
      let transcript = cachedVideo?.transcript;

      if (!videoData) {
        videoData = await YouTubeService.getVideoDetails(videoId);
        transcript = await TranscriptService.getTranscript(videoId);
        DBService.saveVideo(videoData, transcript);
      }

      // Step 3: Generate requested content
      let results = contentTypes.includes("all") ? cachedContent : {};
      let errors = {};

      const pendingTypes = contentTypes.includes("all") 
        ? Object.keys(AIService.getGenerators()).filter(type => !cachedContent[type])
        : contentTypes.filter(type => !cachedContent[type]);

      if (pendingTypes.length > 0) {
        const generatorMap = AIService.getGenerators(videoData, transcript);

        // Process missing types sequentially
        for (const type of pendingTypes) {
          const generator = generatorMap[type];
          if (generator) {
            try {
              const generated = await generator();
              results[type] = generated;
              DBService.saveContent(videoId, type, generated);
            } catch (error) {
              errors[type] = error.message;
            }
          }
        }
      } else {
        results = cachedContent;
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
            id: videoData.id || videoData.youtube_id,
            title: videoData.title,
            channelTitle: videoData.channelTitle || videoData.channel_title,
            thumbnail: videoData.thumbnails?.high?.url || videoData.thumbnail_url,
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

      // Check cache for this specific content
      const cachedContent = DBService.getContent(videoId, contentType);
      if (cachedContent) {
        // Still need images if carousel/infographic
        let images = null;
        if (contentType === "carousel") {
          images = await ImageService.generateCarouselImages(cachedContent);
        } else if (contentType === "infographic") {
          images = await ImageService.generateInfographicImage(cachedContent);
        }

        return res.json({
          success: true,
          data: {
            contentType,
            content: cachedContent,
            images,
            generatedAt: new Date().toISOString(),
            cached: true
          },
        });
      }

      const cachedVideo = DBService.getVideo(videoId);
      let videoData = cachedVideo;
      let transcript = cachedVideo?.transcript;

      if (!videoData) {
        videoData = await YouTubeService.getVideoDetails(videoId);
        transcript = await TranscriptService.getTranscript(videoId);
        DBService.saveVideo(videoData, transcript);
      }

      const generatorMap = AIService.getGenerators(videoData, transcript);
      const generator = generatorMap[contentType];

      if (!generator) {
        return res
          .status(400)
          .json({ error: `Unknown content type: ${contentType}` });
      }

      const content = await generator();
      DBService.saveContent(videoId, contentType, content);

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

  /**
   * GET /api/content/history
   * Fetch all previously processed videos
   */
  static async getHistory(req, res, next) {
    try {
      const history = DBService.getHistory();
      res.json({
        success: true,
        data: history.map((video) => ({
          id: video.id,
          url: video.url,
          title: video.title,
          channelTitle: video.channel_title,
          thumbnail: video.thumbnail_url,
          duration: video.duration,
          formattedDuration: YouTubeService.formatDuration(video.duration),
          createdAt: video.created_at,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ContentController;
