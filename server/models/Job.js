const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a job title'],
        trim: true
    },
    type: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'],
        required: true
    },
    category: {
        type: String,
        enum: ['Software', 'HR', 'Marketing', 'Sales', 'Finance', 'Other'],
        required: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    responsibilities: {
        type: String
    },
    requirements: {
        type: [String],
        required: true
    },
    jobLocation: {
        type: String, // City, State, Country or 'Remote'
        required: true
    },
    salaryMin: {
        type: Number
    },
    salaryMax: {
        type: Number
    },
    isSalaryNotDisclosed: {
        type: Boolean,
        default: false
    },
    experienceLevel: {
        type: String,
        enum: ['0-1', '1-3', '3-5', '5-7', '7+'],
        required: true
    },
    education: {
        type: String
    },
    companyName: {
        type: String,
        required: true
    },
    // Meta Info
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'closed'],
        default: 'active'
    },
    deadline: {
        type: Date
    },
    keywords: {
        type: [String]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Job', jobSchema);
