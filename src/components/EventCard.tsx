import type { FC } from 'hono/jsx'
import type { MeetupEvent } from '../types'
import { formatDate, formatTime } from '../lib/dates'

export const EventCard: FC<{ event: MeetupEvent; groupSlug: string; archived?: boolean }> = ({ event, groupSlug, archived }) => {
  return (
    <li class={`event${archived ? ' archived' : ''}`}>
      <h3 class="card-title">
        <a href={`/meetups/${groupSlug}/events/${event.slug}`}>
          {event.name}
        </a>
      </h3>
      <dl class="event-details card-body">
        <dt>Date:</dt>
        <dd>{formatDate(event.start_time)}</dd>
        <dt>Time:</dt>
        <dd>{formatTime(event.start_time, event.end_time)}</dd>
        <dt>Location:</dt>
        <dd>{event.location}</dd>
        {archived ? (
          <>
            <dt>Attendees:</dt>
            <dd>{event.confirmed_rsvp_count || 0} people attended</dd>
          </>
        ) : (
          <>
            <dt>Spaces available:</dt>
            <dd>
              {event.max_attendance}
              {' '}
              {(event.remaining_places ?? 0) > 0
                ? `(${event.remaining_places} remaining)`
                : '(Fully booked)'}
            </dd>
          </>
        )}
      </dl>
    </li>
  )
}
