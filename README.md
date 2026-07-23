# Untold

A privacy-first social platform for sharing real life experiences — anonymously or under your own name — without your personal data being collected, tracked, or sold.

## Why

Most people go through things they never talk about openly: leaving a toxic job, losing someone, reconnecting with estranged family, quietly celebrating a win no one else understood. Untold gives people a place to put those moments into words, and to connect privately with others who relate — without the usual social media baggage of profiles, followers, ads, and data harvesting.

## Core Principles

- **Minimal data collection.** Login is Google OAuth only. The app stores just your name, email, and profile picture — nothing else about you is logged, tracked, or shared.
- **No tracking.** No analytics SDKs, no ad networks, no device fingerprinting.
- **Anonymous by choice.** Every post can be shared under your name or fully anonymously, post by post.
- **Consent-based messaging.** You can only send a first message to someone once. They have to accept before a real conversation opens up — no unsolicited message floods.
- **Encrypted chat.** Messages are end-to-end encrypted; the server only ever stores ciphertext.

## Features

- Public feed of shared stories, anonymous or named
- Like and "Relate to this" interactions on posts
- Message-request system: one message allowed until the recipient accepts
- Real-time chat once a conversation is accepted
- Cross-platform: iOS, Android, and web/desktop from a single codebase
- Editable profile with anonymity controls

## Tech Stack

**Frontend**
- React Native + Expo (Expo Router) — one codebase for iOS, Android, and web
- NativeWind (Tailwind for React Native)
- Zustand for state, TanStack Query for data fetching/caching
- Socket.IO client for real-time chat

**Backend**
- Node.js + Express
- Socket.IO for real-time messaging
- Google OAuth 2.0 for authentication, JWT for sessions
- Redis for rate limiting and Socket.IO scaling

**Database**
- PostgreSQL — minimal schema (`users`, `posts`, `message_requests`, `messages`)
- Object storage (Cloudflare R2 / Bunny CDN) for optional post images

## Message-Request Flow

1. User A sends a first message to User B → stored as a pending request.
2. User A can't send another message until User B responds.
3. If accepted, a real conversation opens and both users can chat freely.
4. If declined or ignored, no further messages are possible.

This is enforced both in the UI and at the API layer.

## Data Model (minimal by design)

| Table | Purpose |
|---|---|
| `users` | id, Google subject id, display name, avatar, hashed email |
| `posts` | id, author (nullable if anonymous), body, anonymity flag |
| `message_requests` | sender, receiver, status, first message |
| `messages` | conversation id, sender, encrypted body |

No phone numbers, no IP logging, no location data, no device fingerprinting.

## Design

- Warm, paper-toned palette and serif typography for post content — the app is meant to feel like reading someone's journal, not scrolling a typical feed.
- Anonymous posts render in a distinct monospace typeface as a visual (not just iconographic) signal of anonymity.
- Full design tokens and component specs live in `/docs`.

## Status

Actively in development. Current focus: core screens (feed, post creation, chat, profile) and the message-request flow.

