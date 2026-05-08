module.exports = (videoData, transcript) => `
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
