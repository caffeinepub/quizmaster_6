/* eslint-disable */
// @ts-nocheck
import { IDL } from '@icp-sdk/core/candid';

export const Question = IDL.Record({
  'id' : IDL.Nat, 'text' : IDL.Text,
  'questionType' : IDL.Variant({
    'multipleChoice' : IDL.Record({ 'correctOption' : IDL.Nat, 'options' : IDL.Vec(IDL.Text) }),
    'trueFalse' : IDL.Record({ 'correctAnswer' : IDL.Bool }),
  }),
  'quizId' : IDL.Nat,
});
export const UserRole = IDL.Variant({ 'admin' : IDL.Null, 'user' : IDL.Null, 'guest' : IDL.Null });
export const SpinWheelSegment = IDL.Record({ 'segmentLabel' : IDL.Text, 'points' : IDL.Nat });
export const CustomTriviaQuestion = IDL.Record({
  'correctOption' : IDL.Nat, 'text' : IDL.Text,
  'options' : IDL.Vec(IDL.Text), 'pointsReward' : IDL.Nat,
});
export const Time = IDL.Int;
export const Quiz = IDL.Record({
  'id' : IDL.Nat, 'title' : IDL.Text, 'creator' : IDL.Principal,
  'description' : IDL.Text, 'timestamp' : Time,
});
export const QuizWithAnswers = IDL.Record({ 'quiz' : Quiz, 'questions' : IDL.Vec(Question) });
export const CustomGame = IDL.Record({
  'id' : IDL.Nat, 'title' : IDL.Text, 'creator' : IDL.Principal,
  'gameType' : IDL.Variant({
    'customSpinWheel' : IDL.Record({ 'segments' : IDL.Vec(SpinWheelSegment) }),
    'customTrivia' : IDL.Record({ 'questions' : IDL.Vec(CustomTriviaQuestion) }),
  }),
});
export const PointsEntry = IDL.Record({ 'player' : IDL.Principal, 'points' : IDL.Nat });
export const PlayerRankEntry = IDL.Record({ 'player' : IDL.Principal, 'rank' : IDL.Text });
export const Post = IDL.Record({
  'id' : IDL.Nat, 'author' : IDL.Principal, 'message' : IDL.Text,
  'timestamp' : Time, 'quizId' : IDL.Nat,
});
export const PostWithStats = IDL.Record({ 'likeCount' : IDL.Nat, 'post' : Post, 'commentCount' : IDL.Nat });
export const UserProfile = IDL.Record({ 'username' : IDL.Text });
export const Comment = IDL.Record({
  'id' : IDL.Nat, 'content' : IDL.Text, 'author' : IDL.Principal,
  'timestamp' : Time, 'postId' : IDL.Nat,
});
export const PostWithComment = IDL.Record({ 'post' : Post, 'comments' : IDL.Vec(Comment) });
export const Result = IDL.Record({
  'username' : IDL.Text, 'player' : IDL.Principal, 'score' : IDL.Nat,
  'totalQuestions' : IDL.Nat, 'timestamp' : Time, 'quizId' : IDL.Nat,
});
export const QuizStats = IDL.Record({
  'title' : IDL.Text, 'totalAttemptCount' : IDL.Nat,
  'quizId' : IDL.Nat, 'totalCorrectCount' : IDL.Nat,
});
export const Answer = IDL.Record({
  'answer' : IDL.Variant({ 'multipleChoice' : IDL.Nat, 'trueFalse' : IDL.Bool }),
  'questionId' : IDL.Nat,
});
export const ChatMessage = IDL.Record({
  'id' : IDL.Nat, 'author' : IDL.Principal, 'content' : IDL.Text, 'timestamp' : Time,
});

