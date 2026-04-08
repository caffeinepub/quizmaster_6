// Re-export wrapper that bridges the old no-arg useActor() API
// to the new @caffeineai/core-infrastructure useActor(createActor) API.

import { useActor as _useActor } from "@caffeineai/core-infrastructure";
import { createActor } from "../backend";

// Full actor interface — all methods used across the app
export interface ActorInterface {
  // Quiz
  getAllQuizzes(): Promise<import("../types").Quiz[]>;
  getQuiz(id: bigint): Promise<import("../types").Quiz>;
  getQuizQuestions(id: bigint): Promise<import("../types").Question[]>;
  getQuizLeaderboard(id: bigint): Promise<import("../types").Result[]>;
  getQuizStats(id: bigint): Promise<import("../types").QuizStats>;
  createQuiz(title: string, description: string): Promise<bigint>;
  addQuestion(
    quizId: bigint,
    question: import("../types").Question,
  ): Promise<bigint>;
  submitQuizAnswers(
    quizId: bigint,
    answers: import("../types").Answer[],
  ): Promise<bigint>;
  deleteQuiz(quizId: bigint): Promise<void>;
  getAdminQuizAnswers(): Promise<import("../types").QuizWithAnswers[]>;
  getUserQuizResults(): Promise<import("../types").Result[]>;
  // User profile
  createUserProfile(username: string): Promise<void>;
  getCallerUserProfile(): Promise<import("../types").UserProfile | null>;
  getUserProfile(
    p: import("@icp-sdk/core/principal").Principal,
  ): Promise<import("../types").UserProfile | null>;
  updateUserProfile(username: string): Promise<void>;
  saveCallerUserProfile(profile: import("../types").UserProfile): Promise<void>;
  searchUsers(query: string): Promise<
    Array<{
      principal: import("@icp-sdk/core/principal").Principal;
      profile: import("../types").UserProfile;
    }>
  >;
  // Points
  getMyPoints(): Promise<bigint>;
  getAllPlayerPoints(): Promise<import("../types").PointsEntry[]>;
  getTopPlayer(): Promise<import("@icp-sdk/core/principal").Principal | null>;
  awardPoints(amount: bigint): Promise<void>;
  giftPoints(
    recipient: import("@icp-sdk/core/principal").Principal,
    amount: bigint,
  ): Promise<void>;
  deductPoints(
    player: import("@icp-sdk/core/principal").Principal,
    amount: bigint,
  ): Promise<bigint>;
  getPointPackages(): Promise<
    Array<{ id: bigint; name: string; points: bigint; priceInPaise: bigint }>
  >;
  getMonthlyLimit(): Promise<bigint>;
  getMyMonthlySpend(): Promise<bigint>;
  fulfillPointsPurchase(packageId: bigint, sessionId: string): Promise<bigint>;
  purchaseVip(): Promise<void>;
  // Social feed
  getAllPostsWithStats(): Promise<import("../types").PostWithStats[]>;
  getPostsByQuizId(quizId: bigint): Promise<import("../types").PostWithStats[]>;
  createPost(quizId: bigint, message: string): Promise<bigint>;
  likePost(postId: bigint): Promise<void>;
  unlikePost(postId: bigint): Promise<void>;
  addComment(postId: bigint, content: string): Promise<bigint>;
  getCommentsByPostId(postId: bigint): Promise<import("../types").Comment[]>;
  getPostWithComments(
    postId: bigint,
  ): Promise<import("../types").PostWithStats | null>;
  getUserPosts(
    player: import("@icp-sdk/core/principal").Principal,
  ): Promise<import("../types").PostWithStats[]>;
  // Chat
  getMessages(): Promise<import("../types").Comment[]>;
  sendMessage(content: string): Promise<bigint>;
  sendPrivateMessage(
    recipient: import("@icp-sdk/core/principal").Principal,
    content: string,
  ): Promise<bigint>;
  getConversation(
    otherUser: import("@icp-sdk/core/principal").Principal,
  ): Promise<import("../types").PrivateMessage[]>;
  getMyConversations(): Promise<import("../types").ConversationSummary[]>;
  getUnreadMessageCount(): Promise<bigint>;
  markConversationRead(
    otherUser: import("@icp-sdk/core/principal").Principal,
  ): Promise<void>;
  // Mini games
  recordMemoryGamePlay(): Promise<bigint>;
  getMemoryGameCooldown(): Promise<bigint>;
  recordSpinWheelPlay(): Promise<bigint>;
  getSpinWheelCooldown(): Promise<bigint>;
  claimDailyChest(): Promise<bigint>;
  getDailyChestCooldown(): Promise<bigint>;
  claimMysteryBonus(): Promise<bigint>;
  getMysteryBonusCooldown(): Promise<bigint>;
  claimLuckyStar(): Promise<bigint>;
  getLuckyStarCooldown(): Promise<bigint>;
  getAllCustomGames(): Promise<import("../types").CustomGame[]>;
  createCustomTrivia(
    title: string,
    questions: import("../types").CustomTriviaQuestion[],
  ): Promise<bigint>;
  createCustomSpinWheel(
    title: string,
    segments: import("../types").SpinWheelSegment[],
  ): Promise<bigint>;
  playCustomTrivia(
    gameId: bigint,
    answers: Array<{ questionId: bigint; answerIndex: bigint }>,
  ): Promise<bigint>;
  playCustomSpinWheel(gameId: bigint): Promise<bigint>;
  // Admin / owner
  getOwner(): Promise<[import("@icp-sdk/core/principal").Principal] | []>;
  isCallerOwner(): Promise<boolean>;
  isCallerAdmin(): Promise<boolean>;
  isCallerBanned(): Promise<boolean>;
  isPlayerBanned(
    player: import("@icp-sdk/core/principal").Principal,
  ): Promise<boolean>;
  getBannedPlayers(): Promise<import("@icp-sdk/core/principal").Principal[]>;
  banPlayer(player: import("@icp-sdk/core/principal").Principal): Promise<void>;
  unbanPlayer(
    player: import("@icp-sdk/core/principal").Principal,
  ): Promise<void>;
  assignCallerUserRole(role: string): Promise<void>;
  getCallerUserRole(): Promise<string>;
  assignPlayerRank(
    player: import("@icp-sdk/core/principal").Principal,
    rank: string,
  ): Promise<void>;
  getPlayerAssignedRank(
    player: import("@icp-sdk/core/principal").Principal,
  ): Promise<string | null>;
  getAllAssignedRanks(): Promise<
    Array<{ player: import("@icp-sdk/core/principal").Principal; rank: string }>
  >;
  // Visitors
  trackVisit(): Promise<void>;
  getTotalVisitors(): Promise<bigint>;
  // Troll
  trollPlayer(
    player: import("@icp-sdk/core/principal").Principal,
  ): Promise<bigint>;
  getTrollCooldown(
    player: import("@icp-sdk/core/principal").Principal,
  ): Promise<bigint>;
}

// Stub upload/download since this backend doesn't use object storage
const noopUpload = async (): Promise<Uint8Array> => new Uint8Array();
const noopDownload = async (): Promise<{
  directURL: string;
  getBytes: () => Promise<Uint8Array>;
  getDirectURL: () => string;
  withUploadProgress: (fn: unknown) => unknown;
}> => ({
  directURL: "",
  getBytes: async () => new Uint8Array(),
  getDirectURL: () => "",
  withUploadProgress: () => ({}),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createActorWrapped(canisterId: string, ..._rest: any[]): unknown {
  return createActor(
    canisterId,
    noopUpload as never,
    noopDownload as never,
    {},
  );
}

export function useActor(): {
  actor: ActorInterface | null;
  isFetching: boolean;
} {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = _useActor(createActorWrapped as any);
  return result as unknown as {
    actor: ActorInterface | null;
    isFetching: boolean;
  };
}
