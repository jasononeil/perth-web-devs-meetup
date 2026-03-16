import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth'
import { getCookie, setCookie } from 'hono/cookie'
import type { Bindings, MeetupGroup, MeetupEvent, Person, RSVP, Subscriber } from '../types'
import { isArchived } from '../lib/dates'
import { sendEmail } from '../lib/resend'
import { eventAnnouncementHtml } from '../emails/event-announcement'
import { eventReminderHtml } from '../emails/event-reminder'
import { eventBumpHtml } from '../emails/event-bump'
import { DashboardPage } from './components/DashboardPage'
import { GroupsListPage } from './components/GroupsListPage'
import { GroupFormPage } from './components/GroupFormPage'
import { EventsListPage } from './components/EventsListPage'
import { EventFormPage } from './components/EventFormPage'
import { PeopleListPage } from './components/PeopleListPage'
import { PersonFormPage } from './components/PersonFormPage'
import { SubscribersListPage } from './components/SubscribersListPage'
import { RsvpsPage } from './components/RsvpsPage'
import { EmailsPage } from './components/EmailsPage'

const admin = new Hono<{ Bindings: Bindings }>()

// Basic auth middleware
admin.use('*', async (c, next) => {
  const password = c.env.ADMIN_PASSWORD
  if (!password) {
    return c.text('ADMIN_PASSWORD environment variable not set', 500)
  }
  const auth = basicAuth({ username: 'admin', password })
  return auth(c, next)
})

// --- Flash helpers ---
type Flash = { message?: string; type?: 'success' | 'error' | 'info' }

function setFlash(c: any, data: Flash) {
  setCookie(c, '_admin_flash', JSON.stringify(data), { path: '/admin', maxAge: 60, httpOnly: true, sameSite: 'Lax' })
}

function getFlash(c: any): Flash | null {
  const raw = getCookie(c, '_admin_flash')
  if (!raw) return null
  setCookie(c, '_admin_flash', '', { path: '/admin', maxAge: 0, httpOnly: true })
  try { return JSON.parse(raw) } catch { return null }
}

// --- Slug helper ---
function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// ==================== DASHBOARD ====================

admin.get('/', async (c) => {
  const db = c.env.DB
  const [groups, events, people, subscribers, upcoming] = await Promise.all([
    db.prepare('SELECT COUNT(*) as cnt FROM meetup_groups').first<{ cnt: number }>(),
    db.prepare('SELECT COUNT(*) as cnt FROM meetup_events').first<{ cnt: number }>(),
    db.prepare('SELECT COUNT(*) as cnt FROM people').first<{ cnt: number }>(),
    db.prepare('SELECT COUNT(*) as cnt FROM subscribers WHERE is_confirmed = 1').first<{ cnt: number }>(),
    db.prepare("SELECT COUNT(*) as cnt FROM meetup_events WHERE start_time > datetime('now')").first<{ cnt: number }>(),
  ])

  return c.html(
    <DashboardPage
      stats={{
        groups: groups?.cnt ?? 0,
        events: events?.cnt ?? 0,
        people: people?.cnt ?? 0,
        subscribers: subscribers?.cnt ?? 0,
        upcomingEvents: upcoming?.cnt ?? 0,
      }}
      flash={getFlash(c)}
    />
  )
})

// ==================== GROUPS ====================

admin.get('/groups', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM meetup_groups ORDER BY name').all<MeetupGroup>()
  return c.html(<GroupsListPage groups={results} flash={getFlash(c)} />)
})

admin.get('/groups/new', async (c) => {
  const { results: people } = await c.env.DB.prepare('SELECT * FROM people ORDER BY name').all<Person>()
  return c.html(<GroupFormPage allPeople={people} currentOrganiserIds={[]} flash={getFlash(c)} />)
})

