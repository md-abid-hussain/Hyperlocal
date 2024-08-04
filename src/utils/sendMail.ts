import nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/json-transport';

async function configureTestTransporter() {
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

// Send email
async function sendMail(to: string, subject: string, html: string) {
  const transporter = await configureTestTransporter();
  const mailOptions: MailOptions = {
    from: process.env.EMAIL || 'amomynys@gmail.com',
    to,
    subject,
    html,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', result.messageId);
    console.log('Preview URL: ', nodemailer.getTestMessageUrl(result));
  } catch (err) {
    console.error('Error sending email:', JSON.stringify(err, null, 2));
  }
}

// send email verification
export async function sendVerificationEmail(to: string, token: string) {
  const subject = 'Email Verification';
  const html = `
    <h1>Email Verification</h1>
    <p>Click <a href="${process.env.BASE_URL}/verify-email/${token}">here</a> to verify your email</p>
  `;

  await sendMail(to, subject, html);
}
