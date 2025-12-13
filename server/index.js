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
app.use(express.json());

app.use(cors({
    origin: "https://job-portal-and-resume-builder.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Handle preflight requests
app.options("*", cors({
    origin: "https://job-portal-and-resume-builder.vercel.app",
    credentials: true
}));

app.use(cookieParser());

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
