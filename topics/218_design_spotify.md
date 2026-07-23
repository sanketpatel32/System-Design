# Design Spotify

> **Category:** Intermediate System Design Problems

---

Design Spotify: stream music, playlists, recommendations.

### Requirements
- **Functional**: play music; playlists; recommendations; offline mode.
- **Non-functional**: low-latency start (1s); massive concurrent streams.

### Architecture
```
[Client] -> [API] -> [Metadata service]
                     [Playlist service]
                     [Recommendation (ML)]
                              |
                              v
                       [Audio CDN]
```

### Audio storage
- Songs pre-encoded at multiple bitrates.
- CDN caches globally.

### Streaming
- HTTP range requests for seeking.
- Buffer ahead for smooth playback.
- Pre-fetch next track in playlist.

### Recommendations
- Collaborative filtering (users like you).
- Audio features (tempo, energy).
- **Discover Weekly**: weekly personalized playlist.

### Offline mode
- Cache encrypted audio on device.
- License-checked before play.

### Data model
```
tracks (id, title, artist, duration, audio_url)
playlists (id, user_id, name)
playlist_tracks (playlist_id, track_id, position)
```

### Key takeaway
Spotify = audio CDN + pre-encoded bitrates + recommendation ML. Low-latency start via
pre-fetching + buffering. Offline mode via encrypted local cache.
