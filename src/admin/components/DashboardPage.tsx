import type { FC } from 'hono/jsx'
import { AdminLayout } from './AdminLayout'

type Props = {
  stats: { groups: number; events: number; people: number; subscribers: number; upcomingEvents: number }
  flash?: { message?: string; type?: 'success' | 'error' | 'info' } | null
}

export const DashboardPage: FC<Props> = ({ stats, flash }) => {
  return (
    <AdminLayout title="Dashboard" flash={flash}>
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-value">{stats.groups}</div>
          <div class="stat-label">Groups</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{stats.upcomingEvents}</div>
          <div class="stat-label">Upcoming Events</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{stats.events}</div>
          <div class="stat-label">Total Events</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{stats.subscribers}</div>
          <div class="stat-label">Subscribers</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{stats.people}</div>
          <div class="stat-label">People</div>
        </div>
      </div>
      <div class="btn-group">
        <a href="/admin/events/new" class="btn btn-primary">Create New Event</a>
        <a href="/admin/emails" class="btn btn-secondary">Send Emails</a>
      </div>
    </AdminLayout>
  )
}
