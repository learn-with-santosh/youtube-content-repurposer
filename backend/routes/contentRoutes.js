const express = require("express");
const router = express.Router();
const ContentController = require("../controllers/contentController");

// Analyze video (get metadata + transcript info)
router.post("/analyze", ContentController.analyzeVideo);

// Generate all or multiple content types
router.post("/generate", ContentController.generateContent);

// Generate single content type
router.post("/generate/single", ContentController.generateSingleContent);

module.exports = router;
