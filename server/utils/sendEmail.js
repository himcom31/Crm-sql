const nodemailer = require('nodemailer');

/**
 * @desc    Send login credentials to client via Gmail
 * @param   {string} email - Recipient email
 * @param   {string} password - Plain text password
 * @param   {string} name - Client name
 */
const sendEmail = async (email, password, name) => {
    try {
        // 1. Transporter configuration
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER, // Aapka Gmail (env file se)
                pass: process.env.EMAIL_PASS  // Aapka 16-digit App Password
            }
        });

        // 2. Email content with professional branding
        const mailOptions = {
            from: `"Kuber support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome Kuber Support - Your Login Credentials',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
                    <div style="background-color: #1e293b; padding: 20px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Chaudhary & Sons</h1>
                    </div>
                    <div style="padding: 30px; background-color: #ffffff;">
                        <h2 style="color: #1e293b; margin-top: 0;">Welcome, ${name}!</h2>
                        <p style="color: #475569; font-size: 16px; line-height: 1.6;">Aapka account successfully create ho gaya hai. Aap niche diye gaye credentials ka use karke apne dashboard mein login kar sakte hain:</p>
                        
                        <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px dashed #cbd5e1; margin: 20px 0;">
                            <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: bold; uppercase;">Login Email</p>
                            <p style="margin: 5px 0 15px 0; color: #1e293b; font-weight: bold; font-size: 18px;">${email}</p>
                            
                            <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: bold; uppercase;">Temporary Password</p>
                            <p style="margin: 5px 0 0 0; color: #00a669; font-weight: bold; font-size: 18px;">${password}</p>
                        </div>

                        
                        <div style="margin-top: 30px; text-align: center;">
                            <a href="${process.env.CLIENT_URL || '#'}" style="background-color: #1e293b; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">Login to Dashboard</a>
                        </div>
                    </div>
                    <div style="background-color: #f1f5f9; padding: 15px; text-align: center; color: #94a3b8; font-size: 11px;">
                        Kuber support. All rights reserved.
                    </div>
                </div>
            `
        };

        // 3. Send Mail
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email delivered: ${info.messageId}`);
        return info;

    } catch (error) {
        console.error("❌ Nodemailer Service Error:", error.message);
        throw new Error("Email sending failed");
    }
};

module.exports = sendEmail;