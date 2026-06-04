# Goovoiture Mobile

React Native (Expo) mobile app for the Goovoiture platform. Shares the same backend as the web app.

## Setup

```bash
cd goovoiture/mobile
npm install
```

## ⚠️ Wi‑Fi changed? Update API URL

On a **physical phone** (Expo Go), the app cannot use `localhost`. After every Wi‑Fi change:

1. On Windows, run `ipconfig` and note **IPv4** for your Wi‑Fi adapter (e.g. `192.168.1.37`).
2. Edit `mobile/.env`:
   ```env
   EXPO_PUBLIC_DEV_API_URL=http://YOUR_IPV4:5000
   ```
   No trailing slash. Example: `http://192.168.1.37:5000`
3. Start the **backend** (`goovoiture/server`, port 5000).
4. **Stop Expo completely** (Ctrl+C), then restart with a clean cache:
   ```bash
   npm run start:clear
   ```
   Do **not** combine `--offline` and `--lan` (Expo forbids it). Offline mode already uses LAN by default for the QR code.
5. In **Expo Go**, scan the **new** QR code (the LAN IP in the terminal changes with Wi‑Fi too).
6. Phone and PC must be on the **same** Wi‑Fi (not guest network / mobile data only).

In Metro logs you should see: `[Goovoiture] API: http://192.168.x.x:5000/api (from .env)`

Test API from the PC browser: `http://YOUR_IPV4:5000/api/health` → should show `{"ok":true,...}`.

## Run

```bash
# Start Expo dev server
npm start

# Android emulator
npm run android

# iOS simulator (Mac only)
npm run ios
```

Install the **Expo Go** app on your phone, then scan the QR code shown in the terminal.

## Build for production

```bash
# Install EAS CLI
npm install -g eas-cli
eas login

# Build
npm run build:android
npm run build:ios
```

## Project structure

```
mobile/
├── app/                    # Expo Router screens
│   ├── (auth)/             # Login, Register
│   ├── (customer)/         # Explore, bookings, messages, saved, profile
│   ├── (car-owner)/        # Garage + marketplace
│   ├── (rental-owner)/     # Fleet operations (5 tabs)
│   ├── (tabs)/             # Legacy redirect → customer
│   ├── cars/[id].jsx       # Car details
│   ├── rentals/[id].jsx    # Rental details + booking
│   ├── seller/[id].jsx     # Seller profile
│   ├── my-bookings.jsx     # Customer bookings
│   ├── my-sales.jsx        # Seller listings
│   ├── new-sale.jsx        # Create sale (camera + GPS)
│   ├── my-fleet.jsx        # Owner rental vehicles
│   ├── add-rental.jsx      # Add rental (camera + GPS)
│   ├── owner-bookings.jsx  # Owner booking management
│   └── notifications.jsx   # Notifications
├── src/
│   ├── api/                # All API calls (same endpoints as web)
│   ├── components/         # Shared components (CarCard, RentalCard, etc.)
│   ├── context/            # Auth, Socket, Language contexts
│   ├── config/             # Server URL config
│   ├── locales/            # EN/FR translations (same as web)
│   └── utils/              # Secure storage auth
└── app.json                # Expo config (permissions, bundle ID)
```
