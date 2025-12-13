import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider } from './context/AuthContext';

// Set global axios defaults
axios.defaults.withCredentials = true;
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPasswordOTP from './pages/ResetPasswordOTP';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import PostJob from './pages/recruiter/PostJob';
import MyJobs from './pages/recruiter/MyJobs';
import ReviewApplications from './pages/recruiter/ReviewApplications';
import CompanyProfile from './pages/recruiter/CompanyProfile';
import ApplicationDetails from './pages/recruiter/ApplicationDetails';
import SeekerDashboard from './pages/seeker/SeekerDashboard';
import FindJobs from './pages/seeker/FindJobs';
import ProfileBuilder from './pages/seeker/ProfileBuilder';
import AppliedJobs from './pages/seeker/AppliedJobs';
import ShortlistedJobs from './pages/seeker/ShortlistedJobs';
import ResumeBuilder from './pages/seeker/ResumeBuilder';
import RecruiterInterviews from './pages/recruiter/RecruiterInterviews';
import SeekerInterviews from './pages/seeker/SeekerInterviews';
import ManualApply from './pages/seeker/ManualApply';
import ProfilePreview from './pages/seeker/ProfilePreview';
import ChangePassword from './pages/ChangePassword';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen pb-10">
          <Navbar />
          <div className="pt-20"> {/* Padding for fixed navbar */}
            <Routes>
              {/* Redirect root to Login if not authenticated */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* OTP-related routes (Public) */}
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password-otp" element={<ResetPasswordOTP />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Recruiter Routes */}
                <Route path="/post-job" element={<PostJob />} />
                <Route path="/my-jobs" element={<MyJobs />} />
                <Route path="/applications" element={<ReviewApplications />} />
                <Route path="/recruiter/application-details/:id" element={<ApplicationDetails />} />
                <Route path="/company-profile" element={<CompanyProfile />} />
                <Route path="/recruiter/interviews" element={<RecruiterInterviews />} />

                {/* Seeker Routes */}
                <Route path="/find-jobs" element={<FindJobs />} />
                <Route path="/profile-builder" element={<ResumeBuilder />} /> {/* Replaced ProfileBuilder with ResumeBuilder concept or linked separately? User asked for Resume Builder Upgrade. I'll map resume-builder to ResumeBuilder and keep profile-builder if needed, but the dashboard link was to profile-builder. I'll update dashboard link later or just map profile-builder to ResumeBuilder if it covers both. Let's add separate route for now and I will update dashboard link */}
                <Route path="/resume-builder" element={<ResumeBuilder />} />
                <Route path="/my-applications" element={<AppliedJobs />} />
                <Route path="/shortlisted-jobs" element={<ShortlistedJobs />} />
                <Route path="/seeker/interviews" element={<SeekerInterviews />} />
                <Route path="/seeker/profile" element={<ResumeBuilder />} />
                <Route path="/seeker/manual-application/:jobId" element={<ManualApply />} />
                <Route path="/seeker/profile-preview/:jobId" element={<ProfilePreview />} />

                {/* Change Password (Available to all authenticated users) */}
                <Route path="/change-password" element={<ChangePassword />} />
              </Route>
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
