# QuizMaster

## Current State
QuizMaster has a full Admin Panel accessible to the Owner and #1 points leader. It includes rank assignment, quiz deletion, custom mini game creation, and player management. The Owner is hardcoded by Principal ID.

## Requested Changes (Diff)

### Add
- `banPlayer(playerId: Principal)` backend method — sets a banned flag on the player's record
- `unbanPlayer(playerId: Principal)` backend method — clears the banned flag
- `deductPoints(playerId: Principal, amount: Nat)` backend method — deducts a specified amount from a player's points (floor at 0), Owner-only
- `getBannedPlayers()` backend method — returns list of banned player principals
- Ban/unban UI in Admin Panel: table of all players with ban status toggle (Owner only)
- Deduct Points UI in Admin Panel: input field + button next to each player to deduct a specific amount
- Frontend ban enforcement: before allowing quiz play, chat send, points earn actions — check if caller is banned and block with a message

### Modify
- Admin Panel page: add "Player Management" section with ban controls and point deduction controls
- Public chat, private chat: check ban status before sending messages
- Quiz play flow: check ban status before submitting answers
- Mini games / points earning: check ban status before awarding points

### Remove
- Nothing removed

## Implementation Plan
1. Add `bannedPlayers` stable storage (HashSet of Principals) to backend
2. Implement `banPlayer`, `unbanPlayer`, `getBannedPlayers`, `deductPoints` — all Owner-only
3. Add `isCallerBanned()` query method for frontend to check ban status
4. Regenerate backend bindings
5. Frontend: fetch ban status on login and store in context
6. Block banned users from: sending chat messages (public/private), playing quizzes, earning points from mini games/bonus items/troll
7. Show a clear "You are banned" message when a banned user tries to interact
8. Admin Panel: add Player Management section showing all players, their points, ban status, with Ban/Unban toggle and Deduct Points input+button (Owner only)
