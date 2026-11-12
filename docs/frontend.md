# Frontend Guide

How the React app is organized, and how we each build pages without merge conflicts.

## Setup

```bash
cd frontend
npm install
npm run dev
```

## Folder structure

```text
frontend/src/
├── main.jsx            # entry point (router + global CSS)
├── App.jsx             # ALL routes live here
├── index.css           # design tokens (colors, spacing) + shared styles
├── api.js              # all backend calls go through here
├── layouts/
│   └── AppLayout.jsx   # pages with the bottom nav
├── components/         # shared UI: Button, TextInput, Card, StatusBadge, PageHeader, BottomNav
└── pages/              # one file per screen
```

## Pages and owners

| Page | Route | File | Bottom nav | Owner |
|---|---|---|---|---|
| Login | `/login` | `pages/Login.jsx` | No | Ellie |
| Sign up | `/signup` | `pages/SignUp.jsx` | No | Ellie |
| Check your email | `/check-email` | `pages/CheckEmail.jsx` | No | Ellie |
| Find a ride (Explore) | `/` | `pages/Explore.jsx` | Yes | |
| Ride details | `/rides/:id` | `pages/RideDetails.jsx` | Yes | |
| Request sent | `/rides/:id/requested` | `pages/RequestSent.jsx` | No | |
| Post a ride | `/post` | `pages/PostRide.jsx` | Yes | |
| Pickup & drop-off | `/post/pickup` | `pages/PickupDropoff.jsx` | Yes | |
| My trips | `/trips` | `pages/MyTrips.jsx` | Yes | |
| Manage requests | `/trips/:id/requests` | `pages/ManageRequests.jsx` | Yes | |
| Messages | `/messages` | `pages/Messages.jsx` | Yes | (MVP decision pending) |
| My profile | `/profile` | `pages/Profile.jsx` | Yes | |

## Rules to avoid merge conflicts

1. **Only edit your own page file.** Each page is already created and routed.
2. **Need a new shared component or a token change?** Make it a separate small PR, merged before your page PR.
3. **Use the tokens and components** instead of hard-coded colors:
   ```jsx
   import { Button, TextInput, Card, PageHeader } from "../components";

   <TextInput label="Leaving from" value={origin} onChange={(e) => setOrigin(e.target.value)} />
   <Button fullWidth>Continue to pickup details</Button>
   ```
   ```css
   color: var(--color-primary);
   padding: var(--space-4);
   ```
4. **Page-only styles:** add a `PageName.css` next to your page and import it in your page file. Prefix class names with the page (e.g. `.explore-card`) so they don't clash.
5. **Backend calls:** add a function to `src/api.js` in your PR. Keep it to your own functions.
6. **Before you start and before you open a PR:** `git pull origin main`.

## Post a ride: two steps

`/post` and `/post/pickup` are one form split over two screens. Pass step 1's data with
`navigate("/post/pickup", { state: formData })` and read it with `useLocation().state`.
The API is called once, when **Post ride** is pressed on step 2.
