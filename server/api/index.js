const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("../config/db");
const path = require("path");
const serverless = require("serverless-http");

dotenv.config();

const app = express();

/* ===================== DATABASE ===================== */
connectDB();

/* ===================== MIDDLEWARE ===================== */
app.use(express.json());
app.use(cookieParser());

/* ===================== CORS (FIXED, NO WILDCARD) ===================== */
const FRONTEND_URL = "https://job-portal-and-resume-builder.vercel.app";

app.use(
    cors({
        origin: FRONTEND_URL,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.options(
    "*",
    cors({
        origin: FRONTEND_URL,
        credentials: true,
    })
);

/* ===================== ROUTES ===================== */
app.use("/api/auth", require("../routes/authRoutes"));
app.use("/api/jobs", require("../routes/jobRoutes"));
app.use("/api/applications", require("../routes/applicationRoutes"));
app.use("/api/upload", require("../routes/uploadRoutes"));

/* ===================== STATIC FILES ===================== */
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* ===================== HEALTH CHECK ===================== */
app.get("/api/health", (req, res) => {
    res.json({ status: "OK" });
});

/* ===================== EXPORT FOR VERCEL ===================== */
module.exports = serverless(app);
