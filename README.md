# AlKhan Restaurant - Expo App 🍖

A beautiful, cross-platform restaurant ordering app built with **Expo** and **React Native**. This app recreates the Flutter design with 6 complete screens for browsing menus, placing orders, tracking deliveries, and reserving tables.

## Features ✨

- **🍽️ Menu Screen** - Browse restaurant dishes and categories
- **📖 Item Detail** - View detailed item information with customization options
- **🛒 Cart & Checkout** - Review orders and place orders with delivery details
- **🚗 Live Order Tracking** - Real-time delivery tracking with rider information
- **📅 Table Reservation** - Multi-step booking for dining in
- **🏪 Branch Directory** - Find nearby restaurant locations
- **🎨 Dark Theme UI** - Modern dark design with gold accents
- **📱 Cross-Platform** - Works on iOS, Android, and Web
- **⚡ Hot Reload** - Live development with instant updates

## Tech Stack

- **Expo** - Universal React Native framework
- **React Native** - Cross-platform mobile framework
- **TypeScript** - Type-safe development
- **Expo Router** - File-based routing

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Expo Go app (download from App Store or Google Play)

### Installation

1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/TODO_APP.git
cd TodoApp
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

4. Scan the QR code with Expo Go
   - **iOS**: Use your iPhone camera or Expo Go's QR scanner
   - **Android**: Use Expo Go's QR scanner button

### Manual Connection
If QR code doesn't work, enter the URL manually:
```
exp://YOUR_IP_ADDRESS:8082
```

## Project Structure

```
src/
├── app/
│   ├── index.tsx          # Main AlKhan app with all 6 screens
│   ├── explore.tsx        # Additional explore screen
│   └── _layout.tsx        # Router configuration
├── components/            # Reusable UI components
├── constants/             # Theme & config
└── hooks/                # Custom React hooks
```

## Available Scripts

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web

# Lint code
npm run lint
```

## Screens Overview

### 1. Menu Screen
Browse all available dishes with search and category filters

### 2. Item Detail
View detailed item information with:
- Spice level options
- Portion sizes
- Add-on selections
- Quantity controls

### 3. Cart & Checkout
Complete order review with:
- Delivery address selection
- Branch selection
- Delivery time options
- Payment method selection

### 4. Order Tracking
Live order status with:
- Real-time rider location
- Order progress timeline
- Rider contact information
- Help & support buttons

### 5. Table Reservation
Multi-step reservation form:
- Branch selection
- Date & time picking
- Party size selection
- Occasion notes (optional)

### 6. Branches
Browse all restaurant locations with:
- Distance information
- Operating hours
- Navigation links
- Direct call option

## Design System

**Color Palette:**
- Primary: `#C9A24A` (Gold)
- Background: `#0E0E0E` (Dark)
- Secondary: `#1A1A18` (Dark Gray)
- Text: `#F5F1EA` (Light)
- Secondary Text: `#8E877C` (Gray)

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub
- Check [Expo documentation](https://docs.expo.dev)
- Visit [Expo Discord](https://chat.expo.dev)

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev)
- [Expo Go App](https://expo.dev/go)
