import transporter from "../configurations/nodemailer.js";
import dotenv from 'dotenv';

dotenv.config();

const emailTemplates = {
  forgot: {
    subject: 'Password Reset Request - Global Lead Platform',
    html: (OTP) => `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #0057D9;">Password Reset Request</h2>
        <p>We received a request to reset your password. Use the OTP below to reset it:</p>
        <div style="margin: 20px 0; padding: 10px 20px; background-color: #f5f5f5; border-left: 4px solid #0057D9; font-size: 1.5rem; font-weight: bold; letter-spacing: 2px;">
          ${String(OTP)}
        </div>
        <p>This OTP is valid for <strong>5 minutes</strong>. If this wasn’t you, please ignore this email.</p>
        <p style="margin-top: 30px;">Best regards,<br/>The Global Lead Platform Team</p>
      </div>
    `
  },

  signup: {
    subject: 'Signup Verification - Global Lead Platform',
    html: (OTP) => `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #0057D9;">Welcome to Global Lead Platform</h2>
        <p>Thank you for signing up. Verify your email using the OTP below:</p>
        <div style="margin: 20px 0; padding: 10px 20px; background-color: #f5f5f5; border-left: 4px solid #0057D9; font-size: 1.5rem; font-weight: bold; letter-spacing: 2px;">
          ${String(OTP)}
        </div>
        <p>This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone.</p>
        <p>If you didn’t create an account, you can ignore this email.</p>
        <p style="margin-top: 30px;">Best regards,<br/>The Global Lead Platform Team</p>
      </div>
    `
  },

  login: {
    subject: 'Login Verification - Global Lead Platform',
    html: (OTP) => `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #0057D9;">Login Verification</h2>
        <p>We detected a login attempt. Use the OTP below to verify your login:</p>
        <div style="margin: 20px 0; padding: 10px 20px; background-color: #f5f5f5; border-left: 4px solid #0057D9; font-size: 1.5rem; font-weight: bold; letter-spacing: 2px;">
          ${String(OTP)}
        </div>
        <p>This OTP is valid for <strong>5 minutes</strong>. If this wasn’t you, please reset your password.</p>
        <p style="margin-top: 30px;">Best regards,<br/>The Global Lead Platform Team</p>
      </div>
    `
  }
};

const DEFAULT_FROM = `"Global Lead Platform" <${process.env.SMTP_USER}>`;
const emailVerificatonMail = async (recipient, OTP, state) => {
  if (!emailTemplates[state]) {
    throw new Error(`Invalid email state: ${state}`);
  }

  try {
    await transporter.sendMail({
      from: DEFAULT_FROM,
      to: recipient,
      subject: emailTemplates[state].subject,
      html: emailTemplates[state].html(OTP),
    });

    console.log(`${state} email sent to ${recipient}`);
  } catch (error) {
    console.error(`Failed to send ${state} email:`, error);
    throw error;
  }
};

export default emailVerificatonMail;
