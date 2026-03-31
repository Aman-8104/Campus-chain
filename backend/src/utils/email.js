const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send OTP email for registration verification
 */
const sendOtpEmail = async (to, otp, name) => {
  await transporter.sendMail({
    from: `"CampusChain" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Your CampusChain Verification Code',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: auto; background: #0a0a1a; color: #fff; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #00f0ff22, #6366f122); padding: 40px 32px 24px;">
          <h1 style="margin:0; font-size:24px; color:#00f0ff; letter-spacing:-0.5px;">CampusChain</h1>
          <p style="color:#ffffff80; font-size:12px; margin:4px 0 0;">Institutional Financial Ecosystem</p>
        </div>
        <div style="padding: 32px;">
          <p style="color:#ffffffcc; margin:0 0 8px;">Hi <strong>${name}</strong>,</p>
          <p style="color:#ffffff80; margin:0 0 24px; font-size:14px;">Use the code below to verify your recovery email. It expires in <strong>10 minutes</strong>.</p>
          <div style="background:#ffffff10; border:1px solid #00f0ff30; border-radius:12px; text-align:center; padding:24px 0;">
            <span style="font-size:42px; font-weight:900; letter-spacing:12px; color:#00f0ff;">${otp}</span>
          </div>
          <p style="color:#ffffff40; font-size:12px; margin:24px 0 0;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      </div>
    `,
  });
};

/**
 * Send password reset email
 */
const sendResetEmail = async (to, resetLink, name) => {
  await transporter.sendMail({
    from: `"CampusChain" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Reset Your CampusChain Password',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: auto; background: #0a0a1a; color: #fff; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #f59e0b22, #d9770622); padding: 40px 32px 24px;">
          <h1 style="margin:0; font-size:24px; color:#f59e0b; letter-spacing:-0.5px;">CampusChain</h1>
          <p style="color:#ffffff80; font-size:12px; margin:4px 0 0;">Password Reset Request</p>
        </div>
        <div style="padding: 32px;">
          <p style="color:#ffffffcc; margin:0 0 8px;">Hi <strong>${name}</strong>,</p>
          <p style="color:#ffffff80; margin:0 0 24px; font-size:14px;">We received a request to reset your password. Click the button below — the link expires in <strong>1 hour</strong>.</p>
          <a href="${resetLink}" style="display:block; text-align:center; background:linear-gradient(135deg,#f59e0b,#d97706); color:#000; font-weight:700; font-size:15px; padding:16px 32px; border-radius:12px; text-decoration:none;">Reset My Password</a>
          <p style="color:#ffffff40; font-size:12px; margin:24px 0 0;">If you didn't request this, no action is needed. Your password remains unchanged.</p>
        </div>
      </div>
    `,
  });
};

module.exports = { sendOtpEmail, sendResetEmail };
