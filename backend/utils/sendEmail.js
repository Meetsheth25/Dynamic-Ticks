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
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
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
