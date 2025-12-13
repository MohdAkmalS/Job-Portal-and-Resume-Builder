# Job Portal & Resume Builder

A comprehensive full-stack platform for job seekers and recruiters, built with the MERN stack.

## 🚀 Features

### For Job Seekers
- **Build Professional Resumes**: Choose from 5+ premium templates (Modern, Executive, Creative, etc.).
- **Persist Data**: Save your personal details, education, and experience to your profile.
- **Find Jobs**: Advanced search by location, category, job type, and experience.
- **Apply Instantly**: Apply using your stored profile or fill out a manual application.
- **Track Status**: Monitor your application progress (Applied, Shortlisted, Interviewing, Hired).
- **Profile Dashboard**: View profile completeness and application statistics.

### For Recruiters
- **Post Jobs**: Create detailed job listings with requirements and descriptions.
- **Manage Applications**: View all applicants, download resumes (PDF), and update status.
- **Company Branding**: Customize your company profile with logo, website, and description.

### For Everyone
- **Secure Authentication**: OTP-based signup/login and password reset (via Brevo email service).
- **Role-Based Access Control**: Distinct features for Seekers and Recruiters.
- **Modern UI**: Fully responsive design with a clean, pure white aesthetic.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT, HttpOnly Cookies, BCrypt
- **Email Service**: Brevo (formerly Sendinblue)
- **Tools**: Axios, react-icons, html2canvas, jspdf

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MohdAkmalS/Job-Portal-and-Resume-Builder.git
   cd Job-Portal-and-Resume-Builder
   ```

2. **Server Setup**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   BREVO_API_KEY=your_brevo_api_key
   EMAIL_FROM=your_sender_email
   EMAIL_FROM_NAME=JobPortal
   ```
   Start the server:
   ```bash
   npm run dev
   ```

3. **Client Setup**
   ```bash
   cd client
   npm install
   ```
   Start the frontend:
   ```bash
   npm run dev
   ```

## 📸 Screenshots

*(Add screenshots here)*

## 📄 License

This project is licensed under the MIT License.
