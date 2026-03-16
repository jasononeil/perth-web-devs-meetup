import { Hono } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import type { Bindings, MeetupGroup, MeetupEvent, Person, RSVP, Subscriber } from './types'
import { GroupPage } from './components/GroupPage'
import { EventPage } from './components/EventPage'
import { renderMarkdown } from './lib/markdown'
import { isArchived } from './lib/dates'
import { generateVerificationUrl, validateVerificationUrl } from './lib/verification'
import { sendEmail } from './lib/resend'
import { verifyEmailHtml } from './emails/verify-email'
import { rsvpConfirmationHtml } from './emails/rsvp-confirmation'
import { admin } from './admin/routes'

const app = new Hono<{ Bindings: Bindings }>()

// Mount admin routes
app.route('/admin', admin)

// --- Flash message helpers (cookie-based) ---

type FlashData = {
  message?: string
  type?: 'success' | 'info'
  hideForm?: boolean
  errors?: string[]
}

function setFlash(c: any, data: FlashData) {
  setCookie(c, '_flash', JSON.stringify(data), {
    path: '/',
    maxAge: 60,
    httpOnly: true,
    sameSite: 'Lax',
  })
}

function getFlash(c: any): FlashData | null {
  const raw = getCookie(c, '_flash')
  if (!raw) return null
  // Clear the flash cookie
  setCookie(c, '_flash', '', { path: '/', maxAge: 0, httpOnly: true })
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

// --- Routes ---

// Redirect root to the Perth Web Devs group
app.get('/', (c) => c.redirect('/meetups/perth-web-devs/'))

// Group page
app.get('/meetups/:groupSlug', async (c) => {
  const { groupSlug } = c.req.param()
  const db = c.env.DB

  const group = await db
    .prepare('SELECT * FROM meetup_groups WHERE slug = ?')
    .bind(groupSlug)
    .first<MeetupGroup>()

  if (!group) return c.notFound()

  // Get all events ordered by start_time desc
  const { results: events } = await db
    .prepare('SELECT * FROM meetup_events WHERE meetup_group_id = ? ORDER BY start_time DESC')
    .bind(group.id)
    .all<MeetupEvent>()

  // Separate upcoming and archived
  const upcomingEvents: MeetupEvent[] = []
  const archivedEvents: MeetupEvent[] = []

  for (const event of events) {
    // Get confirmed RSVP count
    const countResult = await db
      .prepare('SELECT COUNT(*) as cnt FROM rsvps WHERE meetup_event_id = ? AND is_confirmed = 1')
      .bind(event.id)
      .first<{ cnt: number }>()
    const confirmedCount = countResult?.cnt ?? 0
    event.confirmed_rsvp_count = confirmedCount
    event.remaining_places = event.max_attendance - confirmedCount

    if (isArchived(event.start_time)) {
      archivedEvents.push(event)
    } else {
      upcomingEvents.push(event)
    }
  }

  // Get organisers
  const { results: organisers } = await db
    .prepare(`
      SELECT p.* FROM people p
      JOIN meetup_group_organisers mgo ON mgo.person_id = p.id
      WHERE mgo.meetup_group_id = ?
    `)
    .bind(group.id)
    .all<Person>()

  const flash = getFlash(c)
  const descriptionHtml = renderMarkdown(group.description || '')

  return c.html(
    <GroupPage
      group={group}
      upcomingEvents={upcomingEvents}
      archivedEvents={archivedEvents}
      organisers={organisers}
      descriptionHtml={descriptionHtml}
      flash={flash || undefined}
      errors={flash?.errors}
      renderTimestamp={Math.floor(Date.now() / 1000)}
    />
  )
})

// Event page
app.get('/meetups/:groupSlug/events/:eventSlug', async (c) => {
  const { groupSlug, eventSlug } = c.req.param()
  const db = c.env.DB

  const group = await db
    .prepare('SELECT * FROM meetup_groups WHERE slug = ?')
    .bind(groupSlug)
    .first<MeetupGroup>()

  if (!group) return c.notFound()

  const event = await db
    .prepare('SELECT * FROM meetup_events WHERE meetup_group_id = ? AND slug = ?')
    .bind(group.id, eventSlug)
    .first<MeetupEvent>()

  if (!event) return c.notFound()

  // Get confirmed RSVP count
  const countResult = await db
    .prepare('SELECT COUNT(*) as cnt FROM rsvps WHERE meetup_event_id = ? AND is_confirmed = 1')
    .bind(event.id)
    .first<{ cnt: number }>()
  const confirmedCount = countResult?.cnt ?? 0
  const remainingPlaces = event.max_attendance - confirmedCount

  // Get hosts
  const { results: hosts } = await db
    .prepare(`
      SELECT p.* FROM people p
      JOIN meetup_event_hosts meh ON meh.person_id = p.id
      WHERE meh.meetup_event_id = ?
    `)
    .bind(event.id)
    .all<Person>()

  const flash = getFlash(c)
  const descriptionHtml = renderMarkdown(event.description || '')

  return c.html(
    <EventPage
      group={group}
      event={event}
      hosts={hosts}
      descriptionHtml={descriptionHtml}
      isArchived={isArchived(event.start_time)}
      remainingPlaces={remainingPlaces}
      flash={flash || undefined}
      errors={flash?.errors}
    />
  )
})

// Handle RSVP submission
app.post('/meetups/:groupSlug/events/:eventSlug/rsvp', async (c) => {
  const { groupSlug, eventSlug } = c.req.param()
  const db = c.env.DB

  const group = await db
    .prepare('SELECT * FROM meetup_groups WHERE slug = ?')
    .bind(groupSlug)
    .first<MeetupGroup>()
  if (!group) return c.notFound()

  const event = await db
    .prepare('SELECT * FROM meetup_events WHERE meetup_group_id = ? AND slug = ?')
    .bind(group.id, eventSlug)
    .first<MeetupEvent>()
  if (!event) return c.notFound()

  const body = await c.req.parseBody()
  const name = String(body.name || '').trim()
  const email = String(body.email || '').trim()
  const subscribe = body.subscribe === 'on'
  const redirectUrl = `/meetups/${groupSlug}/events/${eventSlug}`

  // Validation
  const errors: string[] = []
  if (!name) errors.push('Name is required.')
  if (name && /http/i.test(name)) {
    errors.push("We don't allow submissions if your name contains 'http'.")
  }
  if (!email) errors.push('Email is required.')
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please provide a valid email address.')
  }

  if (errors.length > 0) {
    setFlash(c, { errors })
    return c.redirect(redirectUrl)
  }

  // Find or create person
  let person = await db
    .prepare('SELECT * FROM people WHERE email = ?')
    .bind(email)
    .first<Person>()

  if (!person) {
    await db
      .prepare("INSERT INTO people (name, email, profile_image_url) VALUES (?, ?, '')")
      .bind('', email)
      .run()
    person = await db
      .prepare('SELECT * FROM people WHERE email = ?')
      .bind(email)
      .first<Person>()
  }

  const isVerified = person?.email_verified_at != null

  // Handle subscription checkbox
  if (subscribe) {
    const existingSub = await db
      .prepare('SELECT * FROM subscribers WHERE email = ? AND meetup_group_id = ?')
      .bind(email, group.id)
      .first<Subscriber>()

    if (existingSub) {
      await db
        .prepare('UPDATE subscribers SET is_confirmed = ? WHERE id = ?')
        .bind(isVerified ? 1 : 0, existingSub.id)
        .run()
    } else {
      await db
        .prepare('INSERT INTO subscribers (email, meetup_group_id, is_confirmed) VALUES (?, ?, ?)')
        .bind(email, group.id, isVerified ? 1 : 0)
        .run()
    }
  }

  // Create or update RSVP
  const existingRsvp = await db
    .prepare('SELECT * FROM rsvps WHERE meetup_event_id = ? AND email = ?')
    .bind(event.id, email)
    .first<RSVP>()

  let rsvpId: number
  if (existingRsvp) {
    await db
      .prepare('UPDATE rsvps SET name = ?, is_confirmed = ? WHERE id = ?')
      .bind(name, isVerified ? 1 : 0, existingRsvp.id)
      .run()
    rsvpId = existingRsvp.id
  } else {
    const result = await db
      .prepare('INSERT INTO rsvps (meetup_event_id, name, email, is_confirmed) VALUES (?, ?, ?, ?)')
      .bind(event.id, name, email, isVerified ? 1 : 0)
      .run()
    rsvpId = Number(result.meta.last_row_id)
  }

  if (isVerified) {
    // Send confirmation email
    if (c.env.RESEND_API_KEY) {
      await sendEmail(c.env.RESEND_API_KEY, {
        to: email,
        subject: `RSVP Confirmed: ${event.name}`,
        html: rsvpConfirmationHtml({
          name,
          eventName: event.name,
          groupName: group.name,
          startTime: event.start_time,
          endTime: event.end_time,
          location: event.location,
        }),
      })
    }

    setFlash(c, {
      message: "Thank you for your RSVP! We're excited to see you there.",
      type: 'success',
      hideForm: true,
    })
  } else {
    // Send verification email
    if (c.env.RESEND_API_KEY && c.env.VERIFICATION_SECRET) {
      const verificationUrl = await generateVerificationUrl(
        c.env.APP_URL || c.req.url,
        c.env.VERIFICATION_SECRET,
        { email, type: 'rsvp', rsvp_id: rsvpId }
      )
      await sendEmail(c.env.RESEND_API_KEY, {
        to: email,
        subject: 'Verify your RSVP - Perth Web Devs',
        html: verifyEmailHtml({
          verificationUrl,
          type: 'rsvp',
          eventName: event.name,
          groupName: group.name,
        }),
      })
    }

    setFlash(c, {
      message: "Please check your email to verify your address and complete your RSVP. (Sorry we need to do this - it's because spammers keep filling out fake RSVPs!)",
      type: 'info',
      hideForm: true,
    })
  }

  return c.redirect(redirectUrl)
})

