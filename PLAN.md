# Hono + Cloudflare Rework Plan

## Overview
Rework the Perth Web Devs Meetup app from Laravel/PHP to:
- **Hono** with JSX for web framework
- **Cloudflare Pages/Workers** for serverless deployment
- **Cloudflare D1** (SQLite) for storage
- **Wrangler** for deploys
- **Resend** for outbound emails

The existing app is a meetup group site with event listings, RSVPs, email subscriptions, and email verification. All styles and page structure will be faithfully reproduced.

---

## New Project Structure

```
src/
  index.tsx              # Hono app entry point, all routes
  db/
    schema.sql           # D1 database schema (initial migration)
    seed.sql             # Seed data for dev
  components/
    Layout.tsx           # Base HTML layout (replaces app.blade.php)
    GroupPage.tsx        # Meetup group listing page
    EventPage.tsx        # Event detail page with RSVP form
    Cards.tsx            # Event card components
    AvatarList.tsx       # Organiser/host avatar list
    AlertBox.tsx         # Alert/flash message component
  emails/
    rsvp-confirmation.ts # RSVP confirmation email (HTML string)
    verify-email.ts      # Verification email (HTML string)
    event-announcement.ts
    event-reminder.ts
    event-bump.ts
  lib/
    resend.ts            # Resend email sending helper
    markdown.ts          # Markdown rendering utility
    verification.ts      # Email verification URL generation/validation (HMAC-signed)
    bot-protection.ts    # Honeypot + timing check
public/
  fonts/jost/            # Copy existing Jost font files
  css/
    app.css              # All styles combined into one file
wrangler.toml            # Cloudflare Pages + D1 config
package.json
tsconfig.json
vite.config.ts
migrations/
  0001_initial.sql       # D1 migration: full schema
```

---

## Step-by-Step Implementation

### Step 1: Project Scaffolding
- Create `package.json` with deps: `hono`, `resend`, `marked` (for markdown)
- Create `tsconfig.json` with JSX support for Hono
- Create `vite.config.ts` with `@hono/vite-dev-server` + `@hono/vite-cloudflare-pages`
- Create `wrangler.toml` with D1 binding (`DB`), env vars for Resend API key
- Copy font files from `public/fonts/jost/`

### Step 2: Database Schema (D1 Migration)
Create `migrations/0001_initial.sql`:
- `meetup_groups` (id, slug, name, description, created_at, updated_at)
- `meetup_events` (id, meetup_group_id, name, slug, description, location, start_time, end_time, max_attendance, accepting_rsvps, created_at, updated_at)
- `people` (id, name, email UNIQUE, profile_image_url, email_verified_at, created_at, updated_at)
- `rsvps` (id, meetup_event_id, name, email, mobile_number, is_confirmed, created_at, updated_at)
- `subscribers` (id, email, meetup_group_id, is_confirmed, created_at, updated_at, UNIQUE(email, meetup_group_id))
- `meetup_group_organisers` (meetup_group_id, person_id)
- `meetup_event_hosts` (meetup_event_id, person_id)
- `meetup_event_messages` (id, meetup_event_id, message_type, custom_message, created_at, updated_at)
- `meetup_event_mail_logs` (id, meetup_event_message_id, recipient_email, sent_at, created_at, updated_at)

### Step 3: CSS
Combine all existing CSS files into a single `public/css/app.css` preserving existing styles:
- Base styles (font-face, body, h1, h2, buttons, forms, alerts)
- Card styles
- Event details grid
- Avatar list
- Group show page styles
- Event show page styles

### Step 4: JSX Layout & Components
Create Hono JSX components matching the existing Blade templates:

**Layout.tsx**: HTML shell with charset, viewport, title, CSS link, Jost font
**GroupPage.tsx**: Group name (h1), description (markdown), upcoming events cards, subscribe form, past events, organisers avatar list
**EventPage.tsx**: Back link, event name, description (markdown), hosts, details grid, RSVP form (with conditional display based on archived/accepting/capacity)
**AlertBox.tsx**: Success/info/danger alerts
**Cards.tsx**: Event card with title, details grid
**AvatarList.tsx**: Circular avatar images with captions

### Step 5: Routes (src/index.tsx)
```
GET  /                                        → redirect to /meetups/perth-web-devs/
GET  /meetups/:groupSlug                      → group page with events
GET  /meetups/:groupSlug/events/:eventSlug    → event detail page
POST /meetups/:groupSlug/events/:eventSlug/rsvp → handle RSVP
POST /meetups/:groupSlug/subscribe            → handle subscription
GET  /verify-email                            → email verification callback
```

Each route handler queries D1 directly with prepared statements and renders JSX.

### Step 6: Email Verification System
- Generate HMAC-signed URLs using a secret from env vars
- URL params: email, type (rsvp/subscription), rsvp_id/subscriber_id, expires, signature
- 48-hour expiry
- Verification endpoint validates signature + expiry, marks person verified, confirms RSVPs/subscriptions

### Step 7: Resend Email Integration
- Use `resend` npm package
- API key from env var `RESEND_API_KEY`
- Send HTML emails for: verification, RSVP confirmation, announcements, reminders, bumps
- Email templates as functions returning HTML strings

### Step 8: Seed Data
Create `migrations/0002_seed.sql` with sample data matching the current database seeders:
- Perth Web Devs group
- Sample events
- Organiser person records

---

## Bindings & Environment

**wrangler.toml:**
```toml
name = "perth-web-devs"
compatibility_date = "2024-09-25"
pages_build_output_dir = "./dist"

[[d1_databases]]
binding = "DB"
database_name = "perth-web-devs-db"
database_id = "local"

[vars]
RESEND_API_KEY = ""
APP_URL = "https://perth-web-devs.pages.dev"
VERIFICATION_SECRET = ""
```

**TypeScript Bindings:**
```ts
type Bindings = {
  DB: D1Database;
  RESEND_API_KEY: string;
  APP_URL: string;
  VERIFICATION_SECRET: string;
};
```

---

## Key Differences from Laravel Version
1. **No ORM** — direct D1 SQL queries with prepared statements
2. **No sessions** — flash messages passed via URL query params (or cookie-based)
3. **JSX instead of Blade** — Hono's built-in JSX renderer
4. **Resend instead of SendGrid** — simpler API, no SMTP config
5. **No artisan CLI commands** — admin tasks would need a separate script or dashboard (out of scope for this rework)
6. **Serverless** — no persistent server, runs on Cloudflare's edge

## What's Preserved
- All 5 routes and their behavior
- RSVP flow with email verification
- Subscribe flow with email verification + honeypot + timing protection
- All page layouts, styles, and visual design
- Markdown rendering for descriptions
- Avatar lists for organisers/hosts
- Card grid layout for events
- Alert messages for success/pending states
