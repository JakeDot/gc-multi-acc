# GC Multi-Acc Pro (jakedot-gcpro)

A hybrid PWA and Chrome Extension for managing multiple Gartic.io accounts with instant switching capabilities.

## Features

- 🔄 **Instant Account Switching** - Switch between Gartic.io accounts with one click
- 💾 **Persistent Storage** - Accounts stored in Chrome sync storage (extension) or localStorage (PWA)
- 🎨 **Modern UI** - Beautiful gradient interface with dark theme
- 🔌 **Hybrid Architecture** - Works as both a standalone PWA and Chrome extension
- 🚀 **Built with React + Vite** - Fast development and optimized production builds

## Project Structure

This is an AI Studio Project using Vite + React with a hybrid configuration:

- **Extension Mode**: Accesses `chrome.cookies` to live-swap Gartic.io sessions
- **PWA Mode**: Allows account management, naming, and data syncing via cloud/local storage

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/JakeDot/gc-multi-acc.git
   cd gc-multi-acc
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Using as a Chrome Extension

1. Build the project:
   ```bash
   npm run build
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" in the top right

4. Click "Load unpacked" and select the `dist` folder

5. The extension will appear in your extensions list

6. Navigate to gartic.io and click the extension icon to manage accounts

## Using as a PWA

1. Run the development server or build and serve the production build

2. Visit the application in your browser

3. Look for the "Install" or "Add to Home Screen" prompt

4. The PWA can manage accounts using localStorage

## How to Get Session Tokens

1. Log into Gartic.io with your account
2. Open DevTools (F12)
3. Go to Application → Cookies → https://gartic.io
4. Find the `session` cookie and copy its value
5. Add this token to GC Multi-Acc Pro with a name for the account

## Technology Stack

- **React 18** - UI framework
- **TypeScript 5** - Type safety
- **Vite 4** - Build tool and dev server
- **Tailwind CSS 3** - Styling
- **@crxjs/vite-plugin** - Chrome extension support
- **vite-plugin-pwa** - Progressive Web App support
- **Lucide React** - Icons

## Development

The project includes:

- `src/lib/engine.ts` - Core account management logic
- `src/App.tsx` - Main UI component
- `src/lib/utils.ts` - Utility functions (cn helper)
- `manifest.json` - Chrome extension manifest
- `vite.config.ts` - Hybrid build configuration

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production (creates both PWA and extension)
- `npm run preview` - Preview production build

## License

This project is private and for personal use.
