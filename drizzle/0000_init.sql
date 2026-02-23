CREATE TABLE IF NOT EXISTS `users` (
  `id` text PRIMARY KEY NOT NULL,
  `email` text NOT NULL UNIQUE,
  `name` text,
  `password_hash` text,
  `image` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `events` (
  `id` text PRIMARY KEY NOT NULL,
  `title` text NOT NULL,
  `description` text,
  `location` text,
  `start_at` integer NOT NULL,
  `end_at` integer,
  `created_by_id` text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `event_participants` (
  `event_id` text NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  `user_id` text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  `status` text NOT NULL DEFAULT 'upcoming',
  `updated_at` integer NOT NULL,
  PRIMARY KEY (`event_id`, `user_id`)
);

CREATE TABLE IF NOT EXISTS `invitations` (
  `id` text PRIMARY KEY NOT NULL,
  `event_id` text NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  `email` text NOT NULL,
  `invited_by_id` text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  `token` text NOT NULL UNIQUE,
  `status` text NOT NULL DEFAULT 'pending',
  `created_at` integer NOT NULL,
  `expires_at` integer NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_start_at ON events(start_at);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user ON event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
