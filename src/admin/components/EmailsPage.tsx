import type { FC } from 'hono/jsx'
import { AdminLayout } from './AdminLayout'
import type { MeetupEvent, MeetupGroup } from '../../types'
import { formatDate } from '../../lib/dates'

type EventOption = MeetupEvent & { group_name: string; rsvp_count: number; subscriber_count: number; non_rsvp_subscriber_count: number }

type Props = {
  groups: MeetupGroup[]
  events: EventOption[]
  selectedEventId?: number
  selectedType?: string
  customMessage?: string
  testEmail?: string
  recipientCount?: number
  recipientType?: string
  flash?: { message?: string; type?: 'success' | 'error' | 'info' } | null
}

export const EmailsPage: FC<Props> = ({ groups, events, selectedEventId, selectedType, customMessage, testEmail, recipientCount, recipientType, flash }) => {
  return (
    <AdminLayout title="Send Emails" flash={flash}>
      <div class="card">
        <h3>Select Event & Email Type</h3>
        <form method="get" action="/admin/emails" class="admin-form">
          <div class="form-group">
            <label>Event</label>
            <select name="event_id" required>
              <option value="">Select an event...</option>
              {events.map(e => (
                <option value={String(e.id)} selected={e.id === selectedEventId}>
                  {e.group_name}: {e.name} ({formatDate(e.start_time)})
                </option>
              ))}
            </select>
          </div>
          <div class="form-group">
            <label>Email Type</label>
            <select name="type" required>
              <option value="">Select type...</option>
              <option value="announcement" selected={selectedType === 'announcement'}>Announcement (to all confirmed subscribers)</option>
              <option value="bump" selected={selectedType === 'bump'}>Bump (to subscribers who haven't RSVP'd)</option>
              <option value="reminder" selected={selectedType === 'reminder'}>Reminder (to confirmed RSVPs)</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary">Preview Recipients</button>
        </form>
      </div>

      {selectedEventId && selectedType && recipientCount !== undefined && (
        <div class="card" style="margin-top: 16px;">
          <h3>Send: {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}</h3>
          <p style="margin-bottom: 12px;">
            <strong>{recipientCount}</strong> {recipientType} will receive this email.
          </p>

          {recipientCount === 0 ? (
            <p class="empty-state">No recipients match the criteria for this email type.</p>
          ) : (
            <form method="post" action="/admin/emails/send" class="admin-form">
              <input type="hidden" name="event_id" value={String(selectedEventId)} />
              <input type="hidden" name="type" value={selectedType} />

              {selectedType === 'bump' && (
                <div class="form-group">
                  <label>Custom Message (required for bump emails)</label>
                  <textarea name="custom_message" required placeholder="Write a personal message to encourage RSVPs...">{customMessage || ''}</textarea>
                </div>
              )}

              <div class="form-group">
                <label>Test Email Address</label>
                <input type="email" name="test_email" value={testEmail || ''} placeholder="your@email.com" />
                <div class="form-help">Send a test to this address first before sending to all recipients</div>
              </div>

              <div class="btn-group">
                <button type="submit" name="action" value="test" class="btn btn-warning">
                  Send Test Email
                </button>
                <button type="submit" name="action" value="send_all" class="btn btn-danger"
                  onclick={`return confirm('Are you sure you want to send this email to ${recipientCount} recipients?')`}>
                  Send to All ({recipientCount} recipients)
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </AdminLayout>
  )
}
