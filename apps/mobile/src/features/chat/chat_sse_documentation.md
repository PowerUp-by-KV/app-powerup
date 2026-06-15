# Chatbot SSE Streaming Guide & Chat UI Design

We have upgraded the chat infrastructure! To provide a fast, "typing" effect exactly like ChatGPT, the AI's responses are now streamed back to the client using **Server-Sent Events (SSE)**.

This document explains how the new endpoint works and how you can implement it on the frontend. It also includes the chat UI design specifications implemented in `ChatScreen.tsx`.

## UI Design Overview

The chat interface includes two main screens:

### Screen 1: Home / Voice Screen (Empty State)

- **Header**: Back arrow (←) left, bookmark + hamburger menu right
- **Greeting**: Large bold text "Hi {firstName}!" with subtitle
- **Visual Center**: Watercolor-style orb (lime green, teal, blue-purple) with pause bars overlay
- **Quick Actions**: 2-column card layout + horizontal scrollable pills
- **Input Bar**: "+" icon, text input placeholder "Ask me anything...", green send button

### Screen 2: Chat / Conversation Screen

- **Header**: Back arrow (←) left, hamburger menu (☰) right
- **User Bubbles**: Royal blue (#3B5BF6), right-aligned with user avatar on right
- **AI Bubbles**: Lime green (#D4F57A), left-aligned with mini orb icon on left
- **AI Actions**: Bookmark and "..." options (pause/more) below AI message
- **Timestamps**: Formatted as "10 AM" between messages >5 min apart
- **Streaming**: Live text updates with cursor animation (▍) and typing indicator (● ● ●)
- **Input Bar**: Same as Screen 1

### Design Colors (Exact Spec)

- User Bubble: #3B5BF6 (Royal Blue)
- AI Bubble: #D4F57A (Lime/Yellow-Green)
- Send Button: #22C55E (Bright Green)
- Card/Pill Button: #2C3FD6 (Dark Blue)
- Background: #FFFFFF (White)
- Text Primary: #111111 (Black)
- Text Secondary: #888888 (Gray)

### Orb Component

The watercolor-style orb uses inline SVG with overlapping ellipses:

- Layer 1: Lime green (#A8E063, opacity 0.6)
- Layer 2: Teal (#5CC8C8, opacity 0.5)
- Layer 3: Blue-purple (#7B9EF0, opacity 0.45)
- Layer 4: Bright lime core (#C4F084, opacity 0.7)
- Layer 5: White center glow (#FFFFFF, opacity 0.5)

Two versions:

- **ChatOrb**: Full-size (190px) with optional pause bars for empty state
- **ChatOrbMini**: Thumbnail (28px) next to AI messages in chat

### Design Mockup

For design reference and prototyping, use `ChatDesignMockup` component which displays both screens side-by-side with connecting arrow.

## 1. The New Endpoint

**`POST /api/v1/chat/threads/{thread_id}/messages/stream`**

Instead of waiting for the full LLM response to complete, this endpoint will return a stream of chunks (`text/event-stream` format) as soon as the AI starts generating words.

### Request Body

The request payload is exactly the same as the standard `/messages` endpoint:

```json
{
  "content": "Can you explain the present perfect tense?",
  "quick_action_id": null
}
```

## 2. Understanding the Stream Events

The endpoint yields JSON objects prefixed with `data: `, following the SSE standard. There are 3 main types of events you need to handle: `start`, `chunk`, and `done`.

### Event 1: `start`

Fired immediately after the API receives the request.
**Purpose:** Confirms that the user's message was saved to the database successfully. You should use this to update the UI (e.g., mark the user's message as "delivered" or set its database ID).

```json
data: {"event": "start", "user_message_id": "uuid-of-user-message", "off_topic": false}
```

_Note: If `off_topic` is true, the bot will stream a canned redirect reply instead of using the LLM._

### Event 2: `chunk`

Fired continuously as the AI generates text.
**Purpose:** Contains the actual words/tokens. You should append this `content` string directly to the current Assistant chat bubble in your UI.

```json
data: {"event": "chunk", "content": "The "}
data: {"event": "chunk", "content": "present "}
data: {"event": "chunk", "content": "perfect "}
```

### Event 3: `done`

Fired once the AI has completely finished generating the response and it has been saved to the database.
**Purpose:** Signals the UI to stop the loading/typing indicator. It provides the final database ID of the assistant's message, which you need for features like Bookmarking.

```json
data: {"event": "done", "assistant_message_id": "uuid-of-assistant-message"}
```

### Event 4: `error` (Edge Case)

Fired if there's an immediate validation error (e.g., Thread not found).

```json
data: {"event": "error", "detail": "Thread not found"}
```

## 3. Frontend Implementation Example (React / TypeScript)

Since this is a `POST` request with custom headers (Bearer token), you **cannot** use the browser's native `new EventSource()` API (which only supports GET requests without custom headers).

Instead, you should use the industry-standard library: `@microsoft/fetch-event-source` or handle the `Response.body.getReader()` manually.

Here is a recommended implementation using `@microsoft/fetch-event-source`:

```typescript
import { fetchEventSource } from "@microsoft/fetch-event-source";

async function sendChatMessageStream(threadId: string, messageContent: string, token: string) {
  let assistantReplyText = "";

  await fetchEventSource(`http://localhost:8000/api/v1/chat/threads/${threadId}/messages/stream`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      content: messageContent,
    }),

    // Triggered when a message is received from the server
    onmessage(msg) {
      if (msg.event === "message" || !msg.event) {
        // fetch-event-source defaults event to 'message'
        const data = JSON.parse(msg.data);

        if (data.event === "start") {
          console.log("User message saved! ID:", data.user_message_id);
          // TODO: Update your UI state to assign this ID to the user's chat bubble
        } else if (data.event === "chunk") {
          assistantReplyText += data.content;
          // TODO: Update your UI state to append data.content to the Assistant's chat bubble
          console.log(assistantReplyText);
        } else if (data.event === "done") {
          console.log("Stream finished! Assistant Message ID:", data.assistant_message_id);
          // TODO: Save this ID to the Assistant's chat bubble (required for Bookmarks)
          // TODO: Remove the "typing..." indicator
        } else if (data.event === "error") {
          console.error("Stream error:", data.detail);
          // TODO: Show an error toast
        }
      }
    },

    onerror(err) {
      console.error("Connection error:", err);
      throw err; // Throw to stop retrying automatically
    },

    onclose() {
      console.log("Stream connection closed");
    },
  });
}
```

## 4. Key Takeaways for the UI

1. **Append, don't replace:** The `chunk` event yields partial text, not the full text. `bubble.text += data.content`.
2. **Handle IDs:** Make sure to grab `user_message_id` from the `start` event and `assistant_message_id` from the `done` event. If you don't map these to your UI state, the user won't be able to bookmark the newly generated message!
3. **Markdown Rendering:** Since the LLM returns Markdown, you should run the concatenated `assistantReplyText` through a Markdown parser (like `react-markdown`) on every render cycle.
