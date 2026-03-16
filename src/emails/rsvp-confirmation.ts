import { formatDate, formatTime } from '../lib/dates'

export function rsvpConfirmationHtml(params: {
  name: string
  eventName: string
  groupName: string
  startTime: string
  endTime: string
  location: string
}): string {
  const { name, eventName, groupName, startTime, endTime, location } = params
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Confirmation</h1>
      <p>Dear ${name},</p>
      <p>Thank you for your RSVP to the ${eventName} event of the ${groupName} group.</p>
      <p>The event will be held on ${formatDate(startTime)} at ${formatTime(startTime, endTime)}, meeting at ${location}.</p>
      <p>We're excited to see you there!</p>
      <p>If you need to change your RSVP, or have questions, just reply to this email and let me know. (I haven't automated any of that yet).</p>
      <p>Thanks,<br>Jason O'Neil<br>Perth Web Devs</p>
    </div>
  `
}
