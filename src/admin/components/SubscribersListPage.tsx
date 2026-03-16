import type { FC } from 'hono/jsx'
import { AdminLayout } from './AdminLayout'
import type { Subscriber } from '../../types'

type SubWithGroup = Subscriber & { group_name: string }

type Props = {
  subscribers: SubWithGroup[]
  flash?: { message?: string; type?: 'success' | 'error' | 'info' } | null
}

export const SubscribersListPage: FC<Props> = ({ subscribers, flash }) => {
  return (
    <AdminLayout title="Subscribers" flash={flash}>
      <table>
        <thead>
          <tr><th>Email</th><th>Group</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {subscribers.length === 0 ? (
            <tr><td colspan={4} class="empty-state">No subscribers yet.</td></tr>
          ) : subscribers.map(s => (
            <tr>
              <td>{s.email}</td>
              <td>{s.group_name}</td>
              <td>
                {s.is_confirmed
                  ? <span class="badge badge-success">Confirmed</span>
                  : <span class="badge badge-warning">Unconfirmed</span>}
              </td>
              <td class="actions">
                <form method="post" action={`/admin/subscribers/${s.id}/delete`} style="display:inline;"
                  onsubmit="return confirm('Remove this subscriber?')">
                  <button type="submit" class="btn btn-sm btn-danger">Remove</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  )
}
