import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

// Cache for SMTP settings to avoid repeated DB queries
interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  fromName: string;
}

let smtpSettingsCache: SmtpConfig | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Function to get SMTP settings from database with fallback to env variables
async function getSmtpSettings() {
  // Check if cache is still valid
  if (smtpSettingsCache && (Date.now() - cacheTimestamp) < CACHE_TTL) {
    return smtpSettingsCache;
  }

  try {
    // Fetch SMTP settings from database
    const dbSettings = await prisma.adminSettings.findMany({
      where: {
        key: {
          in: ['smtpHost', 'smtpPort', 'smtpUser', 'smtpPass', 'smtpFrom', 'smtpFromName']
        }
      },
      select: {
        key: true,
        value: true
      }
    });

    // Convert to key-value object
    const settingsObj = dbSettings.reduce((acc: Record<string, string>, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    // Prepare settings with fallbacks to environment variables
    const smtpConfig = {
      host: settingsObj.smtpHost || process.env.EMAIL_SERVER_HOST || 'smtp.hostinger.com',
      port: parseInt(settingsObj.smtpPort || process.env.EMAIL_SERVER_PORT || '587'),
      user: settingsObj.smtpUser || process.env.EMAIL_SERVER_USER || 'info@sciolabs.in',
      pass: settingsObj.smtpPass || process.env.EMAIL_SERVER_PASSWORD || '',
      from: settingsObj.smtpFrom || process.env.EMAIL_FROM || 'info@sciolabs.in',
      fromName: settingsObj.smtpFromName || process.env.SMTP_FROM_NAME || 'ScioLabs Team',
    };

    // Cache the settings
    smtpSettingsCache = smtpConfig;
    cacheTimestamp = Date.now();
    
    console.log('SMTP settings loaded from:', dbSettings.length > 0 ? 'database (with env fallbacks)' : 'environment variables');
    
    return smtpConfig;
  } catch (error) {
    console.error('Error fetching SMTP settings from database, using env variables:', error);
    
    // Fallback to environment variables only
    const envConfig = {
      host: process.env.EMAIL_SERVER_HOST || 'smtp.hostinger.com',
      port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
      user: process.env.EMAIL_SERVER_USER || 'info@sciolabs.in',
      pass: process.env.EMAIL_SERVER_PASSWORD || '',
      from: process.env.EMAIL_FROM || 'info@sciolabs.in',
      fromName: process.env.SMTP_FROM_NAME || 'ScioLabs Team',
    };
    
    return envConfig;
  }
}

// Function to create transporter with dynamic settings
async function createTransporter(useAlternativePort = false) {
  const settings = await getSmtpSettings();
  
  const port = useAlternativePort ? 465 : settings.port;
  const secure = useAlternativePort ? true : false;
  
  return nodemailer.createTransport({
    host: settings.host,
    port: port,
    secure: secure, // Use SSL for 465, STARTTLS for 587
    auth: {
      user: settings.user,
      pass: settings.pass,
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: useAlternativePort ? undefined : 'SSLv3'
    },
    requireTLS: !useAlternativePort,
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    authMethod: 'PLAIN',
    debug: false,
    logger: false
  });
}

// Test email connection
async function testEmailConnection() {
  try {
    // First try the main transporter (port 587 with STARTTLS)
    const transporter = await createTransporter(false);
    await transporter.verify();
    console.log("SMTP server is ready to send emails (port 587)");
    return transporter;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log("Port 587 failed, trying port 465...", errorMessage);
    
    try {
      // Try alternative transporter (port 465 with SSL)
      const alternativeTransporter = await createTransporter(true);
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

// Initialize connection test (but don't block startup)
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
    const settings = await getSmtpSettings();
    let transporter;
    
    try {
      // Try main configuration first
      transporter = await createTransporter(false);
      await transporter.verify();
    } catch {
      console.log("Trying alternative SMTP configuration...");
      // Fallback to alternative configuration
      transporter = await createTransporter(true);
    }

    const mailOptions = {
      from: `${settings.fromName} <${settings.from}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      to: options.to,
      subject: options.subject,
      from: `${settings.fromName} <${settings.from}>`
    });
    
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Function to clear cache (useful for when settings are updated)
export function clearSmtpCache() {
  smtpSettingsCache = null;
  cacheTimestamp = 0;
  console.log('SMTP settings cache cleared');
}