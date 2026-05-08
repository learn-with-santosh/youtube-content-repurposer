module.exports = (videoData, transcript) => `
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
