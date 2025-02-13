import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // Hostinger specific settings
    rejectUnauthorized: true,
    minVersion: "TLSv1.2"
  }
});

// Test email connection on server start
transporter.verify(function (error) {
  if (error) {
    console.log("SMTP connection error:", error);
  } else {
    console.log("SMTP server is ready to send emails");
  }
});

export async function sendDemoEmail(data: {
  name: string;
  email: string;
  school: string;
  role: string;
}) {
  const demoUrl = `${process.env.NEXT_PUBLIC_DEMO_URL}`;

  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4B9DCE;">Welcome to ScioLabs! 🚀</h1>
      <p>Hi ${data.name},</p>
      <p>Thank you for your interest in ScioLabs! Here's your demo access link:</p>
      <p style="margin: 20px 0;">
        <a href="${demoUrl}" 
           style="background-color: #4B9DCE; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 50px; display: inline-block;">
          Access Demo
        </a>
      </p>
      <p>Your details:</p>
      <ul>
        <li>School/Institution: ${data.school}</li>
        <li>Role: ${data.role}</li>
      </ul>
      <p>If you have any questions, feel free to reply to this email.</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
      <p style="color: #666; font-size: 14px;">
        Best regards,<br />
        The ScioLabs Team
      </p>
    </div>
  `;

  return transporter.sendMail({
    from: `"ScioLabs Team" <${process.env.SMTP_FROM}>`,
    to: data.email,
    subject: "Welcome to ScioLabs Demo! 🎮",
    html: htmlContent,
  });
}
