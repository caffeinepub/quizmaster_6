# QuizMaster

## Current State
A quiz app with user authentication (Internet Identity), quiz creation, multiple choice and true/false questions, scoring, leaderboard, and a quiz browsing home page. Backend has quizzes, questions, results, user profiles.

## Requested Changes (Diff)

### Add
- `Post` type: a quiz posted to the social feed (links to a quizId, has creator, timestamp)
- `Like` on posts: users can like/unlike a post
- `Comment` on posts: users can add text comments to a post
- Backend functions: `postQuiz`, `getAllPosts`, `likePost`, `unlikePost`, `addComment`, `getComments`
- New frontend page: Feed (`/feed`) showing all posts as cards
- Each post card shows: quiz title, description, creator name, question count, like count, comment section, and a "Play Quiz" button
- Navigation link to Feed in Navbar

### Modify
- Navbar: add "Feed" link
- Home page: can optionally show a "Post to Feed" button on quiz cards (for quiz owner)

### Remove
- Nothing

## Implementation Plan
1. Add `Post`, `Like`, `Comment` types to backend
2. Add `postQuiz`, `getAllPosts`, `likePost`, `unlikePost`, `addComment`, `getComments` functions
3. Regenerate frontend bindings
4. Create `/feed` page with post cards
5. Create `/feed` route in App.tsx
6. Add Feed link to Navbar
7. Add "Post to Feed" button on quiz cards in Home for quiz owners
