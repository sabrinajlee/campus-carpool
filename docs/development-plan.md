# Development Plan

> **Duration:** 5 weeks (to be confirmed with mentor) · **Approach:** MVP-first, vertical slices

## Principles

- Finish the MVP before anything else; nice-to-haves only if time allows.
- Agree on data structures and APIs before implementing.
- Build one feature end-to-end (DB → API → UI) at a time.
- Test continuously, not only at the end.
- Feature freeze in the middle of Week 4.
- Last week is for stabilizing, deploying, and demo prep — not new features.

## Phases

| Phase | Stage | Description |
|---|---|---|
| 1 | Requirements & Scope | Decide what's in and out |
| 2 | Technical Planning & Design | Stack, architecture, DB, API |
| 3 | Project Setup | GitHub, dev environment, base code structure |
| 4 | Implementation | Feature-by-feature frontend + backend |
| 5 | Testing & Stabilization | Integration tests, bug fixes, feature freeze |
| 6 | Deployment & Delivery | Deploy, final checks, docs, presentation |

## MVP Features

| Feature | Priority |
|---|---|
| Sign up with school email + verification | Required |
| Login / logout | Required |
| Post a ride | Required |
| Search rides (destination, date) | Required |
| Ride details | Required |
| Request a seat, driver accepts / declines | Required |
| My trips (driving / riding) | Required |
| Cancel a ride or booking | Required |
| Contact info after match | Required |
| Password reset | TBD |
| Email notifications (request / accept / decline / cancel) | TBD |
| In-app chat | Optional |
| Ratings, report a user | Nice-to-have |
| Payments, GPS tracking, route matching | Out of scope |

## Timeline

| Week | Phase | Goal |
|---|---|---|
| 1 | Planning & Setup | Requirements, DB/API design, repo + dev environment |
| 2 | Core Development | Auth, post ride, list rides |
| 3 | Feature Completion | Search, booking requests, accept/decline, my trips |
| 4 | Integration & Testing | Full user flows, edge cases, bug fixes — **feature freeze mid-week** |
| 5 | Release & Presentation | Deploy, README, demo script, presentation |

### Week 1 — Planning & Setup
- [ ] Confirm MVP scope with PM
- [ ] Finalize tech stack ([decision record](decisions/0001-frontend-approach.md))
- [ ] Architecture diagram
- [ ] ERD
- [ ] API spec (first draft)
- [ ] Project structure + local setup instructions
- [ ] Create GitHub issues and assign

**Done when:** everyone can run the project locally and knows their tasks.

### Week 2 — Core Development
- [ ] Backend server + DB connection
- [ ] Sign up, email verification, login
- [ ] `POST /rides`, `GET /rides`
- [ ] Post ride form + ride list page
- [ ] First deploy to staging

**Done when:** a user can register, post a ride, and see it in the list — on the real DB.

### Week 3 — Feature Completion
- [ ] Search + filters
- [ ] Ride details page
- [ ] Request seat, accept / decline
- [ ] Seat count management
- [ ] My trips page
- [ ] Cancel ride / booking

**Done when:** search → request → accept → view → cancel works end-to-end.

### Week 4 — Integration & Testing
- [ ] Merge and integrate all branches
- [ ] Duplicate booking + overbooking prevention verified
- [ ] Invalid input / edge case testing
- [ ] UI fixes, bug fixes
- [ ] Staging deploy tested

**Done when:** all MVP flows work and major bugs are fixed.

### Week 5 — Deployment & Delivery
- [ ] Production deploy + environment variables
- [ ] Final testing on deployed app
- [ ] README + setup guide + API doc cleanup
- [ ] Demo script, presentation, rehearsal

**Release candidate:** 2–3 days before the presentation. No new features after this.

## Build Order — Vertical Slices

Build one feature all the way through before starting the next.

**Example: Post a ride**
1. Create `rides` table
2. Implement `POST /rides` with validation
3. Build the post ride form
4. Connect form → API
5. Verify it's saved in the DB
6. Show the result on screen
7. Test
8. PR → review → merge

## Task Split

_To be decided in the team meeting._

| Area | Owner |
|---|---|
| Project setup, DB schema, deployment | |
| Auth (sign up, verification, login) | |
| Post / search / ride details | |
| Booking requests, accept / decline | |
| My trips, cancel | |
| Profile | |

## Risks

- Presentation date not confirmed → scope may need to shrink.
- One developer is still learning Python → keep the stack simple.
- December exams may overlap with Week 5.
- School email may filter verification emails as spam → test with a real `@uwo.ca` address in Week 1.
