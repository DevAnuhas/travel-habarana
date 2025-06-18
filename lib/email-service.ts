import nodemailer from "nodemailer";
import { siteConfig } from "@/config/site";

// Configure nodemailer transporter
export const getEmailTransporter = () => {
	return nodemailer.createTransport({
		host: "smtp.gmail.com",
		port: 465,
		secure: true,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASSWORD,
		},
	});
};

/**
 * Email templates for various notifications
 */

interface Inquiry {
	name: string;
	email: string;
	phone: string;
	date: string;
	numberOfPeople: number;
	specialRequests?: string;
}

interface PackageDetails {
	name: string;
	images?: string[];
}

// Format date for display
export function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

// Admin notification for new inquiry
export function newInquiryAdminTemplate(
	inquiry: Inquiry,
	packageDetails: PackageDetails
) {
	return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Booking Inquiry - ${siteConfig.name}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #4CAF50;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
          margin: -20px -20px 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 0 20px;
        }
        .inquiry-details {
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .detail-row {
          margin-bottom: 10px;
          display: flex;
        }
        .detail-label {
          font-weight: bold;
          width: 150px;
        }
        .detail-value {
          flex: 1;
        }
        .package-info {
          background-color: #e8f5e9;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .cta-button {
          display: inline-block;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin-top: 10px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #666;
        }
        .priority-tag {
          display: inline-block;
          background-color: #ff9800;
          color: white;
          padding: 5px 10px;
          border-radius: 3px;
          font-size: 12px;
          font-weight: bold;
          margin-left: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Booking Inquiry</h1>
        </div>
        
        <div class="content">
          <p>You have received a new booking inquiry from the ${
						siteConfig.name
					} website. Please review the details below and respond to the customer as soon as possible.</p>
          
          <div class="package-info">
            <h2>Package Information</h2>
            <div class="detail-row">
              <div class="detail-label">Package:</div>
              <div class="detail-value">${packageDetails.name}</div>
            </div>
          </div>
          
          <div class="inquiry-details">
            <h2>Customer Information</h2>
            <div class="detail-row">
              <div class="detail-label">Name:</div>
              <div class="detail-value">${inquiry.name}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Email:</div>
              <div class="detail-value">${inquiry.email}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Phone:</div>
              <div class="detail-value">${inquiry.phone}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Date:</div>
              <div class="detail-value">${formatDate(inquiry.date)}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Group Size:</div>
              <div class="detail-value">${inquiry.numberOfPeople} people</div>
            </div>
            ${
							inquiry.specialRequests
								? `
            <div class="detail-row">
              <div class="detail-label">Special Requests:</div>
              <div class="detail-value">${inquiry.specialRequests}</div>
            </div>
            `
								: ""
						}
          </div>
          
          <p>Please respond to this inquiry within 24 hours to ensure customer satisfaction.</p>
          
          <a href="${
						process.env.NEXT_PUBLIC_APP_URL || siteConfig.url
					}/admin/inquiries" class="cta-button">View in Admin Dashboard</a>
        </div>
        
        <div class="footer">
          <p>This is an automated email from ${
						siteConfig.name
					}. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} ${
						siteConfig.name
					}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Customer confirmation for new inquiry
export function newInquiryCustomerTemplate(
	inquiry: Inquiry,
	packageDetails: PackageDetails
) {
	return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Inquiry Confirmation - ${siteConfig.name}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #4CAF50;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
          margin: -20px -20px 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 0 20px;
        }
        .package-image {
          width: 100%;
          height: auto;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .inquiry-summary {
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .contact-info {
          background-color: #e8f5e9;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #666;
        }
        .social-links {
          text-align: center;
          margin-top: 20px;
        }
        .social-links a {
          display: inline-block;
          margin: 0 10px;
          color: #4CAF50;
          text-decoration: none;
        }
        .what-next {
          background-color: #fff8e1;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thank You for Your Booking Inquiry</h1>
        </div>
        
        <div class="content">
          <p>Dear ${inquiry.name},</p>
          
          <p>Thank you for your interest in our <strong>${
						packageDetails.name
					}</strong> package. We have received your inquiry and our team will get back to you within 24 hours.</p>
          
          <div class="inquiry-summary">
            <h2>Your Inquiry Details</h2>
            <ul>
              <li><strong>Package:</strong> ${packageDetails.name}</li>
              <li><strong>Date:</strong> ${formatDate(inquiry.date)}</li>
              <li><strong>Number of People:</strong> ${
								inquiry.numberOfPeople
							}</li>
              ${
								inquiry.specialRequests
									? `<li><strong>Special Requests:</strong> ${inquiry.specialRequests}</li>`
									: ""
							}
            </ul>
          </div>
          
          <div class="what-next">
            <h2>What Happens Next?</h2>
            <ol>
              <li>Our team will review your inquiry</li>
              <li>We'll check availability for your requested date</li>
              <li>We'll contact you within 24 hours with confirmation and payment details</li>
              <li>Once confirmed, we'll send you a detailed itinerary</li>
            </ol>
          </div>
          
          <div class="contact-info">
            <h2>Need to Reach Us?</h2>
            <p>If you have any questions or need to update your inquiry, please don't hesitate to contact us:</p>
            <ul>
              <li><strong>Email:</strong> ${siteConfig.contact.email}</li>
              <li><strong>Phone:</strong> ${siteConfig.contact.phone}</li>
              <li><strong>WhatsApp:</strong> ${siteConfig.contact.phone}</li>
            </ul>
          </div>
          
          <p>We look forward to helping you plan an unforgettable experience in Habarana!</p>
          
          <p>Best regards,<br>The ${siteConfig.name} Team</p>
          
          <div class="social-links">
            <p>Follow us on social media for updates and special offers:</p>
            <a href="${siteConfig.links.facebook}">Facebook</a> |
            <a href="${siteConfig.links.instagram}">Instagram</a> |
            <a href="${siteConfig.links.tiktok}">TikTok</a>
          </div>
        </div>
        
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${
						siteConfig.name
					}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Password reset email template
export function passwordResetAdminTemplate(
	resetToken: string,
	userName: string
) {
	const resetUrl = `${
		process.env.NEXT_PUBLIC_APP_URL || siteConfig.url
	}/admin/reset-password?token=${resetToken}`;

	return `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - ${siteConfig.name} Admin</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #4CAF50;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
          margin: -20px -20px 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 0 20px;
        }
        .reset-button {
          display: inline-block;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          padding: 15px 30px;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .security-notice {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 0 5px 5px 0;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #6b7280;
        }
        .logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${siteConfig.name}</h1>
        </div>
        
        <div class="content">
          <h2>Password Reset Request</h2>
          <p>Hello ${userName},</p>
                   <p>We received a request to reset your password for your ${
											siteConfig.name
										} admin account. If you made this request, click the button below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" class="reset-button">Reset My Password</a>
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 5px; font-family: monospace;">
            ${resetUrl}
          </p>
          
          <div class="security-notice">
            <h3 style="margin-top: 0; color: #92400e;">Security Notice</h3>
            <ul style="margin-bottom: 0;">
              <li>This link will expire in <strong>1 hour</strong> for security reasons</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Never share this link with anyone</li>
              <li>Contact your system administrator if you have concerns</li>
            </ul>
          </div>
          
          <p>Best regards,<br>${siteConfig.name} Security Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated security email from ${
						siteConfig.name
					} Admin Portal.</p>
          <p>&copy; ${new Date().getFullYear()} ${
						siteConfig.name
					}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>`;
}
