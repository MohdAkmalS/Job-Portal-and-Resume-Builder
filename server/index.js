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
app.use(express.json());

const allowedOrigins = [
    "https://job-portal-and-resume-builder.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176"
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, or server-to-server)
        if (!origin) return callback(null, true);

        // Check if origin is explicitly allowed
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }

        // Allow Vercel preview URLs (dynamic subdomains)
        // Matches https://job-portal-and-resume-builder-*.vercel.app
        if (origin.startsWith("https://job-portal-and-resume-builder") && origin.endsWith(".vercel.app")) {
            return callback(null, true);
        }

        // For debugging, you might want to log the blocked origin
        console.log("Blocked by CORS:", origin);
        return callback(null, false); // Fail silently or return error
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

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
