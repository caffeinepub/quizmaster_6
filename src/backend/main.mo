import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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

  // Key compare modules for sorting
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

  module PostWithStats {
    public func compare(a : PostWithStats, b : PostWithStats) : Order.Order {
      Int.compare(b.post.timestamp, a.post.timestamp);
    };
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let quizzes = Map.empty<Nat, Quiz>();
  let questions = Map.empty<Nat, Question>();
  let quizResults = Map.empty<Nat, Result>();
  let resultsByQuiz = Map.empty<Nat, [Result]>();

  // Social Feed state
  let posts = Map.empty<Nat, Post>();
  let likes = Map.empty<Nat, [Like]>();
  let comments = Map.empty<Nat, [Comment]>();
  let postsByQuiz = Map.empty<Nat, [Post]>();

  // ID Counters
  var nextQuizId = 0;
  var nextQuestionId = 0;
  var nextResultId = 0;
  var nextPostId = 0;
  var nextCommentId = 0;

  public shared ({ caller }) func createUserProfile(username : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };
    if (userProfiles.containsKey(caller)) { Runtime.trap("User already exists") };
    let userProfile : UserProfile = { username };
    userProfiles.add(caller, userProfile);
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

  public shared ({ caller }) func submitQuizAnswers(quizId : Nat, answers : [Answer.T]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit quiz answers");
    };
    // Validate quiz exists
    let quiz = switch (quizzes.get(quizId)) {
      case (null) { Runtime.trap("Quiz does not exist") };
      case (?quiz) { quiz };
    };

    var correctCount = 0;
    for (answer in answers.values()) {
      // Validate question exists
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

    let username = switch (userProfiles.get(caller)) {
      case (null) { "Anonymous" };
      case (?user) { user.username };
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

  // Social Feed Functions

  public shared ({ caller }) func createPost(quizId : Nat, message : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };

    if (not quizzes.containsKey(quizId)) {
      Runtime.trap("Referenced quiz does not exist");
    };

    let postId = nextPostId;
    nextPostId += 1;

    let post : Post = {
      id = postId;
      author = caller;
      quizId;
      message;
      timestamp = Time.now();
    };

    posts.add(postId, post);

    let existingPosts = switch (postsByQuiz.get(quizId)) {
      case (null) { [] };
      case (?p) { p };
    };

    postsByQuiz.add(quizId, existingPosts.concat([post]));
    postId;
  };

  public shared ({ caller }) func likePost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };

    if (not posts.containsKey(postId)) {
      Runtime.trap("Post does not exist");
    };

    let existingLikes = switch (likes.get(postId)) {
      case (null) { [] };
      case (?l) { l };
    };

    // Check if user already liked
    let alreadyLiked = existingLikes.any(func(l) { l.user == caller });
    if (alreadyLiked) {
      Runtime.trap("User already liked this post");
    };

    let newLike = {
      postId;
      user = caller;
      timestamp = Time.now();
    };

    likes.add(postId, existingLikes.concat([newLike]));
  };

  public shared ({ caller }) func unlikePost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlike posts");
    };

    if (not posts.containsKey(postId)) {
      Runtime.trap("Post does not exist");
    };

    let existingLikes = switch (likes.get(postId)) {
      case (null) { [] };
      case (?l) { l };
    };

    let remainingLikes = existingLikes.filter(func(l) { l.user != caller });
    likes.add(postId, remainingLikes);
  };

  public shared ({ caller }) func addComment(postId : Nat, content : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };

    if (not posts.containsKey(postId)) {
      Runtime.trap("Post does not exist");
    };

    let commentId = nextCommentId;
    nextCommentId += 1;

    let comment : Comment = {
      id = commentId;
      postId;
      author = caller;
      content;
      timestamp = Time.now();
    };

    let existingComments = switch (comments.get(postId)) {
      case (null) { [] };
      case (?c) { c };
    };

    comments.add(postId, existingComments.concat([comment]));
    commentId;
  };

  public query ({ caller }) func getAllPostsWithStats() : async [PostWithStats] {
    posts.values().toArray().map(
      func(post) {
        let likeCount = switch (likes.get(post.id)) {
          case (null) { 0 };
          case (?l) { l.size() };
        };
        let commentCount = switch (comments.get(post.id)) {
          case (null) { 0 };
          case (?c) { c.size() };
        };
        {
          post;
          likeCount;
          commentCount;
        };
      }
    ).sort();
  };

  public query ({ caller }) func getPostsByQuizId(quizId : Nat) : async [PostWithStats] {
    switch (postsByQuiz.get(quizId)) {
      case (null) { [] };
      case (?quizPosts) {
        quizPosts.map(
          func(post) {
            let likeCount = switch (likes.get(post.id)) {
              case (null) { 0 };
              case (?l) { l.size() };
            };
            let commentCount = switch (comments.get(post.id)) {
              case (null) { 0 };
              case (?c) { c.size() };
            };
            {
              post;
              likeCount;
              commentCount;
            };
          }
        );
      };
    };
  };

  public query ({ caller }) func getCommentsByPostId(postId : Nat) : async [Comment] {
    switch (comments.get(postId)) {
      case (null) { [] };
      case (?c) { c };
    };
  };

  public query ({ caller }) func getPostWithComments(postId : Nat) : async ?PostWithComment {
    switch (posts.get(postId)) {
      case (null) { null };
      case (?post) {
        let postComments = switch (comments.get(postId)) {
          case (null) { [] };
          case (?c) { c };
        };
        ?{
          post;
          comments = postComments;
        };
      };
    };
  };

  public query ({ caller }) func getUserPosts(user : Principal) : async [PostWithStats] {
    posts.values().toArray().filter(
      func(post) { post.author == user }
    ).map(
      func(post) {
        let likeCount = switch (likes.get(post.id)) {
          case (null) { 0 };
          case (?l) { l.size() };
        };
        let commentCount = switch (comments.get(post.id)) {
          case (null) { 0 };
          case (?c) { c.size() };
        };
        {
          post;
          likeCount;
          commentCount;
        };
      }
    ).sort();
  };
};
