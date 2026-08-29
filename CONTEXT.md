# RouteRig — Domain Context

RouteRig is a React Native (Expo) mobile app for truck drivers. It plans HGV-safe routes based on vehicle dimensions, provides turn-by-turn navigation with route-deviation rerouting, and alerts the driver when approaching each waypoint.

---

## Glossary

### Waypoint
A resolved geographic location: `{ label: string, latitude: number, longitude: number }`. Typed as `GeocodeResult`. Can play one of three roles in a route: **origin**, **stop**, or **destination**.

- **Origin** — the first waypoint (index 0).
- **Destination** — the last waypoint.
- **Stop** — any waypoint between origin and destination.

Do not use "point", "location", or "address" as synonyms for waypoint in the domain layer.

### Waypoint slot
A UI-layer container for a waypoint. Typed as `WaypointSlot = { id: string, value: GeocodeResult | null }`. A slot is either **empty** (no geocoded value yet) or **filled**. Always referred to as a "slot", not an "input field" or "row".

### Resolved waypoints
The full array of waypoints when every slot is filled (`values.every(v => v !== null)`). Route fetching is only triggered when waypoints are resolved. The variable is named `resolved` throughout the codebase.

### Truck restrictions
Typed as `TruckRestrictions = { heightMeters, weightTons, lengthMeters }`. Always stored and transmitted in SI units (metres, metric tons) regardless of the user's unit system. Display conversion happens at the UI boundary only.

Do not call these "dimensions", "parameters", or "specs" — always "restrictions".

### Truck route
A route calculated by ORS using the `driving-hgv` profile with truck restrictions applied. Shown on the map in blue. The truck route is the only route the app computes when waypoints are resolved.

### Car route
Removed. A driver cannot safely follow a car route with an HGV. The truck route is the only route computed and displayed.

### Route result
The output of a routing API call: `{ points: RoutePoint[], distanceMeters: number, durationSeconds: number }`. Typed as `RouteResult`.

### Saved route
A persisted route: `{ id, waypoints: GeocodeResult[], restrictions: TruckRestrictions, createdAt }`. Typed as `SavedRoute`. Stored in AsyncStorage. Not the same as a truck profile.

A saved route is a **point-in-time snapshot**: the waypoints and restrictions are fixed at the moment of saving. Replaying a saved route restores those exact restrictions, regardless of the driver's current truck. This is intentional — a saved route represents a specific trip with a specific vehicle.

Do not call these "bookmarked routes" or "history".

### Truck profile entry
A named set of restrictions saved for reuse: `{ id, name, restrictions: TruckRestrictions }`. Typed as `TruckProfileEntry`. Represents a specific vehicle (e.g. "Freightliner #2"). Stored separately from saved routes.

Do not call these "vehicles" or "presets".

### Active truck profile
A single `TruckRestrictions` object that always reflects the **last used restrictions**, regardless of source (manual entry or applying a fleet entry). Persisted to AsyncStorage and loaded automatically when opening the map with no saved route. Distinct from the fleet of named `TruckProfileEntry` records.

### Unit system
`'metric' | 'imperial'`. Stored in Settings. Controls how restrictions and route distances are displayed. Internal storage is always metric. Typed as `UnitSystem`.

Do not call this "locale", "units", or "measurement system".

### Navigation session
The period between the driver tapping "Start navigation" and either tapping "Stop navigation" or the destination proximity notification firing. Only during an active navigation session does the app perform camera tracking, show turn-by-turn maneuvers, and detect route deviation. Background location tracking is scoped to the navigation session.

During an active session the driver may edit waypoints; the route recalculates immediately and the session continues. The session auto-ends when the proximity notification fires for the destination (the final waypoint).

Proximity notifications fire for each unvisited waypoint in order — not only for the final destination. The app tracks which waypoints have been visited and always notifies for the next unvisited one.

Do not use "trip", "ride", or "journey" as synonyms.

### Maneuver
A single step within a truck route: an instruction text (e.g. "Turn left onto Main St") and a distance to the next maneuver. Sourced from ORS `segments[].steps[].instruction`. Displayed as the next upcoming action during an active navigation session. The current maneuver advances automatically as the driver moves along the route.

Do not use "step", "direction", or "instruction" as a standalone term — always "maneuver".

### Visited waypoint
A waypoint within the current route that has already triggered its proximity notification during the active navigation session. The app tracks visited waypoints to advance the proximity target to the next unvisited one. Only meaningful during a navigation session.

### Deviation
The condition where the driver's current position is sufficiently far from the planned truck route polyline. When detected during an active navigation session, triggers automatic rerouting: a new ORS request with the current position as origin and remaining waypoints unchanged.

### Proximity notification
A background push notification fired when the device is within ~500 m of the destination. Requires background location permission. Powered by `expo-task-manager` running the `PROXIMITY_TASK_NAME` location task.

---

## External dependencies

- **ORS (OpenRouteService)** — the only routing and geocoding provider. Used for address autocomplete (`/geocode/autocomplete`) and directions (`/v2/directions/{profile}/geojson`). All route and geocode logic goes through ORS. Key stored in `EXPO_PUBLIC_ORS_API_KEY`.

---

## Feature boundaries

| Feature | Responsibility |
|---|---|
| `route-planning` | Waypoint state, ORS API calls, address search, truck params form |
| `map` | MapScreen, current location hook |
| `saved-routes` | Persisting and loading SavedRoute records |
| `truck-profile` | Persisting active profile and named TruckProfileEntry fleet |
| `notifications` | Proximity task and background location tracking |
| `settings` | Unit system preference |

---

## Invariants

- Truck restrictions are always stored in SI units; conversion to display units is UI-only.
- A route can only be saved when waypoints are resolved, restrictions are set, and a truck route result exists.
- The truck route is the only route the driver follows. There is no car route.
- Background location permission is only requested after a truck route is first computed.
- Camera tracking, maneuver display, and deviation detection only operate while the app is in the foreground and a navigation session is active.
- When the app is in the background during a navigation session, only proximity notifications continue.
- Rerouting requires an internet connection. When offline, the existing route remains visible but rerouting is unavailable. An alert is shown if deviation is detected while offline.
- Skipping a stop during navigation is done by deleting its waypoint slot — there is no separate "skip" concept.
