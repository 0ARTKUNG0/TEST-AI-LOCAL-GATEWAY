const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const grammarFixRoute = require("./routes/grammarFix");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/grammar-fix", grammarFixRoute);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Root endpoint with API info
app.get("/", (req, res) => {
  res.json({
    name: "AI Local Gateway",
    version: "1.0.0",
    description: "Thai Grammar Correction API powered by LM Studio",
    endpoints: {
      grammarFix: {
        method: "POST",
        path: "/grammar-fix",
        description: "แก้ไขไวยากรณ์และปรับโทนภาษาไทย",
      },
      health: {
        method: "GET",
        path: "/health",
        description: "Health check endpoint",
      },
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    error: "internal_error",
    message: "เกิดข้อผิดพลาดภายในระบบ",
    details: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Local Gateway running on http://localhost:${PORT}`);
  console.log(
    `📡 LM Studio URL: ${
      process.env.LM_STUDIO_BASE_URL || "http://localhost:1234"
    }`
  );
});

module.exports = app;
