import type { FC } from 'hono/jsx'
import { AdminLayout } from './AdminLayout'
import type { MeetupGroup } from '../../types'

type Props = {
  groups: MeetupGroup[]
  flash?: { message?: string; type?: 'success' | 'error' | 'info' } | null
}

export const GroupsListPage: FC<Props> = ({ groups, flash }) => {
  return (
    <AdminLayout title="Groups" flash={flash}>
      <a href="/admin/groups/new" class="btn btn-primary" style="margin-bottom: 16px;">New Group</a>
      <table>
        <thead>
          <tr><th>Name</th><th>Slug</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {groups.map(g => (
            <tr>
              <td>{g.name}</td>
              <td><code>{g.slug}</code></td>
              <td class="actions">
                <a href={`/admin/groups/${g.id}/edit`} class="btn btn-sm btn-secondary">Edit</a>
                <a href={`/meetups/${g.slug}`} class="btn btn-sm btn-primary">View</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  )
}
