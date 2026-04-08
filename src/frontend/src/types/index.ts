import type { Principal } from "@icp-sdk/core/principal";

// ---- Quiz types ----
export interface TrueFalseQuestion {
  correctAnswer: boolean;
}

export interface MultipleChoiceQuestion {
  options: string[];
  correctOption: bigint;
}

export type QuestionType =
  | { __kind__: "trueFalse"; trueFalse: TrueFalseQuestion }
  | { __kind__: "multipleChoice"; multipleChoice: MultipleChoiceQuestion };

export interface Question {
  id: bigint;
  quizId: bigint;
  text: string;
  questionType: QuestionType;
}

export interface Quiz {
  id: bigint;
  creator: { toString(): string } & Principal;
  title: string;
  description: string;
  createdAt: bigint;
}

export interface QuizStats {
  totalPlays: bigint;
  averageScore: number;
}

// Answer matches the shape used by PlayQuiz when submitting answers
export interface Answer {
  questionId: bigint;
  answer:
    | { __kind__: "multipleChoice"; multipleChoice: bigint }
    | { __kind__: "trueFalse"; trueFalse: boolean };
}

export interface Result {
  quizId: bigint;
  player: { toString(): string } & Principal;
  username: string;
  score: bigint;
  totalQuestions: bigint;
  timestamp: bigint;
}

export interface QuizWithAnswers {
  quiz: Quiz;
  questions: Question[];
}

// ---- User types ----
export interface UserProfile {
  username: string;
  createdAt: bigint;
}

export type UserRole =
  | { __kind__: "admin" }
  | { __kind__: "user" }
  | { __kind__: "owner" };

// ---- Points types ----
export interface PointsEntry {
  player: { toString(): string } & Principal;
  points: bigint;
}

// ---- Post / Feed types ----
export interface Post {
  id: bigint;
  author: { toString(): string } & Principal;
  quizId: bigint;
  message: string;
  timestamp: bigint;
}

export interface PostWithStats {
  post: Post;
  quiz: Quiz;
  likeCount: bigint;
  commentCount: bigint;
  likedByMe: boolean;
  authorProfile: UserProfile | null;
}

export interface Comment {
  id: bigint;
  postId: bigint;
  author: { toString(): string } & Principal;
  content: string;
  timestamp: bigint;
}

// ---- Chat types ----
export interface PrivateMessage {
  id: bigint;
  sender: { toString(): string } & Principal;
  receiver: { toString(): string } & Principal;
  content: string;
  timestamp: bigint;
  read: boolean;
}

export interface ConversationSummary {
  otherUser: { toString(): string } & Principal;
  lastMessage: string;
  lastTimestamp: bigint;
  unreadCount: bigint;
}

// ---- Mini-game types ----
export interface CustomTriviaQuestion {
  text: string;
  options: [string, string, string, string];
  correctOption: bigint;
  pointsReward: bigint;
}

export interface SpinWheelSegment {
  segmentLabel: string;
  points: bigint;
}

export type CustomGameType =
  | {
      __kind__: "customTrivia";
      customTrivia: { questions: CustomTriviaQuestion[] };
    }
  | {
      __kind__: "customSpinWheel";
      customSpinWheel: { segments: SpinWheelSegment[] };
    };

export interface CustomGame {
  id: bigint;
  creator: { toString(): string } & Principal;
  title: string;
  gameType: CustomGameType;
  createdAt: bigint;
}
