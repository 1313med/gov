# Goovoiture Mobile

React Native (Expo) mobile app for the Goovoiture platform. Shares the same backend as the web app.

## Setup

```bash
cd goovoiture/mobile
npm install
```

## ⚠️ Important: Set your server IP

Before running on a **physical device**, open [src/config/index.js](src/config/index.js) and replace `localhost` with your computer's local IP address:

```js
// Find your IP: run `ipconfig` on Windows
export const SERVER_URL = "http://192.168.X.X:5000";
```

Simulators/emulators can use `localhost` — physical phones cannot.

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
│   ├── (tabs)/             # Home, Cars, Rentals, Messages, Profile
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
