module.exports = (videoData, transcript) => `
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
