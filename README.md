# OVERVIEW

WELCOME TO my landing page project that embodies the concept of a "Thinking Space." The name "Gedang-Goreng" (Indonesian for fried banana) is chosen purely for its absurd humor, THERE IS NO particular reason behind the naming:D

I wanna introduce something new rather than rigid portofolio, taking inspiration of a mind space where ideas float aimlessly. A personal space where identity is server interactively. I feel that most website server you similar experience of visiting someone's house, clean, tidy, and synthetic. Here, I want to get rid of that, I wanna make my landing page actually feel like you're meeting the person, not just shadow they left behind. And thus, Thinking Space commences.

---

## PHILOSOPHY

The web shouldn't be a flat document; it should be an experience.  Thinking Space was built with the philosophy of "Immersive Web" and the core idea of a "Thinking Space." It breaks away from standard scrolling templates by combining game-like UI paradigms (HUDs, cursors, debris particles) with highly functional portfolio and content-management systems. It aims to create a personal, fluid digital environment where content and interaction blend seamlessly, reflecting the organic flow of thought.

It is designed to be creative maximalist, showing off cool things that might interest hirers or people in general. It is designed to be both professional and personal. By design, hobby, character, and all within Luki.

---

## CORE FEATURES

### The Persona (Luki)
An interactive digital companion integrated directly into the landing page, it's not an *assistant* is most sense, it's *me*.
- **Reactive Expressions:** Blinks, idles, and reacts based on user interactions (e.g., gets angry when collided with, telling you what to do, comments on your browser choice, behavior, etc.).
- **Event-Driven:** Triggers based on idle time, clicks, screen resolution, and custom scripted events.

### Luki Markdown (LMD)
A custom AST-based Markdown parser (`luki-parser.js`) designed to bridge content and interactivity.
- Supports standard Markdown (Headers, Paragraphs).
- Features inline `<say>` tags to trigger the Luki persona dynamically as users read or scroll through content (`<say message="..." expression="..." trigger="..." />`).

### Integrated Terminal & HUD
- **TTY Terminal:** A functional command-line interface (`vtty1`) for power-user interactions and hidden easter eggs.
- **4-Corner HUD:** A stylistic, video-game-inspired interface housing core modules:
  - **Identity (Top-Left):** Profile, bio, and social modules.
  - **Vault (Top-Right):** Filterable works (Essays, Sketches, Projects, Music, Art).
  - **Portal (Bottom-Right):** Curated external links and social bookmarks.
  - **Playlist (Bottom-Left):** Integrated YouTube audio with floating, time-synced lyrics.

### Full-Stack Admin & Content Management
- **Real-Time Editor:** A sleek, dark-mode editor for the admin to update their Identity Matrix, Works, and Portals with live side-by-side previews.
- **Guestbook Moderation:** Public visitors can leave their mark, but messages are safely hidden behind an approval wall until reviewed.
- **Row Level Security (RLS):** Bulletproof Supabase policies ensuring public data is read-only while keeping admin capabilities fully locked down to authenticated users.

---

## Tech Stack

- **Framework:** SvelteKit (v4/v5 Svelte Runes with `$state` architecture)
- **Styling:** TailwindCSS v4 + Custom CSS Animations
- **Database & Auth:** Supabase (PostgreSQL + Row Level Security)
- **E2E Testing:** Playwright (Automated Admin / UI Verification)
- **Deployment:** Vercel (`@sveltejs/adapter-vercel`) 