module.exports = (videoData, transcript) => `
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
