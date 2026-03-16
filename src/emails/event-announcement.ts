import { formatDate, formatTime } from '../lib/dates'
import { renderMarkdown } from '../lib/markdown'

export function eventAnnouncementHtml(params: {
  eventName: string
  groupName: string
  startTime: string
  endTime: string
  location: string
  description: string
  rsvpUrl: string
  hosts: { name: string }[]
}): string {
  const { eventName, groupName, startTime, endTime, location, description, rsvpUrl, hosts } = params
  const descHtml = renderMarkdown(description)
  const hostNames = hosts.length > 0 ? hosts.map(h => h.name).join(', ') : null

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Upcoming Event: ${eventName}</h1>
      <p><strong>What:</strong> ${eventName}</p>
      <p><strong>When:</strong> ${formatDate(startTime)}, ${formatTime(startTime, endTime)}</p>
      <p><strong>Where:</strong> ${location}</p>
      <div>${descHtml}</div>
      <p style="margin: 24px 0;">
        <a href="${rsvpUrl}" style="background: black; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
          RSVP Now
        </a>
      </p>
      <p>
        ${hostNames ? `${hostNames}<br>` : ''}
        ${groupName}
      </p>
    </div>
  `
}
