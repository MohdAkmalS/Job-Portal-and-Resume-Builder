<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forgot Password</title>
    <link rel="stylesheet" href="styles.css">
<script src="https://smtpjs.com/v3/smtp.js">
</script>
</head>
<body>
    <div class="forgot-password-container">
        <div class="forgot-password-box">
            <h2>Reset Your Password</h2>
            <p>Enter your email address below, and we’ll send you an OTP to reset your password.</p>
            <form id="resetForm">
                <div class="input-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" placeholder="Enter your email" required>
                </div>
                <button type="button" class="reset-btn" onclick="sendOTP()">Send OTP</button>
                <div class="otpverify" style="display:none;">
                    <label for="otp_inp">Enter OTP</label>
                    <input type="text" id="otp_inp" placeholder="Enter received OTP">
                    <button type="button" id="otp-btn">Verify OTP</button>
                </div>
                <div class="extra-options">
                    <a href="index.html">Remembered your password? Sign In</a>
                </div>
            </form>
        </div>
    </div>

    <script>
        function sendOTP() {
            const email = document.getElementById('email');
            const otpverify = document.getElementsByClassName('otpverify')[0];
            
            // Generate a random 4-digit OTP
            let otp_val = Math.floor(Math.random() * 10000);
            
            let emailbody = `<h2>Your OTP is </h2>${otp_val}`;
            
            Email.send({
                SecureToken : "aa0f74c8-341c-4445-8da8-0b54c8d17307",
                To : email.value,
                From : "mohammedakmal9786@gmail.com",
                Subject : "Email OTP using JavaScript",
                Body : emailbody,
            }).then(
                message => {
                    if (message === "OK") {
                        alert("OTP sent to your email " + email.value);
                        otpverify.style.display = "flex";
                    } else {
                        alert("Failed to send OTP. Please try again.");
                    }
                }
            );
            
            const otp_inp = document.getElementById('otp_inp');
            const otp_btn = document.getElementById('otp-btn');
            
            otp_btn.addEventListener('click', () => {
                if (otp_inp.value == otp_val) {
                    alert("Email address verified...");
                } else {
                    alert("Invalid OTP");
                }
            });
        }
    </script>
</body>
</html>
