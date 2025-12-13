const SibApiV3Sdk = require('@getbrevo/brevo');

// Initialize Brevo API client
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const apiKey = process.env.BREVO_API_KEY;
if (apiKey) {
    apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, apiKey);
    console.log('Brevo API Key initialized:', apiKey.substring(0, 4) + '...');
} else {
    console.error('Brevo API Key MISSING in environment variables');
}

// Send OTP email for signup
const sendSignupOTP = async (email, otp) => {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.sender = {
        name: process.env.EMAIL_FROM_NAME || 'Job Portal',
        email: process.env.EMAIL_FROM || 'noreply@jobportal.com'
    };
    sendSmtpEmail.to = [{ email: email }];
    sendSmtpEmail.subject = 'Verify Your Email - Job Portal';
    sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #6366f1; margin-bottom: 20px;">Email Verification</h2>
                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                    Thank you for registering with our Job Portal!
                </p>
                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                    Your verification code is:
                </p>
                <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
                    <h1 style="color: #6366f1; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h1>
                </div>
                <p style="color: #666; font-size: 14px; line-height: 1.6;">
                    This code will expire in <strong>5 minutes</strong>.
                </p>
                <p style="color: #666; font-size: 14px; line-height: 1.6;">
                    If you didn't request this code, please ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">
                    Job Portal - Your Career Partner
                </p>
            </div>
        </div>
    `;

    try {
        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('✅ Signup OTP email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('❌ Email send error:', error.message);
        console.error('Error details:', error.response?.body || error);
        return { success: false, error: error.message };
    }
};

// Send OTP email for password reset
const sendResetOTP = async (email, otp) => {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.sender = {
        name: process.env.EMAIL_FROM_NAME || 'Job Portal',
        email: process.env.EMAIL_FROM || 'noreply@jobportal.com'
    };
    sendSmtpEmail.to = [{ email: email }];
    sendSmtpEmail.subject = 'Reset Your Password - Job Portal';
    sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #6366f1; margin-bottom: 20px;">Password Reset Request</h2>
                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                    We received a request to reset your password.
                </p>
                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                    Your password reset code is:
                </p>
                <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
                    <h1 style="color: #6366f1; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h1>
                </div>
                <p style="color: #666; font-size: 14px; line-height: 1.6;">
                    This code will expire in <strong>5 minutes</strong>.
                </p>
                <p style="color: #666; font-size: 14px; line-height: 1.6;">
                    If you didn't request a password reset, please ignore this email and your password will remain unchanged.
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">
                    Job Portal - Your Career Partner
                </p>
            </div>
        </div>
    `;

    try {
        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('✅ Reset OTP email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('❌ Email send error:', error.message);
        console.error('Error details:', error.response?.body || error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendSignupOTP,
    sendResetOTP
};
