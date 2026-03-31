import type { FC } from 'hono/jsx'
import { Layout } from './Layout'
import { AvatarList } from './AvatarList'
import { AlertBox } from './AlertBox'
import type { MeetupGroup, MeetupEvent, Person } from '../types'
import { formatDate, formatTime } from '../lib/dates'

type Props = {
  group: MeetupGroup
  event: MeetupEvent
  hosts: Person[]
  descriptionHtml: string
  isArchived: boolean
  remainingPlaces: number
  flash?: { message?: string; type?: 'success' | 'info'; hideForm?: boolean }
  errors?: string[]
}

export const EventPage: FC<Props> = ({
  group, event, hosts, descriptionHtml, isArchived, remainingPlaces,
  flash, errors
}) => {
  const canRsvp = !isArchived && event.accepting_rsvps && remainingPlaces > 0

  return (
    <Layout title={`${event.name} - ${group.name}`}>
      <h1>{group.name}</h1>
      <a href={`/meetups/${group.slug}`} class="back-link">&#8672; Back to all events for this group</a>

      <div class="event-grid">
        <section>
          <h2>
            {event.name}
            {isArchived && <span class="archived-badge">(Archived)</span>}
          </h2>
          <div class="lede-text" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
          <h3>Hosts</h3>
          <AvatarList people={hosts} />
        </section>
        <section>
          <h3>Details</h3>
          <dl class="event-details">
            <dt>Date:</dt>
            <dd>{formatDate(event.start_time)}</dd>
            <dt>Time:</dt>
            <dd>{formatTime(event.start_time, event.end_time)}</dd>
            <dt>Location:</dt>
            <dd>{event.location}</dd>
            <dt>Spaces available:</dt>
            <dd>
              {event.max_attendance}
              {' '}
              {remainingPlaces > 0
                ? `(${remainingPlaces} remaining)`
                : '(Fully booked)'}
            </dd>
          </dl>

          <h3>RSVP here</h3>
          {canRsvp ? (
            <>
              {flash?.message && (
                <AlertBox type={flash.type || 'success'} message={flash.message} />
              )}
              {errors && errors.length > 0 && (
                <div class="alert alert-danger">
                  <ul>
                    {errors.map((e) => <li>{e}</li>)}
                  </ul>
                </div>
              )}
              {!flash?.hideForm && (
                <form method="post" action={`/meetups/${group.slug}/events/${event.slug}/rsvp`}>
                  <div class="app-form-group">
                    <label for="name">Name</label>
                    <input type="text" class="app-form-control" id="name" name="name" required />
                  </div>
                  <div class="app-form-group">
                    <label for="email">Email</label>
                    <input type="email" class="app-form-control" id="email" name="email" />
                  </div>
                  <div class="app-form-group">
                    <label for="subscribe">Email me about future events</label>
                    <input type="checkbox" id="subscribe" name="subscribe" />
                  </div>
                  <button type="submit" class="app-btn">RSVP</button>
                </form>
              )}
            </>
          ) : (
            <>
              {isArchived && <p>This event has already taken place.</p>}
              {!isArchived && !event.accepting_rsvps && (
                <p>RSVPs are not open for this event yet. <a href={`/meetups/${group.slug}`}>Subscribe to our group</a> to be notified when RSVPs open.</p>
              )}
              {!isArchived && event.accepting_rsvps && remainingPlaces <= 0 && (
                <p>Event is fully booked - join waitlist</p>
              )}
            </>
          )}
        </section>
      </div>
    </Layout>
  )
}
