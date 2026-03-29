# Owner Guide

## Overview
This is a high-performance, cyber-aesthetic portfolio website built with **SvelteKit** and **TailwindCSS**. It features a custom Window Manager, simulated Terminal OS, and an Admin Panel for live content updates.

## Key Features
- **Window System**: Draggable, resizable, auto-tiling windows.
- **Ghost Admin**: A hidden terminal (`Shift+L`) to unlock administrative features.
- **Live Editing**: Change text, music, and projects without redeploying (session-based or connected to DB).
- **Responsive**: Mobile-ready "Reactor" menu.

## Authentication (Ghost Protocol)
To access the Admin Panel:
1. Press `Shift + L` on your keyboard.
2. A terminal overlay will appear.
3. Type the passcode: `GHOST_PROTOCOL` (Case sensitive).
4. Wait for the authentication sequence.
5. The **Admin Panel** will appear as a new window.

## Customization

### Changing the Passcode
Edit `src/lib/components/TerminalAuth.svelte`:
```javascript
const PASSCODE = "YOUR_NEW_PASSWORD";
```

### Adding Music
1. Enter Admin Mode.
2. Navigate to the **Audio** tab.
3. Add Track Title, Artist, and File URL (mp3/wav).

### Adding Projects (Vault)
1. Enter Admin Mode.
2. Navigate to the **Vault** tab.
3. Select "Writing" or "Image".
4. Fill in the details and Save.

## Deployment
This project is optimized for **Vercel**.
1. Install dependencies: `npm install`
2. Build: `npm run build`
3. Deploy: `vercel`

## Troubleshooting
- **Lag?** Ensure hardware acceleration is enabled in your browser.
- **Admin not working?** Check if `Shift+L` conflicts with browser extensions.
