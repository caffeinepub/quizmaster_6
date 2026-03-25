import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  module Question {
    public func compare(a : Question, b : Question) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };
  module Quiz {
    public func compare(quizA : Quiz, quizB : Quiz) : Order.Order {
      Nat.compare(quizA.id, quizB.id);
    };
  };
  module Result {
    public func compare(resultA : Result, resultB : Result) : Order.Order {
      Nat.compare(resultA.score, resultB.score);
    };
  };
  module QuizStats {
    public func compareByAverageScore(statsA : QuizStats, statsB : QuizStats) : Order.Order {
      Nat.compare(statsA.totalCorrectCount / statsA.totalAttemptCount, statsB.totalCorrectCount / statsB.totalAttemptCount);
    };
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

  module Answer {
    public type T = {
      questionId : Nat;
      answer : {
        #multipleChoice : Nat;
        #trueFalse : Bool;
      };
    };
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let quizzes = Map.empty<Nat, Quiz>();
  let questions = Map.empty<Nat, Question>();
  let quizResults = Map.empty<Nat, Result>();
  let resultsByQuiz = Map.empty<Nat, [Result]>();
  var nextQuizId = 0;
  var nextQuestionId = 0;
  var nextResultId = 0;

  public shared ({ caller }) func createUserProfile(username : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };
    if (userProfiles.containsKey(caller)) { Runtime.trap("User already exists") };
    let userProfile : UserProfile = { username };
    userProfiles.add(caller, userProfile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func updateUserProfile(username : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    userProfiles.add(caller, { username });
  };

  public shared ({ caller }) func createQuiz(title : Text, description : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create quizzes");
    };
    let quizId = nextQuizId;
    nextQuizId += 1;
    let quiz : Quiz = {
      id = quizId;
      title;
      description;
      creator = caller;
      timestamp = Time.now();
    };
    quizzes.add(quizId, quiz);
    quizId;
  };

  public shared ({ caller }) func addQuestion(quizId : Nat, question : Question) : async Nat {
    let quiz = switch (quizzes.get(quizId)) {
      case (null) { Runtime.trap("Quiz does not exist") };
      case (?q) { q };
    };
    
    if (quiz.creator != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the quiz creator or admins can add questions");
    };
    
    let questionId = nextQuestionId;
    nextQuestionId += 1;
    let newQuestion : Question = {
      question with
      id = questionId;
      quizId;
    };
    questions.add(questionId, newQuestion);
    questionId;
  };

  public query ({ caller }) func getAllQuizzes() : async [Quiz] {
    quizzes.values().toArray().sort();
  };

  public query ({ caller }) func getQuiz(quizId : Nat) : async Quiz {
    switch (quizzes.get(quizId)) {
      case (null) { Runtime.trap("Quiz does not exist") };
      case (?quiz) { quiz };
    };
  };

  public query ({ caller }) func getQuizQuestions(quizId : Nat) : async [Question] {
    questions.values().toArray().filter(func(q) { q.quizId == quizId });
  };

  public shared ({ caller }) func submitQuizAnswers(quizId : Nat, answers : [Answer.T]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit quiz answers");
    };
    
    let quiz = switch (quizzes.get(quizId)) {
      case (null) { Runtime.trap("Quiz does not exist") };
      case (?quiz) { quiz };
    };

    let username = switch (userProfiles.get(caller)) {
      case (null) { "Anonymous" };
      case (?user) { user.username };
    };

    var correctCount = 0;
    for (answer in answers.values()) {
      switch (questions.get(answer.questionId)) {
        case (null) { Runtime.trap("Question does not exist") };
        case (?question) {
          switch (question.questionType) {
            case (#multipleChoice { correctOption }) {
              switch (answer.answer) {
                case (#multipleChoice val) {
                  if (correctOption == val) { correctCount += 1 };
                };
                case (_) {};
              };
            };
            case (#trueFalse { correctAnswer }) {
              switch (answer.answer) {
                case (#trueFalse val) {
                  if (correctAnswer == val) {
                    correctCount += 1;
                  };
                };
                case (_) {};
              };
            };
          };
        };
      };
    };

    let resultId = nextResultId;
    nextResultId += 1;

    let result = {
      quizId;
      player = caller;
      username;
      score = correctCount;
      totalQuestions = answers.size();
      timestamp = Time.now();
    };

    quizResults.add(resultId, result);

    let existingResults = switch (resultsByQuiz.get(quizId)) {
      case (null) { [] };
      case (?r) { r };
    };
    resultsByQuiz.add(quizId, existingResults.concat([result]));
    correctCount;
  };

  public query ({ caller }) func getQuizLeaderboard(quizId : Nat) : async ?[Result] {
    switch (resultsByQuiz.get(quizId)) {
      case (null) { null };
      case (?results) {
        let sorted = results.sort();
        let topResults = Array.tabulate(Nat.min(10, sorted.size()), func(i) { sorted[i] });
        ?topResults;
      };
    };
  };

  public query ({ caller }) func getQuizStats() : async [QuizStats] {
    quizzes.values().toArray().map(
      func(quiz) {
        let results = switch (resultsByQuiz.get(quiz.id)) {
          case (null) { [] };
          case (?r) { r };
        };
        let totalAttemptCount = results.size();
        let totalCorrectCount = results.foldLeft(0, func(acc, result) { acc + result.score });
        {
          quizId = quiz.id;
          title = quiz.title;
          totalAttemptCount;
          totalCorrectCount;
        };
      }
    ).sort(
      func(a, b) { QuizStats.compareByAverageScore(b, a) }
    );
  };

  public query ({ caller }) func getUserQuizResults() : async [Result] {
    quizResults.values().toArray().filter(
      func(result) { result.player == caller }
    );
  };
};
