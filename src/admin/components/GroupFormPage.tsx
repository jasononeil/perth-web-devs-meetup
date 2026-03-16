import type { FC } from 'hono/jsx'
import { AdminLayout } from './AdminLayout'
import type { MeetupGroup, Person } from '../../types'

type Props = {
  group?: MeetupGroup | null
  allPeople: Person[]
  currentOrganiserIds: number[]
  flash?: { message?: string; type?: 'success' | 'error' | 'info' } | null
}

export const GroupFormPage: FC<Props> = ({ group, allPeople, currentOrganiserIds, flash }) => {
  const isEdit = !!group
  return (
    <AdminLayout title={isEdit ? `Edit: ${group!.name}` : 'New Group'} flash={flash}>
      <form method="post" class="admin-form" action={isEdit ? `/admin/groups/${group!.id}/edit` : '/admin/groups/new'}>
        <div class="form-group">
          <label>Name</label>
          <input type="text" name="name" value={group?.name || ''} required />
        </div>
        <div class="form-group">
          <label>Slug</label>
          <input type="text" name="slug" value={group?.slug || ''} required />
          <div class="form-help">URL-friendly identifier (e.g. perth-web-devs)</div>
        </div>
        <div class="form-group">
          <label>Description (Markdown)</label>
          <textarea name="description">{group?.description || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Organisers</label>
          {allPeople.map(p => (
            <div class="form-group-inline">
              <input type="checkbox" name="organiser_ids" value={String(p.id)}
                checked={currentOrganiserIds.includes(p.id)} />
              <label>{p.name} ({p.email})</label>
            </div>
          ))}
          {allPeople.length === 0 && <div class="form-help">No people exist yet. Create people first.</div>}
        </div>
        <button type="submit" class="btn btn-primary">{isEdit ? 'Update Group' : 'Create Group'}</button>
        {' '}
        <a href="/admin/groups" class="btn btn-secondary">Cancel</a>
      </form>
    </AdminLayout>
  )
}
