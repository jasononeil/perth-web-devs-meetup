import type { FC } from 'hono/jsx'
import { AdminLayout } from './AdminLayout'
import type { Person } from '../../types'

type Props = {
  people: Person[]
  flash?: { message?: string; type?: 'success' | 'error' | 'info' } | null
}

export const PeopleListPage: FC<Props> = ({ people, flash }) => {
  return (
    <AdminLayout title="People" flash={flash}>
      <a href="/admin/people/new" class="btn btn-primary" style="margin-bottom: 16px;">New Person</a>
      <table>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Verified</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {people.map(p => (
            <tr>
              <td>{p.name}</td>
              <td>{p.email}</td>
              <td>
                {p.email_verified_at
                  ? <span class="badge badge-success">Verified</span>
                  : <span class="badge badge-warning">Unverified</span>}
              </td>
              <td class="actions">
                <a href={`/admin/people/${p.id}/edit`} class="btn btn-sm btn-secondary">Edit</a>
                {!p.email_verified_at && (
                  <form method="post" action={`/admin/people/${p.id}/verify`} style="display:inline;">
                    <button type="submit" class="btn btn-sm btn-success">Verify</button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  )
}
