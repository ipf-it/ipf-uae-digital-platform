const apiKey = process.env.RESEND_API_KEY?.trim();
const fromAddress = process.env.EMAIL_FROM?.trim() || "Indian People's Forum UAE <no-reply@ipfuae.com>";

type EmailAttachment = { filename: string; content: Buffer };

/**
 * Sends a transactional email via Resend. Same fail-closed pattern as sms.ts's sendOtpSms: if
 * RESEND_API_KEY isn't configured on a real deployment, this throws instead of silently
 * succeeding — a member must never be told "your card was emailed" when nothing was actually
 * delivered. Purely local dev (no VERCEL_ENV) falls back to logging, so the flow can be exercised
 * end to end without a live email provider.
 */
export async function sendEmail(params: { to: string; subject: string; html: string; attachments?: EmailAttachment[] }): Promise<void> {
  if (!apiKey) {
    if (process.env.VERCEL_ENV) {
      throw new Error("Email delivery is not configured for this deployment yet — contact the site administrator.");
    }
    console.warn(`[email] RESEND_API_KEY not configured — would send "${params.subject}" to ${params.to}`);
    return;
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      from: fromAddress,
      to: params.to,
      subject: params.subject,
      html: params.html,
      attachments: params.attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content.toString("base64"),
      })),
    }),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Could not send email (Resend responded ${response.status}): ${body.slice(0, 200)}`);
  }
}