admin.post('/groups/new', async (c) => {
  const body = await c.req.parseBody()
  const name = String(body.name || '').trim()
  const slug = String(body.slug || '').trim() || slugify(name)
  const description = String(body.description || '')
  const organiserIds = Array.isArray(body.organiser_ids) ? body.organiser_ids.map(Number) : body.organiser_ids ? [Number(body.organiser_ids)] : []

  const result = await c.env.DB
    .prepare('INSERT INTO meetup_groups (name, slug, description) VALUES (?, ?, ?)')
    .bind(name, slug, description).run()
  const groupId = Number(result.meta.last_row_id)

  for (const pid of organiserIds) {
    await c.env.DB.prepare('INSERT INTO meetup_group_organisers (meetup_group_id, person_id) VALUES (?, ?)').bind(groupId, pid).run()
  }

  setFlash(c, { message: `Group "${name}" created.`, type: 'success' })
  return c.redirect('/admin/groups')
})

admin.get('/groups/:id/edit', async (c) => {
  const db = c.env.DB
  const group = await db.prepare('SELECT * FROM meetup_groups WHERE id = ?').bind(c.req.param('id')).first<MeetupGroup>()
  if (!group) return c.notFound()
  const { results: people } = await db.prepare('SELECT * FROM people ORDER BY name').all<Person>()
  const { results: orgLinks } = await db.prepare('SELECT person_id FROM meetup_group_organisers WHERE meetup_group_id = ?').bind(group.id).all<{ person_id: number }>()
  return c.html(<GroupFormPage group={group} allPeople={people} currentOrganiserIds={orgLinks.map(o => o.person_id)} flash={getFlash(c)} />)
})

admin.post('/groups/:id/edit', async (c) => {
  const db = c.env.DB
  const id = Number(c.req.param('id'))
  const body = await c.req.parseBody()
  const name = String(body.name || '').trim()
  const slug = String(body.slug || '').trim()
  const description = String(body.description || '')
  const organiserIds = Array.isArray(body.organiser_ids) ? body.organiser_ids.map(Number) : body.organiser_ids ? [Number(body.organiser_ids)] : []

  await db.prepare('UPDATE meetup_groups SET name = ?, slug = ?, description = ? WHERE id = ?').bind(name, slug, description, id).run()
  await db.prepare('DELETE FROM meetup_group_organisers WHERE meetup_group_id = ?').bind(id).run()
  for (const pid of organiserIds) {
    await db.prepare('INSERT INTO meetup_group_organisers (meetup_group_id, person_id) VALUES (?, ?)').bind(id, pid).run()
  }

  setFlash(c, { message: `Group "${name}" updated.`, type: 'success' })
  return c.redirect('/admin/groups')
})

// ==================== EVENTS ====================

