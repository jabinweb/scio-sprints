import nodemailer from 'nodemailer';

// Alternative configuration for Hostinger - try SSL on port 465
const alternativeTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465, // SSL port
  secure: true, // Use SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  }
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false, // Use STARTTLS (false for port 587, true for port 465)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // Hostinger specific settings - more permissive
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  },
  // Additional settings for better authentication
  requireTLS: true,
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000,
  authMethod: 'PLAIN', // Explicitly use PLAIN auth
  debug: false, // Disable debug for cleaner logs
  logger: false // Disable logging
});

// Test email connection on server start
async function testEmailConnection() {
  try {
    // First try the main transporter (port 587 with STARTTLS)
    await transporter.verify();
    console.log("SMTP server is ready to send emails (port 587)");
    return transporter;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log("Port 587 failed, trying port 465...", errorMessage);
    
    try {
      // Try alternative transporter (port 465 with SSL)
      await alternativeTransporter.verify();
      console.log("SMTP server is ready to send emails (port 465)");
      return alternativeTransporter;
    } catch (altError) {
      const altErrorMessage = altError instanceof Error ? altError.message : String(altError);
      console.log("Both configurations failed:", altErrorMessage);
      throw altError;
    }
  }
}

testEmailConnection().catch(console.error);

export async function sendDemoEmail(data: {
  name: string;
  email: string;
  school: string;
  role: string;
}) {
  // Mail sending is disabled - just log the data for now
  console.log('Demo signup received:', {
    name: data.name,
    email: data.email,
    school: data.school,
    role: data.role,
    timestamp: new Date().toISOString()
  });

  // Return a resolved promise to maintain the same interface
  return Promise.resolve({
    messageId: 'demo-disabled',
    response: 'Email sending disabled'
  });
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  try {
    const mailOptions = {
      from: `${process.env.SMTP_FROM_NAME || 'ScioLabs Team'} <${process.env.SMTP_FROM || 'noreply@sciolabs.in'}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      to: options.to,
      subject: options.subject
    });
    
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}