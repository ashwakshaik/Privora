import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

/**
 * Sends a transactional email using Resend, falling back to console logs in development.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: "Privora Security <security@privora.io>",
        to: [to],
        subject,
        html,
        text
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("[Resend Error] Failed to send email:", err);
      // Fallback log
      console.log(`[Resend Fallback] Email to: ${to} | Subject: ${subject}`);
      return null;
    }
  } else {
    console.log(`
========================================
[MOCK EMAIL NOTIFICATION]
To: ${to}
Subject: ${subject}
Text: ${text}
========================================
    `);
    return { id: "mock_email_id" };
  }
}

export async function sendOtpEmail(email: string, otp: string) {
  return sendEmail({
    to: email,
    subject: "Privora Verification Code",
    text: `Your Privora verification code is: ${otp}. This code expires in 10 minutes.`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; rounded: 8px;">
        <h2 style="color: #0f0f10;">Welcome to Privora</h2>
        <p>Please use the following verification code to complete your signup registration:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 15px; background-color: #f4f4f5; text-align: center; margin: 20px 0; border-radius: 6px;">
          ${otp}
        </div>
        <p style="font-size: 12px; color: #71717a;">This code will expire in 10 minutes. If you did not sign up for Privora, you can ignore this email.</p>
      </div>
    `
  });
}

export async function sendScanAlertEmail(email: string, score: number, exposuresFound: number) {
  const statusText = score > 80 ? "Secure" : score > 50 ? "Medium Risk" : "Vulnerable";
  return sendEmail({
    to: email,
    subject: `Privacy Scan Complete — Score: ${score}%`,
    text: `Your privacy scan is complete. We found ${exposuresFound} exposure records. Your current score is ${score}% (${statusText}).`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; rounded: 8px;">
        <h2 style="color: #0f0f10;">Privacy Scan Completed</h2>
        <p>Your search criteria scan completed successfully. Here are your latest index results:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Privacy Score Index:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: ${score > 80 ? "#10b981" : score > 50 ? "#3b82f6" : "#ef4444"};">${score}%</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">Exposures Detected:</td>
            <td style="padding: 8px 0; text-align: right;">${exposuresFound} registry listings</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">Risk Category:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 500;">${statusText}</td>
          </tr>
        </table>
        <p>Login to your dashboard to review the exposed registry entries and queue opt-out removal requests.</p>
      </div>
    `
  });
}

export async function sendRemovalCompletedEmail(email: string, brokerName: string) {
  return sendEmail({
    to: email,
    subject: `Opt-Out Complete — ${brokerName}`,
    text: `Great news! Your opt-out request for ${brokerName} was completed. The data broker has successfully removed your records.`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; rounded: 8px;">
        <h2 style="color: #10b981;">Opt-Out Successful</h2>
        <p>We are writing to confirm that your opt-out removal request has been completed:</p>
        <div style="padding: 15px; background-color: #f0fdf4; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 4px;">
          <strong>Data Broker:</strong> ${brokerName}<br/>
          <strong>Status:</strong> Completed & Verified
        </div>
        <p>Your privacy score has been credited. Autopilot continues to scan registries for re-exposure listings.</p>
      </div>
    `
  });
}
