const authKey = process.env.MSG91_AUTH_KEY?.trim();
const senderId = process.env.MSG91_SENDER_ID?.trim();

/**
 * Sends a one-time verification code by SMS via MSG91. If MSG91 isn't configured (no
 * MSG91_AUTH_KEY/MSG91_SENDER_ID), logs the code to the server console instead — usable for
 * local development and testing the OTP flow end-to-end, but not a substitute for real delivery
 * in production.
 */
export async function sendOtpSms(phone: string, code: string): Promise<void> {
  if (!authKey || !senderId) {
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
