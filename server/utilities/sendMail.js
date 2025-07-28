import transporter from "../configurations/nodemailer.js";
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_FROM = `"Global Lead Platform" <${process.env.SMTP_USER}>`;

const emailVerificatonMail = async (recipient,OTP) => {
    await transporter.sendMail({
        from: DEFAULT_FROM,
        to: recipient,
        subject: 'Your Global Lead Platform OTP',
        html: generateOtpMail(OTP)
    })
}

const generateOtpMail = (OTP) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #0057D9;">Welcome to Global Lead Platform</h2>

      <p>Thank you for signing up. To complete your registration, please verify your email address using the OTP below:</p>

      <div style="margin: 20px 0; padding: 10px 20px; background-color: #f5f5f5; border-left: 4px solid #0057D9; font-size: 1.5rem; font-weight: bold; letter-spacing: 2px;">
        ${OTP}
      </div>

      <p>This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone.</p>

      <p>If you did not request this, you can safely ignore this email.</p>

      <p style="margin-top: 30px;">Best regards,<br/>The Global Lead Platform Team</p>
    </div>
  `;
};

export default emailVerificatonMail;