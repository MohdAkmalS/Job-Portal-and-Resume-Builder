const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const path = require("path");
const serverless = require("serverless-http");

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// ================= CORS CONFIGURATION =================
const allowedOrigins = [
    "https://job-portal-and-resume-builder.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176"
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);

        // Check if origin is explicitly allowed
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }

        // Check for Vercel Preview URLs (Dynamic Subdomains)
        // Matches https://job-portal-and-resume-builder-*.vercel.app
        const vercelPreviewPattern = /^https:\/\/job-portal-and-resume-builder.*\.vercel\.app$/;
        if (vercelPreviewPattern.test(origin)) {
            return callback(null, true);
        }

        console.log("Blocked by CORS:", origin);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
};

// Apply CORS middleware
app.use(cors(corsOptions));
// Handle Preflight Request explicitly
app.options("*", cors(corsOptions));

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(cookieParser());

// ================= ROUTES =================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));

// ================= STATIC FILES =================
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// ================= TEST ROUTES =================
app.get("/", (req, res) => {
    res.send("API is running... (v1.0)");
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV
    });
});

// ================= SERVER EXPORT (VERCEL) =================
// Only listen if running locally (not in Vercel lambda)
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export for Vercel Serverless
module.exports = serverless(app);
