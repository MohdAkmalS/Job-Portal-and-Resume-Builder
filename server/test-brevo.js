require('dotenv').config();
const { sendSignupOTP } = require('./utils/emailService');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'test-output.txt');

function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
}

async function test() {
    fs.writeFileSync(logFile, '--- Brevo Diagnostic Start ---\n');
    log('API Key Present: ' + !!process.env.BREVO_API_KEY);
    if (process.env.BREVO_API_KEY) {
        log('API Key First 4 chars: ' + process.env.BREVO_API_KEY.substring(0, 4));
    }
    log('Email From: ' + process.env.EMAIL_FROM);

    const email = 'test@example.com';
    const otp = '123456';

    log(`Attempting to send OTP to ${email}...`);
    try {
        const result = await sendSignupOTP(email, otp);
        log('Result: ' + JSON.stringify(result, null, 2));
    } catch (err) {
        log('Unexpected error in test script: ' + err.message);
        log('Stack: ' + err.stack);
    }
    log('--- Brevo Diagnostic End ---');
}

test();
