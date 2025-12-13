import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSave, FiSettings } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const CompanyProfile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        companyName: '',
        companyWebsite: '',
        designation: '',
        department: '',
        address: '',
        description: '',
        phoneNumber: ''
    });
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                companyName: user.profile?.companyName || '',
                companyWebsite: user.profile?.companyWebsite || '',
                designation: user.profile?.designation || '',
                department: user.profile?.department || '',
                address: user.profile?.address || '',
                description: user.profile?.description || '',
                phoneNumber: user.phoneNumber || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                profile: {
                    companyName: formData.companyName,
                    companyWebsite: formData.companyWebsite,
                    designation: formData.designation,
                    department: formData.department,
                    address: formData.address,
                    description: formData.description
                }
            };

            await axios.put('http://localhost:5000/api/auth/update-profile', payload, { withCredentials: true });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-6 py-12 animate-fade-in-up">
            <div className="max-w-4xl mx-auto glass rounded-2xl p-8 border border-white/5">
                <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
                    <div className="p-3 bg-pink-500/20 text-pink-400 rounded-xl">
                        <FiSettings size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Company Profile</h1>
                        <p className="text-muted">Manage your company branding and details</p>
                    </div>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl mb-6 ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Role Info */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-white">Recruiter Info</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Full Name</label>
                                <input name="name" value={formData.name} onChange={handleChange} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Email</label>
                                <input name="email" value={formData.email} onChange={handleChange} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Phone Number</label>
                                <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="input-field" placeholder="+1 234 567 890" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Designation</label>
                                <input name="designation" value={formData.designation} onChange={handleChange} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Department</label>
                                <input name="department" value={formData.department} onChange={handleChange} className="input-field" placeholder="e.g. Talent Acquisition" />
                            </div>
                        </div>
                    </div>

                    {/* Company Info */}
                    <div className="space-y-6 pt-6 border-t border-white/10">
                        <h2 className="text-xl font-semibold text-white">Company Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Company Name</label>
                                <input name="companyName" value={formData.companyName} onChange={handleChange} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Website</label>
                                <input name="companyWebsite" value={formData.companyWebsite} onChange={handleChange} className="input-field" placeholder="https://example.com" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1">Address</label>
                            <input name="address" value={formData.address} onChange={handleChange} className="input-field" placeholder="123 Business St, Tech City" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1">Description</label>
                            <textarea name="description" rows="4" value={formData.description} onChange={handleChange} className="input-field" placeholder="Tell candidates about your company..." />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button type="submit" disabled={loading} className="btn-primary py-3 px-8 flex items-center gap-2">
                            <FiSave /> {loading ? 'Saving...' : 'Update Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompanyProfile;