export const idlService = IDL.Service({
  '_initializeAccessControlWithSecret' : IDL.Func([IDL.Text], [], []),
  'addComment' : IDL.Func([IDL.Nat, IDL.Text], [IDL.Nat], []),
  'addQuestion' : IDL.Func([IDL.Nat, Question], [IDL.Nat], []),
  'assignCallerUserRole' : IDL.Func([IDL.Principal, UserRole], [], []),
  'assignPlayerRank' : IDL.Func([IDL.Principal, IDL.Text], [], []),
  'awardPoints' : IDL.Func([IDL.Nat], [], []),
  'claimOwner' : IDL.Func([], [], []),
  'createCustomSpinWheel' : IDL.Func([IDL.Text, IDL.Vec(SpinWheelSegment)], [IDL.Nat], []),
  'createCustomTrivia' : IDL.Func([IDL.Text, IDL.Vec(CustomTriviaQuestion)], [IDL.Nat], []),
  'createPost' : IDL.Func([IDL.Nat, IDL.Text], [IDL.Nat], []),
  'createQuiz' : IDL.Func([IDL.Text, IDL.Text], [IDL.Nat], []),
  'createUserProfile' : IDL.Func([IDL.Text], [], []),
  'deleteQuiz' : IDL.Func([IDL.Nat], [], []),
  'getAdminQuizAnswers' : IDL.Func([], [IDL.Vec(QuizWithAnswers)], ['query']),
  'getAllAssignedRanks' : IDL.Func([], [IDL.Vec(PlayerRankEntry)], ['query']),
  'getAllCustomGames' : IDL.Func([], [IDL.Vec(CustomGame)], ['query']),
  'getAllPlayerPoints' : IDL.Func([], [IDL.Vec(PointsEntry)], ['query']),
  'getAllPostsWithStats' : IDL.Func([], [IDL.Vec(PostWithStats)], ['query']),
  'getAllQuizzes' : IDL.Func([], [IDL.Vec(Quiz)], ['query']),
  'getCallerUserProfile' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
  'getCallerUserRole' : IDL.Func([], [UserRole], ['query']),
  'getCommentsByPostId' : IDL.Func([IDL.Nat], [IDL.Vec(Comment)], ['query']),
  'getMemoryGameCooldown' : IDL.Func([], [IDL.Opt(Time)], ['query']),
  'getMessages' : IDL.Func([], [IDL.Vec(ChatMessage)], ['query']),
  'getMyPoints' : IDL.Func([], [IDL.Nat], ['query']),
  'getOwner' : IDL.Func([], [IDL.Opt(IDL.Principal)], ['query']),
  'getPlayerAssignedRank' : IDL.Func([IDL.Principal], [IDL.Opt(IDL.Text)], ['query']),
  'getPostWithComments' : IDL.Func([IDL.Nat], [IDL.Opt(PostWithComment)], ['query']),
  'getPostsByQuizId' : IDL.Func([IDL.Nat], [IDL.Vec(PostWithStats)], ['query']),
  'getQuiz' : IDL.Func([IDL.Nat], [Quiz], ['query']),
  'getQuizLeaderboard' : IDL.Func([IDL.Nat], [IDL.Opt(IDL.Vec(Result))], ['query']),
  'getQuizQuestions' : IDL.Func([IDL.Nat], [IDL.Vec(Question)], ['query']),
  'getQuizStats' : IDL.Func([], [IDL.Vec(QuizStats)], ['query']),
  'getSpinWheelCooldown' : IDL.Func([], [IDL.Opt(Time)], ['query']),
  'getTopPlayer' : IDL.Func([], [IDL.Opt(IDL.Principal)], ['query']),
  'getTotalVisitors' : IDL.Func([], [IDL.Nat], ['query']),
  'getUserPosts' : IDL.Func([IDL.Principal], [IDL.Vec(PostWithStats)], ['query']),
  'getUserProfile' : IDL.Func([IDL.Principal], [IDL.Opt(UserProfile)], ['query']),
  'getUserQuizResults' : IDL.Func([], [IDL.Vec(Result)], ['query']),
  'giftPoints' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
  'isCallerAdmin' : IDL.Func([], [IDL.Bool], ['query']),
  'isCallerOwner' : IDL.Func([], [IDL.Bool], ['query']),
  'likePost' : IDL.Func([IDL.Nat], [], []),
  'playCustomSpinWheel' : IDL.Func([IDL.Nat], [IDL.Nat], []),
  'playCustomTrivia' : IDL.Func(
    [IDL.Nat, IDL.Vec(IDL.Record({ 'answerIndex' : IDL.Nat, 'questionId' : IDL.Nat }))],
    [IDL.Nat], [],
  ),
  'recordMemoryGamePlay' : IDL.Func([], [], []),
  'recordSpinWheelPlay' : IDL.Func([], [], []),
  'saveCallerUserProfile' : IDL.Func([UserProfile], [], []),
  'sendMessage' : IDL.Func([IDL.Text], [IDL.Nat], []),
  'submitQuizAnswers' : IDL.Func([IDL.Nat, IDL.Vec(Answer)], [IDL.Nat], []),
  'trackVisit' : IDL.Func([], [], []),
  'unlikePost' : IDL.Func([], [], []),
  'updateUserProfile' : IDL.Func([IDL.Text], [], []),
  'banPlayer' : IDL.Func([IDL.Principal], [], []),
  'unbanPlayer' : IDL.Func([IDL.Principal], [], []),
  'getBannedPlayers' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
  'isCallerBanned' : IDL.Func([], [IDL.Bool], ['query']),
  'isPlayerBanned' : IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
  'deductPoints' : IDL.Func([IDL.Principal, IDL.Nat], [IDL.Nat], []),
});

