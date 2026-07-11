import { Resend } from "resend";

/**
 * Sends an email using the Resend Email API.
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Plain text message body
 * @param {string} options.html - HTML message body
 */
const sendEmail = async (options) => {
  console.log("========================================");
  console.log("📧 ATTEMPTING TO SEND EMAIL VIA RESEND");
  console.log("To   :", options.email);
  console.log("Subject :", options.subject);
  console.log("========================================");

  if (!process.env.RESEND_API_KEY) {
    const error = new Error("Missing RESEND_API_KEY environment variable.");
    console.error("❌ RESEND CONFIG ERROR:", error.message);
    throw error;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailData = {
      from: '"Dynamic Ticks" <onboarding@resend.dev>',
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    console.log("📤 Sending email via Resend API...");
    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error("========================================");
      console.error("❌ RESEND API ERROR RESPONSE");
      console.error("Name:", error.name);
      console.error("Message:", error.message);
      console.error("Error Object:", JSON.stringify(error, null, 2));
      console.error("========================================");
      
      // Throwing error as required by step 10
      throw new Error(error.message || "Failed to send email via Resend API.");
    }

    console.log("✅ Email Sent Successfully via Resend");
    console.log("Response Data:", JSON.stringify(data, null, 2));

    return data;
  } catch (error) {
    console.error("========================================");
    console.error("❌ RESEND SENDING EXCEPTION");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.error("========================================");
    throw error;
  }
};

export default sendEmail;