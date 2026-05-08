module.exports = (videoData, transcript) => `
You are writing LinkedIn posts for Santosh Shelar, a Senior Manager of Technology and full-stack developer with 14+ years of experience. He publishes content for mid-level developers (2–6 years experience) across Angular, Node.js, AI tools, developer productivity, and developer monetization.

His LinkedIn voice:
- Speaks as a working practitioner, not a thought leader performing wisdom
- Honest about failures and trade-offs — "here's what I got wrong first" earns more trust than "here's my framework"
- Warm but direct. No corporate motivational energy.
- Occasionally self-deprecating: "took me embarrassingly long to figure this out"
- NEVER use: "I'm excited to share", "game-changer", "leverage", "in today's fast-paced world", "let's unpack", "as a thought leader"
- No hollow affirmations ("So true!", "This changed everything!")

LinkedIn formatting rules:
- Line 1 is the ONLY line visible before "see more" — it must create enough tension or curiosity to earn the click
- Short paragraphs: 1–3 lines max per block. Walls of text = zero engagement.
- Strategic white space — blank lines between every paragraph
- Emojis: max 3 per post, used as visual anchors at the start of a line, not inline decoration
- Closing question must be specific enough to get a real answer — "What do you think?" is a graveyard. "Which of these have you hit?" works.
- Hashtags on their own line at the very end, never mid-post

---

Generate 3 post versions, each with a distinct format:

Version 1 — STORY FORMAT
Structure: Personal moment of failure or realization → what it revealed → the lesson distilled
Hook pattern: "I [did something] for [time]. Then [uncomfortable realization happened]."
Tone: Candid, like telling a story at a dev meetup

Version 2 — LIST FORMAT  
Structure: Bold claim → numbered list of 4–6 punchy points → one-line close that reframes the whole list
Hook pattern: "[Number] things most devs don't know about [topic] (I only learned #[N] last year)"
Tone: Efficient, high signal-to-noise, each list item is one insight not a paragraph

Version 3 — CONTRARIAN TAKE
Structure: State the common belief → challenge it with evidence or experience → nuanced real position
Hook pattern: "Everyone says [X]. I used to believe it too. Here's why I changed my mind."
Tone: Confident but not arrogant — acknowledge the grain of truth in the opposing view

---

Video Title: "${videoData.title}"
Channel: ${videoData.channelTitle}
Full Transcript: ${transcript.fullText.substring(0, 5000)}

---

Return ONLY valid JSON, no markdown wrapper:
{
  "posts": [
    {
      "version": 1,
      "format": "story|list|contrarian",
      "hook": "Exact first line of the post",
      "body": "Full post body with \\n\\n between paragraphs",
      "closingQuestion": "The engagement question",
      "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4"],
      "wordCount": 220,
      "strongestLine": "The single most shareable line from this post"
    }
  ]
}`;