import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  type PointsEntry = {
    player : Principal;
    points : Nat;
  };

  type UserProfile = {
    username : Text;
  };

  type Quiz = {
    id : Nat;
    title : Text;
    description : Text;
    creator : Principal;
    timestamp : Time.Time;
  };

  type Question = {
    id : Nat;
    quizId : Nat;
    text : Text;
    questionType : {
      #multipleChoice : {
        options : [Text];
        correctOption : Nat;
      };
      #trueFalse : {
        correctAnswer : Bool;
      };
    };
  };

  type Result = {
    quizId : Nat;
    player : Principal;
    username : Text;
    score : Nat;
    totalQuestions : Nat;
    timestamp : Time.Time;
  };

  type QuizStats = {
    quizId : Nat;
    title : Text;
    totalAttemptCount : Nat;
    totalCorrectCount : Nat;
  };

  // Social Feed Types
  type Post = {
    id : Nat;
    author : Principal;
    quizId : Nat;
    message : Text;
    timestamp : Time.Time;
  };

  type Like = {
    postId : Nat;
    user : Principal;
    timestamp : Time.Time;
  };

  type Comment = {
    id : Nat;
    postId : Nat;
    author : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  type PostWithStats = {
    post : Post;
    likeCount : Nat;
    commentCount : Nat;
  };

  type PostWithComment = {
    post : Post;
    comments : [Comment];
  };

  type MiniGameType = {
    #spinWheel;
    #memoryGame;
  };

  type MiniGameCooldown = {
    lastPlayed : Time.Time;
    gameType : MiniGameType;
  };

  // Visitor Tracking Types
  type Visitor = {
    principalId : Principal;
    timestamp : Time.Time;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    quizzes : Map.Map<Nat, Quiz>;
    questions : Map.Map<Nat, Question>;
    quizResults : Map.Map<Nat, Result>;
    resultsByQuiz : Map.Map<Nat, [Result]>;
    userPoints : Map.Map<Principal, Nat>;
    posts : Map.Map<Nat, Post>;
    likes : Map.Map<Nat, [Like]>;
    comments : Map.Map<Nat, [Comment]>;
    postsByQuiz : Map.Map<Nat, [Post]>;
    nextQuizId : Nat;
    nextQuestionId : Nat;
    nextResultId : Nat;
    nextPostId : Nat;
    nextCommentId : Nat;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    quizzes : Map.Map<Nat, Quiz>;
    questions : Map.Map<Nat, Question>;
    quizResults : Map.Map<Nat, Result>;
    resultsByQuiz : Map.Map<Nat, [Result]>;
    userPoints : Map.Map<Principal, Nat>;
    posts : Map.Map<Nat, Post>;
    likes : Map.Map<Nat, [Like]>;
    comments : Map.Map<Nat, [Comment]>;
    postsByQuiz : Map.Map<Nat, [Post]>;
    miniGameCooldowns : Map.Map<Principal, [MiniGameCooldown]>;
    visitors : Map.Map<Principal, Visitor>;
    nextQuizId : Nat;
    nextQuestionId : Nat;
    nextResultId : Nat;
    nextPostId : Nat;
    nextCommentId : Nat;
    nextCustomGameId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      miniGameCooldowns = Map.empty<Principal, [MiniGameCooldown]>();
      visitors = Map.empty<Principal, Visitor>();
      nextCustomGameId = 0;
    };
  };
};

