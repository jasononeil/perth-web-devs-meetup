import type { FC } from 'hono/jsx'
import { AdminLayout } from './AdminLayout'
import type { MeetupEvent, MeetupGroup, Person } from '../../types'

type Props = {
  event?: MeetupEvent | null
  groups: MeetupGroup[]
  allPeople: Person[]
  currentHostIds: number[]
  selectedGroupId?: number
  flash?: { message?: string; type?: 'success' | 'error' | 'info' } | null
}

function toDateInput(dt: string): string {
  if (!dt) return ''
  return dt.split(' ')[0] || dt.split('T')[0] || ''
}

function toTimeInput(dt: string): string {
  if (!dt) return ''
  const parts = dt.split(' ')
  const time = parts[1] || ''
  return time.substring(0, 5)
}

export const EventFormPage: FC<Props> = ({ event, groups, allPeople, currentHostIds, selectedGroupId, flash }) => {
  const isEdit = !!event
  return (
    <AdminLayout title={isEdit ? `Edit: ${event!.name}` : 'New Event'} flash={flash}>
      <form method="post" class="admin-form" action={isEdit ? `/admin/events/${event!.id}/edit` : '/admin/events/new'}>
        <div class="form-group">
          <label>Group</label>
          <select name="meetup_group_id" required>
            <option value="">Select a group...</option>
            {groups.map(g => (
              <option value={String(g.id)} selected={g.id === (event?.meetup_group_id || selectedGroupId)}>{g.name}</option>
            ))}
          </select>
        </div>
        <div class="form-group">
          <label>Event Name</label>
          <input type="text" name="name" value={event?.name || ''} required />
        </div>
        <div class="form-group">
          <label>Slug</label>
          <input type="text" name="slug" value={event?.slug || ''} required />
          <div class="form-help">URL-friendly identifier</div>
        </div>
        <div class="form-group">
          <label>Description (Markdown)</label>
          <textarea name="description" style="min-height: 200px;">{event?.description || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Location</label>
          <input type="text" name="location" value={event?.location || ''} />
        </div>
        <div class="form-group">
          <label>Date</label>
          <input type="date" name="date" value={event ? toDateInput(event.start_time) : ''} required />
        </div>
        <div class="form-group">
          <label>Start Time</label>
          <input type="time" name="start_time" value={event ? toTimeInput(event.start_time) : '17:30'} required />
        </div>
        <div class="form-group">
          <label>End Time</label>
          <input type="time" name="end_time" value={event ? toTimeInput(event.end_time) : '19:30'} required />
        </div>
        <div class="form-group">
          <label>Max Attendance</label>
          <input type="number" name="max_attendance" value={String(event?.max_attendance || 50)} />
        </div>
        <div class="form-group">
          <div class="form-group-inline">
            <input type="checkbox" name="accepting_rsvps" value="1" checked={event ? !!event.accepting_rsvps : true} />
            <label>Accept RSVPs</label>
          </div>
        </div>
        <div class="form-group">
          <label>Hosts</label>
          {allPeople.map(p => (
            <div class="form-group-inline">
              <input type="checkbox" name="host_ids" value={String(p.id)} checked={currentHostIds.includes(p.id)} />
              <label>{p.name} ({p.email})</label>
            </div>
          ))}
          {allPeople.length === 0 && <div class="form-help">No people exist yet.</div>}
        </div>
        <button type="submit" class="btn btn-primary">{isEdit ? 'Update Event' : 'Create Event'}</button>
        {' '}
        <a href="/admin/events" class="btn btn-secondary">Cancel</a>
      </form>
    </AdminLayout>
  )
}
