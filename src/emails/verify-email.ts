export function verifyEmailHtml(params: {
  verificationUrl: string
  type: 'rsvp' | 'subscription'
  eventName?: string
  groupName: string
}): string {
  const { verificationUrl, type, eventName, groupName } = params
  const actionText = type === 'rsvp'
    ? `Your RSVP to <strong>${eventName}</strong> (${groupName}) will be confirmed once you click the button below.`
    : `Your subscription to <strong>${groupName}</strong> will be confirmed once you click the button below.`

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Verify Your Email Address</h1>
      <p>Thanks for your interest in Perth Web Devs!</p>
      <p>Due to weird spammers who think filling out fake RSVPs is going to get them traffic, we need to verify your email address.</p>
      <p>${actionText}</p>
      <p>Please click the button below to verify your email address and complete your ${type === 'rsvp' ? 'RSVP' : 'subscription'}.</p>
      <p style="margin: 24px 0;">
        <a href="${verificationUrl}" style="background: black; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
          Verify Email Address
        </a>
      </p>
      <p>This link will expire in 48 hours.</p>
      <p>If you didn't make this request, you can safely ignore this email.</p>
      <p>Thanks,<br>Jason O'Neil<br>${groupName}</p>
    </div>
  `
}