admin.get('/events', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT me.*, mg.name as group_name, mg.slug as group_slug,
      (SELECT COUNT(*) FROM rsvps WHERE meetup_event_id = me.id AND is_confirmed = 1) as rsvp_count
    FROM meetup_events me
    JOIN meetup_groups mg ON mg.id = me.meetup_group_id
    ORDER BY me.start_time DESC
  `).all()
  return c.html(<EventsListPage events={results as any} flash={getFlash(c)} />)
})

admin.get('/events/new', async (c) => {
  const db = c.env.DB
  const { results: groups } = await db.prepare('SELECT * FROM meetup_groups ORDER BY name').all<MeetupGroup>()
  const { results: people } = await db.prepare('SELECT * FROM people ORDER BY name').all<Person>()
  return c.html(<EventFormPage groups={groups} allPeople={people} currentHostIds={[]} flash={getFlash(c)} />)
})

admin.post('/events/new', async (c) => {
  const db = c.env.DB
  const body = await c.req.parseBody()
  const groupId = Number(body.meetup_group_id)
  const name = String(body.name || '').trim()
  const slug = String(body.slug || '').trim() || slugify(name)
  const description = String(body.description || '')
  const location = String(body.location || '')
  const date = String(body.date || '')
  const startTime = String(body.start_time || '')
  const endTime = String(body.end_time || '')
  const maxAttendance = Number(body.max_attendance || 50)
  const acceptingRsvps = body.accepting_rsvps === '1' ? 1 : 0
  const hostIds = Array.isArray(body.host_ids) ? body.host_ids.map(Number) : body.host_ids ? [Number(body.host_ids)] : []

  const startDt = `${date} ${startTime}:00`
  const endDt = `${date} ${endTime}:00`

  const result = await db.prepare(
    'INSERT INTO meetup_events (meetup_group_id, name, slug, description, location, start_time, end_time, max_attendance, accepting_rsvps) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(groupId, name, slug, description, location, startDt, endDt, maxAttendance, acceptingRsvps).run()
  const eventId = Number(result.meta.last_row_id)

  for (const hid of hostIds) {
    await db.prepare('INSERT INTO meetup_event_hosts (meetup_event_id, person_id) VALUES (?, ?)').bind(eventId, hid).run()
  }

  setFlash(c, { message: `Event "${name}" created.`, type: 'success' })
  return c.redirect('/admin/events')
})

admin.get('/events/:id/edit', async (c) => {
  const db = c.env.DB
  const event = await db.prepare('SELECT * FROM meetup_events WHERE id = ?').bind(c.req.param('id')).first<MeetupEvent>()
  if (!event) return c.notFound()
  const { results: groups } = await db.prepare('SELECT * FROM meetup_groups ORDER BY name').all<MeetupGroup>()
  const { results: people } = await db.prepare('SELECT * FROM people ORDER BY name').all<Person>()
  const { results: hostLinks } = await db.prepare('SELECT person_id FROM meetup_event_hosts WHERE meetup_event_id = ?').bind(event.id).all<{ person_id: number }>()
  return c.html(<EventFormPage event={event} groups={groups} allPeople={people} currentHostIds={hostLinks.map(h => h.person_id)} flash={getFlash(c)} />)
})

admin.post('/events/:id/edit', async (c) => {
  const db = c.env.DB
  const id = Number(c.req.param('id'))
  const body = await c.req.parseBody()
  const groupId = Number(body.meetup_group_id)
  const name = String(body.name || '').trim()
  const slug = String(body.slug || '').trim()
  const description = String(body.description || '')
  const location = String(body.location || '')
  const date = String(body.date || '')
  const startTime = String(body.start_time || '')
  const endTime = String(body.end_time || '')
  const maxAttendance = Number(body.max_attendance || 50)
  const acceptingRsvps = body.accepting_rsvps === '1' ? 1 : 0
  const hostIds = Array.isArray(body.host_ids) ? body.host_ids.map(Number) : body.host_ids ? [Number(body.host_ids)] : []

  const startDt = `${date} ${startTime}:00`
  const endDt = `${date} ${endTime}:00`

  await db.prepare(
    'UPDATE meetup_events SET meetup_group_id = ?, name = ?, slug = ?, description = ?, location = ?, start_time = ?, end_time = ?, max_attendance = ?, accepting_rsvps = ? WHERE id = ?'
  ).bind(groupId, name, slug, description, location, startDt, endDt, maxAttendance, acceptingRsvps, id).run()

  await db.prepare('DELETE FROM meetup_event_hosts WHERE meetup_event_id = ?').bind(id).run()
  for (const hid of hostIds) {
    await db.prepare('INSERT INTO meetup_event_hosts (meetup_event_id, person_id) VALUES (?, ?)').bind(id, hid).run()
  }

  setFlash(c, { message: `Event "${name}" updated.`, type: 'success' })
  return c.redirect('/admin/events')
})

// ==================== RSVPs ====================

admin.get('/events/:id/rsvps', async (c) => {
  const db = c.env.DB
  const event = await db.prepare('SELECT * FROM meetup_events WHERE id = ?').bind(c.req.param('id')).first<MeetupEvent>()
  if (!event) return c.notFound()
  const group = await db.prepare('SELECT * FROM meetup_groups WHERE id = ?').bind(event.meetup_group_id).first<MeetupGroup>()
  const { results: rsvps } = await db.prepare('SELECT * FROM rsvps WHERE meetup_event_id = ? ORDER BY created_at').bind(event.id).all<RSVP>()
  return c.html(<RsvpsPage event={event} groupName={group?.name || ''} rsvps={rsvps} flash={getFlash(c)} />)
})

// ==================== PEOPLE ====================

admin.get('/people', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM people ORDER BY name').all<Person>()
  return c.html(<PeopleListPage people={results} flash={getFlash(c)} />)
})

admin.get('/people/new', async (c) => {
  return c.html(<PersonFormPage flash={getFlash(c)} />)
})

admin.post('/people/new', async (c) => {
  const body = await c.req.parseBody()
  const name = String(body.name || '').trim()
  const email = String(body.email || '').trim()
  const profileImageUrl = String(body.profile_image_url || '')

  await c.env.DB.prepare(
    "INSERT INTO people (name, email, profile_image_url, email_verified_at) VALUES (?, ?, ?, datetime('now'))"
  ).bind(name, email, profileImageUrl).run()

  setFlash(c, { message: `Person "${name}" created.`, type: 'success' })
  return c.redirect('/admin/people')
})

admin.get('/people/:id/edit', async (c) => {
  const person = await c.env.DB.prepare('SELECT * FROM people WHERE id = ?').bind(c.req.param('id')).first<Person>()
  if (!person) return c.notFound()
  return c.html(<PersonFormPage person={person} flash={getFlash(c)} />)
})

admin.post('/people/:id/edit', async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.parseBody()
  const name = String(body.name || '').trim()
  const email = String(body.email || '').trim()
  const profileImageUrl = String(body.profile_image_url || '')

  await c.env.DB.prepare('UPDATE people SET name = ?, email = ?, profile_image_url = ? WHERE id = ?')
    .bind(name, email, profileImageUrl, id).run()

  setFlash(c, { message: `Person "${name}" updated.`, type: 'success' })
  return c.redirect('/admin/people')
})

admin.post('/people/:id/verify', async (c) => {
  const id = Number(c.req.param('id'))
  const db = c.env.DB
  const person = await db.prepare('SELECT * FROM people WHERE id = ?').bind(id).first<Person>()
  if (!person) return c.notFound()

  await db.prepare("UPDATE people SET email_verified_at = datetime('now') WHERE id = ?").bind(id).run()
  await db.prepare('UPDATE rsvps SET is_confirmed = 1 WHERE email = ?').bind(person.email).run()
  await db.prepare('UPDATE subscribers SET is_confirmed = 1 WHERE email = ?').bind(person.email).run()

  setFlash(c, { message: `${person.email} verified.`, type: 'success' })
  return c.redirect('/admin/people')
})

// ==================== SUBSCRIBERS ====================

admin.get('/subscribers', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT s.*, mg.name as group_name
    FROM subscribers s
    JOIN meetup_groups mg ON mg.id = s.meetup_group_id
    ORDER BY s.email
  `).all()
  return c.html(<SubscribersListPage subscribers={results as any} flash={getFlash(c)} />)
})

