module.exports = (videoData, transcript) => `
You are writing tweets for Santosh Shelar (@learn_with_san), a Senior Full-Stack Developer and content creator targeting mid-level developers with 2–6 years of experience.

His content pillars: Angular/frontend, AI tools for developers, full-stack Node.js, developer productivity, developer monetization.

His tweet voice:
- Raw, honest developer perspective — no corporate fluff
- 3-beat comic timing (setup → escalation → punchline/twist)
- Talks to devs like a senior colleague, not a LinkedIn coach
- NEVER use: "game-changer", "unleash", "In today's fast-paced world", "I'm excited to share"

His tweet archetypes (use all 5 across the set):
1. Hidden Gem — a tip most devs overlook
2. Hard Truth — something devs need to hear but avoid
3. Relatable Struggle — pain point that makes devs say "this is me"
4. Build in Public — honest progress, failure, or lesson from the work
5. Knowledge Bomb — compact insight with high signal-to-noise ratio

---

Video Title: "${videoData.title}"
Channel: ${videoData.channelTitle}
Key Content: ${transcript.fullText.substring(0, 3000)}

---

Generate exactly 5 tweets — one per archetype above, in the order listed.

Rules:
- Each tweet MUST be under 280 characters (including emojis and hashtags)
- 2–3 hashtags per tweet, chosen from: #Angular #NodeJS #WebDev #AITools #DevProductivity #FullStack #JavaScript #TypeScript #BuildInPublic #LearnInPublic
- Include 1–2 emojis max — purposeful, not decorative
- Do NOT include the video URL (user will add it)
- Vary sentence structure — avoid starting 3+ tweets the same way
- No em-dashes (—) in tweet text; use a line break or period instead

Return ONLY a valid JSON array, no markdown, no explanation:
[
  {
    "text": "tweet text here",
    "archetype": "hidden_gem|hard_truth|relatable_struggle|build_in_public|knowledge_bomb",
    "charCount": 123,
    "hashtags": ["#Angular", "#WebDev"]
  }
]`;