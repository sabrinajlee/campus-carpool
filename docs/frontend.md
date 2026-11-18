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

Page numbers (P1, P2, ...) match [Page Flows and Screen Specs](../documentation/Campus%20Carpool%20Page%20Flows%20and%20Screen%20Specs.md). Numbers in brackets are pages that are built as **states** of that page (a message, tab, sheet or variant), not their own route. Components in *italics* aren't built yet. See [Shared components](#shared-components).

| Page | Route | File | Bottom nav | What it has and what it's for | Shared components | Owner |
|---|---|---|---|---|---|---|
| P1 Login (P3) | `/login` | `pages/Login.jsx` | No | Western email, password, Log in, link to Sign up. Shows the verify-link result (`?verify=success\|expired\|invalid`, P3) and an "unverified" error with Resend. Goes to the page the user wanted, or `/welcome` if they haven't onboarded, else Explore. | TextInput, Button, *Logo*, *InlineError* | Ellie |
| P1 Sign up | `/signup` | `pages/SignUp.jsx` | No | Name, Western email, password, confirm password, Create account, link to Log in. Creates the account and goes to Check your email. | TextInput, Button, *Logo* | Ellie |
| P2 Check your email | `/check-email` | `pages/CheckEmail.jsx` | No | Masked email ("j\*\*\*@uwo.ca"), Resend (60s cooldown, not built yet), "Wrong email? Go back" to `/signup`, Log in. | Button | Ellie |
| P4 Forgot password | `/forgot-password` | `pages/ForgotPassword.jsx` | No | Email field and Send link. After sending, the form swaps for a "check your email" message, the same whether or not the account exists. Linked from Login. | TextInput, Button | |
| P5 Reset password | `/reset-password?token=...` | `pages/ResetPassword.jsx` | No | Opened from the emailed link. New password and confirm, then `/login` with a success message. An expired or used token shows a notice with a link to `/forgot-password`. | TextInput, Button, *InlineError* | |
| P6 Travel preferences | `/welcome` | `pages/TravelPreferences.jsx` | No | First onboarding screen. Two cards, "I need rides" and "I can drive". The choice isn't saved: it only decides whether Car details comes next. | PageHeader, *SelectableCard*, *InfoNote*, Button | |
| P9 Find a ride / Explore (P10) | `/` | `pages/Explore.jsx` | Yes | Home page. From/To search, date and time chips, Filters sheet (P10), list of open rides. Full rides are hidden. Tapping a card opens Ride details. Loading, empty ("No rides match") and error states. | PageHeader, *RouteSearch*, *Chip*, *RideCard*, *DateChip*, *Avatar*, *FilterSheet*, *EmptyState*, *InlineError*, *Spinner* | |
| P11 Ride details (P14, P15, P16) | `/rides/:id` | `pages/RideDetails.jsx` | Yes | The rider's view of one ride, in every state: not requested (Request a seat), full, pending (P14), accepted (P15: driver contact, vehicle, exact meetup), declined, cancelled or past (P16, read-only). Cancel ride opens the cancel dialog (D1). See the "ride details by situation" table in the spec. | PageHeader (showBack), StatusBadge, Button, Card, *RouteHeader*, *DriverCard*, *PickupDropoff*, *PriceBanner*, *VehicleCard*, *ContactInfo*, *ConfirmDialog* | |
| P12 Request sent | `/rides/:id/requested` | `pages/RequestSent.jsx` | No | Terminal confirmation: "Request sent!", summary with "Request pending", My trips and Back to explore. Back must not resubmit. | Button, StatusBadge, *ConfirmationLayout*, *SummaryCard* | |
| P17 Ride cancelled (P25) | `/rides/:id/cancelled` | `pages/RideCancelled.jsx` | No | Terminal confirmation after a cancel. Copy depends on who cancelled: rider sees "Driver will be notified", driver sees "Riders will be notified" (P25). Pass who cancelled in `navigate` state. My trips and Back to explore. | Button, *ConfirmationLayout*, *SummaryCard* | |
| P18 Was your ride completed? | `/rides/:id/complete` | `pages/RideCompleted.jsx` | No | Opens instead of Ride details when a trip in My trips is in the past. Completed! records the completion and goes to My trips. My trips and Back to explore skip it, and it shows again next time. Needs request status `completed` in the database first. | Button (success), *ConfirmationLayout*, *SummaryCard* | |
| P19 Post a ride | `/post` | `pages/PostRide.jsx` | Yes | Step 1 of 2: leaving from, going to, date, departure time, estimated arrival, seats (1 to 7), price per seat (CAD). Continue to pickup details. Users without a vehicle see the "add a vehicle first" dialog (D2) instead. | PageHeader, TextInput, Button, *DateField*, *TimeField*, *NumberStepper*, *PriceField*, *ConfirmDialog* | |
| P20 Pickup & drop-off | `/post/pickup` | `pages/PickupDropoff.jsx` | Yes | Step 2 of 2: pickup location, drop-off location, optional notes, trip summary, Post ride. Creates the trip, guarded against double taps. | PageHeader (showBack), TextInput (multiline), Card (soft), Button, *SummaryCard* | |
| P21 Ride posted | `/rides/:id/posted` | `pages/RidePosted.jsx` | No | Terminal confirmation: "Ride Posted!", summary, "You'll see requests under My trips". My trips (Driving tab) and Back to explore. | Button, *ConfirmationLayout*, *SummaryCard* | |
| P13 My trips (P22) | `/trips` | `pages/MyTrips.jsx` | Yes | Riding and Driving tabs (Driving is P22). Upcoming trip cards with status badges. Riding cards open Ride details (or P18 if past). Driving cards show request counts and passengers and open Manage requests. | PageHeader, StatusBadge, Card, Button, *Tabs*, *TripCard*, *EmptyState*, *InlineError* | |
| P23 Manage requests (P24) | `/trips/:id/requests` | `pages/ManageRequests.jsx` | Yes | The driver's view of their own ride. Pending requests with accept and decline (P24), confirmed riders with contact info and remove, seats remaining, Cancel ride (D1, then Ride cancelled with the driver copy). | PageHeader (showBack), StatusBadge, Button, *RouteHeader*, *RiderRow*, *IconButton*, *PriceBanner*, *ContactInfo*, *ConfirmDialog* | |
| P34 Messages | `/messages` | `pages/Messages.jsx` | Yes | Later feature. For now this tab is a temporary preview of every shared component. | All of them | |
| P27 My profile | `/profile` | `pages/Profile.jsx` | Yes | Initials, name, "Verified Western student", rows for Basic information and Car details, placeholder rows for ride history and connections ("Coming soon"), red Logout button. | PageHeader, Button (danger), *Avatar*, *VerifiedBadge*, *ListRow* | |
| P28 Basic information (P8) | `/profile/basic-info` | `pages/BasicInfo.jsx` | Yes, hidden during onboarding | School email (read-only), full name (set once, read-only after), phone number (editable). During onboarding (P8) the button says Continue and goes to Explore. From Profile it says Save Changes and returns to Profile. | PageHeader (showBack), TextInput (read-only), Button, *InfoNote*, *Toast* | |
| P29 Car details (P7) | `/profile/vehicle` | `pages/CarDetails.jsx` | Yes, hidden during onboarding | Make, model, colour, licence plate, seats stepper (default 3), preview of what accepted riders see. Same page for onboarding (P7), the "add a vehicle first" dialog (D2) and Profile. Skip for now shows only during onboarding. Where Save goes is in [Onboarding](#onboarding). | PageHeader (showBack), TextInput, Button, *NumberStepper*, *VehicleCard*, *InfoNote* | |
| P35 Error / not found | `/error` and any unknown URL (`*`) | `pages/ErrorPage.jsx` | No | "Something went wrong." Report a problem (placeholder) and Back to home (Explore, or Login if logged out). Only for failures the user can't fix on the spot. A failed list or form shows an inline error with Retry instead. | Button, *ConfirmationLayout* | |

**Not routed:** P30 Ride history and P32 Connections are later features (rows on My profile only). P31 Settings and P33 Public profile were cut. Dialogs D1 (confirm cancel) and D2 (add a vehicle first) are `ConfirmDialog` states of the pages that open them.

**Route changes still to make in `App.jsx`:** add the new routes above, and replace the `*` redirect with `ErrorPage`.

## Rules to avoid merge conflicts

1. **Only edit your own page file.** Pages with a file in the table above already exist and are routed. A page that isn't created yet needs its file and its `App.jsx` route added first, in one small PR.
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

## Flows

How users move between pages. The full branch-by-branch versions (F1 to F11) are in the spec, Section 2.

### Onboarding

New users go through: `/signup` → `/check-email` → (email link) → `/login?verify=success` → `/welcome` → `/profile/vehicle` (only if "I can drive") → `/profile/basic-info` → `/`.

There are no separate onboarding routes. Onboarding reuses the profile pages, and the app knows a user is onboarding because **`user.phone` is `null`** in `/auth/me` (the name is set at sign up, and phone is set on the last onboarding step). While `user.phone` is `null`:

- Login sends the user to `/welcome` instead of Explore.
- `AppLayout` hides the bottom nav.
- Car details shows **Skip for now**, and Save or Skip goes to `/profile/basic-info`.
- Basic information shows **Continue** (not Save Changes), and goes to `/`.

Car details is also opened from two other places. Pass where to go next as `?next=`:

| Opened from | URL | Save goes to |
|---|---|---|
| Onboarding | `/profile/vehicle` | `/profile/basic-info` |
| "Add a vehicle first" dialog (D2) on `/post` | `/profile/vehicle?next=/post` | `/post` |
| My profile | `/profile/vehicle` | `/profile` |

Travel preferences isn't saved anywhere. The backend has no driver or rider roles.

### Log in and reset password

- `/login`: correct details go to the page the user was trying to open (or `/`). An unverified account shows an error with Resend. Wrong details show one error that doesn't say which field was wrong.
- Logged-in users who open `/login` skip it and land on `/`.
- Forgot password: `/login` → `/forgot-password` → email link → `/reset-password?token=...` → `/login` with a success message. An expired token shows a notice with a link back to `/forgot-password`.

### Find and request a ride (rider)

- `/` Explore: search, chips and filters update the list on the same page. Tap a card → `/rides/:id`.
- `/rides/:id`: **Request a seat** creates a pending request (the driver is emailed) → `/rides/:id/requested`.
  - The ride filled up or was cancelled meanwhile: show a message and go back to `/`.
  - Already requested: the page shows its pending state.
- `/rides/:id/requested`: My trips → `/trips`, Back to explore → `/`.
- When the driver accepts or declines, the rider is emailed and `/rides/:id` shows the accepted (contact and vehicle visible) or declined state.

### Cancel a request (rider)

`/trips` → View trip details → `/rides/:id` → **Cancel ride** → confirm dialog (D1, "The driver will be notified") → the seat is returned and the driver emailed → `/rides/:id/cancelled` (rider copy).

### Post a ride (driver)

- Tap **+** in the nav. No vehicle on the account: the "add a vehicle first" dialog (D2) opens, with Add vehicle → `/profile/vehicle?next=/post`, or Not now.
- `/post` and `/post/pickup` are one form split over two screens. Pass step 1's data with
  `navigate("/post/pickup", { state: formData })` and read it with `useLocation().state`.
  The back arrow on step 2 returns to `/post` with the fields kept.
- The API is called once, when **Post ride** is pressed on step 2 → `/rides/:id/posted`.
- `/rides/:id/posted`: My trips → `/trips` (Driving tab), Back to explore → `/` (the new ride is listed there).

### Handle requests (driver)

- The driver is emailed, or sees "N Requests" on the Driving tab of `/trips` → `/trips/:id/requests`.
- **Accept**: the seat count drops, both people are emailed. The last seat makes the ride Full and hides it from Explore. If another accept took the last seat first, show "No seats left" and leave the request pending.
- **Decline**: the rider is emailed.
- **Remove** (on a confirmed rider): confirm first, then the rider is emailed and taken off, and the seat goes back.

### Cancel a ride (driver)

`/trips/:id/requests` → **Cancel ride** → D1 ("All riders will be notified") → the ride is cancelled, removed from Explore, and every pending and accepted rider emailed → `/rides/:id/cancelled` (driver copy). Riders then see the ride as Cancelled on `/trips` and `/rides/:id`.

### After the ride: confirm completion

Nothing happens when the departure time passes. When a rider taps a past trip on `/trips`, open `/rides/:id/complete` instead of the details page. **Completed!** saves the completion and goes to `/trips`. The other buttons skip, and the screen shows again next time. Whether drivers also see this isn't decided yet.

### Profile

`/profile` → Basic information (`/profile/basic-info`) or Car details (`/profile/vehicle`), each returning to `/profile` on save. **Logout** ends the session → `/login`.

### Guards (every page)

- Logged out on any page except login, sign up, check email, forgot or reset password: go to `/login`, then come back to that page after logging in. The same applies when a session expires mid-action and when a user opens a link from an email.
- A user who skipped onboarding gets a prompt to finish their profile when they try to request or post a ride. Don't block them with a greyed-out button.
- A list that fails to load shows an inline error with Retry. Use `/error` only for failures the user can't fix on the spot.

## Developer notes

1. **Navigation.** Five bottom nav items: Explore, My trips, + Post ride, Messages (placeholder), Profile. Highlight the active item. The nav is hidden on auth, onboarding and confirmation screens.
2. **Privacy is enforced by the server.** Phone, email, exact meetup details, vehicle and plate are only returned after a request is accepted. The rider sees the driver's contact and vehicle, and the driver sees the rider's contact. There are no public profile pages. Hiding fields in the UI is not enough.
3. **No roles.** The backend has no driver or rider roles. Anyone can request or post. Travel preferences only decides whether Car details shows during onboarding.
4. **A vehicle is required to post.** Anyone without one sees the "add a vehicle first" dialog (D2) when tapping +. The server also refuses a ride with no vehicle.
5. **Seat counting.** Accepting a request lowers seats left in one atomic step, and cancelling or removing an accepted rider gives the seat back. A ride with 0 seats is Full and hidden from Explore. Seats per ride are 1 to 7.
6. **Confirmation screens are terminal.** `/rides/:id/requested`, `/cancelled`, `/posted` and `/complete` must not let the browser back button resubmit a form. Use `navigate(..., { replace: true })` to get there.
7. **Every list needs loading, empty and error states.** These are the most commonly forgotten part.
8. **Money.** Prices are in CAD, stored in dollars as `price_per_seat` (`Numeric(8,2)`), a flat price per seat. There are no payments in the app, so add copy like "Pay the driver directly" on the accepted state.
9. **Dates and times.** The backend stores UTC. The frontend displays local time.
10. **Deep links.** Emails link to specific pages (new request → `/trips/:id/requests`, accepted or declined → `/rides/:id`). A logged-out user goes to `/login` and then on to the target.
11. **Buttons.** A primary button is disabled until every *required* field on the screen is valid, with a short reason under the field. After a tap, disable it and show loading so nothing is sent twice. The server re-checks everything. Full per-page rules are in the spec, Section 7.
12. **Data model gaps.** The `rides` table has no estimated arrival time yet (Post a ride collects it, but it isn't saved). Request status has no `completed` or "cancelled by driver" value yet, and `/rides/:id/complete` and the "cancelled by driver" banner both depend on those.
13. **Out of the MVP:** ratings, problem reports, ride history, connections, in-app chat, settings, payments, saved routes. Completed! should still save each completion (ride, driver, rider, time) so history can be built from real data later.
14. **Naming.** Use the P-numbers in Figma frames, tickets and branch names (for example `feature/p23-manage-requests`) so everyone means the same screen.

## Shared components

Everything in `src/components/`, imported from `"../components"`. Each component takes meaning, not looks (`variant="danger"`, `status="pending"`, never a colour), and is built with all its states (default, disabled, loading, error, empty). Every one also appears on the Messages tab preview so you can see what already exists. Need a new one? Build it in a small PR first (see the rules above). Icons come from `lucide-react`.

### Built

| Component | Props | Used for |
|---|---|---|
| `Button` | `variant`: `primary` \| `secondary` \| `danger` \| `success`, `fullWidth`, plus any `<button>` prop (`disabled`, `onClick`) | Every action. Danger for Cancel ride and Logout, success for Completed! |
| `TextInput` | `label`, `error`, `multiline`, plus any `<input>` prop (`readOnly`, `type`) | All form fields. `multiline` for trip notes, `readOnly` for school email and the locked name. |
| `Card` | `soft` | White content card. `soft` (lavender) for trip summaries and price panels. |
| `StatusBadge` | `status`, `count`, `label` | The one place for status labels and colours: `pending` ("N seats left", amber), `accepted`, `declined`, `cancelled`, `completed`, `requests` ("N Requests"), `full` ("Seats Filled"), `seats`. Don't hard-code a badge colour on a page. |
| `PageHeader` | `title`, `subtitle`, `showBack` | Page title. `showBack` adds the back arrow (there's no separate BackHeader). |
| `BottomNav` | none | The five-item nav. It's rendered by `layouts/AppLayout.jsx`, not by pages. |

### To build

Roughly in build order. "Used on" helps decide who builds it first.

| Component | What it is | Used on |
|---|---|---|
| `ConfirmationLayout` | Large icon circle (check, X, car, error), title, subtitle, slot for a summary card, stack of buttons | P12, P17, P18, P21, P35 |
| `SummaryCard` | Route, date and time, optional badge or note, on a soft card | P12, P17, P18, P20, P21 |
| `Avatar` | Initials in a soft circle (no photos in the MVP) | RideCard, DriverCard, RiderRow, P27 |
| `VerifiedBadge` | "Verified Western student" with a check | DriverCard, RiderRow, P27 |
| `DateChip` | "Fri, Nov 13" in a soft pill | RideCard, RouteHeader |
| `RouteHeader` | Date chip, status badge, origin → destination, departs, seats available | P11, P23 |
| `RideCard` | Explore list item: route, date, driver, time, seats left, price | P9 |
| `TripCard` | My trips list item: route, date and time, driver or passengers, badge, View trip details | P13 |
| `DriverCard` | Avatar, name, verified badge, optional contact line | P11 |
| `RiderRow` | Request version (accept and decline) and confirmed version (remove, contact) | P23 |
| `IconButton` | Icon-only accept (green check) and decline or remove (red X), with a required `aria-label` | P23 |
| `PickupDropoff` | Two-point timeline with "exact details shared on acceptance" | P11 |
| `PriceBanner` | "Price per seat" and seats remaining on a soft panel | P11, P23 |
| `VehicleCard` | Car icon, colour, make and model, seats, plate in an outlined box | P11 (accepted), P29 preview |
| `ContactInfo` | Phone and email in green text | P11, P23 |
| `Tabs` | Segmented control (Riding / Driving) | P13 |
| `Chip` | Filter chips (All dates, Any time, Filters) | P9 |
| `RouteSearch` | From (dot) and To (ring) fields | P9 |
| `SelectableCard` | Checkable card, multi-select | P6 |
| `NumberStepper` | Minus, value, plus, with `min` and `max` | P19, P29 (seats) |
| `DateField`, `TimeField` | Date and time inputs with "not in the past" validation | P19 |
| `PriceField` | `$` prefix and CAD label | P19 |
| `ListRow` | Title, subtitle, chevron | P27 |
| `InfoNote` | Soft helper box with an optional lock icon | P6, P28, P29 |
| `Logo` | Placeholder circle and wordmark | P1 |
| `ConfirmDialog` | Title, body, two buttons. Covers D1 (cancel, rider and driver copy) and D2 (add a vehicle first) | P11, P19, P23 |
| `FilterSheet` | Bottom sheet with filters (not designed yet) | P9 |
| `EmptyState` | Icon, message, optional button | Every list |
| `InlineError` | Message with Retry when a list or form fails | Every list and form |
| `Spinner` | Loading for buttons, lists and pages | Everywhere |
| `Toast` | Short messages like "Saved" | P28, P29 |

### Shared code that isn't a component

Write these once. Don't write a copy per page.

| Piece | Where | What it does |
|---|---|---|
| API client | `src/api.js` (auth calls in `src/auth/authApi.js`) | Every backend call, the standard error shape, and a redirect to `/login` on a 401 |
| Auth context and guard | `src/auth/AuthContext.jsx`, `src/auth/RequireAuth.jsx` | The logged-in user (including `phone`, used for onboarding mode), protected routes, and returning to the wanted page after login |
| Formatters | to add | Local date and time, `$15` prices, seats, masked email |
| Validators | to add | School email, password, phone, licence plate, price. The same functions decide when a button is disabled. |
| Constants | to add | School name and email domain, support email, cooldown lengths |
