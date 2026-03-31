-- Meetup Groups
CREATE TABLE IF NOT EXISTS meetup_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- People (organisers, hosts)
CREATE TABLE IF NOT EXISTS people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL DEFAULT '',
  email TEXT UNIQUE,
  profile_image_url TEXT DEFAULT '',
  email_verified_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Meetup Events
CREATE TABLE IF NOT EXISTS meetup_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meetup_group_id INTEGER NOT NULL REFERENCES meetup_groups(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  max_attendance INTEGER DEFAULT 0,
  accepting_rsvps INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- RSVPs
CREATE TABLE IF NOT EXISTS rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meetup_event_id INTEGER NOT NULL REFERENCES meetup_events(id),
  name TEXT NOT NULL,
  email TEXT,
  mobile_number TEXT,
  is_confirmed INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Subscribers
CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  meetup_group_id INTEGER NOT NULL REFERENCES meetup_groups(id),
  is_confirmed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(email, meetup_group_id)
);

-- Junction: Group Organisers
CREATE TABLE IF NOT EXISTS meetup_group_organisers (
  meetup_group_id INTEGER NOT NULL REFERENCES meetup_groups(id),
  person_id INTEGER NOT NULL REFERENCES people(id),
  PRIMARY KEY (meetup_group_id, person_id)
);

-- Junction: Event Hosts
CREATE TABLE IF NOT EXISTS meetup_event_hosts (
  meetup_event_id INTEGER NOT NULL REFERENCES meetup_events(id),
  person_id INTEGER NOT NULL REFERENCES people(id),
  PRIMARY KEY (meetup_event_id, person_id)
);

-- Event Messages (for email campaigns)
CREATE TABLE IF NOT EXISTS meetup_event_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meetup_event_id INTEGER REFERENCES meetup_events(id),
  message_type TEXT NOT NULL CHECK(message_type IN ('announcement', 'bump', 'reminder')),
  custom_message TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Mail Logs
CREATE TABLE IF NOT EXISTS meetup_event_mail_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meetup_event_message_id INTEGER NOT NULL REFERENCES meetup_event_messages(id),
  recipient_email TEXT NOT NULL,
  sent_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