export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const Question = IDL.Record({
    'id' : IDL.Nat, 'text' : IDL.Text,
    'questionType' : IDL.Variant({
      'multipleChoice' : IDL.Record({ 'correctOption' : IDL.Nat, 'options' : IDL.Vec(IDL.Text) }),
      'trueFalse' : IDL.Record({ 'correctAnswer' : IDL.Bool }),
    }),
    'quizId' : IDL.Nat,
  });
  const UserRole = IDL.Variant({ 'admin' : IDL.Null, 'user' : IDL.Null, 'guest' : IDL.Null });
  const SpinWheelSegment = IDL.Record({ 'segmentLabel' : IDL.Text, 'points' : IDL.Nat });
  const CustomTriviaQuestion = IDL.Record({
    'correctOption' : IDL.Nat, 'text' : IDL.Text,
    'options' : IDL.Vec(IDL.Text), 'pointsReward' : IDL.Nat,
  });
  const Time = IDL.Int;
  const Quiz = IDL.Record({
    'id' : IDL.Nat, 'title' : IDL.Text, 'creator' : IDL.Principal,
    'description' : IDL.Text, 'timestamp' : Time,
  });
  const QuizWithAnswers = IDL.Record({ 'quiz' : Quiz, 'questions' : IDL.Vec(Question) });
  const CustomGame = IDL.Record({
    'id' : IDL.Nat, 'title' : IDL.Text, 'creator' : IDL.Principal,
    'gameType' : IDL.Variant({
      'customSpinWheel' : IDL.Record({ 'segments' : IDL.Vec(SpinWheelSegment) }),
      'customTrivia' : IDL.Record({ 'questions' : IDL.Vec(CustomTriviaQuestion) }),
    }),
  });
  const PointsEntry = IDL.Record({ 'player' : IDL.Principal, 'points' : IDL.Nat });
  const PlayerRankEntry = IDL.Record({ 'player' : IDL.Principal, 'rank' : IDL.Text });
  const Post = IDL.Record({
    'id' : IDL.Nat, 'author' : IDL.Principal, 'message' : IDL.Text,
    'timestamp' : Time, 'quizId' : IDL.Nat,
  });
  const PostWithStats = IDL.Record({ 'likeCount' : IDL.Nat, 'post' : Post, 'commentCount' : IDL.Nat });
  const UserProfile = IDL.Record({ 'username' : IDL.Text });
  const Comment = IDL.Record({
    'id' : IDL.Nat, 'content' : IDL.Text, 'author' : IDL.Principal,
    'timestamp' : Time, 'postId' : IDL.Nat,
  });
  const PostWithComment = IDL.Record({ 'post' : Post, 'comments' : IDL.Vec(Comment) });
  const Result = IDL.Record({
    'username' : IDL.Text, 'player' : IDL.Principal, 'score' : IDL.Nat,
    'totalQuestions' : IDL.Nat, 'timestamp' : Time, 'quizId' : IDL.Nat,
  });
  const QuizStats = IDL.Record({
    'title' : IDL.Text, 'totalAttemptCount' : IDL.Nat,
    'quizId' : IDL.Nat, 'totalCorrectCount' : IDL.Nat,
  });
  const Answer = IDL.Record({
    'answer' : IDL.Variant({ 'multipleChoice' : IDL.Nat, 'trueFalse' : IDL.Bool }),
    'questionId' : IDL.Nat,
  });
  const ChatMessage = IDL.Record({
    'id' : IDL.Nat, 'author' : IDL.Principal, 'content' : IDL.Text, 'timestamp' : Time,
  });

  return IDL.Service({
    '_initializeAccessControlWithSecret' : IDL.Func([IDL.Text], [], []),
    'addComment' : IDL.Func([IDL.Nat, IDL.Text], [IDL.Nat], []),
    'addQuestion' : IDL.Func([IDL.Nat, Question], [IDL.Nat], []),
    'assignCallerUserRole' : IDL.Func([IDL.Principal, UserRole], [], []),
    'assignPlayerRank' : IDL.Func([IDL.Principal, IDL.Text], [], []),
    'awardPoints' : IDL.Func([IDL.Nat], [], []),
    'claimOwner' : IDL.Func([], [], []),
    'createCustomSpinWheel' : IDL.Func([IDL.Text, IDL.Vec(SpinWheelSegment)], [IDL.Nat], []),
    'createCustomTrivia' : IDL.Func([IDL.Text, IDL.Vec(CustomTriviaQuestion)], [IDL.Nat], []),
    'createPost' : IDL.Func([IDL.Nat, IDL.Text], [IDL.Nat], []),
    'createQuiz' : IDL.Func([IDL.Text, IDL.Text], [IDL.Nat], []),
    'createUserProfile' : IDL.Func([IDL.Text], [], []),
    'deleteQuiz' : IDL.Func([IDL.Nat], [], []),
    'getAdminQuizAnswers' : IDL.Func([], [IDL.Vec(QuizWithAnswers)], ['query']),
    'getAllAssignedRanks' : IDL.Func([], [IDL.Vec(PlayerRankEntry)], ['query']),
    'getAllCustomGames' : IDL.Func([], [IDL.Vec(CustomGame)], ['query']),
    'getAllPlayerPoints' : IDL.Func([], [IDL.Vec(PointsEntry)], ['query']),
    'getAllPostsWithStats' : IDL.Func([], [IDL.Vec(PostWithStats)], ['query']),
    'getAllQuizzes' : IDL.Func([], [IDL.Vec(Quiz)], ['query']),
    'getCallerUserProfile' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    'getCallerUserRole' : IDL.Func([], [UserRole], ['query']),
    'getCommentsByPostId' : IDL.Func([IDL.Nat], [IDL.Vec(Comment)], ['query']),
    'getMemoryGameCooldown' : IDL.Func([], [IDL.Opt(Time)], ['query']),
    'getMessages' : IDL.Func([], [IDL.Vec(ChatMessage)], ['query']),
    'getMyPoints' : IDL.Func([], [IDL.Nat], ['query']),
    'getOwner' : IDL.Func([], [IDL.Opt(IDL.Principal)], ['query']),
    'getPlayerAssignedRank' : IDL.Func([IDL.Principal], [IDL.Opt(IDL.Text)], ['query']),
    'getPostWithComments' : IDL.Func([IDL.Nat], [IDL.Opt(PostWithComment)], ['query']),
    'getPostsByQuizId' : IDL.Func([IDL.Nat], [IDL.Vec(PostWithStats)], ['query']),
    'getQuiz' : IDL.Func([IDL.Nat], [Quiz], ['query']),
    'getQuizLeaderboard' : IDL.Func([IDL.Nat], [IDL.Opt(IDL.Vec(Result))], ['query']),
    'getQuizQuestions' : IDL.Func([IDL.Nat], [IDL.Vec(Question)], ['query']),
    'getQuizStats' : IDL.Func([], [IDL.Vec(QuizStats)], ['query']),
    'getSpinWheelCooldown' : IDL.Func([], [IDL.Opt(Time)], ['query']),
    'getTopPlayer' : IDL.Func([], [IDL.Opt(IDL.Principal)], ['query']),
    'getTotalVisitors' : IDL.Func([], [IDL.Nat], ['query']),
    'getUserPosts' : IDL.Func([IDL.Principal], [IDL.Vec(PostWithStats)], ['query']),
    'getUserProfile' : IDL.Func([IDL.Principal], [IDL.Opt(UserProfile)], ['query']),
    'getUserQuizResults' : IDL.Func([], [IDL.Vec(Result)], ['query']),
    'giftPoints' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
    'isCallerAdmin' : IDL.Func([], [IDL.Bool], ['query']),
    'isCallerOwner' : IDL.Func([], [IDL.Bool], ['query']),
    'likePost' : IDL.Func([IDL.Nat], [], []),
    'playCustomSpinWheel' : IDL.Func([IDL.Nat], [IDL.Nat], []),
    'playCustomTrivia' : IDL.Func(
      [IDL.Nat, IDL.Vec(IDL.Record({ 'answerIndex' : IDL.Nat, 'questionId' : IDL.Nat }))],
      [IDL.Nat], [],
    ),
    'recordMemoryGamePlay' : IDL.Func([], [], []),
    'recordSpinWheelPlay' : IDL.Func([], [], []),
    'saveCallerUserProfile' : IDL.Func([UserProfile], [], []),
    'sendMessage' : IDL.Func([IDL.Text], [IDL.Nat], []),
    'submitQuizAnswers' : IDL.Func([IDL.Nat, IDL.Vec(Answer)], [IDL.Nat], []),
    'trackVisit' : IDL.Func([], [], []),
    'unlikePost' : IDL.Func([IDL.Nat], [], []),
    'updateUserProfile' : IDL.Func([IDL.Text], [], []),
  'banPlayer' : IDL.Func([IDL.Principal], [], []),
  'unbanPlayer' : IDL.Func([IDL.Principal], [], []),
  'getBannedPlayers' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
  'isCallerBanned' : IDL.Func([], [IDL.Bool], ['query']),
  'isPlayerBanned' : IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
  'deductPoints' : IDL.Func([IDL.Principal, IDL.Nat], [IDL.Nat], []),
  });
};

export const init = ({ IDL }) => { return []; };
