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

  type Visitor = {
    principalId : Principal;
    timestamp : Time.Time;
  };

  type PrivateMessage = {
    id : Nat;
    sender : Principal;
    recipient : Principal;
    content : Text;
    timestamp : Time.Time;
    isRead : Bool;
  };

  type ConversationSummary = {
    otherUser : Principal;
    lastMessage : Text;
    lastTimestamp : Time.Time;
    unreadCount : Nat;
  };

  type ChatMessage = {
    id : Nat;
    author : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  // Manually assigned rank override (owner can set any player's rank)
  type AssignedRank = Text; // "Noob" | "Pro" | "God" | "Hacker" | "Admin" | "Owner"

  type PlayerRankEntry = {
    player : Principal;
    rank : AssignedRank;
  };

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
  let posts = Map.empty<Nat, Post>();
  let likes = Map.empty<Nat, [Like]>();
  let comments = Map.empty<Nat, [Comment]>();
  let postsByQuiz = Map.empty<Nat, [Post]>();
  let miniGameCooldowns = Map.empty<Principal, [MiniGameCooldown]>();
  let customGames = Map.empty<Nat, CustomGame>();
  let visitors = Map.empty<Principal, Visitor>();
  let privateMessages = Map.empty<Nat, PrivateMessage>();
  let chatMessages = Map.empty<Nat, ChatMessage>();
  let assignedRanks = Map.empty<Principal, AssignedRank>();

  var ownerPrincipal : ?Principal = ?Principal.fromText("z3mva-tptde-7oekh-xfili-hlllb-ljasq-t5z65-b3z44-sc4qp-j6qxy-rqe");

  var nextChatMessageId = 0;
  var nextQuizId = 0;
  var nextQuestionId = 0;
  var nextResultId = 0;
  var nextPostId = 0;
  var nextCommentId = 0;
  var nextCustomGameId = 0;
  var nextMessageId = 0;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  /////////////////////////////////////////////////////////////////////////////
  // Owner Functions
  /////////////////////////////////////////////////////////////////////////////

  public query func getOwner() : async ?Principal {
    ownerPrincipal;
  };

  public query ({ caller }) func isCallerOwner() : async Bool {
    switch (ownerPrincipal) {
      case (null) { false };
      case (?owner) { caller == owner };
    };
  };

  public shared ({ caller }) func claimOwner() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to claim owner");
    };
    switch (ownerPrincipal) {
      case (?_) { Runtime.trap("Owner has already been claimed") };
      case (null) { ownerPrincipal := ?caller };
    };
  };

  /////////////////////////////////////////////////////////////////////////////
  // Rank Assignment (Owner only)
  /////////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func assignPlayerRank(player : Principal, rank : AssignedRank) : async () {
    let isOwner = switch (ownerPrincipal) {
      case (?owner) { caller == owner };
      case (null) { false };
    };
    if (not isOwner) {
      Runtime.trap("Unauthorized: Only the owner can assign ranks");
    };
    // Remove rank override if set to empty string
    if (rank == "") {
      assignedRanks.remove(player);
    } else {
      assignedRanks.add(player, rank);
    };
  };

  public query func getPlayerAssignedRank(player : Principal) : async ?AssignedRank {
    assignedRanks.get(player);
  };

  public query func getAllAssignedRanks() : async [PlayerRankEntry] {
    assignedRanks.toArray().map(func((player, rank)) { { player; rank } });
  };

  /////////////////////////////////////////////////////////////////////////////
  // User Profile Functions
  /////////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func createUserProfile(username : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };
    if (userProfiles.containsKey(caller)) { Runtime.trap("User already exists") };
    userProfiles.add(caller, { username });
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query func getUserProfile(user : Principal) : async ?UserProfile {
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

  public query ({ caller }) func searchUsers(searchQuery : Text) : async [(Principal, UserProfile)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    userProfiles.toArray().filter(
      func((p, u)) { p != caller and u.username.contains(#text searchQuery) }
    );
  };

  /////////////////////////////////////////////////////////////////////////////
  // Points System Functions
  /////////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func awardPoints(amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can award points");
    };
    let isOwner = switch (ownerPrincipal) {
      case (?owner) { caller == owner };
      case (null) { false };
    };
    if (isOwner) { return };
    let currentPoints = switch (userPoints.get(caller)) {
      case (null) { 0 };
      case (?points) { points };
    };
    userPoints.add(caller, currentPoints + amount);
  };

  public shared ({ caller }) func giftPoints(recipient : Principal, amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can gift points");
    };
    if (caller == recipient) { Runtime.trap("Cannot gift points to yourself") };
    if (amount == 0) { Runtime.trap("Amount must be greater than zero") };

    let isOwner = switch (ownerPrincipal) {
      case (?owner) { caller == owner };
      case (null) { false };
    };

    if (not isOwner) {
      let callerPoints = switch (userPoints.get(caller)) {
        case (null) { 0 };
        case (?points) { points };
      };
      if (callerPoints < amount) { Runtime.trap("Insufficient points") };
      userPoints.add(caller, if (callerPoints >= amount) { callerPoints - amount } else { 0 });
    };

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
      let isOwner = switch (ownerPrincipal) {
        case (?owner) { player == owner };
        case (null) { false };
      };
      if (not isOwner) {
        let current : PointsEntry = { player; points };
        switch (topPlayer) {
          case (null) { topPlayer := ?current };
          case (?top) {
            if (points > top.points) { topPlayer := ?current };
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
      let isOwner = switch (ownerPrincipal) {
        case (?owner) { player == owner };
        case (null) { false };
      };
      if (not isOwner) {
        let current : PointsEntry = { player; points };
        switch (topPlayer) {
          case (null) { topPlayer := ?current };
          case (?top) {
            if (points > top.points) { topPlayer := ?current };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create quizzes");
    };
    let quizId = nextQuizId;
    nextQuizId += 1;
    let quiz : Quiz = { id = quizId; title; description; creator = caller; timestamp = Time.now() };
    quizzes.add(quizId, quiz);
    quizId;
  };

  public shared ({ caller }) func deleteQuiz(quizId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let quiz = switch (quizzes.get(quizId)) {
      case (null) { Runtime.trap("Quiz does not exist") };
      case (?q) { q };
    };
    let isOwner = switch (ownerPrincipal) {
      case (?owner) { caller == owner };
      case (null) { false };
    };
    if (not isOwner and quiz.creator != caller) {
      Runtime.trap("Unauthorized: Only the owner or quiz creator can delete this quiz");
    };
    quizzes.remove(quizId);
    let remainingQuestions = questions.toArray().filter(func((_, q)) { q.quizId != quizId });
    for ((k, _) in questions.entries()) { questions.remove(k) };
    for ((k, v) in remainingQuestions.values()) { questions.add(k, v) };
    resultsByQuiz.remove(quizId);
    let remainingResults = quizResults.toArray().filter(func((_, r)) { r.quizId != quizId });
    for ((k, _) in quizResults.entries()) { quizResults.remove(k) };
    for ((k, v) in remainingResults.values()) { quizResults.add(k, v) };
    switch (postsByQuiz.get(quizId)) {
      case (null) {};
      case (?quizPosts) {
        for (post in quizPosts.values()) {
          posts.remove(post.id);
          likes.remove(post.id);
          comments.remove(post.id);
        };
      };
    };
    postsByQuiz.remove(quizId);
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
    let newQuestion : Question = { question with id = questionId; quizId };
    questions.add(questionId, newQuestion);
    questionId;
  };

  public shared ({ caller }) func submitQuizAnswers(quizId : Nat, answers : [Answer]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit quiz answers");
    };
    if (not quizzes.containsKey(quizId)) { Runtime.trap("Quiz does not exist") };
    var correctCount = 0;
    for (answer in answers.values()) {
      switch (questions.get(answer.questionId)) {
        case (null) { Runtime.trap("Question does not exist") };
        case (?question) {
          switch (question.questionType) {
            case (#multipleChoice { correctOption }) {
              switch (answer.answer) {
                case (#multipleChoice val) { if (correctOption == val) { correctCount += 1 } };
                case (_) {};
              };
            };
            case (#trueFalse { correctAnswer }) {
              switch (answer.answer) {
                case (#trueFalse val) { if (correctAnswer == val) { correctCount += 1 } };
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
    let result = { quizId; player = caller; username; score = correctCount; totalQuestions = answers.size(); timestamp = Time.now() };
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
        { quizId = quiz.id; title = quiz.title; totalAttemptCount; totalCorrectCount };
      }
    ).sort(func(a, b) { QuizStats.compareByAverageScore(b, a) });
  };

  public query ({ caller }) func getUserQuizResults() : async [Result] {
    quizResults.values().toArray().filter(func(result) { result.player == caller });
  };

  public query ({ caller }) func getAdminQuizAnswers() : async [QuizWithAnswers] {
    let isOwner = switch (ownerPrincipal) {
      case (?owner) { caller == owner };
      case (null) { false };
    };
    if (not isOwner) {
      let topPlayer = getTopPlayerSync();
      switch (topPlayer) {
        case (null) { Runtime.trap("Unauthorized: No top player exists yet") };
        case (?top) {
          if (caller != top) {
            Runtime.trap("Unauthorized: Only the owner or top player can access this");
          };
        };
      };
    };
    quizzes.values().toArray().map(
      func(quiz) {
        let quizQuestions = questions.values().toArray().filter(func(q) { q.quizId == quiz.id }).sort();
        { quiz; questions = quizQuestions };
      }
    );
  };

  /////////////////////////////////////////////////////////////////////////////
  // Private Messaging Functions
  /////////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func sendPrivateMessage(recipient : Principal, content : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    if (content.size() == 0) { Runtime.trap("Message cannot be empty") };
    if (recipient == caller) { Runtime.trap("Cannot send message to self") };
    let msgId = nextMessageId;
    nextMessageId += 1;
    let message : PrivateMessage = { id = msgId; sender = caller; recipient; content; timestamp = Time.now(); isRead = false };
    privateMessages.add(msgId, message);
    msgId;
  };

  public query ({ caller }) func getConversation(otherUser : Principal) : async [PrivateMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    privateMessages.values().toArray().filter(
      func(m) { (m.sender == caller and m.recipient == otherUser) or (m.recipient == caller and m.sender == otherUser) }
    );
  };

  public query ({ caller }) func getMyConversations() : async [ConversationSummary] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    let allMessages = privateMessages.values().toArray().filter(
      func(m) { m.sender == caller or m.recipient == caller }
    );
    let summarized = allMessages.foldLeft(
      Map.empty<Principal, ConversationSummary>(),
      func(acc, msg) {
        let otherUser = if (msg.sender == caller) { msg.recipient } else { msg.sender };
        switch (acc.get(otherUser)) {
          case (null) {
            acc.add(otherUser, { otherUser; lastMessage = msg.content; lastTimestamp = msg.timestamp; unreadCount = if (msg.recipient == caller and not msg.isRead) { 1 } else { 0 } });
          };
          case (?existing) {
            if (msg.timestamp > existing.lastTimestamp) {
              acc.add(otherUser, { otherUser; lastMessage = msg.content; lastTimestamp = msg.timestamp; unreadCount = existing.unreadCount + (if (msg.recipient == caller and not msg.isRead) { 1 } else { 0 }) });
            };
          };
        };
        acc;
      },
    );
    summarized.values().toArray();
  };

  public query ({ caller }) func getUnreadMessageCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    privateMessages.values().toArray().filter(func(m) { m.recipient == caller and not m.isRead }).size();
  };

  public shared ({ caller }) func markConversationRead(otherUser : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    for (message in privateMessages.values()) {
      if (message.sender == otherUser and message.recipient == caller and not message.isRead) {
        privateMessages.add(message.id, { message with isRead = true });
      };
    };
  };

  /////////////////////////////////////////////////////////////////////////////
  // Social Feed Functions
  /////////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func createPost(quizId : Nat, message : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    if (not quizzes.containsKey(quizId)) { Runtime.trap("Referenced quiz does not exist") };
    let postId = nextPostId;
    nextPostId += 1;
    let post : Post = { id = postId; author = caller; quizId; message; timestamp = Time.now() };
    posts.add(postId, post);
    let existingPosts = switch (postsByQuiz.get(quizId)) { case (null) { [] }; case (?p) { p } };
    postsByQuiz.add(quizId, existingPosts.concat([post]));
    postId;
  };

  public shared ({ caller }) func likePost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    if (not posts.containsKey(postId)) { Runtime.trap("Post does not exist") };
    let existingLikes = switch (likes.get(postId)) { case (null) { [] }; case (?l) { l } };
    if (existingLikes.any(func(l) { l.user == caller })) { Runtime.trap("User already liked this post") };
    likes.add(postId, existingLikes.concat([{ postId; user = caller; timestamp = Time.now() }]));
  };

  public shared ({ caller }) func unlikePost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    if (not posts.containsKey(postId)) { Runtime.trap("Post does not exist") };
    let existingLikes = switch (likes.get(postId)) { case (null) { [] }; case (?l) { l } };
    likes.add(postId, existingLikes.filter(func(l) { l.user != caller }));
  };

  public shared ({ caller }) func addComment(postId : Nat, content : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    if (not posts.containsKey(postId)) { Runtime.trap("Post does not exist") };
    let commentId = nextCommentId;
    nextCommentId += 1;
    let comment : Comment = { id = commentId; postId; author = caller; content; timestamp = Time.now() };
    let existingComments = switch (comments.get(postId)) { case (null) { [] }; case (?c) { c } };
    comments.add(postId, existingComments.concat([comment]));
    commentId;
  };

  public query func getAllPostsWithStats() : async [PostWithStats] {
    posts.values().toArray().map(
      func(post) {
        let likeCount = switch (likes.get(post.id)) { case (null) { 0 }; case (?l) { l.size() } };
        let commentCount = switch (comments.get(post.id)) { case (null) { 0 }; case (?c) { c.size() } };
        { post; likeCount; commentCount };
      }
    ).sort();
  };

  public query func getPostsByQuizId(quizId : Nat) : async [PostWithStats] {
    switch (postsByQuiz.get(quizId)) {
      case (null) { [] };
      case (?quizPosts) {
        quizPosts.map(func(post) {
          let likeCount = switch (likes.get(post.id)) { case (null) { 0 }; case (?l) { l.size() } };
          let commentCount = switch (comments.get(post.id)) { case (null) { 0 }; case (?c) { c.size() } };
          { post; likeCount; commentCount };
        });
      };
    };
  };

  public query func getCommentsByPostId(postId : Nat) : async [Comment] {
    switch (comments.get(postId)) { case (null) { [] }; case (?c) { c } };
  };

  public query func getPostWithComments(postId : Nat) : async ?PostWithComment {
    switch (posts.get(postId)) {
      case (null) { null };
      case (?post) {
        let postComments = switch (comments.get(postId)) { case (null) { [] }; case (?c) { c } };
        ?{ post; comments = postComments };
      };
    };
  };

  public query func getUserPosts(user : Principal) : async [PostWithStats] {
    posts.values().toArray().filter(func(post) { post.author == user }).map(
      func(post) {
        let likeCount = switch (likes.get(post.id)) { case (null) { 0 }; case (?l) { l.size() } };
        let commentCount = switch (comments.get(post.id)) { case (null) { 0 }; case (?c) { c.size() } };
        { post; likeCount; commentCount };
      }
    ).sort();
  };

  /////////////////////////////////////////////////////////////////////////////
  // Mini Games Functions
  /////////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func recordSpinWheelPlay() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    recordMiniGamePlay(caller, #spinWheel);
  };

  public query ({ caller }) func getSpinWheelCooldown() : async ?Time.Time {
    getMiniGameCooldown(caller, #spinWheel);
  };

  public shared ({ caller }) func recordMemoryGamePlay() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    recordMiniGamePlay(caller, #memoryGame);
  };

  public query ({ caller }) func getMemoryGameCooldown() : async ?Time.Time {
    getMiniGameCooldown(caller, #memoryGame);
  };

  func recordMiniGamePlay(player : Principal, gameType : MiniGameType) {
    let existingCooldowns = switch (miniGameCooldowns.get(player)) { case (null) { [] }; case (?c) { c } };
    let filtered = existingCooldowns.filter(func(c) { N.not_equal(c.gameType, gameType) });
    miniGameCooldowns.add(player, filtered.concat([{ lastPlayed = Time.now(); gameType }]));
  };

  func getMiniGameCooldown(player : Principal, gameType : MiniGameType) : ?Time.Time {
    switch (miniGameCooldowns.get(player)) {
      case (null) { null };
      case (?cooldowns) {
        let matching = cooldowns.filter(func(c) { N.equal(c.gameType, gameType) });
        if (matching.size() > 0) { ?matching[0].lastPlayed } else { null };
      };
    };
  };

  module N {
    public func equal(a : MiniGameType, b : MiniGameType) : Bool {
      switch (a, b) {
        case (#spinWheel, #spinWheel) { true };
        case (#memoryGame, #memoryGame) { true };
        case (_, _) { false };
      };
    };
    public func not_equal(a : MiniGameType, b : MiniGameType) : Bool { not equal(a, b) };
  };

  /////////////////////////////////////////////////////////////////////////////
  // Visitor Tracking
  /////////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func trackVisit() : async () {
    visitors.add(caller, { principalId = caller; timestamp = Time.now() });
  };

  public query func getTotalVisitors() : async Nat { visitors.size() };

  /////////////////////////////////////////////////////////////////////////////
  // Custom Games Functions
  /////////////////////////////////////////////////////////////////////////////

  func isTopPlayerOrOwner(caller : Principal) : Bool {
    let isOwner = switch (ownerPrincipal) {
      case (?owner) { caller == owner };
      case (null) { false };
    };
    if (isOwner) { return true };
    switch (getTopPlayerSync()) {
      case (null) { false };
      case (?top) { caller == top };
    };
  };

  public shared ({ caller }) func createCustomTrivia(title : Text, questions : [CustomTriviaQuestion]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    if (not isTopPlayerOrOwner(caller)) { Runtime.trap("Unauthorized: Only the owner or top player can create custom games") };
    let gameId = nextCustomGameId;
    nextCustomGameId += 1;
    customGames.add(gameId, { id = gameId; title; creator = caller; gameType = #customTrivia({ questions }) });
    gameId;
  };

  public shared ({ caller }) func createCustomSpinWheel(title : Text, segments : [SpinWheelSegment]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    if (not isTopPlayerOrOwner(caller)) { Runtime.trap("Unauthorized: Only the owner or top player can create custom games") };
    let gameId = nextCustomGameId;
    nextCustomGameId += 1;
    customGames.add(gameId, { id = gameId; title; creator = caller; gameType = #customSpinWheel({ segments }) });
    gameId;
  };

  public query func getAllCustomGames() : async [CustomGame] { customGames.values().toArray() };

  public shared ({ caller }) func playCustomTrivia(gameId : Nat, answers : [{ questionId : Nat; answerIndex : Nat }]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    let game = switch (customGames.get(gameId)) { case (null) { Runtime.trap("Custom game does not exist") }; case (?g) { g } };
    let qs = switch (game.gameType) { case (#customTrivia({ questions })) { questions }; case (_) { Runtime.trap("Invalid game type") } };
    var score = 0;
    for (answer in answers.values()) {
      if (answer.questionId < qs.size()) {
        let question = qs[answer.questionId];
        if (question.correctOption == answer.answerIndex) { score += question.pointsReward };
      };
    };
    let currentPoints = switch (userPoints.get(caller)) { case (null) { 0 }; case (?p) { p } };
    userPoints.add(caller, currentPoints + score);
    score;
  };

  public shared ({ caller }) func playCustomSpinWheel(gameId : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    let game = switch (customGames.get(gameId)) { case (null) { Runtime.trap("Custom game does not exist") }; case (?g) { g } };
    let segments = switch (game.gameType) { case (#customSpinWheel({ segments })) { segments }; case (_) { Runtime.trap("Invalid game type") } };
    if (segments.size() == 0) { return 0 };
    let randomIndex = Int.abs(Time.now()) % segments.size();
    let pointsWon = segments[randomIndex].points;
    let currentPoints = switch (userPoints.get(caller)) { case (null) { 0 }; case (?p) { p } };
    userPoints.add(caller, currentPoints + pointsWon);
    pointsWon;
  };

  /////////////////////////////////////////////////////////////////////////////
  // Chat Functions
  /////////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func sendMessage(content : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) { Runtime.trap("Unauthorized") };
    if (content.size() == 0) { Runtime.trap("Message cannot be empty") };
    let msgId = nextChatMessageId;
    nextChatMessageId += 1;
    chatMessages.add(msgId, { id = msgId; author = caller; content; timestamp = Time.now() });
    msgId;
  };

  public query func getMessages() : async [ChatMessage] {
    chatMessages.values().toArray().sort(func(a, b) { Int.compare(a.timestamp, b.timestamp) });
  };
};
