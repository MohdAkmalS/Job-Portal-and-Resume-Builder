const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
    credentials: true
}));
app.use(cookieParser());

// Database Connection
connectDB();

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Make uploads folder static
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
