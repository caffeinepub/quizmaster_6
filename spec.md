# QuizMaster

## Current State
Fresh rebuild of QuizMaster social quiz app.

## Requested Changes (Diff)

### Add
- Full app rebuild with all features from previous versions

### Modify
- N/A (fresh build)

### Remove
- N/A

## Implementation Plan

### Backend (Motoko)
- User authentication via Internet Identity
- User profiles with username
- Role-based access control (admin, user, guest)
- Quiz CRUD: create quiz, add questions (multiple choice + true/false)
- Quiz play: submit answers, score calculation
- Per-quiz leaderboard
- Social feed: posts linked to quizzes, likes, comments
- Points system: awardPoints, getMyPoints, getAllPlayerPoints
- Gift points: giftPoints(recipient: Principal, amount: Nat)
- Top player detection: getTopPlayer returns Principal with most points
- Admin panel: getAdminQuizAnswers (only for top player)
- Spin Wheel cooldown: 3-day cooldown tracked per user in backend
- Memory Game cooldown: 1-day cooldown tracked per user in backend
- Visitor/player counter: track total registered users
- Custom mini game creator: top player can create custom trivia challenges or spin wheel games
- Mini game timers: countdown shown in UI for both cooldowns

### Frontend (React/TypeScript)
- Landing/Feed page: social feed cards with quiz info, play button, like/comment
- Navigation: Home, Create Quiz, Mini Games, Leaderboard, Admin Panel, Profile
- Quiz creation form with dynamic question builder
- Quiz play flow: one question at a time, score at end
- Per-quiz leaderboard modal/page
- Mini Games Hub page with Memory Game and Spin Wheel
  - Memory Game: 4x4 card grid, flip pairs, earn 10pts per match, 1-day cooldown timer
  - Spin Wheel: animated spin wheel, random point prizes, 3-day cooldown timer
- Points Leaderboard page: all players ranked, gift points button
- Admin Panel: visible only to #1 points player, shows all quiz answers
- Custom Mini Game Creator in Admin Panel: create trivia challenge or custom spin wheel
- Community Mini Games section: shows custom games created by #1 player
- Player counter on homepage showing total registered users
- Cooldown countdowns visible on Games Hub before entering mini games
