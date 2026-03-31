import { formatDate, formatTime } from '../lib/dates'
import { renderMarkdown } from '../lib/markdown'

export function eventReminderHtml(params: {
  eventName: string
  groupName: string
  startTime: string
  endTime: string
  location: string
  description: string
  eventUrl: string
  dayOfWeek: string
  hosts: { name: string }[]
}): string {
  const { eventName, groupName, startTime, endTime, location, description, eventUrl, dayOfWeek, hosts } = params
  const descHtml = renderMarkdown(description)
  const hostNames = hosts.length > 0 ? hosts.map(h => h.name).join(', ') : null

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>See you ${dayOfWeek}: ${eventName}</h1>
      <p>Thanks for your RSVP! Just a friendly reminder about the upcoming event.</p>
      <p><strong>What:</strong> ${eventName}</p>
      <p><strong>When:</strong> ${formatDate(startTime)}, ${formatTime(startTime, endTime)}</p>
      <p><strong>Where:</strong> ${location}</p>
      <div>${descHtml}</div>
      <p style="margin: 24px 0;">
        <a href="${eventUrl}" style="background: black; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
          View Event Details
        </a>
      </p>
      <p>
        ${hostNames ? `${hostNames}<br>` : ''}
        ${groupName}
      </p>
    </div>
  `
}
