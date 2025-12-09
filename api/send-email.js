import nodemailer from 'nodemailer';
import { rateLimit } from '@/lib/rate-limit';
import { validateEmail } from '@/lib/validation';

// Step 1: Setup rate limiting - allows 10 requests per minute per IP
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute in milliseconds
  uniqueTokenPerInterval: 500, // Max 500 unique users per minute
});

export default async function handler(req, res) {
  // Step 2: Only accept POST requests (contact forms use POST)
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed. Use POST instead.' 
    });
  }

  try {
    // Step 3: Apply rate limiting
    await limiter.check(res, 10, 'EMAIL_SEND_LIMIT');
    
    // Step 4: Extract data from request body
    const { name, email, message, subject } = req.body;
    
    // Step 5: Validate all required fields exist
    if (!name || !email || !message || !subject) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, email, message, and subject are all required.' 
      });
    }
    
    // Step 6: Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ 
        error: 'Invalid email address format.' 
      });
    }
    
    // Step 7: Prevent overly long messages
    if (message.length > 2000) {
      return res.status(400).json({ 
        error: 'Message is too long. Maximum 2000 characters.' 
      });
    }

    // Step 8: Configure email transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // e.g., smtp.gmail.com
      port: parseInt(process.env.EMAIL_PORT), // e.g., 587
      secure: process.env.EMAIL_PORT === '465', // true for port 465
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });

    // Step 9: Create email content
    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_FROM}>`,
      replyTo: email, // Allows you to reply directly to the sender
      to: process.env.EMAIL_TO || process.env.EMAIL_USER, // Who receives the email
      subject: `[RGRMstudio Contact] ${subject.substring(0, 100)}`, // Limit subject length
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333; border-bottom: 2px solid #0070f3; padding-bottom: 10px;">New Contact Form Submission - RGRMstudio</h2>
          <p><strong style="color: #555;">👤 Name:</strong> ${name}</p>
          <p><strong style="color: #555;">📧 Email:</strong> ${email}</p>
          <p><strong style="color: #555;">📋 Subject:</strong> ${subject}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p><strong style="color: #555;">💬 Message:</strong></p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #0070f3;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 20px; text-align: center;">
            Sent from RGRMstudio website contact form • ${new Date().toLocaleDateString()}
          </p>
        </div>
      `,
    };

    // Step 10: Send the email
    await transporter.sendMail(mailOptions);
    
    // Step 11: Return success response
    return res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully! We\'ll get back to you soon.' 
    });

  } catch (error) {
    console.error('Email send error:', error);
    
    // Step 12: Handle specific errors with appropriate messages
    if (error.message.includes('rate limit')) {
      return res.status(429).json({ 
        error: 'Too many requests. Please try again in a minute.' 
      });
    }
    
    if (error.message.includes('authentication failed')) {
      return res.status(500).json({ 
        error: 'Email service configuration error. Please contact the website administrator.' 
      });
    }
    
    // Step 13: Generic error for everything else
    return res.status(500).json({ 
      error: 'Failed to send email. Please try again later or contact us directly.' 
    });
  }
}

// Step 14: Next.js API route configuration
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb', // Don't accept requests larger than 1MB
    },
    externalResolver: true, // Tells Next.js this route is handled externally
  },
};
