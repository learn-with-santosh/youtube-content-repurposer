const axios = require("axios");
const config = require("../config/config");

// Import Prompts
const tweetPrompt = require("../prompts/tweetPrompt");
const threadPrompt = require("../prompts/threadPrompt");
const articlePrompt = require("../prompts/articlePrompt");
const carouselPrompt = require("../prompts/carouselPrompt");
const infographicPrompt = require("../prompts/infographicPrompt");
const linkedinPrompt = require("../prompts/linkedinPrompt");
const newsletterPrompt = require("../prompts/newsletterPrompt");
const summaryPrompt = require("../prompts/summaryPrompt");

class AIService {
  /**
   * Generate content using local Ollama
   */
  static async generate(prompt, options = {}) {
    const {
      model = config.ollama.model,
      systemPrompt = "You are an expert content repurposing specialist who creates engaging social media and written content from video transcripts.",
    } = options;

    try {
      const response = await axios.post(`${config.ollama.baseUrl}/api/generate`, {
        model,
        prompt: `System: ${systemPrompt}\n\nUser: ${prompt}`,
        stream: false,
        format: "json",
      });

      return response.data.response;
    } catch (error) {
      console.error("Ollama Error:", error.response?.data || error.message);
      throw new Error(`Ollama generation failed: ${error.message}`);
    }
  }

  /**
   * Helper to clean JSON string from Ollama (removes markdown ticks)
   */
  static cleanJSON(jsonString) {
    if (!jsonString) return "{}";
    
    // Remove markdown code blocks if present
    let cleaned = jsonString.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```json/, "").replace(/^```/, "").replace(/```$/, "");
    }
    
    return cleaned.trim();
  }

  /**
   * Generate a single tweet (≤280 chars)
   */
  static async generateTweet(videoData, transcript) {
    const prompt = tweetPrompt(videoData, transcript);
    const result = await this.generate(prompt);
    return JSON.parse(this.cleanJSON(result));
  }

  /**
   * Generate a Twitter/X thread
   */
  static async generateThread(videoData, transcript) {
    const prompt = threadPrompt(videoData, transcript);
    const result = await this.generate(prompt);
    return JSON.parse(this.cleanJSON(result));
  }

  /**
   * Generate a full article/blog post
   */
  static async generateArticle(videoData, transcript) {
    const prompt = articlePrompt(videoData, transcript);
    const result = await this.generate(prompt);
    return JSON.parse(this.cleanJSON(result));
  }

  /**
   * Generate infographic content structure
   */
  static async generateInfographic(videoData, transcript) {
    const prompt = infographicPrompt(videoData, transcript);
    const result = await this.generate(prompt);
    return JSON.parse(this.cleanJSON(result));
  }

  /**
   * Generate carousel slides (Instagram/LinkedIn)
   */
  static async generateCarousel(videoData, transcript) {
    const prompt = carouselPrompt(videoData, transcript);
    const result = await this.generate(prompt);
    return JSON.parse(this.cleanJSON(result));
  }

  /**
   * Generate LinkedIn post
   */
  static async generateLinkedInPost(videoData, transcript) {
    const prompt = linkedinPrompt(videoData, transcript);
    const result = await this.generate(prompt);
    return JSON.parse(this.cleanJSON(result));
  }

  /**
   * Generate newsletter content
   */
  static async generateNewsletter(videoData, transcript) {
    const prompt = newsletterPrompt(videoData, transcript);
    const result = await this.generate(prompt);
    return JSON.parse(this.cleanJSON(result));
  }

  /**
   * Generate a concise summary
   */
  static async generateSummary(videoData, transcript) {
    const prompt = summaryPrompt(videoData, transcript);
    const result = await this.generate(prompt);
    return JSON.parse(this.cleanJSON(result));
  }


  /**
   * Returns a map of available content generators
   */
  static getGenerators(videoData, transcript) {
    return {
      tweet: () => this.generateTweet(videoData, transcript),
      thread: () => this.generateThread(videoData, transcript),
      article: () => this.generateArticle(videoData, transcript),
      infographic: () => this.generateInfographic(videoData, transcript),
      carousel: () => this.generateCarousel(videoData, transcript),
      linkedinPost: () => this.generateLinkedInPost(videoData, transcript),
      newsletter: () => this.generateNewsletter(videoData, transcript),
      summary: () => this.generateSummary(videoData, transcript),
    };
  }

  /**
   * Generate all content types sequentially to avoid overloading local Ollama
   */
  static async generateAll(videoData, transcript) {
    const generators = this.getGenerators(videoData, transcript);

    const results = {};
    const errors = {};

    // Process each generator one by one
    for (const [key, generator] of Object.entries(generators)) {
      try {
        console.log(`⏳ Generating ${key}...`);
        results[key] = await generator();
        console.log(`✅ ${key} generated!`);
      } catch (error) {
        console.error(`❌ Error generating ${key}:`, error.message);
        errors[key] = error.message;
      }
    }

    return { results, errors };
  }
}

module.exports = AIService;
