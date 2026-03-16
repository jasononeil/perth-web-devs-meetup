import { Resend } from 'resend'

export async function sendEmail(
  apiKey: string,
  { to, subject, html }: { to: string; subject: string; html: string }
): Promise<void> {
  const resend = new Resend(apiKey)
  await resend.emails.send({
    from: "Jason O'Neil (Perth Web Devs) <noreply@perth-web-devs.pages.dev>",
    to,
    subject,
    html,
  })
}
