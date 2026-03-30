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
export interface Comment {
    id: bigint;
    content: string;
    author: Principal;
    timestamp: Time;
    postId: bigint;
}
export interface SpinWheelSegment {
    segmentLabel: string;
    points: bigint;
}
export interface PointsEntry {
    player: Principal;
    points: bigint;
}
export interface PointPackage {
    id: bigint;
    name: string;
    points: bigint;
    priceInPaise: bigint;
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
export interface CustomTriviaQuestion {
    correctOption: bigint;
    text: string;
    options: Array<string>;
    pointsReward: bigint;
}
export interface CustomGame {
    id: bigint;
    title: string;
    creator: Principal;
    gameType: {
        __kind__: "customSpinWheel";
        customSpinWheel: {
            segments: Array<SpinWheelSegment>;
        };
    } | {
        __kind__: "customTrivia";
        customTrivia: {
            questions: Array<CustomTriviaQuestion>;
        };
    };
}
export interface PrivateMessage {
    id: bigint;
    content: string;
    recipient: Principal;
    isRead: boolean;
    sender: Principal;
    timestamp: Time;
}
export interface Result {
    username: string;
    player: Principal;
    score: bigint;
    totalQuestions: bigint;
    timestamp: Time;
    quizId: bigint;
}
export interface QuizWithAnswers {
    quiz: Quiz;
    questions: Array<Question>;
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
export interface Post {
    id: bigint;
    author: Principal;
    message: string;
    timestamp: Time;
    quizId: bigint;
}
export interface Answer {
    answer: {
        __kind__: "multipleChoice";
        multipleChoice: bigint;
    } | {
        __kind__: "trueFalse";
        trueFalse: boolean;
    };
    questionId: bigint;
}
export interface ChatMessage {
    id: bigint;
    content: string;
    author: Principal;
    timestamp: Time;
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
export interface ConversationSummary {
    lastMessage: string;
    otherUser: Principal;
    unreadCount: bigint;
    lastTimestamp: Time;
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
    awardPoints(amount: bigint): Promise<void>;
    claimOwnership(): Promise<void>;
    createCustomSpinWheel(title: string, segments: Array<SpinWheelSegment>): Promise<bigint>;
    createCustomTrivia(title: string, questions: Array<CustomTriviaQuestion>): Promise<bigint>;
    createPost(quizId: bigint, message: string): Promise<bigint>;
    createQuiz(title: string, description: string): Promise<bigint>;
    createUserProfile(username: string): Promise<void>;
    deleteQuiz(quizId: bigint): Promise<void>;
    fulfillPointsPurchase(packageId: bigint, sessionId: string): Promise<bigint>;
    getAdminQuizAnswers(): Promise<Array<QuizWithAnswers>>;
    getAllCustomGames(): Promise<Array<CustomGame>>;
    getAllPlayerPoints(): Promise<Array<PointsEntry>>;
    getAllPostsWithStats(): Promise<Array<PostWithStats>>;
    getAllQuizzes(): Promise<Array<Quiz>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCommentsByPostId(postId: bigint): Promise<Array<Comment>>;
    getConversation(otherUser: Principal): Promise<Array<PrivateMessage>>;
    getMemoryGameCooldown(): Promise<Time | null>;
    getMessages(): Promise<Array<ChatMessage>>;
    getMonthlyLimit(): Promise<bigint>;
    getMyConversations(): Promise<Array<ConversationSummary>>;
    getMyMonthlySpend(): Promise<bigint>;
    getMyPoints(): Promise<bigint>;
    getOwner(): Promise<Principal | null>;
    getPointPackages(): Promise<Array<PointPackage>>;
    getPostWithComments(postId: bigint): Promise<PostWithComment | null>;
    getPostsByQuizId(quizId: bigint): Promise<Array<PostWithStats>>;
    getQuiz(quizId: bigint): Promise<Quiz>;
    getQuizLeaderboard(quizId: bigint): Promise<Array<Result> | null>;
    getQuizQuestions(quizId: bigint): Promise<Array<Question>>;
    getQuizStats(): Promise<Array<QuizStats>>;
    getSpinWheelCooldown(): Promise<Time | null>;
    getTopPlayer(): Promise<Principal | null>;
    getTotalVisitors(): Promise<bigint>;
    getUnreadMessageCount(): Promise<bigint>;
    getUserPosts(user: Principal): Promise<Array<PostWithStats>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserQuizResults(): Promise<Array<Result>>;
    giftPoints(recipient: Principal, amount: bigint): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isCallerOwner(): Promise<boolean>;
    likePost(postId: bigint): Promise<void>;
    markConversationRead(otherUser: Principal): Promise<void>;
    playCustomSpinWheel(gameId: bigint): Promise<bigint>;
    playCustomTrivia(gameId: bigint, answers: Array<{
        answerIndex: bigint;
        questionId: bigint;
    }>): Promise<bigint>;
    recordMemoryGamePlay(): Promise<void>;
    recordSpinWheelPlay(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchUsers(searchQuery: string): Promise<Array<[Principal, UserProfile]>>;
    sendMessage(content: string): Promise<bigint>;
    sendPrivateMessage(recipient: Principal, content: string): Promise<bigint>;
    submitQuizAnswers(quizId: bigint, answers: Array<Answer>): Promise<bigint>;
    trackVisit(): Promise<void>;
    unlikePost(postId: bigint): Promise<void>;
    updateUserProfile(username: string): Promise<void>;
}
