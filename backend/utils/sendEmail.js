import nodemailer from "nodemailer";

/**
 * Sends an email using Brevo SMTP.
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Plain text message body
 * @param {string} options.html - HTML message body
 */
const sendEmail = async (options) => {
  console.log("========================================");
  console.log("📧 ATTEMPTING TO SEND EMAIL VIA BREVO SMTP");
  console.log("To   :", options.email);
  console.log("Subject :", options.subject);
  console.log("========================================");

  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS ||
    !process.env.EMAIL_FROM
  ) {
    const error = new Error(
      "Missing Brevo SMTP environment variables (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM)."
    );
    console.error("❌ SMTP CONFIG ERROR:", error.message);
    throw error;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // true for port 465, false for other ports (like 587)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log("🔍 Connecting to Brevo SMTP...");
    await transporter.verify();
    console.log("✅ SMTP Connected Successfully");

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    console.log("📤 Sending email via SMTP...");
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email Sent Successfully");
    console.log("Message ID:", info.messageId);

    return info;
  } catch (error) {
    console.error("========================================");
    console.error("❌ SMTP ERROR");
    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.error("========================================");
    throw error;
  }
};

export default sendEmail;