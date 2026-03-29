# QuizMaster

## Current State
- Quiz creation, play, scoring, per-quiz leaderboard
- Social feed with posts, likes, comments
- Internet Identity authentication
- Authorization with roles (admin/user/guest)

## Requested Changes (Diff)

### Add
- **Mini Game: Memory Game** -- flip cards to match pairs, earn points per match
- **Mini Game: Spin Wheel** -- spin to win random bonus points
- **Points system** -- players accumulate points from both mini games, stored per user
- **#1 All-Time Player detection** -- the single player with the most total points gets admin access
- **Admin Panel** -- only accessible to the #1 all-time points leader; shows all quizzes with their correct answers for every question

### Modify
- Backend: add points tracking, getTopPlayer, getPlayerPoints, awardPoints functions
- Backend: add getAdminQuizAnswers function (all quizzes + all questions with correct answers)
- App.tsx: add routes for /games, /games/memory, /games/spinwheel, /admin
- Navbar: add "Games" and "Admin" (conditionally visible) links

### Remove
- Nothing removed

## Implementation Plan
1. Backend: add `playerPoints` map, `awardPoints(caller, amount)`, `getPlayerPoints(caller)`, `getTopPlayer()` returning Principal of #1 scorer, `getAdminQuizAnswers()` returning all quizzes with questions including correct answers (admin-only check: caller must be top player)
2. Frontend: Memory Game page -- grid of face-down cards, flip pairs, award points on match via backend
3. Frontend: Spin Wheel page -- animated wheel, spin button, award random points (10-100) via backend
4. Frontend: Admin Panel page -- fetch top player, check if caller is top player, display all quiz questions with correct answers
5. Wire new routes in App.tsx, add Games nav link, conditionally show Admin link for top player
