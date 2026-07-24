# Design Spotify
> **Category:** Intermediate System Design Problems

---

### Overview
**Spotify** is a digital music, podcast, and audio streaming service offering instant access to over 100 million audio tracks. The system provides seamless, low-latency audio playback, offline playback sync, cross-device playback control (Spotify Connect), and personalized discovery features (Discover Weekly).

Core technical challenges involve **low-latency Ogg Vorbis/AAC audio streaming**, Collaborative Filtering recommendation engines, and persistent WebSockets for cross-device state sync.

### System Architecture & Spotify Connect Topology

```
+--------------------+                                      +--------------------+
| Mobile Phone App   | (Active Controller)                  | Desktop Client App | (Playback Receiver)
+--------------------+                                      +--------------------+
          |                                                           ^
          | 1. POST /v1/connect/play ("Play Track X on Desktop")      |
          v                                                           |
+--------------------------------------------------------------------------+
| SPOTIFY CONNECT STATE ENGINE & WEBSOCKET GATEWAY                         |
| (Synchronizes playback state across active devices via persistent WS)    |
+--------------------------------------------------------------------------+
          |                                                           |
          | 2. Fetch Audio Stream                                     | 3. Audio Stream
          v                                                           v
+------------------+                                      +--------------------+
| Audio Metadata DB|                                      | Audio Delivery CDN |
| (Cassandra)      |                                      | (Ogg Vorbis 320k)  |
+------------------+                                      +--------------------+
```

### Key Technical Mechanics
1. **Spotify Connect Protocol:** Uses a centralized WebSocket state gateway. When a user changes tracks on their phone, the gateway pushes the updated playback state to the active desktop/speaker client in real time (< 100ms).
2. **Audio Encryption & Encoded Bitrates:** Stores audio tracks in **Ogg Vorbis** and **AAC** formats at multiple quality tiers:
   - **Low:** 24 kbps (Mobile data saver).
   - **Normal:** 96 kbps.
   - **High:** 160 kbps.
   - **Very High:** 320 kbps (Spotify Premium).
3. **Collaborative Filtering & Audio Embeddings:** Powers Discover Weekly using Matrix Factorization (ALS) on user playlists combined with Deep Learning audio spectrogram analysis.

### API Interface Specifications

| Endpoint | Method | Request Payload | Response Payload |
|---|---|---|---|
| `/api/v1/me/player/play`| PUT | `{"device_id": "dev_desktop", "uris": ["spotify:track:4cOd..."]}` | `{"status": "PLAYING"}` |
| `/api/v1/tracks/{id}` | GET | None | `{"track_id": "4cOd...", "name": "Song Name", "duration_ms": 210000, "audio_url": "https://cdn.spotify.com/audio.ogg"}` |

### Audio Metadata & Playback Data Model

| Field Name | Data Type | Storage Engine | Purpose |
|---|---|---|---|
| `track_id` | String (Base62) | Cassandra / PostgreSQL | Unique identifier for audio track. |
| `artist_ids` | Array of Strings | Relational DB | List of associated artist IDs. |
| `audio_s3_key` | String | Relational DB | CDN path to encrypted Ogg Vorbis binary file. |
| `playback_state` | JSONB | Redis Cache | Active device state: `{"active_device": "dev1", "progress_ms": 42000, "is_playing": true}`. |

### Architectural Trade-offs

| Strategy / Choice | Advantages | Disadvantages | Best Used When |
|---|---|---|---|
| **Centralized WebSocket Spotify Connect State**| Seamless cross-device control; control playback on TV/Desktop using phone. | Requires maintaining persistent WebSocket connections for millions of online devices. | Multi-device audio and smart speaker ecosystems. |
| **Ogg Vorbis Audio Encoding** | Open-source, royalty-free codec with superior audio fidelity at lower bitrates than MP3. | Requires native audio decoding libraries on client devices. | High-scale digital audio streaming services. |
| **Local Client Audio Caching** | Caches recently played songs on device storage, enabling instant replay without network calls. | Consumes local user disk space on mobile devices. | Mobile music streaming applications. |

### Key takeaway
**Spotify** delivers high-fidelity audio streaming using **Ogg Vorbis codec variants** delivered via CDNs, relying on persistent **WebSocket gateways for Spotify Connect cross-device playback synchronization**.
