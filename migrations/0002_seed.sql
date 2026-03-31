-- Seed person
INSERT INTO people (name, email, profile_image_url) VALUES ('Jason O''Neil', 'jason@jasononeil.au', '/img/jason.jpg');

-- Seed group
INSERT INTO meetup_groups (slug, name, description) VALUES (
  'perth-web-devs',
  'Perth Web Devs',
  'A Perth meetup group for web developers, software engineers, designers, PMs and whoever else is building things for the web.

We''ll have a mix of social catch-ups and meetups with technical talks or discussions about our industry.'
);

-- Link organiser
INSERT INTO meetup_group_organisers (meetup_group_id, person_id) VALUES (1, 1);

-- Seed events
INSERT INTO meetup_events (meetup_group_id, name, slug, description, location, start_time, end_time, max_attendance, accepting_rsvps) VALUES (
  1,
  ':first-of-type(drinks)',
  'first-drinks-oct-2024',
  'Casual drinks after work with others in the Perth Web Dev community.

We''re meeting at Market Grounds in the city (right outside the Perth busport, a short walk from the train station).

With this meetup group, I''m hoping to alternate between events with structured talks / discussions, and casual drinks like this one.

This is the first of it''s type! Come along.',
  'Market Grounds, Perth',
  '2024-10-16 17:30:00',
  '2024-10-16 19:00:00',
  20,
  1
);

INSERT INTO meetup_events (meetup_group_id, name, slug, description, location, start_time, end_time, max_attendance, accepting_rsvps) VALUES (
  1,
  'Show and tell',
  'show-and-tell-nov-2024',
  'Get a peak into what different people are working on.

We''ll have 3 or 4 people tell us about their role and their current project, give us a short demo or show us some code. And some time for questions.

Hopefully it''ll be interesting, fun, and give you a bigger picture of the different kinds of roles and projects happening in our industry.

If you''re interested in sharing, let me know.',
  'To be confirmed',
  '2024-11-13 17:30:00',
  '2024-11-13 19:30:00',
  30,
  0
);

-- Link hosts
INSERT INTO meetup_event_hosts (meetup_event_id, person_id) VALUES (1, 1);
INSERT INTO meetup_event_hosts (meetup_event_id, person_id) VALUES (2, 1);