admin.post('/subscribers/:id/delete', async (c) => {
  await c.env.DB.prepare('DELETE FROM subscribers WHERE id = ?').bind(c.req.param('id')).run()
  setFlash(c, { message: 'Subscriber removed.', type: 'success' })
  return c.redirect('/admin/subscribers')
})

// ==================== EMAILS ====================

admin.get('/emails', async (c) => {
  const db = c.env.DB
  const { results: groups } = await db.prepare('SELECT * FROM meetup_groups ORDER BY name').all<MeetupGroup>()
  const { results: events } = await db.prepare(`
    SELECT me.*, mg.name as group_name, mg.slug as group_slug,
      (SELECT COUNT(*) FROM rsvps WHERE meetup_event_id = me.id AND is_confirmed = 1) as rsvp_count,
      (SELECT COUNT(*) FROM subscribers WHERE meetup_group_id = me.meetup_group_id AND is_confirmed = 1) as subscriber_count
    FROM meetup_events me
    JOIN meetup_groups mg ON mg.id = me.meetup_group_id
    ORDER BY me.start_time DESC
  `).all()

  const selectedEventId = Number(c.req.query('event_id')) || undefined
  const selectedType = c.req.query('type') || undefined

  let recipientCount: number | undefined
  let recipientType: string | undefined

  if (selectedEventId && selectedType) {
    const event = events.find((e: any) => e.id === selectedEventId) as any
    if (event) {
      if (selectedType === 'announcement') {
        const cnt = await db.prepare(
          'SELECT COUNT(*) as cnt FROM subscribers WHERE meetup_group_id = ? AND is_confirmed = 1'
        ).bind(event.meetup_group_id).first<{ cnt: number }>()
        recipientCount = cnt?.cnt ?? 0
        recipientType = 'confirmed subscribers'
      } else if (selectedType === 'bump') {
        const cnt = await db.prepare(`
          SELECT COUNT(*) as cnt FROM subscribers
          WHERE meetup_group_id = ? AND is_confirmed = 1
          AND email NOT IN (SELECT email FROM rsvps WHERE meetup_event_id = ? AND is_confirmed = 1 AND email IS NOT NULL)
        `).bind(event.meetup_group_id, selectedEventId).first<{ cnt: number }>()
        recipientCount = cnt?.cnt ?? 0
        recipientType = "confirmed subscribers who haven't RSVP'd"
      } else if (selectedType === 'reminder') {
        const cnt = await db.prepare(
          'SELECT COUNT(*) as cnt FROM rsvps WHERE meetup_event_id = ? AND is_confirmed = 1 AND email IS NOT NULL'
        ).bind(selectedEventId).first<{ cnt: number }>()
        recipientCount = cnt?.cnt ?? 0
        recipientType = 'confirmed RSVPs with email'
      }
    }
  }

  // Compute non_rsvp_subscriber_count for each event
  const eventsWithCounts = await Promise.all((events as any[]).map(async (e) => {
    const cnt = await db.prepare(`
      SELECT COUNT(*) as cnt FROM subscribers
      WHERE meetup_group_id = ? AND is_confirmed = 1
      AND email NOT IN (SELECT email FROM rsvps WHERE meetup_event_id = ? AND is_confirmed = 1 AND email IS NOT NULL)
    `).bind(e.meetup_group_id, e.id).first<{ cnt: number }>()
    return { ...e, non_rsvp_subscriber_count: cnt?.cnt ?? 0 }
  }))

  return c.html(
    <EmailsPage
      groups={groups}
      events={eventsWithCounts as any}
      selectedEventId={selectedEventId}
      selectedType={selectedType}
      recipientCount={recipientCount}
      recipientType={recipientType}
      flash={getFlash(c)}
    />
  )
})

