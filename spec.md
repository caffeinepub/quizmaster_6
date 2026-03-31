# QuizMaster

## Current State
Games Hub has Memory Match and Spin Wheel mini games, plus Community Games section. Points Leaderboard has Gift Points button per player. Profile has VIP purchase mention queued. Backend supports awardPoints.

## Requested Changes (Diff)

### Add
- **Daily Bonus Items section** in Games Hub: 3 clickable items (Daily Chest, Mystery Bonus, Lucky Star) each awarding random points (10-100) with 24h cooldown timers stored in localStorage
- **VIP Status purchase**: Players spend 1,000,000 points to buy VIP badge; shown next to username everywhere; stored in localStorage per principal
- **Troll Button** on Points Leaderboard: Steal 10-50 random points from another player (calls backend giftPoints in reverse logic via awardPoints to caller); 1h cooldown per target; Owner is protected

### Modify
- GamesHub.tsx: add Daily Bonus Items section below Community Games
- PointsLeaderboard.tsx: add Troll button next to Gift button for each player (not Owner, not self)
- Profile.tsx: add Buy VIP section where player can spend 1,000,000 points for VIP badge
- RankBadge.tsx or wherever username is displayed: show 💎 VIP badge if player has VIP

### Remove
- Nothing

## Implementation Plan
1. Add Daily Bonus Items component in GamesHub.tsx with 3 items, random points 10-100, 24h localStorage cooldown per principal
2. Add Troll button to PointsLeaderboard.tsx — calls actor.awardPoints for caller when troll succeeds (steal from target means caller gains points, but we can't actually deduct from target without backend support; instead just award caller 10-50 random pts as 'troll reward'), 1h cooldown in localStorage
3. Add VIP purchase to Profile.tsx — checks if player has 1,000,000 pts, calls actor.giftPoints to self (or use a backend deduction); store VIP status in localStorage keyed by principal
4. Display 💎 VIP badge in RankBadge and leaderboard rows based on localStorage VIP status
