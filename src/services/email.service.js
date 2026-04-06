const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegistrationEmail(name, userEmail){
    const subject = 'Welcome to Backend Ledger!';
    const text = `Hi ${name},\n\nThank you for registering with Backend Ledger! We're excited to have you on board.\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `<p>Hi ${name},</p><p>Thank you for registering with Backend Ledger! We're excited to have you on board.</p><p>Best regards,<br>The Backend Ledger Team</p>`;

    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(name,userEmail, amount, toAccount){
  const subject = 'Transaction Alert from Backend Ledger';
  const text = `Hi ${name},\n\nA ${type} transaction of $${amount} has been recorded in your account.\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `<p>Hi ${name},</p><p>A <strong>${type}</strong> transaction of <strong>$${amount}</strong> has been recorded in your account.</p><p>Best regards,<br>The Backend Ledger Team</p>`;

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(name,userEmail, amount, toAccount){
  const subject = 'Transaction Failure Alert from Backend Ledger';
  const text = `Hi ${name},\n\nWe regret to inform you that a transaction of $${amount} to account ${toAccount} has failed. Please check your account and try again.\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `<p>Hi ${name},</p><p>We regret to inform you that a transaction of <strong>$${amount}</strong> to account <strong>${toAccount}</strong> has failed. Please check your account and try again.</p><p>Best regards,<br>The Backend Ledger Team</p>`;

  await sendEmail(userEmail, subject, text, html);
}

module.exports ={
    sendRegistrationEmail,
    sendTransactionEmail,
    sendTransactionFailureEmail
};