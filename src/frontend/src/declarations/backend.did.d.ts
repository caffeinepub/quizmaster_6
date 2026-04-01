/* eslint-disable */

// @ts-nocheck

import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';
import type { Principal } from '@icp-sdk/core/principal';

export interface Answer {
  'answer' : { 'multipleChoice' : bigint } | { 'trueFalse' : boolean },
  'questionId' : bigint,
}
export interface ChatMessage {
  'id' : bigint, 'author' : Principal, 'content' : string, 'timestamp' : Time,
}
export interface Comment {
  'id' : bigint, 'content' : string, 'author' : Principal,
  'timestamp' : Time, 'postId' : bigint,
}
export interface CustomGame {
  'id' : bigint, 'title' : string, 'creator' : Principal,
  'gameType' : { 'customSpinWheel' : { 'segments' : Array<SpinWheelSegment> } } |
    { 'customTrivia' : { 'questions' : Array<CustomTriviaQuestion> } },
}
export interface CustomTriviaQuestion {
  'correctOption' : bigint, 'text' : string,
  'options' : Array<string>, 'pointsReward' : bigint,
}
export interface PlayerRankEntry { 'player' : Principal, 'rank' : string }
export interface PointsEntry { 'player' : Principal, 'points' : bigint }
export interface Post {
  'id' : bigint, 'author' : Principal, 'message' : string,
  'timestamp' : Time, 'quizId' : bigint,
}
export interface PostWithComment { 'post' : Post, 'comments' : Array<Comment> }
export interface PostWithStats {
  'likeCount' : bigint, 'post' : Post, 'commentCount' : bigint,
}
export interface Question {
  'id' : bigint, 'text' : string,
  'questionType' : { 'multipleChoice' : { 'correctOption' : bigint, 'options' : Array<string> } } |
    { 'trueFalse' : { 'correctAnswer' : boolean } },
  'quizId' : bigint,
}
export interface Quiz {
  'id' : bigint, 'title' : string, 'creator' : Principal,
  'description' : string, 'timestamp' : Time,
}
export interface QuizStats {
  'title' : string, 'totalAttemptCount' : bigint,
  'quizId' : bigint, 'totalCorrectCount' : bigint,
}
export interface QuizWithAnswers { 'quiz' : Quiz, 'questions' : Array<Question> }
export interface Result {
  'username' : string, 'player' : Principal, 'score' : bigint,
  'totalQuestions' : bigint, 'timestamp' : Time, 'quizId' : bigint,
}
export interface SpinWheelSegment { 'segmentLabel' : string, 'points' : bigint }
export type Time = bigint;
export interface UserProfile { 'username' : string }
export type UserRole = { 'admin' : null } | { 'user' : null } | { 'guest' : null };
export interface _SERVICE {
  '_initializeAccessControlWithSecret' : ActorMethod<[string], undefined>,
  'addComment' : ActorMethod<[bigint, string], bigint>,
  'addQuestion' : ActorMethod<[bigint, Question], bigint>,
  'assignCallerUserRole' : ActorMethod<[Principal, UserRole], undefined>,
  'assignPlayerRank' : ActorMethod<[Principal, string], undefined>,
  'awardPoints' : ActorMethod<[bigint], undefined>,
  'claimOwner' : ActorMethod<[], undefined>,
  'createCustomSpinWheel' : ActorMethod<[string, Array<SpinWheelSegment>], bigint>,
  'createCustomTrivia' : ActorMethod<[string, Array<CustomTriviaQuestion>], bigint>,
  'createPost' : ActorMethod<[bigint, string], bigint>,
  'createQuiz' : ActorMethod<[string, string], bigint>,
  'createUserProfile' : ActorMethod<[string], undefined>,
  'deleteQuiz' : ActorMethod<[bigint], undefined>,
  'getAdminQuizAnswers' : ActorMethod<[], Array<QuizWithAnswers>>,
  'getAllAssignedRanks' : ActorMethod<[], Array<PlayerRankEntry>>,
  'getAllCustomGames' : ActorMethod<[], Array<CustomGame>>,
  'getAllPlayerPoints' : ActorMethod<[], Array<PointsEntry>>,
  'getAllPostsWithStats' : ActorMethod<[], Array<PostWithStats>>,
  'getAllQuizzes' : ActorMethod<[], Array<Quiz>>,
  'getCallerUserProfile' : ActorMethod<[], [] | [UserProfile]>,
  'getCallerUserRole' : ActorMethod<[], UserRole>,
  'getCommentsByPostId' : ActorMethod<[bigint], Array<Comment>>,
  'getMemoryGameCooldown' : ActorMethod<[], [] | [Time]>,
  'getMessages' : ActorMethod<[], Array<ChatMessage>>,
  'getMyPoints' : ActorMethod<[], bigint>,
  'getOwner' : ActorMethod<[], [] | [Principal]>,
  'getPlayerAssignedRank' : ActorMethod<[Principal], [] | [string]>,
  'getPostWithComments' : ActorMethod<[bigint], [] | [PostWithComment]>,
  'getPostsByQuizId' : ActorMethod<[bigint], Array<PostWithStats>>,
  'getQuiz' : ActorMethod<[bigint], Quiz>,
  'getQuizLeaderboard' : ActorMethod<[bigint], [] | [Array<Result>]>,
  'getQuizQuestions' : ActorMethod<[bigint], Array<Question>>,
  'getQuizStats' : ActorMethod<[], Array<QuizStats>>,
  'getSpinWheelCooldown' : ActorMethod<[], [] | [Time]>,
  'getTopPlayer' : ActorMethod<[], [] | [Principal]>,
  'getTotalVisitors' : ActorMethod<[], bigint>,
  'getUserPosts' : ActorMethod<[Principal], Array<PostWithStats>>,
  'getUserProfile' : ActorMethod<[Principal], [] | [UserProfile]>,
  'getUserQuizResults' : ActorMethod<[], Array<Result>>,
  'giftPoints' : ActorMethod<[Principal, bigint], undefined>,
  'isCallerAdmin' : ActorMethod<[], boolean>,
  'isCallerOwner' : ActorMethod<[], boolean>,
  'likePost' : ActorMethod<[bigint], undefined>,
  'playCustomSpinWheel' : ActorMethod<[bigint], bigint>,
  'playCustomTrivia' : ActorMethod<[bigint, Array<{ 'answerIndex' : bigint, 'questionId' : bigint }>], bigint>,
  'recordMemoryGamePlay' : ActorMethod<[], undefined>,
  'recordSpinWheelPlay' : ActorMethod<[], undefined>,
  'saveCallerUserProfile' : ActorMethod<[UserProfile], undefined>,
  'sendMessage' : ActorMethod<[string], bigint>,
  'submitQuizAnswers' : ActorMethod<[bigint, Array<Answer>], bigint>,
  'trackVisit' : ActorMethod<[], undefined>,
  'unlikePost' : ActorMethod<[bigint], undefined>,
  'updateUserProfile' : ActorMethod<[string], undefined>,
  'banPlayer' : ActorMethod<[Principal], undefined>,
  'unbanPlayer' : ActorMethod<[Principal], undefined>,
  'getBannedPlayers' : ActorMethod<[], Array<Principal>>,
  'isCallerBanned' : ActorMethod<[], boolean>,
  'isPlayerBanned' : ActorMethod<[Principal], boolean>,
  'deductPoints' : ActorMethod<[Principal, bigint], bigint>,
}
export declare const idlService: IDL.ServiceClass;
export declare const idlInitArgs: IDL.Type[];
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
