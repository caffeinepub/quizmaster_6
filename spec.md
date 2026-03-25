# QuizMaster

## Current State
Empty project with no backend logic or frontend UI.

## Requested Changes (Diff)

### Add
- User authentication (login/signup required for both quiz creators and players)
- Quiz creation: any logged-in user can create quizzes with a title and description
- Question builder: add multiple choice and true/false questions to a quiz
- Quiz play: players take a quiz, answering one question at a time
- Score screen: players see their score (correct/total) at the end of a quiz
- Leaderboard: per-quiz leaderboard showing top scores with usernames
- Quiz listing page: browse all available quizzes

### Modify
- N/A

### Remove
- N/A

## Implementation Plan

### Backend (Motoko)
- User registration: store username per principal
- Quiz CRUD: create quiz with title, description, questions (multiple choice + true/false)
- Quiz play: submit answers, calculate score, store result
- Leaderboard: query top scores per quiz
- Data models: Quiz, Question, QuizResult

### Frontend (React)
- Auth flow: login/signup with Internet Identity, username setup
- Home page: list all quizzes with title, description, creator, question count
- Create quiz page: form for title, description, add questions (MC + T/F)
- Quiz play page: one question at a time, progress indicator
- Score page: final score display with correct/total and option to view leaderboard
- Leaderboard page: per-quiz top scores table
- Navigation: header with login state, link to create quiz
