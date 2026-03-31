import type { FC } from 'hono/jsx'
import { Layout } from './Layout'
import { EventCard } from './EventCard'
import { AvatarList } from './AvatarList'
import { AlertBox } from './AlertBox'
import type { MeetupGroup, MeetupEvent, Person } from '../types'

type Props = {
  group: MeetupGroup
  upcomingEvents: MeetupEvent[]
  archivedEvents: MeetupEvent[]
  organisers: Person[]
  descriptionHtml: string
  flash?: { message?: string; type?: 'success' | 'info'; hideForm?: boolean }
  errors?: string[]
  renderTimestamp: number
}

export const GroupPage: FC<Props> = ({
  group, upcomingEvents, archivedEvents, organisers, descriptionHtml,
  flash, errors, renderTimestamp
}) => {
  return (
    <Layout title={group.name}>
      <main id="meetup-group-show">
        <h1>{group.name}</h1>
        <section class="lede-text" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />

        <h2>Upcoming Events</h2>
        <ul class="cards">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <EventCard event={event} groupSlug={group.slug} />
            ))
          ) : (
            <li class="no-events">
              <p>No upcoming events scheduled at the moment.</p>
            </li>
          )}
          <li class="subscribe">
            <h3 class="card-title">Subscribe</h3>
            <section class="card-body">
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
                <>
                  <p>Be the first to know about new events we're hosting.</p>
                  <form method="post" action={`/meetups/${group.slug}/subscribe`}>
                    <input type="hidden" name="_rendered_at" value={String(renderTimestamp)} />
                    <div style="position: absolute !important; width: 1px !important; height: 1px !important; padding: 0 !important; margin: -1px !important; overflow: hidden !important; clip: rect(0,0,0,0) !important; white-space: nowrap !important; border: 0 !important;">
                      <label for="website">Please leave this field empty.</label>
                      <input type="text" name="website" id="website" tabindex={-1} autocomplete="off" />
                    </div>
                    <div class="app-form-group">
                      <label for="email">Email</label>
                      <input type="email" class="app-form-control" id="email" name="email" required />
                    </div>
                    <button type="submit" class="app-btn">Subscribe</button>
                  </form>
                </>
              )}
            </section>
          </li>
        </ul>

        {archivedEvents.length > 0 && (
          <>
            <h2>Past Events</h2>
            <ul class="cards archived-events">
              {archivedEvents.map((event) => (
                <EventCard event={event} groupSlug={group.slug} archived />
              ))}
            </ul>
          </>
        )}

        <h3>Organiser</h3>
        <AvatarList people={organisers} />
      </main>
    </Layout>
  )
}
