# QuizMaster

## Current State
Full-stack quiz + social app. Backend has custom games (createCustomTrivia, createCustomSpinWheel, getAllCustomGames, playCustomTrivia, playCustomSpinWheel). GamesHub only shows Memory Game and Spin Wheel. No chat feature exists.

## Requested Changes (Diff)

### Add
- Chat: backend ChatMessage type, sendMessage, getMessages
- Chat page with polling, send input for logged-in users
- Chat link in Navbar
- Community Games section in GamesHub using getAllCustomGames
- Custom game page for trivia and spin wheel custom games
- 1-day localStorage cooldown per custom game per user
- New hooks: usePlayCustomTrivia, usePlayCustomSpinWheel, useGetMessages, useSendMessage

### Modify
- GamesHub.tsx: community games section with cooldown timers
- Navbar.tsx: add Chat link
- App.tsx: add /chat and /games/custom/$id routes
- useQueries.ts: add new hooks

### Remove
- Nothing

## Implementation Plan
1. Generate backend with chat support added
2. Add hooks for custom game play and chat
3. Create Chat page with polling every 5s
4. Create CustomGamePage handling trivia and spin wheel
5. Update GamesHub, Navbar, App.tsx
