import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  type UserProfile = {
    username : Text;
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

  type Quiz = {
    id : Nat;
    title : Text;
    description : Text;
    creator : Principal;
    timestamp : Time.Time;
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

  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    quizzes : Map.Map<Nat, Quiz>;
    questions : Map.Map<Nat, Question>;
    quizResults : Map.Map<Nat, Result>;
    resultsByQuiz : Map.Map<Nat, [Result]>;

    nextQuizId : Nat;
    nextQuestionId : Nat;
    nextResultId : Nat;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    quizzes : Map.Map<Nat, Quiz>;
    questions : Map.Map<Nat, Question>;
    quizResults : Map.Map<Nat, Result>;
    resultsByQuiz : Map.Map<Nat, [Result]>;

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

  public func run(old : OldActor) : NewActor {
    {
      old with
      posts = Map.empty<Nat, Post>();
      likes = Map.empty<Nat, [Like]>();
      comments = Map.empty<Nat, [Comment]>();
      postsByQuiz = Map.empty<Nat, [Post]>();

      nextPostId = 0;
      nextCommentId = 0;
    };
  };
};
