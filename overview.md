# Untold — Project Overview & Documentation

**Untold** is a mobile-first anonymous social network and real-time messaging application. It allows users to share their innermost thoughts ("untold stories") anonymously, relate to other people's posts, and initiate secure, real-time anonymous chats.

---

## 🚀 Key Features

### 1. Secure Google Authentication
* **OAuth Popup Integration**: Secure authentication utilizing Google OAuth.
* **Auto-Session Cleanup**: Seamless login/logout synchronization between local storage, OAuth state, and backend verification.
* **Handshake Guard**: WebSockets and REST endpoints are protected using secure JWT authorization.

### 2. Untold Feed & Story Sharing
* **Post Creation**: Users can write posts and toggle **"Post Anonymously"** to hide their profile.
* **Interactive Feed**: A chronological feed with pull-to-refresh.
* **Likes System**: Users can like posts, which updates counts in real-time and triggers notifications for the author.

### 3. "Relate to this" Connection Flow
* **Safe Chat Connection**: If a user relates to a post, they can click **"Relate to this"** to immediately message the author.
* **Preserved Anonymity**: The author's real ID (`author_id`) is strictly nullified on the network layer for anonymous posts. Connection requests are resolved securely *server-side* using the `postId`.
* **Smart Redirection**: If a connection already exists (either a pending request or an active accepted chat), clicking "Relate to this" automatically routes the user directly to the existing conversation, preventing duplicate requests.

### 4. Message Requests & Acceptance
* **Message Requests (REQ)**: New connections start in a pending state. Recipients receive an unread request notification and see a **"REQ"** badge on the conversation item.
* **Accept or Decline**: The receiver can read the initial message request and choose to **Accept** or **Decline**. Accepting a request instantiates a full active chat channel.

### 5. Real-Time Chat (WhatsApp-Style)
* **Zero-Delay Messaging**: Fully powered by Socket.IO. Sending a message broadcasts it instantly to active room participants.
* **Standardized Sockets**: Clean connection scopes matching event triggers (`new_message`, `join_conversation`, `leave_conversation`, `new_message_request`, `request_accepted`).
* **Optimized Layout**: Chat bubbles rendering newest-at-the-bottom inside an inverted layout stream with automatic keyboard avoidance on mobile devices.

### 6. Notifications System
* **Context Triggers**: System notifications sent when:
  * A post is liked.
  * A new message request is sent.
  * A message request is accepted.
  * A new chat message is sent.
* **Auto-Clear Read State**: Tapping into a conversation automatically marks all notifications associated with that conversation (messages, requests, and accepts) as read on both the backend database and local store.

### 7. Smart Indicator Dots
* **Bell Icon indicator**: Lights up with a red dot if there are any unread notifications (likes, chats, requests).
* **Chats Tab Indicator**: Shows a live red dot on the tab bar icon if there are any unread incoming chat messages or message requests.

---

## 🛠️ Technology Stack

### Frontend Client
* **Framework**: React Native + Expo (Expo Router for routing).
* **Styling**: NativeWind (Tailwind CSS for React Native layout engine).
* **State Management**: Zustand (modular stores for authentication, feed, chats, and notifications).
* **Real-time Engine**: Socket.IO client (integrated globally in stores).

### Backend Server
* **Framework**: Node.js + Express (TypeScript).
* **Database**: PostgreSQL (hosted on Supabase) for user data, posts, messages, requests, and notifications.
* **In-Memory Cache**: Redis (hosted on Upstash) for presence and message states.
* **Real-time Engine**: Socket.IO server.

### Deployment & Environments
* **Frontend Hosting**: Vercel (`https://untold-pied.vercel.app`)
* **Backend Hosting**: Render (`https://untold-backend-gvff.onrender.com/`)
