# Testing

## Approach

- **Automated (pytest):** core business logic — booking rules, seat counts, split pricing, token expiry.
- **Manual checklists:** full user flows, run before every demo and before release.

## Manual Checklist — Core Flows

### Sign up & login
- [ ] Non-school email is rejected
- [ ] Verification email arrives (check spam on `@uwo.ca`)
- [ ] Unverified account cannot log in
- [ ] Expired verification link shows an error
- [ ] Login / logout work

### Rides
- [ ] Post a ride with valid input
- [ ] Missing fields / past date are rejected
- [ ] New ride appears in search
- [ ] Search by destination and date works
- [ ] Full / cancelled / past rides are hidden

### Bookings
- [ ] Rider can request a seat
- [ ] Driver cannot book their own ride
- [ ] Same rider cannot request twice
- [ ] Accept / decline updates status for both users
- [ ] Cannot accept more riders than seats
- [ ] Contact info shows only after acceptance
- [ ] Cancelling notifies the other side

### Deployment
- [ ] App works from another computer
- [ ] No `.env` or secrets in the repo
- [ ] Debug mode off in production
- [ ] Environment variables set on host

## Release Checklist
- [ ] All core flow checks pass on the deployed app
- [ ] README setup steps work on a fresh clone
- [ ] Demo script run end-to-end without errors
- [ ] Known issues documented
