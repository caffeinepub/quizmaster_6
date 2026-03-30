# QuizMaster

## Current State
- Rank system does not exist.
- Owner system exists in backend (ownerPrincipal stored, isCallerOwner/getOwner exist) but `claimOwner` function is MISSING — this is why the user couldn't claim owner.
- Points system and leaderboard are fully functional.
- User profiles show usernames.

## Requested Changes (Diff)

### Add
- `claimOwner()` backend function: sets ownerPrincipal if null; traps if already claimed.
- Rank system (frontend-computed from points):
  - Noob = 0 pts
  - Pro = 500 pts
  - God = 2,000 pts
  - Hacker = 100,000 pts
  - Admin = 2,000,000 pts
  - Owner = claim-once (not point-based)
- Rank badges displayed next to usernames everywhere: leaderboard, chat, profile, feed, private messages.
- `getRankLabel(points, isOwner)` utility function in frontend.

### Modify
- Profile page: show current rank + "Claim Owner" button (visible only if owner not yet claimed).
- PointsLeaderboard: show rank badge next to each player.
- Chat / PrivateChat / PrivateMessages: show rank badge next to username.
- Feed: show rank badge next to post author name.

### Remove
- Nothing removed.

## Implementation Plan
1. Add `claimOwner()` to backend main.mo.
2. Update backend.did.d.ts and backend.did.js to include `claimOwner`.
3. Create a shared `getRank` utility in frontend.
4. Update Profile, PointsLeaderboard, Chat, PrivateMessages, Feed components to show rank badges.
5. Validate and deploy.
