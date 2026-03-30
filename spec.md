# QuizMaster

## Current State
claimOwnership is gated behind AccessControl.hasPermission #user. A new login without role gets Unauthorized.

## Requested Changes (Diff)
### Add
- none
### Modify
- claimOwnership: use Principal.isAnonymous check instead of #user role check
### Remove
- none

## Implementation Plan
1. Fix claimOwnership guard in main.mo
