const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['seeker', 'recruiter'],
        required: [true, 'Please select a role']
    },
    phoneNumber: {
        type: String
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    profile: {
        // Seeker Fields
        skills: {
            type: [String],
            default: []
        },
        about: {
            type: String
        },
        resumeOriginal: {
            type: String // URL to uploaded file
        },
        profileImage: {
            type: String // Base64 or URL
        },
        social: {
            linkedin: String,
            github: String,
            portfolio: String
        },
        education: [{
            degree: String,
            institution: String,
            year: String,
            grade: String
        }],
        experience: [{
            role: String,
            company: String,
            start: String,
            end: String,
            description: String
        }],
        projects: [{
            title: String,
            technologies: String,
            description: String,
            link: String
        }],
        certifications: [{
            name: String,
            organization: String,
            year: String
        }],
        publications: [{
            title: String,
            publisher: String,
            year: String,
            link: String
        }],
        areasOfInterest: {
            type: [String],
            default: []
        },
        achievements: [{
            title: String,
            description: String,
            year: String
        }],
        hobbies: {
            type: [String],
            default: []
        },
        resumePreferences: {
            template: { type: String, default: 'modern' },
            themeColor: { type: String, default: 'blue' },
            font: { type: String, default: 'Poppins' },
            fontSize: { type: String, default: 'medium' },
            sectionVisibility: {
                photo: { type: Boolean, default: true },
                summary: { type: Boolean, default: true },
                projects: { type: Boolean, default: true }
            }
        },
        // Recruiter Fields
        companyName: {
            type: String
        },
        companyWebsite: {
            type: String
        },
        address: {
            type: String
        },
        description: {
            type: String // Company description
        },
        department: {
            type: String
        },
        designation: {
            type: String
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
