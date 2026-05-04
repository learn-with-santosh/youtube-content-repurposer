const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const config = require("./config/config");
const contentRoutes = require("./routes/contentRoutes");

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.allowedOrigins,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per window
  message: { error: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

// Body parser
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api/content", contentRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

const server = app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
});

// Set server timeout to 10 minutes
server.timeout = 600000;

