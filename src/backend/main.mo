import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import Time "mo:core/Time";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


actor {
  type PointsEntry = {
    player : Principal;
    points : Nat;
  };

  module PointsEntry {
    public func compare(a : PointsEntry, b : PointsEntry) : Order.Order {
      Nat.compare(b.points, a.points);
    };
  };

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

  type QuizStats = {
    quizId : Nat;
    title : Text;
    totalAttemptCount : Nat;
    totalCorrectCount : Nat;
  };

  type Answer = {
    questionId : Nat;
    answer : {
      #multipleChoice : Nat;
      #trueFalse : Bool;
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

  type QuizWithAnswers = {
    quiz : Quiz;
    questions : [Question];
  };

  // Mini Games Types
  type MiniGameType = {
    #spinWheel;
    #memoryGame;
  };

  type MiniGameCooldown = {
    lastPlayed : Time.Time;
    gameType : MiniGameType;
  };

  type SpinWheelSegment = {
    segmentLabel : Text;
    points : Nat;
  };

  type CustomTriviaQuestion = {
    text : Text;
    options : [Text];
    correctOption : Nat;
    pointsReward : Nat;
  };

  type CustomGame = {
    id : Nat;
    title : Text;
    creator : Principal;
    gameType : {
      #customTrivia : {
        questions : [CustomTriviaQuestion];
      };
      #customSpinWheel : {
        segments : [SpinWheelSegment];
      };
    };
  };

  // Visitor Tracking Types
  type Visitor = {
    principalId : Principal;
    timestamp : Time.Time;
  };


  // Chat Types
  type ChatMessage = {
    id : Nat;
    author : Principal;
    content : Text;
    timestamp : Time.Time;
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
      // Avoid division by zero by checking if totalAttemptCount is not zero
      var ratioA = 0;
      var ratioB = 0;
      if (statsA.totalAttemptCount > 0 and statsB.totalAttemptCount > 0) {
        ratioA := statsA.totalCorrectCount / statsA.totalAttemptCount;
        ratioB := statsB.totalCorrectCount / statsB.totalAttemptCount;
      };
      Nat.compare(ratioA, ratioB);
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
  let userPoints = Map.empty<Principal, Points>();

  // Social Feed state
  let posts = Map.empty<Nat, Post>();
  let likes = Map.empty<Nat, [Like]>();
  let comments = Map.empty<Nat, [Comment]>();
  let postsByQuiz = Map.empty<Nat, [Post]>();

  // Mini Games state
  let miniGameCooldowns = Map.empty<Principal, [MiniGameCooldown]>();
  let customGames = Map.empty<Nat, CustomGame>();

  // Visitors state
  let visitors = Map.empty<Principal, Visitor>();


  // Chat state
  let chatMessages = Map.empty<Nat, ChatMessage>();
  var nextChatMessageId = 0;

  // ID Counters
  var nextQuizId = 0;
  var nextQuestionId = 0;
  var nextResultId = 0;
  var nextPostId = 0;
  var nextCommentId = 0;
  var nextCustomGameId = 0;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  /////////////////////////////////////////////////////////////////////////////
  // User Profile Functions
  /////////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func createUserProfile(username : Text) : async () {
    // Only allow authenticated users to create profiles
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };
    if (userProfiles.containsKey(caller)) { Runtime.trap("User already exists") };
    let userProfile : UserProfile = { username };
    userProfiles.add(caller, userProfile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    // Only allow authenticated users to view profiles
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    // Allow users to view their own profiles, or any profile for admins
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    // Only allow authenticated users to save profiles
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func updateUserProfile(username : Text) : async () {
    // Only allow authenticated users to update profiles
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    userProfiles.add(caller, { username });
  };

  /////////////////////////////////////////////////////////////////////////////
  // Points System Functions
  /////////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func awardPoints(amount : Nat) : async () {
    // Only allow authenticated users to award points
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can award points");
    };
    let currentPoints = switch (userPoints.get(caller)) {
      case (null) { 0 };
      case (?points) { points };
    };
    userPoints.add(caller, currentPoints + amount);
  };

  // Give points to another player (deducted from caller's balance)
  public shared ({ caller }) func giftPoints(recipient : Principal, amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can gift points");
    };
    if (caller == recipient) {
      Runtime.trap("Cannot gift points to yourself");
    };
    if (amount == 0) {
      Runtime.trap("Amount must be greater than zero");
    };
    let callerPoints = switch (userPoints.get(caller)) {
      case (null) { 0 };
      case (?points) { points };
    };
    if (callerPoints < amount) {
      Runtime.trap("Insufficient points");
    };
    userPoints.add(caller, callerPoints - amount);
    let recipientPoints = switch (userPoints.get(recipient)) {
      case (null) { 0 };
      case (?points) { points };
    };
    userPoints.add(recipient, recipientPoints + amount);
  };

  public query ({ caller }) func getMyPoints() : async Nat {
    switch (userPoints.get(caller)) {
      case (null) { 0 };
      case (?points) { points };
    };
  };

  public query func getTopPlayer() : async ?Principal {
    var topPlayer : ?PointsEntry = null;
    for (entry in userPoints.entries()) {
      let (player, points) = entry;
      let current : PointsEntry = { player; points };
      switch (topPlayer) {
        case (null) { topPlayer := ?current };
        case (?top) {
          if (points > top.points) {
            topPlayer := ?current;
          };
        };
      };
    };
    switch (topPlayer) {
      case (null) { null };
      case (?top) { ?top.player };
    };
  };

  public query func getAllPlayerPoints() : async [PointsEntry] {
    userPoints.toArray().map(
      func((player, points)) { { player; points } }
    ).sort();
  };

  func getTopPlayerSync() : ?Principal {
    var topPlayer : ?PointsEntry = null;
    for (entry in userPoints.entries()) {
      let (player, points) = entry;
      let current : PointsEntry = { player; points };
      switch (topPlayer) {
        case (null) { topPlayer := ?current };
        case (?top) {
          if (points > top.points) {
            topPlayer := ?current;
          };
        };
      };
    };
    switch (topPlayer) {
      case (null) { null };
      case (?top) { ?top.player };
    };
  };

  /////////////////////////////////////////////////////////////////////////////
  // Quiz Functions
  /////////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func createQuiz(title : Text, description : Text) : async Nat {
    // Only allow authenticated users to create quizzes
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

    // Only allow the creator or admin to add questions
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

  public shared ({ caller }) func submitQuizAnswers(quizId : Nat, answers : [Answer]) : async Nat {
    // Only allow authenticated users to submit quiz answers
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit quiz answers");
    };
    let quiz = switch (quizzes.get(quizId)) {
      case (null) { Runtime.trap("Quiz does not exist") };
      case (?quiz) { quiz };
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

  public query func getAllQuizzes() : async [Quiz] {
    quizzes.values().toArray().sort();
  };

  public query func getQuiz(quizId : Nat) : async Quiz {
    switch (quizzes.get(quizId)) {
      case (null) { Runtime.trap("Quiz does not exist") };
      case (?quiz) { quiz };
    };
  };

  public query func getQuizQuestions(quizId : Nat) : async [Question] {
    questions.values().toArray().filter(func(q) { q.quizId == quizId });
  };

  public query func getQuizLeaderboard(quizId : Nat) : async ?[Result] {
    switch (resultsByQuiz.get(quizId)) {
      case (null) { null };
      case (?results) {
        let sorted = results.sort();
        let topResults = Array.tabulate(Nat.min(10, sorted.size()), func(i) { sorted[i] });
        ?topResults;
      };
    };
  };

  public query func getQuizStats() : async [QuizStats] {
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

  public query ({ caller }) func getAdminQuizAnswers() : async [QuizWithAnswers] {
    let topPlayer = getTopPlayerSync();
    switch (topPlayer) {
      case (null) {
        Runtime.trap("Unauthorized: No top player exists yet");
      };
      case (?top) {
        if (caller != top) {
          Runtime.trap("Unauthorized: Only the player with the most points can access this endpoint");
        };
      };
    };

    quizzes.values().toArray().map(
      func(quiz) {
        let quizQuestions = questions.values().toArray().filter(
          func(q) { q.quizId == quiz.id }
        ).sort();
        {
          quiz;
          questions = quizQuestions;
        };
      }
    );
  };

  /////////////////////////////////////////////////////////////////////////////
  // Social Feed Functions
  /////////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func createPost(quizId : Nat, message : Text) : async Nat {
    // Only allow authenticated users to create posts
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
    // Only allow authenticated users to like posts
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
    // Only allow authenticated users to unlike posts
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
    // Only allow authenticated users to add comments
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

  public query func getAllPostsWithStats() : async [PostWithStats] {
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

  public query func getPostsByQuizId(quizId : Nat) : async [PostWithStats] {
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

  public query func getCommentsByPostId(postId : Nat) : async [Comment] {
    switch (comments.get(postId)) {
      case (null) { [] };
      case (?c) { c };
    };
  };

  public query func getPostWithComments(postId : Nat) : async ?PostWithComment {
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

  public query func getUserPosts(user : Principal) : async [PostWithStats] {
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

  /////////////////////////////////////////////////////////////////////////////
  // Mini Games Functions
  /////////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func recordSpinWheelPlay() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record mini game plays");
    };
    recordMiniGamePlay(caller, #spinWheel);
  };

  public query ({ caller }) func getSpinWheelCooldown() : async ?Time.Time {
    getMiniGameCooldown(caller, #spinWheel);
  };

  public shared ({ caller }) func recordMemoryGamePlay() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record mini game plays");
    };
    recordMiniGamePlay(caller, #memoryGame);
  };

  public query ({ caller }) func getMemoryGameCooldown() : async ?Time.Time {
    getMiniGameCooldown(caller, #memoryGame);
  };

  // Helper functions for mini games
  func recordMiniGamePlay(player : Principal, gameType : MiniGameType) {
    let existingCooldowns = switch (miniGameCooldowns.get(player)) {
      case (null) { [] };
      case (?c) { c };
    };

    let filteredCooldowns = existingCooldowns.filter(func(c) { N.not_equal(c.gameType, gameType) });

    let newCooldown = {
      lastPlayed = Time.now();
      gameType;
    };

    miniGameCooldowns.add(player, filteredCooldowns.concat([newCooldown]));
  };

  func getMiniGameCooldown(player : Principal, gameType : MiniGameType) : ?Time.Time {
    switch (miniGameCooldowns.get(player)) {
      case (null) { null };
      case (?cooldowns) {
        let matchingCooldowns = cooldowns.filter(func(c) { N.equal(c.gameType, gameType) });
        if (matchingCooldowns.size() > 0) { ?matchingCooldowns[0].lastPlayed } else { null };
      };
    };
  };

  // Generic function for comparing MiniGameType values
  module N {
    public func equal(a : MiniGameType, b : MiniGameType) : Bool {
      switch (a, b) {
        case (#spinWheel, #spinWheel) { true };
        case (#memoryGame, #memoryGame) { true };
        case (_, _) { false };
      };
    };
    public func not_equal(a : MiniGameType, b : MiniGameType) : Bool {
      not equal(a, b);
    };
  };

  /////////////////////////////////////////////////////////////////////////////
  // Visitor Tracking Functions
  /////////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func trackVisit() : async () {
    // Allow any authenticated principal (including guests) to track visits
    let visitor : Visitor = {
      principalId = caller;
      timestamp = Time.now();
    };
    visitors.add(caller, visitor);
  };

  public query func getTotalVisitors() : async Nat {
    visitors.size();
  };

  /////////////////////////////////////////////////////////////////////////////
  // Custom Games Functions
  /////////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func createCustomTrivia(title : Text, questions : [CustomTriviaQuestion]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create custom games");
    };
    
    // Check if caller is the top player
    let topPlayer = getTopPlayerSync();
    switch (topPlayer) {
      case (null) {
        Runtime.trap("Unauthorized: No top player exists yet");
      };
      case (?top) {
        if (caller != top) {
          Runtime.trap("Unauthorized: Only the top player can create custom games");
        };
      };
    };

    let gameId = nextCustomGameId;
    nextCustomGameId += 1;

    let customGame : CustomGame = {
      id = gameId;
      title;
      creator = caller;
      gameType = #customTrivia({ questions });
    };

    customGames.add(gameId, customGame);
    gameId;
  };

  public shared ({ caller }) func createCustomSpinWheel(title : Text, segments : [SpinWheelSegment]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create custom games");
    };
    
    // Check if caller is the top player
    let topPlayer = getTopPlayerSync();
    switch (topPlayer) {
      case (null) {
        Runtime.trap("Unauthorized: No top player exists yet");
      };
      case (?top) {
        if (caller != top) {
          Runtime.trap("Unauthorized: Only the top player can create custom games");
        };
      };
    };

    let gameId = nextCustomGameId;
    nextCustomGameId += 1;

    let customGame : CustomGame = {
      id = gameId;
      title;
      creator = caller;
      gameType = #customSpinWheel({ segments });
    };

    customGames.add(gameId, customGame);
    gameId;
  };

  public query func getAllCustomGames() : async [CustomGame] {
    customGames.values().toArray();
  };

  public shared ({ caller }) func playCustomTrivia(gameId : Nat, answers : [{ questionId : Nat; answerIndex : Nat }]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can play custom games");
    };

    let game = switch (customGames.get(gameId)) {
      case (null) { Runtime.trap("Custom game does not exist") };
      case (?g) { g };
    };

    let questions = switch (game.gameType) {
      case (#customTrivia({ questions })) { questions };
      case (_) { Runtime.trap("Invalid game type") };
    };

    var score = 0;

    for (answer in answers.values()) {
      let matchingQuestions = questions.filter(func(q) { q.correctOption == answer.questionId });
      if (matchingQuestions.size() > 0) {
        let question = matchingQuestions[0];
        if (question.correctOption == answer.answerIndex) {
          score += question.pointsReward;
        };
      };
    };

    let currentPoints = switch (userPoints.get(caller)) {
      case (null) { 0 };
      case (?points) { points };
    };

    userPoints.add(caller, currentPoints + score);
    score;
  };

  public shared ({ caller }) func playCustomSpinWheel(gameId : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can play custom games");
    };

    let game = switch (customGames.get(gameId)) {
      case (null) { Runtime.trap("Custom game does not exist") };
      case (?g) { g };
    };

    let segments = switch (game.gameType) {
      case (#customSpinWheel({ segments })) { segments };
      case (_) { Runtime.trap("Invalid game type") };
    };

    if (segments.size() == 0) {
      return 0;
    };

    let nowNat = Time.now().toNat();
    let randomIndex = nowNat % segments.size();
    let pointsWon = segments[randomIndex].points;

    let currentPoints = switch (userPoints.get(caller)) {
      case (null) { 0 };
      case (?points) { points };
    };

    userPoints.add(caller, currentPoints + pointsWon);
    pointsWon;
  };

  /////////////////////////////////////////////////////////////////////////////
  // Chat Functions
  /////////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func sendMessage(content : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };
    if (content.size() == 0) {
      Runtime.trap("Message cannot be empty");
    };
    let msgId = nextChatMessageId;
    nextChatMessageId += 1;
    let msg : ChatMessage = {
      id = msgId;
      author = caller;
      content;
      timestamp = Time.now();
    };
    chatMessages.add(msgId, msg);
    msgId;
  };

  public query func getMessages() : async [ChatMessage] {
    chatMessages.values().toArray().sort(
      func(a, b) { Int.compare(a.timestamp, b.timestamp) }
    );
  };

};
