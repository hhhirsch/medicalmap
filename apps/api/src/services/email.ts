import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

const fromEmail = process.env.FROM_EMAIL || "noreply@example.com";
const notificationRecipients = (process.env.LEAD_NOTIFICATION_TO || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export async function sendExportEmail(
  to: string,
  buffer: Buffer,
  contentType: string,
  filename: string
): Promise<void> {
  await resend.emails.send({
    from: fromEmail,
    to,
    subject: "Your Congress Directory Export",
    html: `<p>Hello,</p><p>Please find your congress directory export attached.</p><p>Best regards,<br/>Congress Directory Team</p>`,
    attachments: [
      {
        filename,
        content: buffer,
        contentType,
      },
    ],
  });
}

export async function sendLeadNotification(
  leadEmail: string,
  filters: Record<string, unknown>,
  exportType: string
): Promise<void> {
  if (notificationRecipients.length === 0) return;

  const filterSummary = Object.entries(filters)
    .filter(([, v]) => {
      if (v === null || v === undefined) return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    })
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
    .join("\n");

  await resend.emails.send({
    from: fromEmail,
    to: notificationRecipients,
    subject: `New Export Lead: ${leadEmail}`,
    html: `<p>A new export was requested.</p>
<p><strong>Email:</strong> ${leadEmail.replace(/^(.{1,2}).*(@.*)$/, "$1***$2")}</p>
<p><strong>Export type:</strong> ${exportType}</p>
<p><strong>Filters:</strong></p>
<pre>${filterSummary || "No filters"}</pre>`,
  });
}
