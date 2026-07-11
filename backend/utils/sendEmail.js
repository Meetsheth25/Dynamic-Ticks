import nodemailer from "nodemailer";
import dns from "dns";

// Prefer IPv4 first (helps on some cloud platforms)
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
      secure: Number(process.env.EMAIL_PORT) === 465,

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },

      requireTLS: true,

      connectionTimeout: 60000,
      greetingTimeout: 60000,
      socketTimeout: 60000,

      tls: {
        rejectUnauthorized: false,
      },
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
    console.error("❌ NODEMAILER ERROR");
    console.error(error);
    throw error;
  }
};

export default sendEmail;