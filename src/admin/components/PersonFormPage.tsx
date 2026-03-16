import type { FC } from 'hono/jsx'
import { AdminLayout } from './AdminLayout'
import type { Person } from '../../types'

type Props = {
  person?: Person | null
  flash?: { message?: string; type?: 'success' | 'error' | 'info' } | null
}

export const PersonFormPage: FC<Props> = ({ person, flash }) => {
  const isEdit = !!person
  return (
    <AdminLayout title={isEdit ? `Edit: ${person!.name}` : 'New Person'} flash={flash}>
      <form method="post" class="admin-form" action={isEdit ? `/admin/people/${person!.id}/edit` : '/admin/people/new'}>
        <div class="form-group">
          <label>Name</label>
          <input type="text" name="name" value={person?.name || ''} required />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" name="email" value={person?.email || ''} required />
        </div>
        <div class="form-group">
          <label>Profile Image URL</label>
          <input type="text" name="profile_image_url" value={person?.profile_image_url || ''} />
          <div class="form-help">Path like /img/name.jpg or full URL</div>
        </div>
        <button type="submit" class="btn btn-primary">{isEdit ? 'Update Person' : 'Create Person'}</button>
        {' '}
        <a href="/admin/people" class="btn btn-secondary">Cancel</a>
      </form>
    </AdminLayout>
  )
}
