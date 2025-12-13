# Email Service Setup Guide for OTP System

## Quick Setup Instructions:

### Step 1: Enable 2-Factor Authentication on Gmail
1. Go to: https://myaccount.google.com/security
2. Enable "2-Step Verification"

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Name it "Job Portal"
4. Click "Generate"
5. Copy the 16-character password (it will look like: "abcd efgh ijkl mnop")

### Step 3: Update .env File
Replace the placeholders below with your actual credentials:

```
EMAIL_SERVICE=gmail
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=Job Portal <noreply@jobportal.com>
```

### Example:
```
EMAIL_SERVICE=gmail
EMAIL_USER=john.doe@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM=Job Portal <noreply@jobportal.com>
```

### Important Notes:
- Use the App Password, NOT your regular Gmail password
- Remove all spaces from the app password
- The app password is 16 characters long
- After updating, restart your server: `npm run dev`

### Alternative: Use a Test Email Service
If you don't want to use Gmail, you can use Ethereal Email for testing:
https://ethereal.email/ (creates temporary test email accounts)

---

## Need Help?
- Gmail App Passwords: https://support.google.com/accounts/answer/185833
- Nodemailer Docs: https://nodemailer.com/usage/using-gmail/
