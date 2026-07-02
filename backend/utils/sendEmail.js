import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  console.log('--- ATTEMPTING TO SEND EMAIL ---');
  console.log(`Host: ${process.env.EMAIL_HOST}, User: ${process.env.EMAIL_USER}`);

  if (process.env.EMAIL_USER === 'your-email@gmail.com' || process.env.EMAIL_PASS === 'your-app-password') {
    console.log('--- EMAIL SERVICE SKIPPED: Default credentials detected in .env ---');
    console.log('To enable emails, please update your-email@gmail.com and your-app-password in backend/.env');
    return { messageId: 'skipped-placeholder' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,

      family: 4,          // Force IPv4

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },

      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,

      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `"Dynamic Ticks" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('NODEMAILER ERROR:', error.message);
    throw error;
  }
};

export default sendEmail;
