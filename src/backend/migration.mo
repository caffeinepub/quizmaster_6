import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Nat "mo:core/Nat";

module {
  type Points = Nat;

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

  type Comment = {
    id : Nat;
    postId : Nat;
    author : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  type Like = {
    postId : Nat;
    user : Principal;
    timestamp : Time.Time;
  };

  type Post = {
    id : Nat;
    author : Principal;
    quizId : Nat;
    message : Text;
    timestamp : Time.Time;
  };

  type OldState = {
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

  type NewState = {
    userProfiles : Map.Map<Principal, UserProfile>;
    quizzes : Map.Map<Nat, Quiz>;
    questions : Map.Map<Nat, Question>;
    quizResults : Map.Map<Nat, Result>;
    resultsByQuiz : Map.Map<Nat, [Result]>;
    userPoints : Map.Map<Principal, Points>;
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

  public func run(old : OldState) : NewState {
    {
      old with
      userPoints = Map.empty<Principal, Points>();
    };
  };
};
