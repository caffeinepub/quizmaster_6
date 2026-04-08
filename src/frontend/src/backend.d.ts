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
export type AssignedRank = string;
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
export interface PlayerRankEntry {
    player: Principal;
    rank: AssignedRank;
}
export interface ChatMessage {
    id: bigint;
    content: string;
    author: Principal;
    timestamp: Time;
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
export interface PointPackage {
    id: bigint;
    name: string;
    priceInPaise: bigint;
    points: bigint;
}
export interface UserProfile {
    username: string;
    isVip: boolean;
}
export interface backendInterface {
    addComment(postId: bigint, content: string): Promise<bigint>;
    addQuestion(quizId: bigint, question: Question): Promise<bigint>;
    assignCallerUserRole(): Promise<void>;
    assignPlayerRank(player: Principal, rank: AssignedRank): Promise<void>;
    awardPoints(amount: bigint): Promise<void>;
    banPlayer(player: Principal): Promise<void>;
    claimDailyChest(): Promise<bigint>;
    claimLuckyStar(): Promise<bigint>;
    claimMysteryBonus(): Promise<bigint>;
    createCustomSpinWheel(title: string, segments: Array<SpinWheelSegment>): Promise<bigint>;
    createCustomTrivia(title: string, qs: Array<CustomTriviaQuestion>): Promise<bigint>;
    createPost(quizId: bigint, message: string): Promise<bigint>;
    createQuiz(title: string, description: string): Promise<bigint>;
    createUserProfile(username: string): Promise<void>;
    deductPoints(player: Principal, amount: bigint): Promise<bigint>;
    deleteQuiz(quizId: bigint): Promise<void>;
    fulfillPointsPurchase(packageId: bigint, sessionId: string): Promise<bigint>;
    getAdminQuizAnswers(): Promise<Array<QuizWithAnswers>>;
    getAllAssignedRanks(): Promise<Array<PlayerRankEntry>>;
    getAllCustomGames(): Promise<Array<CustomGame>>;
    getAllPlayerPoints(): Promise<Array<PointsEntry>>;
    getAllPostsWithStats(): Promise<Array<PostWithStats>>;
    getAllQuizzes(): Promise<Array<Quiz>>;
    getBannedPlayers(): Promise<Array<Principal>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<string>;
    getCommentsByPostId(postId: bigint): Promise<Array<Comment>>;
    getConversation(otherUser: Principal): Promise<Array<PrivateMessage>>;
    getDailyChestCooldown(): Promise<Time | null>;
    getLuckyStarCooldown(): Promise<Time | null>;
    getMemoryGameCooldown(): Promise<Time | null>;
    getMessages(): Promise<Array<ChatMessage>>;
    getMonthlyLimit(): Promise<bigint>;
    getMyConversations(): Promise<Array<ConversationSummary>>;
    getMyMonthlySpend(): Promise<bigint>;
    getMyPoints(): Promise<bigint>;
    getMysteryBonusCooldown(): Promise<Time | null>;
    getOwner(): Promise<Principal>;
    getPlayerAssignedRank(player: Principal): Promise<AssignedRank | null>;
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
    getTrollCooldown(target: Principal): Promise<Time | null>;
    getUnreadMessageCount(): Promise<bigint>;
    getUserPosts(user: Principal): Promise<Array<PostWithStats>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserQuizResults(): Promise<Array<Result>>;
    giftPoints(recipient: Principal, amount: bigint): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isCallerBanned(): Promise<boolean>;
    isCallerOwner(): Promise<boolean>;
    isPlayerBanned(player: Principal): Promise<boolean>;
    likePost(postId: bigint): Promise<void>;
    markConversationRead(otherUser: Principal): Promise<void>;
    playCustomSpinWheel(gameId: bigint): Promise<bigint>;
    playCustomTrivia(gameId: bigint, answers: Array<{
        answerIndex: bigint;
        questionId: bigint;
    }>): Promise<bigint>;
    purchaseVip(): Promise<void>;
    recordMemoryGamePlay(): Promise<void>;
    recordSpinWheelPlay(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchUsers(searchQuery: string): Promise<Array<[Principal, UserProfile]>>;
    sendMessage(content: string): Promise<bigint>;
    sendPrivateMessage(recipient: Principal, content: string): Promise<bigint>;
    submitQuizAnswers(quizId: bigint, answers: Array<Answer>): Promise<bigint>;
    trackVisit(): Promise<void>;
    trollPlayer(target: Principal): Promise<bigint>;
    unbanPlayer(player: Principal): Promise<void>;
    unlikePost(postId: bigint): Promise<void>;
    updateUserProfile(username: string): Promise<void>;
}
