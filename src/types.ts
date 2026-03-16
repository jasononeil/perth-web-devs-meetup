export type Bindings = {
  DB: D1Database
  RESEND_API_KEY: string
  APP_URL: string
  VERIFICATION_SECRET: string
}

export type MeetupGroup = {
  id: number
  slug: string
  name: string
  description: string
  created_at: string
  updated_at: string
}

export type MeetupEvent = {
  id: number
  meetup_group_id: number
  name: string
  slug: string
  description: string
  location: string
  start_time: string
  end_time: string
  max_attendance: number
  accepting_rsvps: number
  created_at: string
  updated_at: string
  // Computed fields (from queries)
  confirmed_rsvp_count?: number
  remaining_places?: number
}

export type Person = {
  id: number
  name: string
  email: string
  profile_image_url: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

export type RSVP = {
  id: number
  meetup_event_id: number
  name: string
  email: string | null
  mobile_number: string | null
  is_confirmed: number
  created_at: string
  updated_at: string
}

export type Subscriber = {
  id: number
  email: string
  meetup_group_id: number
  is_confirmed: number
  created_at: string
  updated_at: string
}
