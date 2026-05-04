const { YoutubeTranscript } = require("youtube-transcript");

class TranscriptService {
  /**
   * Fetch transcript/captions for a YouTube video
   */
  static async getTranscript(videoId) {
    try {
      const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);

      if (!transcriptItems || transcriptItems.length === 0) {
        throw new Error("No transcript available for this video.");
      }

      // Build full text
      const fullText = transcriptItems
        .map((item) => item.text)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      // Build timestamped segments
      const segments = this.createSegments(transcriptItems);

      return {
        fullText,
        segments,
        wordCount: fullText.split(/\s+/).length,
        duration: transcriptItems[transcriptItems.length - 1]?.offset || 0,
      };
    } catch (error) {
      if (error.message.includes("No transcript")) throw error;
      throw new Error(
        `Failed to fetch transcript: ${error.message}. The video might not have captions enabled.`,
      );
    }
  }

  /**
   * Create logical segments from transcript items
   * Groups every ~30 seconds of content into segments
   */
  static createSegments(items, segmentDuration = 30) {
    const segments = [];
    let currentSegment = {
      startTime: 0,
      text: "",
      items: [],
    };

    for (const item of items) {
      const itemTime = item.offset / 1000; // Convert ms to seconds

      if (
        itemTime - currentSegment.startTime >= segmentDuration &&
        currentSegment.text
      ) {
        segments.push({
          startTime: currentSegment.startTime,
          endTime: itemTime,
          text: currentSegment.text.trim(),
          timestamp: this.formatTimestamp(currentSegment.startTime),
        });

        currentSegment = {
          startTime: itemTime,
          text: "",
          items: [],
        };
      }

      currentSegment.text += " " + item.text;
      currentSegment.items.push(item);
    }

    // Push final segment
    if (currentSegment.text.trim()) {
      segments.push({
        startTime: currentSegment.startTime,
        endTime: (items[items.length - 1]?.offset || 0) / 1000,
        text: currentSegment.text.trim(),
        timestamp: this.formatTimestamp(currentSegment.startTime),
      });
    }

    return segments;
  }

  /**
   * Format seconds to HH:MM:SS or MM:SS
   */
  static formatTimestamp(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  /**
   * Extract key topics from transcript using simple NLP
   */
  static extractKeyPhrases(text, topN = 10) {
    const stopWords = new Set([
      "the",
      "a",
      "an",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "being",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "shall",
      "can",
      "need",
      "dare",
      "ought",
      "used",
      "to",
      "of",
      "in",
      "for",
      "on",
      "with",
      "at",
      "by",
      "from",
      "as",
      "into",
      "through",
      "during",
      "before",
      "after",
      "above",
      "below",
      "between",
      "out",
      "off",
      "over",
      "under",
      "again",
      "further",
      "then",
      "once",
      "and",
      "but",
      "or",
      "nor",
      "not",
      "so",
      "yet",
      "both",
      "either",
      "neither",
      "each",
      "every",
      "all",
      "any",
      "few",
      "more",
      "most",
      "other",
      "some",
      "such",
      "no",
      "only",
      "own",
      "same",
      "than",
      "too",
      "very",
      "just",
      "because",
      "if",
      "when",
      "where",
      "how",
      "what",
      "which",
      "who",
      "whom",
      "this",
      "that",
      "these",
      "those",
      "i",
      "me",
      "my",
      "myself",
      "we",
      "our",
      "ours",
      "you",
      "your",
      "yours",
      "he",
      "him",
      "his",
      "she",
      "her",
      "hers",
      "it",
      "its",
      "they",
      "them",
      "their",
      "theirs",
      "about",
      "up",
      "going",
      "really",
      "like",
      "know",
      "think",
      "want",
      "get",
      "got",
      "right",
      "well",
      "also",
      "yeah",
      "okay",
      "um",
      "uh",
      "ah",
      "oh",
      "well",
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 3 && !stopWords.has(word));

    const freq = {};
    words.forEach((word) => {
      freq[word] = (freq[word] || 0) + 1;
    });

    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([word, count]) => ({ word, count }));
  }
}

module.exports = TranscriptService;
