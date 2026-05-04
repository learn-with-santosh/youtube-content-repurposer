const axios = require("axios");
const config = require("../config/config");

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
        format: "json", // Request JSON format if the prompt asks for it
      });

      // Ollama returns { response: "text" }
      return response.data.response;
    } catch (error) {
      console.error("Ollama Error:", error.response?.data || error.message);
      throw new Error(`Ollama generation failed: ${error.message}`);
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

    const result = await this.generate(prompt);
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

    const result = await this.generate(prompt);
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

    const result = await this.generate(prompt);
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

    const result = await this.generate(prompt);
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

    const result = await this.generate(prompt);
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

    const result = await this.generate(prompt);
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

    const result = await this.generate(prompt);
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

    const result = await this.generate(prompt);
    return JSON.parse(result);
  }

  /**
   * Generate all content types sequentially to avoid overloading local Ollama
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
