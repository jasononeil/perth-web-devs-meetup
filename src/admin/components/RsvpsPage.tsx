import type { FC } from 'hono/jsx'
import { AdminLayout } from './AdminLayout'
import type { MeetupEvent, RSVP } from '../../types'
import { formatDate, formatTime } from '../../lib/dates'

type Props = {
  event: MeetupEvent
  groupName: string
  rsvps: RSVP[]
  flash?: { message?: string; type?: 'success' | 'error' | 'info' } | null
}

export const RsvpsPage: FC<Props> = ({ event, groupName, rsvps, flash }) => {
  const confirmed = rsvps.filter(r => r.is_confirmed)
  const unconfirmed = rsvps.filter(r => !r.is_confirmed)

  return (
    <AdminLayout title={`RSVPs: ${event.name}`} flash={flash}>
      <p style="margin-bottom: 16px; color: #666;">
        {groupName} &middot; {formatDate(event.start_time)} &middot; {formatTime(event.start_time, event.end_time)}
      </p>
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-value">{confirmed.length}</div>
          <div class="stat-label">Confirmed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{unconfirmed.length}</div>
          <div class="stat-label">Unconfirmed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{event.max_attendance - confirmed.length}</div>
          <div class="stat-label">Remaining Places</div>
        </div>
      </div>

      <h2>Confirmed RSVPs ({confirmed.length})</h2>
      {confirmed.length === 0 ? (
        <p class="empty-state">No confirmed RSVPs yet.</p>
      ) : (
        <table>
          <thead><tr><th>#</th><th>Name</th><th>Email</th><th>RSVP Date</th></tr></thead>
          <tbody>
            {confirmed.map((r, i) => (
              <tr>
                <td>{i + 1}</td>
                <td>{r.name}</td>
                <td>{r.email || '—'}</td>
                <td>{r.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {unconfirmed.length > 0 && (
        <>
          <h2>Unconfirmed RSVPs ({unconfirmed.length})</h2>
          <table>
            <thead><tr><th>#</th><th>Name</th><th>Email</th><th>RSVP Date</th></tr></thead>
            <tbody>
              {unconfirmed.map((r, i) => (
                <tr>
                  <td>{i + 1}</td>
                  <td>{r.name}</td>
                  <td>{r.email || '—'}</td>
                  <td>{r.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <div class="btn-group">
        <a href={`/admin/events/${event.id}/edit`} class="btn btn-secondary">Edit Event</a>
        <a href="/admin/events" class="btn btn-secondary">Back to Events</a>
      </div>
    </AdminLayout>
  )
}