// Handle subscription
app.post('/meetups/:groupSlug/subscribe', async (c) => {
  const { groupSlug } = c.req.param()
  const db = c.env.DB

  const group = await db
    .prepare('SELECT * FROM meetup_groups WHERE slug = ?')
    .bind(groupSlug)
    .first<MeetupGroup>()
  if (!group) return c.notFound()

  const body = await c.req.parseBody()
  const email = String(body.email || '').trim()
  const website = String(body.website || '').trim()
  const renderedAt = Number(body._rendered_at || 0)
  const redirectUrl = `/meetups/${groupSlug}`

  // Honeypot check
  if (website) {
    return c.redirect(redirectUrl)
  }

  // Timing check (< 2 seconds = bot)
  const now = Math.floor(Date.now() / 1000)
  if (renderedAt && now - renderedAt < 2) {
    return c.redirect(redirectUrl)
  }

  // Validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFlash(c, { errors: ['A valid email address is required.'] })
    return c.redirect(redirectUrl)
  }

  // Find or create person
  let person = await db
    .prepare('SELECT * FROM people WHERE email = ?')
    .bind(email)
    .first<Person>()

  if (!person) {
    await db
      .prepare("INSERT INTO people (name, email, profile_image_url) VALUES (?, ?, '')")
      .bind('', email)
      .run()
    person = await db
      .prepare('SELECT * FROM people WHERE email = ?')
      .bind(email)
      .first<Person>()
  }

  const isVerified = person?.email_verified_at != null

  // Create or update subscriber
  const existingSub = await db
    .prepare('SELECT * FROM subscribers WHERE email = ? AND meetup_group_id = ?')
    .bind(email, group.id)
    .first<Subscriber>()

  let subscriberId: number
  if (existingSub) {
    await db
      .prepare('UPDATE subscribers SET is_confirmed = ? WHERE id = ?')
      .bind(isVerified ? 1 : 0, existingSub.id)
      .run()
    subscriberId = existingSub.id
  } else {
    const result = await db
      .prepare('INSERT INTO subscribers (email, meetup_group_id, is_confirmed) VALUES (?, ?, ?)')
      .bind(email, group.id, isVerified ? 1 : 0)
      .run()
    subscriberId = Number(result.meta.last_row_id)
  }

  if (isVerified) {
    setFlash(c, {
      message: "Thanks for subscribing! We'll send you an email when we announce our next event.",
      type: 'success',
      hideForm: true,
    })
  } else {
    // Send verification email
    if (c.env.RESEND_API_KEY && c.env.VERIFICATION_SECRET) {
      const verificationUrl = await generateVerificationUrl(
        c.env.APP_URL || c.req.url,
        c.env.VERIFICATION_SECRET,
        { email, type: 'subscription', subscriber_id: subscriberId }
      )
      await sendEmail(c.env.RESEND_API_KEY, {
        to: email,
        subject: 'Verify your subscription - Perth Web Devs',
        html: verifyEmailHtml({
          verificationUrl,
          type: 'subscription',
          groupName: group.name,
        }),
      })
    }

    setFlash(c, {
      message: 'Please check your email to verify your address and complete your subscription.',
      type: 'info',
      hideForm: true,
    })
  }

  return c.redirect(redirectUrl)
})

