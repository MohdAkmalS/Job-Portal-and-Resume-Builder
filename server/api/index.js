const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("../config/db");
const path = require("path");


dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();

/* ===================== DATABASE ===================== */
/* ===================== DATABASE CONNECTION MIDDLEWARE ===================== */
// Ensure DB is connected before processing any request (Critical for Vercel)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("Database connection failed:", error);
        res.status(500).json({ success: false, message: "Database connection failed" });
    }
});

/* ===================== MIDDLEWARE ===================== */
// Debug Logging
app.use((req, res, next) => {
    console.log(`📝 Request: ${req.method} ${req.url}`);
    console.log(`   Time: ${new Date().toISOString()}`);
    next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

/* ===================== CORS (FIXED, NO WILDCARD) ===================== */
/* ===================== CORS (FIXED, DYNAMIC ORIGIN) ===================== */
const allowedOrigins = [
    "https://job-portal-and-resume-builder.vercel.app",
    "http://localhost:5173",
    "http://localhost:5000"
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow any Vercel deployment (Production or Preview)
        if (origin.endsWith(".vercel.app")) {
            return callback(null, true);
        }

        // Allow allowed static origins
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* ===================== ROUTES ===================== */
app.use("/api/auth", require("../routes/authRoutes"));
app.use("/api/jobs", require("../routes/jobRoutes"));
app.use("/api/applications", require("../routes/applicationRoutes"));
app.use("/api/upload", require("../routes/uploadRoutes"));

/* ===================== STATIC FILES ===================== */
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* ===================== HEALTH CHECK ===================== */
app.get("/", (req, res) => {
    res.json({ message: "Backend running on Vercel", status: "OK" });
});

app.get("/api/health", (req, res) => {
    res.json({ status: "OK" });
});

// Export for Vercel
module.exports = app;

// Local Development
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
