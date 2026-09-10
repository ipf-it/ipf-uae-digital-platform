const authKey = process.env.MSG91_AUTH_KEY?.trim();
const senderId = process.env.MSG91_SENDER_ID?.trim();

/**
 * Sends a one-time verification code by SMS via MSG91. If MSG91 isn't configured (no
 * MSG91_AUTH_KEY/MSG91_SENDER_ID) on a real deployment (Vercel sets VERCEL_ENV for both
 * production and preview), this throws instead of silently succeeding — a real visitor must never
 * see "code sent" when nothing was actually delivered. Purely local dev (no VERCEL_ENV at all)
 * still falls back to logging the code to the console, so the OTP flow can be exercised end to
 * end without a live SMS provider.
 */
export async function sendOtpSms(phone: string, code: string): Promise<void> {
  if (!authKey || !senderId) {
    if (process.env.VERCEL_ENV) {
      throw new Error("SMS delivery is not configured for this deployment yet — contact the site administrator.");
    }
    console.warn(`[sms] MSG91 not configured — OTP for ${phone} is ${code} (would not be delivered in production)`);
    return;
  }
  const response = await fetch("https://control.msg91.com/api/v5/flow/", {
    method: "POST",
    headers: { "Content-Type": "application/json", authkey: authKey },
    body: JSON.stringify({
      sender: senderId,
      mobiles: phone.replace("+", ""),
      var: code,
      template_id: process.env.MSG91_OTP_TEMPLATE_ID ?? undefined,
    }),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Could not send verification SMS (MSG91 responded ${response.status}): ${body.slice(0, 200)}`);
  }
}
