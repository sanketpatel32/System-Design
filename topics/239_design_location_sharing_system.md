# Design Location Sharing System
> **Category:** Location Based Systems

---

### Overview
A **Location Sharing System** (e.g., Apple Find My, Glympse) streams continuous real-time location coordinates from mobile client devices to designated receivers over controlled sharing windows.

### Architecture Topology Diagram

```
Publisher (Sender)                              Location Gateway                    Subscriber (Receiver)
     |                                                 |                                     |
     | === 1. WSS Lat/Lon Packet ===================>  |                                     |  (If Active)
     |                                                 v 2. Fanout Location Stream           |
     |                                       +-------------------+                           |
     |                                       | Location Router   | === 3. WSS Push ========> |
     |                                       +-------------------+                           |
     |                                                 |                                     |
     |                                                 v 4. Write Time-Series Log            |
     |                                       +-------------------+                           |
     |                                       | Redis / TimescaleDB|                          |
     |                                       +-------------------+                           |
```

### Location Telemetry Packet Structure
```json
{
  "sharing_session_id": "sess_9981a",
  "publisher_id": "usr_441",
  "coordinates": { "latitude": 37.7749, "longitude": -122.4194 },
  "accuracy_meters": 5.2,
  "battery_level": 84,
  "timestamp": 1700000000
}
```

### Optimization Strategies: Battery & Bandwidth
1. **Dynamic Adaptive Ping Rate**: Adjust GPS update intervals dynamically based on device movement state:
   - **Stationary**: Send update every 5 minutes.
   - **Walking**: Send update every 30 seconds.
   - **Driving**: Send update every 5 seconds.
2. **Kalman Filtering**: Smooth noisy GPS coordinates locally on client device before transmission.

### Key takeaway
Minimize client battery drain using **Adaptive GPS ping rates** based on accelerometer activity, streaming compressed location packets over persistent **WebSockets**.
