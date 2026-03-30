# QuizMaster

## Current State
The app has a Points Leaderboard showing players sorted by points with rank badges. No dedicated Ranks Leaderboard exists.

## Requested Changes (Diff)

### Add
- New RanksLeaderboard page at /ranks-leaderboard sorted by rank tier (Owner → Noob), then points within same tier
- Each row: position, rank badge, player name, points
- New route in App.tsx
- Nav link

### Modify
- App.tsx: add route
- Navbar.tsx: add nav link

### Remove
- Nothing

## Implementation Plan
1. Create src/frontend/src/pages/RanksLeaderboard.tsx
2. Register route in App.tsx
3. Add Navbar link