admin.post('/emails/send', async (c) => {
  const db = c.env.DB
  const body = await c.req.parseBody()
  const eventId = Number(body.event_id)
  const type = String(body.type)
  const action = String(body.action)
  const testEmail = String(body.test_email || '').trim()
  const customMessage = String(body.custom_message || '').trim()

  const event = await db.prepare('SELECT * FROM meetup_events WHERE id = ?').bind(eventId).first<MeetupEvent>()
  if (!event) {
    setFlash(c, { message: 'Event not found.', type: 'error' })
    return c.redirect('/admin/emails')
  }

  const group = await db.prepare('SELECT * FROM meetup_groups WHERE id = ?').bind(event.meetup_group_id).first<MeetupGroup>()
  if (!group) {
    setFlash(c, { message: 'Group not found.', type: 'error' })
    return c.redirect('/admin/emails')
  }

  // Get hosts
  const { results: hosts } = await db.prepare(`
    SELECT p.* FROM people p
    JOIN meetup_event_hosts meh ON meh.person_id = p.id
    WHERE meh.meetup_event_id = ?
  `).bind(eventId).all<Person>()

  const appUrl = c.env.APP_URL || new URL(c.req.url).origin
  const rsvpUrl = `${appUrl}/meetups/${group.slug}/events/${event.slug}`
  const dayOfWeek = new Date(event.start_time + 'Z').toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })

  // Build email HTML based on type
  let subject: string
  let html: string

  if (type === 'announcement') {
    subject = `Upcoming Event: ${event.name}`
    html = eventAnnouncementHtml({
      eventName: event.name, groupName: group.name, startTime: event.start_time,
      endTime: event.end_time, location: event.location, description: event.description,
      rsvpUrl, hosts,
    })
  } else if (type === 'bump') {
    if (!customMessage) {
      setFlash(c, { message: 'Custom message is required for bump emails.', type: 'error' })
      return c.redirect(`/admin/emails?event_id=${eventId}&type=${type}`)
    }
    subject = event.name
    html = eventBumpHtml({
      eventName: event.name, groupName: group.name, startTime: event.start_time,
      endTime: event.end_time, location: event.location, description: event.description,
      customMessage, rsvpUrl, hosts,
    })
  } else if (type === 'reminder') {
    subject = `See you ${dayOfWeek}: ${event.name}`
    html = eventReminderHtml({
      eventName: event.name, groupName: group.name, startTime: event.start_time,
      endTime: event.end_time, location: event.location, description: event.description,
      eventUrl: rsvpUrl, dayOfWeek, hosts,
    })
  } else {
    setFlash(c, { message: 'Invalid email type.', type: 'error' })
    return c.redirect('/admin/emails')
  }

  // Send test email
  if (action === 'test') {
    if (!testEmail) {
      setFlash(c, { message: 'Please provide a test email address.', type: 'error' })
      return c.redirect(`/admin/emails?event_id=${eventId}&type=${type}`)
    }
    if (c.env.RESEND_API_KEY) {
      try {
        await sendEmail(c.env.RESEND_API_KEY, { to: testEmail, subject: `[TEST] ${subject}`, html })
        setFlash(c, { message: `Test email sent to ${testEmail}.`, type: 'success' })
      } catch (e: any) {
        setFlash(c, { message: `Failed to send test email: ${e.message}`, type: 'error' })
      }
    } else {
      setFlash(c, { message: 'RESEND_API_KEY not configured.', type: 'error' })
    }
    return c.redirect(`/admin/emails?event_id=${eventId}&type=${type}`)
  }

  // Send to all recipients
  if (action === 'send_all') {
    if (!c.env.RESEND_API_KEY) {
      setFlash(c, { message: 'RESEND_API_KEY not configured.', type: 'error' })
      return c.redirect(`/admin/emails?event_id=${eventId}&type=${type}`)
    }

    let recipients: string[] = []

    if (type === 'announcement') {
      const { results } = await db.prepare(
        'SELECT email FROM subscribers WHERE meetup_group_id = ? AND is_confirmed = 1'
      ).bind(group.id).all<{ email: string }>()
      recipients = results.map(r => r.email)
    } else if (type === 'bump') {
      const { results } = await db.prepare(`
        SELECT email FROM subscribers
        WHERE meetup_group_id = ? AND is_confirmed = 1
        AND email NOT IN (SELECT email FROM rsvps WHERE meetup_event_id = ? AND is_confirmed = 1 AND email IS NOT NULL)
      `).bind(group.id, eventId).all<{ email: string }>()
      recipients = results.map(r => r.email)
    } else if (type === 'reminder') {
      const { results } = await db.prepare(
        'SELECT email FROM rsvps WHERE meetup_event_id = ? AND is_confirmed = 1 AND email IS NOT NULL'
      ).bind(eventId).all<{ email: string }>()
      recipients = results.map(r => r.email)
    }

    // Create message record
    const msgResult = await db.prepare(
      'INSERT INTO meetup_event_messages (meetup_event_id, message_type, custom_message) VALUES (?, ?, ?)'
    ).bind(eventId, type, customMessage || null).run()
    const messageId = Number(msgResult.meta.last_row_id)

    let sentCount = 0
    let failCount = 0

    for (const email of recipients) {
      try {
        await sendEmail(c.env.RESEND_API_KEY, { to: email, subject, html })
        await db.prepare(
          "INSERT INTO meetup_event_mail_logs (meetup_event_message_id, recipient_email, sent_at) VALUES (?, ?, datetime('now'))"
        ).bind(messageId, email).run()
        sentCount++
      } catch (e) {
        failCount++
      }
    }

    const msg = `Sent ${sentCount} ${type} email(s).${failCount > 0 ? ` ${failCount} failed.` : ''}`
    setFlash(c, { message: msg, type: failCount > 0 ? 'error' : 'success' })
    return c.redirect(`/admin/emails?event_id=${eventId}&type=${type}`)
  }

  return c.redirect('/admin/emails')
})

export { admin }
