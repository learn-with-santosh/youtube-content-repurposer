module.exports = (videoData, transcript) => `
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
