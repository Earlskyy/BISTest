import nodemailer from 'nodemailer';
import pool from '../config/database.js';

// Create Gmail transporter
let transporter;

if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
} else {
  console.warn('Gmail credentials not configured. Email notifications will be disabled.');
}

const SENDER_EMAIL = process.env.GMAIL_USER || 'noreply@barangaycatarman.gov.ph';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Send submission email for new document request
 * Includes tracking number and link to track status
 */
export async function sendSubmissionEmail(
  recipientEmail,
  trackingNumber,
  type = 'document', // 'document' or 'complaint'
  details = {}
) {
  if (!transporter) {
    console.warn('Email service not configured. Skipping email.');
    return false;
  }

  try {
    let subject, text, trackingPageUrl;

    if (type === 'document') {
      subject = `Document Request Received - Reference: ${trackingNumber}`;
      trackingPageUrl = `${FRONTEND_URL}/track-document?ref=${trackingNumber}`;
      text = `
Dear ${details.full_name || 'Applicant'},

Thank you for submitting your document request.

Reference Number: ${trackingNumber}
Type: ${details.certificate_type || 'Certificate'}
Submitted: ${new Date().toLocaleDateString()}

You can track the status of your request here:
${trackingPageUrl}

Keep your reference number safe for status inquiries.

Best regards,
Barangay Catarman
      `;
    } else if (type === 'complaint') {
      subject = `Complaint Received - Tracking Number: ${trackingNumber}`;
      trackingPageUrl = `${FRONTEND_URL}/track-complaint?ref=${trackingNumber}`;
      text = `
Dear ${details.reporter_name || 'Reporter'},

Thank you for filing a complaint with the Barangay.

Tracking Number: ${trackingNumber}
Status: Submitted
Date: ${new Date().toLocaleDateString()}

You can track the status of your complaint here:
${trackingPageUrl}

We will review your report and take appropriate action.

Best regards,
Barangay Catarman
      `;
    }

    const mailOptions = {
      from: SENDER_EMAIL,
      to: recipientEmail,
      subject,
      text,
      html: text.replace(/\n/g, '<br>'),
    };

    const result = await transporter.sendMail(mailOptions);

    // Log email notification
    await logEmailNotification({
      type,
      recipient_email: recipientEmail,
      subject,
      tracking_number: trackingNumber,
      status: 'sent',
    });

    return true;
  } catch (error) {
    console.error('Error sending submission email:', error);
    await logEmailNotification({
      type,
      recipient_email: recipientEmail,
      subject: `Submission Email - ${type}`,
      tracking_number: trackingNumber,
      status: 'failed',
      error: error.message,
    });
    return false;
  }
}

/**
 * Send status update email
 * Used when staff updates request/complaint status
 */
export async function sendStatusUpdateEmail(
  recipientEmail,
  trackingNumber,
  newStatus,
  reason = '',
  type = 'document', // 'document' or 'complaint'
  details = {}
) {
  if (!transporter) {
    console.warn('Email service not configured. Skipping email.');
    return false;
  }

  try {
    let subject, text, trackingPageUrl;

    if (type === 'document') {
      trackingPageUrl = `${FRONTEND_URL}/track-document?ref=${trackingNumber}`;
      let statusText = '';

      if (newStatus === 'approved') {
        statusText = 'Your document request has been APPROVED.';
        text = `
Dear ${details.full_name || 'Applicant'},

${statusText}

Reference Number: ${trackingNumber}
New Status: Approved
Updated: ${new Date().toLocaleDateString()}

Next Steps:
Please proceed to the Barangay office for physical verification and document release.
Bring a valid ID for verification purposes.

Track your request:
${trackingPageUrl}

Best regards,
Barangay Catarman
        `;
        subject = `Your Request Approved - Reference: ${trackingNumber}`;
      } else if (newStatus === 'rejected') {
        statusText = 'Your document request has been REJECTED.';
        text = `
Dear ${details.full_name || 'Applicant'},

${statusText}

Reference Number: ${trackingNumber}
New Status: Rejected
Updated: ${new Date().toLocaleDateString()}

Reason: ${reason || 'Not specified'}

If you believe this is an error, please contact the Barangay office.

Track your request:
${trackingPageUrl}

Best regards,
Barangay Catarman
        `;
        subject = `Your Request Rejected - Reference: ${trackingNumber}`;
      } else if (newStatus === 'flagged') {
        statusText = 'Your document request requires action.';
        text = `
Dear ${details.full_name || 'Applicant'},

${statusText}

Reference Number: ${trackingNumber}
New Status: Flagged for Review
Updated: ${new Date().toLocaleDateString()}

Required Action: ${reason || 'Please contact the Barangay office for details'}

Please address the flagged items and resubmit if necessary.

Track your request:
${trackingPageUrl}

Best regards,
Barangay Catarman
        `;
        subject = `Your Request Flagged - Reference: ${trackingNumber}`;
      } else if (newStatus === 'released') {
        statusText = 'Your document is ready for pickup.';
        text = `
Dear ${details.full_name || 'Applicant'},

${statusText}

Reference Number: ${trackingNumber}
New Status: Released
Updated: ${new Date().toLocaleDateString()}

Your document is ready and available for pickup at the Barangay office.
Please bring your reference number when collecting your document.

Track your request:
${trackingPageUrl}

Best regards,
Barangay Catarman
        `;
        subject = `Your Document is Ready - Reference: ${trackingNumber}`;
      }
    } else if (type === 'complaint') {
      trackingPageUrl = `${FRONTEND_URL}/track-complaint?ref=${trackingNumber}`;
      let statusLabel = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);

      text = `
Dear ${details.reporter_name || 'Reporter'},

Your complaint status has been updated.

Tracking Number: ${trackingNumber}
New Status: ${statusLabel}
Updated: ${new Date().toLocaleDateString()}

${reason ? `Details: ${reason}` : ''}

Track your complaint:
${trackingPageUrl}

Thank you for your report.

Best regards,
Barangay Catarman
      `;
      subject = `Complaint Status Updated - Tracking: ${trackingNumber}`;
    }

    const mailOptions = {
      from: SENDER_EMAIL,
      to: recipientEmail,
      subject,
      text,
      html: text.replace(/\n/g, '<br>'),
    };

    await transporter.sendMail(mailOptions);

    // Log email notification
    await logEmailNotification({
      type,
      recipient_email: recipientEmail,
      subject,
      tracking_number: trackingNumber,
      status: 'sent',
      details: `Status: ${newStatus}${reason ? ` | Reason: ${reason}` : ''}`,
    });

    return true;
  } catch (error) {
    console.error('Error sending status update email:', error);
    await logEmailNotification({
      type,
      recipient_email: recipientEmail,
      subject: `Status Update Email - ${type}`,
      tracking_number: trackingNumber,
      status: 'failed',
      error: error.message,
    });
    return false;
  }
}

/**
 * Log email notification to database for audit trail
 */
export async function logEmailNotification(data) {
  try {
    await pool.query(
      `INSERT INTO email_notifications 
       (type, recipient_email, subject, tracking_number, status, details, error_message, sent_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
      [
        data.type || null,
        data.recipient_email || null,
        data.subject || null,
        data.tracking_number || null,
        data.status || 'pending',
        data.details || null,
        data.error || null,
      ]
    );
  } catch (error) {
    console.error('Error logging email notification:', error);
  }
}

export default {
  sendSubmissionEmail,
  sendStatusUpdateEmail,
  logEmailNotification,
};
