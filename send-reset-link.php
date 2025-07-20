<?php
// reset_password.php

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'];

    if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $otp = rand(100000, 999999);  // Generate a 6-digit OTP

        // Store the OTP in the database for verification (skipped in this example)

        // Send OTP via email (you'll need to configure your email server correctly)
        $to = $email;
        $subject = "Your Password Reset OTP";
        $message = "Your OTP for password reset is: $otp. Enter this code on the website to reset your password.";
        $headers = 'From: no-reply@example.com' . "\r\n" .
                   'Reply-To: no-reply@example.com' . "\r\n" .
                   'X-Mailer: PHP/' . phpversion();

        if (mail($to, $subject, $message, $headers)) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    }
}
?>
