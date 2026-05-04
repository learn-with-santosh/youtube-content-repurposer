const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

// Ensure the database directory exists
const dbPath = path.resolve(__dirname, "../database.sqlite");

const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    channel_title TEXT,
    thumbnail_url TEXT,
    duration INTEGER,
    transcript TEXT,
    view_count INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS contents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id TEXT NOT NULL,
    content_type TEXT NOT NULL,
    content_data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES videos(id),
    UNIQUE(video_id, content_type)
  );
`);

class DBService {
  /**
   * Save video metadata and transcript
   */
  static saveVideo(videoData, transcript) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO videos 
      (id, url, title, description, channel_title, thumbnail_url, duration, transcript, view_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      videoData.id,
      `https://www.youtube.com/watch?v=${videoData.id}`,
      videoData.title,
      videoData.description,
      videoData.channelTitle,
      videoData.thumbnails?.high?.url || videoData.thumbnails?.default?.url,
      videoData.duration,
      JSON.stringify(transcript),
      videoData.viewCount
    );
  }

  /**
   * Get video metadata and transcript
   */
  static getVideo(videoId) {
    const video = db.prepare("SELECT * FROM videos WHERE id = ?").get(videoId);
    if (video) {
      video.transcript = JSON.parse(video.transcript);
      return video;
    }
    return null;
  }

  /**
   * Save generated content
   */
  static saveContent(videoId, contentType, contentData) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO contents (video_id, content_type, content_data)
      VALUES (?, ?, ?)
    `);
    stmt.run(videoId, contentType, JSON.stringify(contentData));
  }

  /**
   * Get all generated content for a video
   */
  static getAllContent(videoId) {
    const rows = db.prepare("SELECT * FROM contents WHERE video_id = ?").all(videoId);
    const content = {};
    rows.forEach(row => {
      content[row.content_type] = JSON.parse(row.content_data);
    });
    return content;
  }

  /**
   * Get specific content type for a video
   */
  static getContent(videoId, contentType) {
    const row = db.prepare("SELECT * FROM contents WHERE video_id = ? AND content_type = ?")
      .get(videoId, contentType);
    return row ? JSON.parse(row.content_data) : null;
  }

  /**
   * Get all previously processed videos
   */
  static getHistory() {
    return db.prepare("SELECT * FROM videos ORDER BY created_at DESC").all();
  }

  /**
   * Delete cache for a video
   */
  static clearCache(videoId) {
    db.prepare("DELETE FROM contents WHERE video_id = ?").run(videoId);
    db.prepare("DELETE FROM videos WHERE id = ?").run(videoId);
  }
}

module.exports = DBService;
