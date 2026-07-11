/**
 * Sends an email using the Brevo HTTP API (v3/smtp/email).
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Plain text message body
 * @param {string} options.html - HTML message body
 */
const sendEmail = async (options) => {
  console.log("========================================");
  console.log("📧 ATTEMPTING TO SEND EMAIL VIA BREVO HTTP API");
  console.log("To   :", options.email);
  console.log("Subject :", options.subject);
  console.log("========================================");

  if (!process.env.BREVO_API_KEY || !process.env.EMAIL_FROM) {
    const error = new Error(
      "Missing Brevo API environment variables (BREVO_API_KEY, EMAIL_FROM)."
    );
    console.error("❌ BREVO HTTP CONFIG ERROR:", error.message);
    throw error;
  }

  const payload = {
    sender: {
      name: "Dynamic Ticks",
      email: process.env.EMAIL_FROM,
    },
    to: [
      {
        email: options.email,
      },
    ],
    subject: options.subject,
    htmlContent: options.html,
    textContent: options.message,
  };

  try {
    console.log("📤 Sending email via Brevo HTTP API...");
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();
    console.log("========================================");
    console.log("📥 BREVO API RESPONSE RECEIVED");
    console.log("Status:", response.status);
    console.log("Data  :", JSON.stringify(responseData, null, 2));
    console.log("========================================");

    if (!response.ok) {
      const errorMessage = responseData.message || `Brevo API returned status ${response.status}`;
      throw new Error(errorMessage);
    }

    console.log("✅ Email Sent Successfully via Brevo HTTP API");
    return responseData;
  } catch (error) {
    console.error("========================================");
    console.error("❌ BREVO HTTP API ERROR");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.error("========================================");
    throw error;
  }
};

export default sendEmail;