import type { FC } from 'hono/jsx'
import { AdminLayout } from './AdminLayout'
import type { MeetupEvent } from '../../types'
import { formatDate } from '../../lib/dates'
import { isArchived } from '../../lib/dates'

type EventWithGroup = MeetupEvent & { group_name: string; group_slug: string; rsvp_count: number }

type Props = {
  events: EventWithGroup[]
  flash?: { message?: string; type?: 'success' | 'error' | 'info' } | null
}

export const EventsListPage: FC<Props> = ({ events, flash }) => {
  return (
    <AdminLayout title="Events" flash={flash}>
      <a href="/admin/events/new" class="btn btn-primary" style="margin-bottom: 16px;">New Event</a>
      <table>
        <thead>
          <tr><th>Name</th><th>Group</th><th>Date</th><th>RSVPs</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {events.map(e => (
            <tr>
              <td>{e.name}</td>
              <td>{e.group_name}</td>
              <td>{formatDate(e.start_time)}</td>
              <td>{e.rsvp_count} / {e.max_attendance}</td>
              <td>
                {isArchived(e.start_time) ? (
                  <span class="badge badge-warning">Past</span>
                ) : e.accepting_rsvps ? (
                  <span class="badge badge-success">Open</span>
                ) : (
                  <span class="badge badge-info">RSVPs Closed</span>
                )}
              </td>
              <td class="actions">
                <a href={`/admin/events/${e.id}/edit`} class="btn btn-sm btn-secondary">Edit</a>
                <a href={`/admin/events/${e.id}/rsvps`} class="btn btn-sm btn-primary">RSVPs</a>
                <a href={`/meetups/${e.group_slug}/events/${e.slug}`} class="btn btn-sm btn-secondary">View</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  )
}
