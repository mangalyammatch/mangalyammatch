const nodemailer = require('nodemailer');

// Configure the transporter
// For Gmail: use service: 'gmail' and your app password
// For others: use host, port, etc.
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify connection configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('[MAILER] Connection error:', error);
  } else {
    console.log('[MAILER] Server is ready to take our messages');
  }
});

/**
 * Send OTP Email
 * @param {string} to - Recipient email
 * @param {string} otp - The 6-digit code
 * @param {string} name - User's name
 */
exports.sendOTPEmail = async (to, otp, name) => {
  try {
    const mailOptions = {
      from: `"MangalyamMatch" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Verify Your MangalyamMatch Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #800000; text-align: center;">Welcome to MangalyamMatch</h2>
          <p>Hello ${name},</p>
          <p>Thank you for joining MangalyamMatch. Your journey to find a perfect partner begins here. Please use the following One-Time Password (OTP) to verify your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #800000; background: #fffaf0; padding: 10px 20px; border-radius: 5px; border: 1px dashed #d4af37;">
              ${otp}
            </span>
          </div>
          <p>This code is valid for 10 minutes. Please do not share this OTP with anyone.</p>
          <p>Best regards,<br/>The MangalyamMatch Team</p>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
          <p style="font-size: 12px; color: #777; text-align: center;">"Uniting Hearts for a Lifetime"</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[MAILER] Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('[MAILER] Error sending email:', error);
    // Even if it fails, we logged it to console in authController
    return false;
  }
};
