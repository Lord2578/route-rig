# RouteRig

A truck-aware route planner. Regular navigation apps route trucks the same way
they route cars — ignoring height, weight, and length restrictions — which is
how trucks end up stuck under low bridges. RouteRig plans routes that actually
account for the vehicle, and shows the truck route next to the regular car
route so the difference is visible.

Built as a portfolio project to practice native module integration, the Expo
dev client workflow, and clean feature-based architecture in React Native.

## Features

- Full-screen map with foreground geolocation (origin defaults to current
  location)
- Address search (autocomplete) for origin and destination
- Truck parameters form (height, weight, length)
- Truck route vs. car route, rendered side by side on the map with a
  distance/duration comparison card
- Save routes locally and reopen them later, pre-filled
- Local notification when approaching the destination (foreground only)
- Dark theme throughout, including native map tiles on iOS

## Tech stack

- **Expo** (dev client, not Expo Go — the app uses custom native modules) +
  **React Native** + **TypeScript**
- **react-native-maps** for the map (Apple Maps on iOS, Google Maps on
  Android — left as native defaults rather than forcing one provider on both
  platforms)
- **TanStack Query** for all server state (geocoding, routing, saved routes)
- **NativeWind** (Tailwind) for styling
- **React Navigation** (native stack) for the two screens
- **AsyncStorage** for saved routes
- **expo-notifications** + **expo-location** for the proximity alert
- **OpenRouteService** for geocoding and truck/car routing

No client-state library (Zustand, Redux, etc.) — all state ended up being
either local `useState` in the screen that owns it, or server state already
handled by TanStack Query. Zustand was installed early on the assumption it'd
be needed and removed once it became clear it wasn't; better than keeping an
unused dependency around.

## Architecture

Feature-based structure: each domain area owns its screens, components,
hooks, and API layer.

```
src/
  app/                 navigation, providers, entry point
  features/
    map/                map screen, geolocation hook
    route-planning/      address search, truck params form, routing API, route summary card
    saved-routes/        AsyncStorage layer, saved routes screen
    notifications/       proximity notification hook
  shared/
    components/          reusable UI (AppTextInput, IconButton)
    utils/                pure functions (distance formatting, haversine)
```

Each feature's API layer returns typed, UI-ready data — components never see
raw OpenRouteService response shapes. Pure logic (distance formatting,
haversine distance, request-body building) is separated from anything that
touches `fetch`, React, or React Native, specifically so it can be unit
tested without mocking a network or a component tree.

## Notable decisions

- **Routing API is OpenRouteService, not HERE.** HERE Truck Routing was the
  original choice (richer restriction parameters, bigger name in the
  logistics industry) but its free tier requires a credit card on file. ORS
  needs no billing information and has a truck/HGV profile that covers the
  same core need.
- **Foreground-only location tracking.** Full background tracking (and
  background-capable notifications) was scoped out of the MVP — the
  iOS/Android background-mode setup is a well-known time sink disproportionate
  to a portfolio project's timeline, and it needs a physical device to test
  properly.
- **Native map providers, not forced parity.** iOS uses Apple Maps and
  Android uses Google Maps (react-native-maps' default per platform). Forcing
  Google Maps on both would need a second Google Cloud API key and a billing
  card just for visual consistency — not worth it.

## Setup

Requires an [OpenRouteService](https://openrouteservice.org/dev/#/signup) API
key (free, no billing info required).

```bash
npm install
cp .env.example .env   # add your OpenRouteService key
npx eas-cli build --profile development --platform all
npx expo start --dev-client
```

react-native-maps needs a Google Maps API key for Android — set
`androidGoogleMapsApiKey` in `app.json`'s `react-native-maps` plugin config
before building for Android.

## Testing

```bash
npm test
```

Tests cover pure logic only: distance/duration formatting, haversine
distance, and the OpenRouteService request-body builder (coordinate order is
`[longitude, latitude]`, a common source of bugs). No component or
integration tests — the ROI on mocking React Native components wasn't worth
it for this project's size.

## Known limitations

- Background location tracking and background notifications are not
  implemented (see "Notable decisions" above)
- No offline handling beyond surfacing the raw API error message
- Android has not been tested on a physical device, only the emulator
