import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Result {
    username: string;
    player: Principal;
    score: bigint;
    totalQuestions: bigint;
    timestamp: Time;
    quizId: bigint;
}
export interface T {
    answer: {
        __kind__: "multipleChoice";
        multipleChoice: bigint;
    } | {
        __kind__: "trueFalse";
        trueFalse: boolean;
    };
    questionId: bigint;
}
export interface Quiz {
    id: bigint;
    title: string;
    creator: Principal;
    description: string;
    timestamp: Time;
}
export interface QuizStats {
    title: string;
    totalAttemptCount: bigint;
    quizId: bigint;
    totalCorrectCount: bigint;
}
export interface Question {
    id: bigint;
    text: string;
    questionType: {
        __kind__: "multipleChoice";
        multipleChoice: {
            correctOption: bigint;
            options: Array<string>;
        };
    } | {
        __kind__: "trueFalse";
        trueFalse: {
            correctAnswer: boolean;
        };
    };
    quizId: bigint;
}
export interface UserProfile {
    username: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addQuestion(quizId: bigint, question: Question): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createQuiz(title: string, description: string): Promise<bigint>;
    createUserProfile(username: string): Promise<void>;
    getAllQuizzes(): Promise<Array<Quiz>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getQuiz(quizId: bigint): Promise<Quiz>;
    getQuizLeaderboard(quizId: bigint): Promise<Array<Result> | null>;
    getQuizQuestions(quizId: bigint): Promise<Array<Question>>;
    getQuizStats(): Promise<Array<QuizStats>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserQuizResults(): Promise<Array<Result>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitQuizAnswers(quizId: bigint, answers: Array<T>): Promise<bigint>;
    updateUserProfile(username: string): Promise<void>;
}
