const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const path = require("path");
const serverless = require("serverless-http");

dotenv.config();

const app = express();

// ================= MIDDLEWARE =================
// ================= MIDDLEWARE =================
// ================= MIDDLEWARE =================
app.use(express.json());
app.use(cookieParser());

// Manual CORS Middleware
app.use((req, res, next) => {
    const origin = req.headers.origin;

    // Define allowed origins
    const allowedOrigins = [
        "https://job-portal-and-resume-builder.vercel.app",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176"
    ];

    // Check if origin is allowed
    let isAllowed = false;
    if (allowedOrigins.includes(origin)) {
        isAllowed = true;
    } else if (origin && origin.startsWith("https://job-portal-and-resume-builder") && origin.endsWith(".vercel.app")) {
        // Allow dynamic Vercel preview URLs
        isAllowed = true;
    }

    // Set headers if allowed
    if (isAllowed) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

    // Handle Preflight
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});

// ================= DATABASE =================
connectDB();

// ================= ROUTES =================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));

// ================= STATIC FILES =================
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// ================= TEST ROUTES =================
app.get("/", (req, res) => {
    res.send("API is running...");
});

app.get("/api/health", (req, res) => {
    res.json({ status: "OK" });
});

// ================= EXPORT FOR VERCEL =================
module.exports = serverless(app);
