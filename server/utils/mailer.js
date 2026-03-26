const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

/**
 * Send an email from the Admin
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} message - Body message from Admin
 * @param {string} adminName - Name of the sending Admin
 */
const sendAdminMail = async (to, subject, message, adminName = 'Admin') => {
    const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; background: #f9fafb;">
            <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #1e293b; font-size: 22px; margin: 0;">📚 Academic Compass</h2>
                <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Smart KPI Dashboard · Official Communication</p>
            </div>
            
            <div style="background: #ffffff; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <p style="color: #334155; font-size: 15px; margin: 0 0 16px;">Hello,</p>
                <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 24px; white-space: pre-wrap;">${message}</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                <p style="color: #64748b; font-size: 13px; margin: 0;">
                    Sent by <strong>${adminName}</strong> · Academic Compass Admin Portal<br/>
                    <span style="color: #94a3b8;">This is an official message from your institution. Please do not reply to this email.</span>
                </p>
            </div>

            <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 24px;">
                © ${new Date().getFullYear()} Academic Compass · Powered by Smart KPI System
            </p>
        </div>
    `;

    await transporter.sendMail({
        from: `"Academic Compass 🎓" <${process.env.GMAIL_USER}>`,
        to,
        subject: subject || 'Message from Academic Compass Admin',
        html: htmlBody,
    });
};

module.exports = { sendAdminMail };
