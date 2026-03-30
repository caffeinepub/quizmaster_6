# QuizMaster

## Current State
QuizMaster is a social quiz app with user authentication, quiz creation/play, mini games, points system with gifting, leaderboards, public/private chat, admin panel, and rank system. Owner is hardcoded by Principal ID.

## Requested Changes (Diff)

### Add
- **Buy Points page**: New page where logged-in users can purchase points via Stripe (INR)
- **4 point packages**:
  - Starter: 100 points for ₹50
  - Popular: 500 points for ₹100
  - Premium: 1,000 points for ₹550
  - Mega: 10,000 points for ₹1,000
- **Monthly spending limit**: ₹10,000 per user per calendar month
- **Backend methods**: `purchasePoints(packageId: Nat)`, `getMonthlySpend()`, point packages data
- **Stripe checkout**: Frontend payment flow for INR; on success, award points to buyer
- **Navigation**: "Buy Points" link in navbar for logged-in users

### Modify
- Navbar: add Buy Points link for authenticated users

### Remove
- Nothing removed

## Implementation Plan
1. Select Stripe component
2. Add purchasePoints, getMonthlySpend, recordPurchase to backend (track monthly spend per user)
3. Create BuyPoints.tsx with package cards, INR pricing, monthly limit display, Stripe checkout
4. Add /buy-points route and navbar link
5. Block purchase if monthly limit (₹10,000) would be exceeded
