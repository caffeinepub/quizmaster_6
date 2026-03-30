# QuizMaster

## Current State
The app has full quiz creation, play, social feed, mini games, leaderboard, and admin functionality. Currently there are no pre-loaded quizzes -- users see an empty quiz list until someone creates one.

## Requested Changes (Diff)

### Add
- A `seedData.ts` file containing 4 pre-built quiz datasets, each with 50 true/false questions:
  1. General Knowledge (50 questions)
  2. Science & Nature (50 questions)
  3. History & Geography (50 questions)
  4. Movies & Pop Culture (50 questions)
- A `useSeedQuizzes` hook that uses the actor to create the 4 quizzes and add all questions sequentially
- A seed trigger in the Home page: when quizzes list is empty AND user is logged in, show a "Load Sample Quizzes" button that runs the seed. While seeding, show a loading state. After completion, invalidate the quizzes query.

### Modify
- `Home.tsx`: add the seed trigger UI near the empty quiz state section. Only show it when `quizzes.length === 0` and user is authenticated.
- `useQueries.ts`: add `useSeedQuizzes` hook

### Remove
- Nothing

## Implementation Plan
1. Create `src/frontend/src/data/seedData.ts` with 4 quiz objects, each containing title, description, and 50 true/false questions with their correct answers.
2. Create `useSeedQuizzes` mutation hook in `useQueries.ts` that:
   - Creates each quiz via `actor.createQuiz(title, description)`
   - For each quiz, calls `actor.addQuestion` for all 50 questions with `#trueFalse` question type
   - Returns the mutation state so UI can show loading/done
3. In `Home.tsx`, when `filtered.length === 0 && !isLoading && !!identity`, show a "Load Sample Quizzes" button in the empty state. On click, run the seed mutation. Show a spinner while running. On success, toast a success message and invalidate quizzes query.