// Email verification callback
app.get('/verify-email', async (c) => {
  const db = c.env.DB
  const url = new URL(c.req.url)

  // Validate signed URL
  const isValid = await validateVerificationUrl(url, c.env.VERIFICATION_SECRET)
  if (!isValid) {
    return c.text('This verification link has expired or is invalid.', 401)
  }

  const email = url.searchParams.get('email')
  const type = url.searchParams.get('type')

  if (!email) return c.text('Email not found.', 400)

  // Find and verify the person
  const person = await db
    .prepare('SELECT * FROM people WHERE email = ?')
    .bind(email)
    .first<Person>()

  if (!person) return c.text('Email not found.', 404)

  // Mark as verified
  await db
    .prepare("UPDATE people SET email_verified_at = datetime('now') WHERE id = ?")
    .bind(person.id)
    .run()

  // Confirm all RSVPs and subscriptions for this email
  await db
    .prepare('UPDATE rsvps SET is_confirmed = 1 WHERE email = ?')
    .bind(email)
    .run()
  await db
    .prepare('UPDATE subscribers SET is_confirmed = 1 WHERE email = ?')
    .bind(email)
    .run()

  // Handle RSVP verification
  if (type === 'rsvp') {
    const rsvpId = url.searchParams.get('rsvp_id')
    if (rsvpId) {
      const rsvp = await db
        .prepare('SELECT * FROM rsvps WHERE id = ?')
        .bind(rsvpId)
        .first<RSVP>()

      if (rsvp) {
        const event = await db
          .prepare('SELECT * FROM meetup_events WHERE id = ?')
          .bind(rsvp.meetup_event_id)
          .first<MeetupEvent>()

        if (event) {
          const group = await db
            .prepare('SELECT * FROM meetup_groups WHERE id = ?')
            .bind(event.meetup_group_id)
            .first<MeetupGroup>()

          if (group) {
            // Send RSVP confirmation email
            if (c.env.RESEND_API_KEY) {
              await sendEmail(c.env.RESEND_API_KEY, {
                to: email,
                subject: `RSVP Confirmed: ${event.name}`,
                html: rsvpConfirmationHtml({
                  name: rsvp.name,
                  eventName: event.name,
                  groupName: group.name,
                  startTime: event.start_time,
                  endTime: event.end_time,
                  location: event.location,
                }),
              })
            }

            setFlash(c, {
              message: 'Email verified! Your RSVP is now confirmed.',
              type: 'success',
            })
            return c.redirect(`/meetups/${group.slug}/events/${event.slug}`)
          }
        }
      }
    }
  }

  // For subscriptions — find a group they subscribed to
  const sub = await db
    .prepare('SELECT * FROM subscribers WHERE email = ?')
    .bind(email)
    .first<Subscriber>()

  if (sub) {
    const group = await db
      .prepare('SELECT * FROM meetup_groups WHERE id = ?')
      .bind(sub.meetup_group_id)
      .first<MeetupGroup>()

    if (group) {
      setFlash(c, {
        message: "Your email is verified - thanks for subscribing! We'll send you an email when we announce our next event.",
        type: 'success',
      })
      return c.redirect(`/meetups/${group.slug}`)
    }
  }

  // Fallback
  setFlash(c, { message: 'Email verified successfully!', type: 'success' })
  return c.redirect('/')
})

export default app
