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
export interface PostWithStats {
    likeCount: bigint;
    post: Post;
    commentCount: bigint;
}
export interface PostWithComment {
    post: Post;
    comments: Array<Comment>;
}
export interface Quiz {
    id: bigint;
    title: string;
    creator: Principal;
    description: string;
    timestamp: Time;
}
export interface Post {
    id: bigint;
    author: Principal;
    message: string;
    timestamp: Time;
    quizId: bigint;
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
export interface Comment {
    id: bigint;
    content: string;
    author: Principal;
    timestamp: Time;
    postId: bigint;
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
    addComment(postId: bigint, content: string): Promise<bigint>;
    addQuestion(quizId: bigint, question: Question): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPost(quizId: bigint, message: string): Promise<bigint>;
    createQuiz(title: string, description: string): Promise<bigint>;
    createUserProfile(username: string): Promise<void>;
    getAllPostsWithStats(): Promise<Array<PostWithStats>>;
    getAllQuizzes(): Promise<Array<Quiz>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCommentsByPostId(postId: bigint): Promise<Array<Comment>>;
    getPostWithComments(postId: bigint): Promise<PostWithComment | null>;
    getPostsByQuizId(quizId: bigint): Promise<Array<PostWithStats>>;
    getQuiz(quizId: bigint): Promise<Quiz>;
    getQuizLeaderboard(quizId: bigint): Promise<Array<Result> | null>;
    getQuizQuestions(quizId: bigint): Promise<Array<Question>>;
    getQuizStats(): Promise<Array<QuizStats>>;
    getUserPosts(user: Principal): Promise<Array<PostWithStats>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserQuizResults(): Promise<Array<Result>>;
    isCallerAdmin(): Promise<boolean>;
    likePost(postId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitQuizAnswers(quizId: bigint, answers: Array<T>): Promise<bigint>;
    unlikePost(postId: bigint): Promise<void>;
    updateUserProfile(username: string): Promise<void>;
}
