import nodemailer from "nodemailer";
import dns from "dns";

// Force Node.js to prefer IPv4
dns.setDefaultResultOrder("ipv4first");

const sendEmail = async (options) => {
  console.log("========================================");
  console.log("📧 ATTEMPTING TO SEND EMAIL");
  console.log("Host :", process.env.EMAIL_HOST);
  console.log("Port :", process.env.EMAIL_PORT);
  console.log("User :", process.env.EMAIL_USER);
  console.log("To   :", options.email);
  console.log("========================================");

  if (
    !process.env.EMAIL_HOST ||
    !process.env.EMAIL_PORT ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS
  ) {
    throw new Error(
      "Missing EMAIL_HOST / EMAIL_PORT / EMAIL_USER / EMAIL_PASS environment variables."
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),

      // Gmail
      secure: false,

      // Force IPv4
      family: 4,

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },

      requireTLS: true,

      tls: {
        rejectUnauthorized: false,
        minVersion: "TLSv1.2",
      },

      connectionTimeout: 60000,
      greetingTimeout: 60000,
      socketTimeout: 60000,

      pool: true,
      maxConnections: 5,
      maxMessages: 100,

      logger: true,
      debug: true,
    });

    console.log("🔍 Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP Connected Successfully");

    const mailOptions = {
      from: `"Dynamic Ticks" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    console.log("📤 Sending email...");

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email Sent Successfully");
    console.log("Message ID:", info.messageId);

    return info;
  } catch (error) {
    console.error("========================================");
    console.error("❌ NODEMAILER ERROR");
    console.error("Code:", error.code);
    console.error("Command:", error.command);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.error("========================================");
    throw error;
  }
};

export default sendEmail;