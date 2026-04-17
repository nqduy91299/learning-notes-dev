# WebSockets & Realtime

## Table of Contents

1. [HTTP Limitations for Realtime](#http-limitations-for-realtime)
2. [Polling](#polling)
3. [Long Polling](#long-polling)
4. [Server-Sent Events (SSE)](#server-sent-events-sse)
5. [WebSocket Protocol](#websocket-protocol)
6. [WebSocket Lifecycle](#websocket-lifecycle)
7. [WebSocket vs SSE Comparison](#websocket-vs-sse-comparison)
8. [Socket.IO](#socketio)
9. [WebRTC (Brief)](#webrtc-brief)
10. [Realtime Patterns](#realtime-patterns)
11. [Scaling WebSockets](#scaling-websockets)
12. [Frontend Relevance](#frontend-relevance)

---

## HTTP Limitations for Realtime

HTTP follows a strict request/response model — the client asks, the server answers.
The server **cannot** push data to the client without being asked first.

This creates problems for realtime features:
- Chat messages: How does the client know a new message arrived?
- Live notifications: The server has a notification but can't send it
- Collaborative editing: Multiple users editing the same document
- Live sports scores, stock prices, social feeds

The solutions below evolved from simple (polling) to sophisticated (WebSocket).

---

## Polling

The simplest approach: ask the server repeatedly at fixed intervals.

```typescript
// Simple polling — ask every 3 seconds
setInterval(async () => {
  const response = await fetch('/api/messages?since=lastTimestamp');
  const messages = await response.json();
  if (messages.length > 0) {
    renderMessages(messages);
  }
}, 3000);
```

### Problems

- **Wasted requests**: Most responses are empty ("no new data")
- **Latency**: Average delay = half the polling interval
- **Server load**: N users × requests/second = lots of unnecessary traffic
- **Battery drain**: Mobile devices suffer from constant network activity

### When It's OK

- Low-frequency updates (weather, daily reports)
- Simple implementations where WebSocket is overkill
- When the update frequency is predictable

---

## Long Polling

An improvement: the server holds the request open until data is available.

```typescript
async function longPoll(): Promise<void> {
  try {
    const response = await fetch('/api/messages/subscribe', {
      signal: AbortSignal.timeout(30000), // 30s timeout
    });
    const data = await response.json();
    handleNewData(data);
  } catch (error) {
    // Timeout or error — just retry
  }
  // Immediately start the next long poll
  longPoll();
}

longPoll();
```

### How It Works

1. Client sends a request
2. Server holds the connection open (doesn't respond immediately)
3. When data is available, server responds
4. Client processes the response and immediately sends a new request
5. Repeat

### Advantages Over Polling

- Near-instant delivery when data is available
- No wasted empty responses
- Less overall traffic

### Disadvantages

- Still creates a new HTTP request for each message
- Server must manage many open connections
- Timeouts and reconnections add complexity
- HTTP overhead on every message

---

## Server-Sent Events (SSE)

A standardized way for the server to push events to the client over a single
long-lived HTTP connection. **One-way only** (server → client).

### Browser API: EventSource

```typescript
const eventSource = new EventSource('/api/events');

eventSource.onopen = () => {
  console.log('Connected to event stream');
};

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('New event:', data);
};

eventSource.addEventListener('notification', (event) => {
  // Listen for specific named events
  console.log('Notification:', event.data);
});

eventSource.onerror = (error) => {
  console.log('SSE error — will auto-reconnect', error);
};

// Close when done
eventSource.close();
```

### Server Response Format

```
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: {"message": "Hello"}

event: notification
data: {"type": "new_follower", "user": "Alice"}

id: 42
data: {"message": "With an ID for resumption"}

retry: 5000
data: {"message": "Reconnect after 5 seconds if disconnected"}
```

### Key Features

- **Automatic reconnection**: Browser reconnects automatically on disconnect
- **Last-Event-ID**: Browser sends `Last-Event-ID` header on reconnect, so
  the server can resume from where it left off
- **Named events**: Can have different event types
- **Simple**: Plain text over HTTP — works with existing infrastructure

### Limitations

- **One-way**: Server → client only (client must use regular HTTP for sending)
- **Text only**: No binary data
- **Limited connections**: Browsers limit SSE connections per domain (~6 in HTTP/1.1)
- **No WebSocket fallback**: If SSE doesn't work, you need a different approach

---

## WebSocket Protocol

WebSocket provides **full-duplex** communication — both client and server can
send messages at any time over a single persistent connection.

### Upgrade Handshake

WebSocket starts as an HTTP request, then "upgrades" to the WebSocket protocol:

```
Client → Server:
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

Server → Client:
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

After this handshake, the connection switches from HTTP to the WebSocket protocol.
Data flows as lightweight **frames** (not HTTP requests/responses).

### URLs

- `ws://example.com/chat` — Unencrypted WebSocket (port 80)
- `wss://example.com/chat` — Encrypted WebSocket over TLS (port 443)

Always use `wss://` in production — same as always using `https://`.

### Frames

WebSocket messages are sent as frames — small binary headers + payload.
Frame overhead is just 2-10 bytes (vs HTTP's hundreds of bytes of headers).

Frame types:
- **Text frame**: UTF-8 text data
- **Binary frame**: Binary data (ArrayBuffer, Blob)
- **Ping/Pong**: Keep-alive heartbeat
- **Close**: Graceful connection termination

---

## WebSocket Lifecycle

```typescript
const ws = new WebSocket('wss://example.com/chat');

// 1. CONNECTING (readyState = 0)
// The connection is being established

// 2. OPEN (readyState = 1)
ws.onopen = () => {
  console.log('Connected!');
  ws.send(JSON.stringify({ type: 'join', room: 'general' }));
};

// 3. RECEIVING MESSAGES
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};

// 4. ERROR HANDLING
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

// 5. CLOSING (readyState = 2) → CLOSED (readyState = 3)
ws.onclose = (event) => {
  console.log(`Closed: code=${event.code} reason=${event.reason}`);
  // event.wasClean — true if closed gracefully
};

// Sending data
ws.send('Hello, server!');
ws.send(JSON.stringify({ type: 'message', text: 'Hi!' }));

// Closing the connection
ws.close(1000, 'Normal closure');
```

### Close Codes

| Code | Meaning |
|------|---------|
| 1000 | Normal closure |
| 1001 | Going away (page navigation, server shutdown) |
| 1006 | Abnormal closure (no close frame received) |
| 1008 | Policy violation |
| 1011 | Server error |

---

## WebSocket vs SSE Comparison

| Feature | WebSocket | SSE |
|---------|-----------|-----|
| Direction | Bidirectional | Server → Client only |
| Protocol | WebSocket (ws/wss) | HTTP |
| Data format | Text + Binary | Text only |
| Reconnection | Manual | Automatic |
| Browser support | All modern browsers | All modern (except old IE) |
| HTTP/2 compatible | Separate connection | Multiplexed on same connection |
| Overhead per message | 2-10 bytes | ~50 bytes (SSE framing) |
| Proxy/firewall friendly | Sometimes blocked | Always works (it's HTTP) |
| Complexity | Higher | Lower |

### When to Use Which

**Use SSE when:**
- Server pushes data, client only reads (notifications, live feeds, stock prices)
- You want automatic reconnection and resume
- Proxy/firewall compatibility matters
- You're already using HTTP for client → server communication

**Use WebSocket when:**
- Bidirectional communication is needed (chat, gaming, collaborative editing)
- Low latency is critical
- Binary data is needed
- High message frequency (many messages per second)

---

## Socket.IO

Socket.IO is a library that wraps WebSocket with additional features:

- **Automatic fallback**: Falls back to long polling if WebSocket is unavailable
- **Reconnection**: Automatic reconnection with exponential backoff
- **Rooms/namespaces**: Built-in pub/sub for grouping connections
- **Acknowledgements**: Confirm message delivery
- **Broadcasting**: Send to all connected clients (or specific rooms)

```typescript
// Client-side (Socket.IO)
import { io } from 'socket.io-client';

const socket = io('https://example.com', {
  transports: ['websocket', 'polling'], // Try WebSocket first
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
  socket.emit('join-room', 'general');
});

socket.on('new-message', (data) => {
  console.log('Message:', data);
});

socket.emit('send-message', { text: 'Hello!' }, (ack) => {
  console.log('Server acknowledged:', ack);
});
```

### Important Note

Socket.IO is **not** a WebSocket library — it's a higher-level abstraction.
A Socket.IO client cannot connect to a plain WebSocket server, and vice versa.

---

## WebRTC (Brief)

WebRTC (Web Real-Time Communication) enables **peer-to-peer** communication
directly between browsers, without going through a server.

### Use Cases
- Video/audio calls
- Screen sharing
- Peer-to-peer file transfer
- Low-latency gaming

### How It Works (Simplified)
1. **Signaling**: Peers exchange connection info through a signaling server (WebSocket/HTTP)
2. **ICE/STUN/TURN**: NAT traversal — finding a path between peers
3. **Direct connection**: Once established, data flows directly between browsers

### Frontend Relevance
- Built into browsers (`RTCPeerConnection`, `getUserMedia`)
- Complex setup — usually use libraries (SimplePeer, PeerJS)
- Falls back to TURN relay server when direct connection fails
- Uses UDP for media (low latency > reliability)

---

## Realtime Patterns

### Chat Application

```
Pattern: WebSocket + Message Queue
- Each user has a WebSocket connection
- Messages are broadcast to room members
- Message history stored in database
- Offline messages queued for delivery
```

### Live Notifications

```
Pattern: SSE or WebSocket
- Server pushes notification events
- Client shows toast/badge
- SSE is often sufficient (one-way)
```

### Live Data Updates (Dashboards, Stock Prices)

```
Pattern: SSE or WebSocket
- Server pushes data updates at regular intervals
- Client updates UI reactively
- Consider throttling/debouncing on the client side
```

### Collaborative Editing (Google Docs)

```
Pattern: WebSocket + Operational Transform (OT) or CRDT
- Each keystroke/edit is sent as an operation
- Server resolves conflicts and broadcasts to all editors
- Complex conflict resolution algorithms required
```

### Presence (Who's Online)

```
Pattern: WebSocket heartbeat
- Client sends periodic "I'm here" messages
- Server tracks last heartbeat per user
- If no heartbeat for N seconds, mark as offline
```

---

## Scaling WebSockets

WebSocket connections are stateful and persistent — this creates scaling challenges
that don't exist with stateless HTTP.

### Problem: Multiple Server Instances

```
User A → Server 1 (WebSocket)
User B → Server 2 (WebSocket)

User A sends message to User B... but they're on different servers!
```

### Solution 1: Sticky Sessions

Route each user to the same server consistently (via cookie, IP hash, etc.).

- Simple but limits horizontal scaling
- If a server dies, all its connections are lost

### Solution 2: Pub/Sub with Redis

```
Server 1 ←→ Redis Pub/Sub ←→ Server 2
Server 3 ←→ Redis Pub/Sub ←→ Server 4

1. User A sends message to Server 1
2. Server 1 publishes to Redis
3. Redis broadcasts to all servers
4. Server 2 (where User B is connected) delivers the message
```

This is the standard approach for scaling WebSocket applications.

### Solution 3: Dedicated WebSocket Services

Use managed services: AWS API Gateway (WebSocket), Pusher, Ably, Supabase Realtime.
They handle scaling, reconnection, and message delivery.

---

## Frontend Relevance

### Common Implementation Pattern: WebSocket with Reconnection

```typescript
function createReliableWebSocket(url: string): {
  send: (data: string) => void;
  close: () => void;
  onMessage: (handler: (data: string) => void) => void;
} {
  let ws: WebSocket;
  let messageHandler: ((data: string) => void) | null = null;
  let reconnectDelay = 1000;
  const maxDelay = 30000;

  function connect(): void {
    ws = new WebSocket(url);

    ws.onopen = () => {
      reconnectDelay = 1000; // Reset on successful connection
    };

    ws.onmessage = (event) => {
      messageHandler?.(event.data);
    };

    ws.onclose = (event) => {
      if (!event.wasClean) {
        // Reconnect with exponential backoff
        setTimeout(connect, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, maxDelay);
      }
    };
  }

  connect();

  return {
    send: (data) => ws.readyState === WebSocket.OPEN && ws.send(data),
    close: () => ws.close(1000),
    onMessage: (handler) => { messageHandler = handler; },
  };
}
```

### Key Takeaways

1. HTTP is request/response only — not designed for server-initiated communication
2. Polling is simple but wasteful; long polling is better but still HTTP overhead
3. SSE is great for server → client streaming (notifications, live feeds)
4. WebSocket is for bidirectional, low-latency communication (chat, gaming)
5. Always implement reconnection with exponential backoff
6. Socket.IO adds convenience but is a separate protocol from WebSocket
7. Scaling WebSockets requires pub/sub (Redis) or managed services
8. Use `wss://` in production, just like `https://`
