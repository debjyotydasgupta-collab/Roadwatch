
# RoadWatch — Implementation Plan

A mobile-first civic app where citizens report road issues (potholes, waterlogging, cracks), track repair progress, and view public spending. Powered by Lovable Cloud (auth + database + storage) and Lovable AI Gateway (chatbot + image analysis).

## Tech Stack

- TanStack Start + React + Tailwind (existing template)
- Lovable Cloud: auth, Postgres, file storage
- Lovable AI: `google/gemini-2.5-flash` for chat + image analysis (vision)
- Leaflet + react-leaflet + leaflet.heat + leaflet.markercluster for the map
- shadcn/ui for components, sonner for toasts

## Pages / Routes

| Route | Purpose |
|---|---|
| `/` | Landing — pitch, CTAs (Report / View Map / Login) |
| `/login`, `/signup` | Email+password auth |
| `/report` | Step-by-step report form: type → photo → GPS → details |
| `/chat` | AI chatbot (text input, voice via Web Speech API) |
| `/map` | Leaflet map with clustered markers + heatmap toggle |
| `/complaints/$id` | Timeline view of a single complaint |
| `/spending` | Public spending dashboard (projects, budgets, contractors) |
| `/_authenticated/admin` | Authority dashboard: list, status updates, verify repairs |

## Database Schema (Lovable Cloud)

- `profiles` (id → auth.users, name, language)
- `user_roles` (id, user_id, role: 'citizen' | 'authority') — separate table per security rules
- `contractors` (id, name)
- `road_projects` (id, name, contractor_id, road_name)
- `budgets` (id, project_id, amount, used_amount)
- `complaints` (id, user_id, title, description, type, severity, location_lat, location_lon, road_name, image_url, status, ai_analysis jsonb, created_at)
- `complaint_status_history` (id, complaint_id, status, note, created_at)
- `repairs` (id, complaint_id, before_image_url, after_image_url, verified, verification_note)
- `notifications` (id, user_id, message, read, created_at)
- Storage buckets: `complaint-images` (public), `repair-images` (public)
- RLS: citizens read/write own complaints, read public spending; authorities (via `has_role`) can update status + verify repairs; everyone can read complaints for the public map
- Seed: 2 users (citizen + authority), 1 contractor, 1 road project + budget, 3 complaints (pothole/waterlogging/crack, mixed statuses, real-ish coordinates)

## Server Functions (TanStack `createServerFn`)

- `chatWithAI` — streams Gemini reply via Lovable AI Gateway with a RoadWatch system prompt (knows about complaints + spending tools)
- `analyzeImage` — sends uploaded photo to Gemini vision, returns `{ issueType, severity, description }`
- `verifyRepair` — sends before+after image URLs to Gemini, returns `{ verified, confidence, note }`
- `reverseGeocode` — calls OpenStreetMap Nominatim, returns road name
- `getAnalytics` — totals, by-status, by-type for admin dashboard

Complaint CRUD, notifications, status updates use the authenticated Supabase client directly from components (RLS-protected).

## Key UI Components

`Navbar`, `LanguageSelector` (EN/HI/ES stub via simple i18n map), `ChatWindow` (markdown + streaming), `VoiceInput` (Web Speech API), `MapView` (Leaflet with cluster + heatmap toggle), `ComplaintCard`, `TimelineCard`, `SpendingCard` (sanctioned vs used progress bar), `ImageUpload` (camera capture via `capture="environment"`), `GpsPicker` (use-current-location + map-tap fallback), `PrivacyNote`, `ConfirmDialog`.

## UX & Accessibility

- Mobile-first, large tap targets (min 44px), high-contrast tokens in `src/styles.css`
- Progressive disclosure on the report form (one question per step)
- Confirmation dialogs on submit + status changes
- Privacy banner about location/image use shown on first report
- Sonner toasts for success/error
- Voice input + 3-language selector
- Friendly demo design direction: warm civic palette (deep blue + signal orange accents), Inter + Space Grotesk pairing — clean, trustworthy, not corporate-bland

## Demo Scenarios Covered

1. **Report a pothole** — chat or `/report` → photo → AI analyzes → geotag via browser GPS → reverse geocode → complaint appears on map + timeline
2. **Check spending** — chatbot recognizes "spending on X road" intent or user picks road on `/spending` → shows project, contractor, sanctioned vs used
3. **Resolve & verify** — authority logs in → `/admin` → marks resolved → citizen uploads after-photo → `verifyRepair` AI compares → timeline shows verified ✓

## Build Order

1. Enable Lovable Cloud + AI Gateway, write migration (tables, RLS, roles, storage buckets, seed data)
2. Auth pages + role-aware navbar + `_authenticated` guard
3. Report flow + image upload + GPS + AI image analysis
4. Map page (Leaflet cluster + heatmap)
5. Complaint detail + timeline
6. Chat page with streaming Gemini
7. Spending dashboard
8. Admin dashboard + repair verification
9. Landing polish, language selector, README

## Out of Scope (clarify if needed)

- Real SMS/push notifications (in-app notifications table only)
- Real payment/contractor integrations
- Production-grade i18n library (using a simple dictionary)
