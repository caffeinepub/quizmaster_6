import Array "mo:core/Array";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";

import Migration "migration";

(with migration = Migration.run)
actor {

  ///////////////////////////////////////////////////////////////////////////
  // Types
  ///////////////////////////////////////////////////////////////////////////

  type PointsEntry = { player : Principal; points : Nat };
  module PointsEntry {
    public func compare(a : PointsEntry, b : PointsEntry) : Order.Order {
      Nat.compare(b.points, a.points)
    };
  };

  type UserProfile = {
    username : Text;
    isVip : Bool;
  };

  type Quiz = {
    id : Nat;
    title : Text;
    description : Text;
    creator : Principal;
    timestamp : Time.Time;
  };
  module Quiz {
    public func compare(a : Quiz, b : Quiz) : Order.Order { Nat.compare(a.id, b.id) };
  };

  type Question = {
    id : Nat;
    quizId : Nat;
    text : Text;
    questionType : {
      #multipleChoice : { options : [Text]; correctOption : Nat };
      #trueFalse : { correctAnswer : Bool };
    };
  };
  module Question {
    public func compare(a : Question, b : Question) : Order.Order { Nat.compare(a.id, b.id) };
  };

  type Answer = {
    questionId : Nat;
    answer : { #multipleChoice : Nat; #trueFalse : Bool };
  };

  type Result = {
    quizId : Nat;
    player : Principal;
    username : Text;
    score : Nat;
    totalQuestions : Nat;
    timestamp : Time.Time;
  };
  module Result {
    public func compare(a : Result, b : Result) : Order.Order { Nat.compare(b.score, a.score) };
  };

  type QuizStats = {
    quizId : Nat;
    title : Text;
    totalAttemptCount : Nat;
    totalCorrectCount : Nat;
  };
  module QuizStats {
    public func compareByAverageScore(a : QuizStats, b : QuizStats) : Order.Order {
      let ra = if (a.totalAttemptCount > 0) { a.totalCorrectCount / a.totalAttemptCount } else { 0 };
      let rb = if (b.totalAttemptCount > 0) { b.totalCorrectCount / b.totalAttemptCount } else { 0 };
      Nat.compare(rb, ra)
    };
  };

  type QuizWithAnswers = { quiz : Quiz; questions : [Question] };

  type Post = {
    id : Nat;
    author : Principal;
    quizId : Nat;
    message : Text;
    timestamp : Time.Time;
  };

  type Like = { postId : Nat; user : Principal; timestamp : Time.Time };

  type Comment = {
    id : Nat;
    postId : Nat;
    author : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  type PostWithStats = { post : Post; likeCount : Nat; commentCount : Nat };
  module PostWithStats {
    public func compare(a : PostWithStats, b : PostWithStats) : Order.Order {
      Int.compare(b.post.timestamp, a.post.timestamp)
    };
  };

  type PostWithComment = { post : Post; comments : [Comment] };

  type MiniGameType = { #spinWheel; #memoryGame; #customGame : Nat };

  type MiniGameCooldownEntry = { gameKey : Text; lastPlayed : Time.Time };

  type SpinWheelSegment = { segmentLabel : Text; points : Nat };

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
      #customTrivia : { questions : [CustomTriviaQuestion] };
      #customSpinWheel : { segments : [SpinWheelSegment] };
    };
  };

  type ChatMessage = {
    id : Nat;
    author : Principal;
    content : Text;
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

  type AssignedRank = Text;
  type PlayerRankEntry = { player : Principal; rank : AssignedRank };

  type PointPackage = {
    id : Nat;
    name : Text;
    points : Nat;
    priceInPaise : Nat;
  };

  type Purchase = {
    id : Nat;
    buyer : Principal;
    packageId : Nat;
    pointsAwarded : Nat;
    priceInPaise : Nat;
    timestamp : Time.Time;
    sessionId : Text;
  };

  type Visitor = { principalId : Principal; timestamp : Time.Time };

  ///////////////////////////////////////////////////////////////////////////
  // Constants
  ///////////////////////////////////////////////////////////////////////////

  let OWNER_PRINCIPAL : Principal = Principal.fromText("z3mva-tptde-7oekh-xfili-hlllb-ljasq-t5z65-b3z44-sc4qp-j6qxy-rqe");

  let MONTHLY_LIMIT_PAISE : Nat = 1_000_000; // Rs 10,000

  let POINT_PACKAGES : [PointPackage] = [
    { id = 0; name = "Starter"; points = 100; priceInPaise = 5_000 },
    { id = 1; name = "Popular"; points = 500; priceInPaise = 10_000 },
    { id = 2; name = "Premium"; points = 1_000; priceInPaise = 55_000 },
    { id = 3; name = "Mega"; points = 10_000; priceInPaise = 100_000 },
  ];

  // Cooldown durations in nanoseconds
  let ONE_DAY_NS : Int = 86_400_000_000_000;
  let THREE_DAYS_NS : Int = 259_200_000_000_000;
  let TWO_HUNDRED_HOURS_NS : Int = 720_000_000_000_000;
  let ONE_HOUR_NS : Int = 3_600_000_000_000;

  // Daily bonus item keys
  let DAILY_CHEST_KEY : Text = "daily_chest";
  let MYSTERY_BONUS_KEY : Text = "mystery_bonus";
  let LUCKY_STAR_KEY : Text = "lucky_star";

  ///////////////////////////////////////////////////////////////////////////
  // State
  ///////////////////////////////////////////////////////////////////////////

  let userProfiles = Map.empty<Principal, UserProfile>();
  let quizzes = Map.empty<Nat, Quiz>();
  let questions = Map.empty<Nat, Question>();
  let quizResults = Map.empty<Nat, Result>();
  let resultsByQuiz = Map.empty<Nat, [Result]>();
  let userPoints = Map.empty<Principal, Nat>();
  let posts = Map.empty<Nat, Post>();
  let likes = Map.empty<Nat, [Like]>();
  let comments = Map.empty<Nat, [Comment]>();
  let postsByQuiz = Map.empty<Nat, [Post]>();
  // cooldowns: keyed by Principal, value is list of (gameKey, lastPlayed)
  let cooldowns = Map.empty<Principal, [MiniGameCooldownEntry]>();
  let customGames = Map.empty<Nat, CustomGame>();
  let visitors = Map.empty<Principal, Visitor>();
  let privateMessages = Map.empty<Nat, PrivateMessage>();
  let chatMessages = Map.empty<Nat, ChatMessage>();
  let assignedRanks = Map.empty<Principal, AssignedRank>();
  let purchases = Map.empty<Nat, Purchase>();
  let bannedPlayers = Map.empty<Principal, Bool>();
  // troll cooldowns: "trollerPrincipal:targetPrincipal" -> lastTrollTime
  let trollCooldowns = Map.empty<Text, Time.Time>();
  // registered users set (for tracking login)
  let registeredUsers = Map.empty<Principal, Bool>();

  var nextChatMessageId : Nat = 0;
  var nextQuizId : Nat = 0;
  var nextQuestionId : Nat = 0;
  var nextResultId : Nat = 0;
  var nextPostId : Nat = 0;
  var nextCommentId : Nat = 0;
  var nextCustomGameId : Nat = 0;
  var nextMessageId : Nat = 0;
  var nextPurchaseId : Nat = 0;
  var preloadedQuizzesInitialized : Bool = false;

  ///////////////////////////////////////////////////////////////////////////
  // Helpers
  ///////////////////////////////////////////////////////////////////////////

  func isOwner(caller : Principal) : Bool {
    Principal.equal(caller, OWNER_PRINCIPAL)
  };

  func isAuthenticated(caller : Principal) : Bool {
    not caller.isAnonymous()
  };

  func requireAuth(caller : Principal) {
    if (not isAuthenticated(caller)) { Runtime.trap("Unauthorized: Must be logged in") }
  };

  func requireNotBanned(caller : Principal) {
    if (bannedPlayers.containsKey(caller)) {
      Runtime.trap("You are banned and cannot perform this action")
    }
  };

  func requireAuthAndNotBanned(caller : Principal) {
    requireAuth(caller);
    requireNotBanned(caller)
  };

  func getPoints(player : Principal) : Nat {
    if (isOwner(player)) { return 1_000_000_000_000 };
    switch (userPoints.get(player)) {
      case (?p) { p };
      case null { 0 };
    }
  };

  func getTopPlayerSync() : ?Principal {
    var topPrincipal : ?Principal = null;
    var topPts : Nat = 0;
    for ((player, pts) in userPoints.entries()) {
      if (not isOwner(player) and pts > topPts) {
        topPts := pts;
        topPrincipal := ?player;
      };
    };
    topPrincipal
  };

  func isTopPlayerOrOwner(caller : Principal) : Bool {
    if (isOwner(caller)) { return true };
    switch (getTopPlayerSync()) {
      case null { false };
      case (?top) { Principal.equal(caller, top) };
    }
  };

  func getCooldownEntry(player : Principal, gameKey : Text) : ?MiniGameCooldownEntry {
    switch (cooldowns.get(player)) {
      case null { null };
      case (?entries) {
        entries.find(func(e : MiniGameCooldownEntry) : Bool { e.gameKey == gameKey })
      };
    }
  };

  func setCooldownEntry(player : Principal, gameKey : Text, ts : Time.Time) {
    let existing = switch (cooldowns.get(player)) {
      case null { [] };
      case (?e) { e };
    };
    let filtered = existing.filter(func(e : MiniGameCooldownEntry) : Bool { e.gameKey != gameKey });
    cooldowns.add(player, filtered.concat([{ gameKey; lastPlayed = ts }]))
  };

  func monthIndex(tsNs : Time.Time) : Nat {
    let ms = Int.abs(tsNs) / 1_000_000;
    ms / 2_592_000_000
  };

  func addPreloadedQuiz(title : Text, description : Text, qs : [(Text, Bool)]) {
    let quizId = nextQuizId;
    nextQuizId += 1;
    quizzes.add(quizId, { id = quizId; title; description; creator = OWNER_PRINCIPAL; timestamp = 0 });
    for ((qtext, answer) in qs.values()) {
      let qId = nextQuestionId;
      nextQuestionId += 1;
      questions.add(qId, {
        id = qId;
        quizId;
        text = qtext;
        questionType = #trueFalse({ correctAnswer = answer });
      })
    }
  };

  ///////////////////////////////////////////////////////////////////////////
  // Pre-loaded Quizzes Initialization
  ///////////////////////////////////////////////////////////////////////////

  func initPreloadedQuizzes() {
    if (preloadedQuizzesInitialized) { return };
    preloadedQuizzesInitialized := true;

    // General Knowledge (150 questions)
    addPreloadedQuiz("General Knowledge", "Test your general knowledge with 150 questions!", [
      ("The Great Wall of China is visible from space.", false),
      ("Water boils at 100 degrees Celsius at sea level.", true),
      ("The sun is a star.", true),
      ("Mount Everest is the tallest mountain in the world.", true),
      ("The Amazon River is the longest river in the world.", false),
      ("Diamonds are made of carbon.", true),
      ("The capital of Australia is Sydney.", false),
      ("Humans share 98% of their DNA with chimpanzees.", true),
      ("The Pacific Ocean is the largest ocean on Earth.", true),
      ("Lightning never strikes the same place twice.", false),
      ("The currency of Japan is the yen.", true),
      ("A group of lions is called a pack.", false),
      ("The Eiffel Tower is located in Paris, France.", true),
      ("Venus is the closest planet to the Sun.", false),
      ("Bats are blind.", false),
      ("The human body has 206 bones.", true),
      ("Gold is the most abundant element in the Earth's crust.", false),
      ("Shakespeare was born in Stratford-upon-Avon.", true),
      ("The capital of Canada is Toronto.", false),
      ("Elephants are the only mammals that cannot jump.", true),
      ("The Berlin Wall fell in 1989.", true),
      ("Oxygen is the most abundant gas in the atmosphere.", false),
      ("The speed of light is approximately 300,000 km/s.", true),
      ("Rome was not built in a day.", true),
      ("Australia is both a country and a continent.", true),
      ("The piano has 88 keys.", true),
      ("Hawaii is the most recently admitted US state.", true),
      ("A decade has 100 years.", false),
      ("The Atlantic Ocean is larger than the Pacific Ocean.", false),
      ("India is the most populous country in the world.", true),
      ("Mars has two moons.", true),
      ("The chemical symbol for water is H2O.", true),
      ("Napoleon Bonaparte was Italian.", false),
      ("A shark is a mammal.", false),
      ("The human brain uses about 20% of the body's energy.", true),
      ("The Sahara is the largest desert in the world.", false),
      ("Mount Kilimanjaro is in Kenya.", false),
      ("The Olympic Games originated in ancient Greece.", true),
      ("Gold's chemical symbol is Au.", true),
      ("The Mona Lisa was painted by Leonardo da Vinci.", true),
      ("Antarctica is the largest continent.", false),
      ("The capital of Brazil is Sao Paulo.", false),
      ("Penguins live in the Arctic.", false),
      ("A group of crows is called a murder.", true),
      ("The first man on the moon was Buzz Aldrin.", false),
      ("The internet was invented in the 1990s.", false),
      ("Whales are fish.", false),
      ("The Colosseum is located in Rome.", true),
      ("Chocolate comes from cocoa beans.", true),
      ("Russia is the largest country by land area.", true),
      ("The heart is on the left side of the body.", true),
      ("A caterpillar turns into a butterfly through metamorphosis.", true),
      ("The DNA double helix was discovered by Watson and Crick.", true),
      ("Pluto is still classified as a planet.", false),
      ("The Great Barrier Reef is located in Australia.", true),
      ("French is the official language of Brazil.", false),
      ("The Sun is approximately 150 million km from Earth.", true),
      ("A human cell has 46 chromosomes.", true),
      ("Bees produce honey.", true),
      ("The number of continents on Earth is seven.", true),
      ("Cleopatra was Greek, not Egyptian.", true),
      ("The Titanic sank in 1912.", true),
      ("Spiders are insects.", false),
      ("The currency of the United Kingdom is the pound.", true),
      ("A year on Mercury is longer than its day.", false),
      ("The Great Pyramid of Giza is one of the Seven Wonders of the Ancient World.", true),
      ("Venus rotates clockwise.", true),
      ("The element with atomic number 1 is Helium.", false),
      ("Humans can survive longer without food than without water.", true),
      ("The Nile River is in Africa.", true),
      ("Sound travels faster than light.", false),
      ("Frogs are reptiles.", false),
      ("The number pi is approximately 3.14.", true),
      ("Julius Caesar was the first Roman Emperor.", false),
      ("Antarctica is the coldest continent.", true),
      ("The Amazon Rainforest produces 20% of the world's oxygen.", true),
      ("Coffee beans are actually seeds.", true),
      ("The human skeleton is composed entirely of bone.", false),
      ("The capital of China is Beijing.", true),
      ("All planets in our solar system rotate in the same direction.", false),
      ("A group of fish is called a school.", true),
      ("Thomas Edison invented the telephone.", false),
      ("The human eye can distinguish about 10 million colors.", true),
      ("Oil and water can mix easily.", false),
      ("The capital of Egypt is Cairo.", true),
      ("Earthquakes can trigger tsunamis.", true),
      ("The Himalayas are the world's youngest mountain range.", true),
      ("The stomach produces hydrochloric acid.", true),
      ("The Vatican is the smallest country in the world.", true),
      ("Mozart was born in Austria.", true),
      ("The Amazon River flows into the Pacific Ocean.", false),
      ("Blood is red due to iron in hemoglobin.", true),
      ("The capital of Argentina is Buenos Aires.", true),
      ("A group of whales is called a pod.", true),
      ("Silk is produced by spiders.", false),
      ("The Statue of Liberty was a gift from France.", true),
      ("Hurricanes rotate clockwise in the Northern Hemisphere.", false),
      ("Mercury is the smallest planet in the solar system.", true),
      ("Plants perform photosynthesis during the night.", false),
      ("The Great Wall of China was built to keep out the Mongols.", true),
      ("The human liver regenerates itself.", true),
      ("Diamonds are the hardest natural substance on Earth.", true),
      ("Antarctica has no permanent human inhabitants.", true),
      ("The first iPhone was released in 2007.", true),
      ("Camels store water in their humps.", false),
      ("Light travels faster in water than in air.", false),
      ("The element gold is represented by the symbol Ag.", false),
      ("Sharks are older than dinosaurs.", true),
      ("The Inca Empire was in South America.", true),
      ("Koalas are bears.", false),
      ("The English Channel separates England from France.", true),
      ("Alexander the Great was from Macedonia.", true),
      ("The Moon has no atmosphere.", true),
      ("The Black Sea borders Turkey.", true),
      ("The primary language of Mexico is Spanish.", true),
      ("Oxygen is necessary for fire to burn.", true),
      ("A decade has 10 years.", true),
      ("The Earth is approximately 4.5 billion years old.", true),
      ("A chameleon changes colour to camouflage.", false),
      ("The capital of South Korea is Seoul.", true),
      ("Ice is denser than liquid water.", false),
      ("The Red Cross was founded by Henry Dunant.", true),
      ("The chemical formula for table salt is NaCl.", true),
      ("Albert Einstein failed math in school.", false),
      ("The Sun is bigger than all other planets combined.", true),
      ("Dolphins are a type of whale.", true),
      ("The population of India exceeds 1 billion people.", true),
      ("Socrates wrote down his own philosophy.", false),
      ("The Mississippi River flows south.", true),
      ("A group of geese on water is called a gaggle.", false),
      ("The Moon is slowly moving away from the Earth.", true),
      ("The first computer was invented in the 19th century.", false),
      ("Humans are the only animals that use tools.", false),
      ("Africa is the second largest continent.", true),
      ("The Great Barrier Reef is the largest living structure on Earth.", true),
      ("Butterflies taste with their feet.", true),
      ("A group of owls is called a parliament.", true),
      ("Volcanic eruptions can cause lightning.", true),
      ("The capital of the United States is New York City.", false),
      ("Honey never spoils.", true),
      ("The Mariana Trench is the deepest ocean trench.", true),
      ("Tectonic plates move very slowly.", true),
      ("Human fingernails grow faster than toenails.", true),
      ("The speed of sound is the same in all materials.", false),
    ]);

    // GK Quiz 2 (50 questions)
    addPreloadedQuiz("General Knowledge 2", "More general knowledge questions to test your mind!", [
      ("The capital of Germany is Berlin.", true),
      ("The longest bone in the human body is the femur.", true),
      ("Rabbits are herbivores.", true),
      ("The Dead Sea is the saltiest lake in the world.", true),
      ("Greece is in Asia.", false),
      ("The word 'typhoon' and 'hurricane' refer to the same type of storm.", true),
      ("The Sun is larger than the Earth.", true),
      ("Coal is a fossil fuel.", true),
      ("The first World War ended in 1918.", true),
      ("Polar bears live in Antarctica.", false),
      ("The Amazon is in South America.", true),
      ("Mercury is liquid at room temperature.", true),
      ("A group of wolves is called a flock.", false),
      ("The capital of Russia is Moscow.", true),
      ("Dolphins can sleep with one eye open.", true),
      ("DNA stands for Deoxyribonucleic Acid.", true),
      ("The Pacific Ocean is the deepest ocean.", true),
      ("Steel is stronger than iron.", true),
      ("A leap year occurs every 4 years.", true),
      ("The first modern Olympic Games were held in 1896.", true),
      ("The telephone was invented by Alexander Graham Bell.", true),
      ("A baby deer is called a foal.", false),
      ("Saturn has the most moons in our solar system.", true),
      ("Ireland is known as the Emerald Isle.", true),
      ("Photosynthesis releases oxygen.", true),
      ("The capital of India is Mumbai.", false),
      ("Pandas are native to China.", true),
      ("The Renaissance began in Italy.", true),
      ("Light is faster than sound.", true),
      ("Bacteria are visible to the naked eye.", false),
      ("The Great Wall of China is over 13,000 miles long.", true),
      ("The Sahara is in Africa.", true),
      ("The capital of France is Paris.", true),
      ("Sharks must keep moving to breathe.", false),
      ("An octopus has eight arms.", true),
      ("The Earth orbits the Sun once a year.", true),
      ("Mount Fuji is in Japan.", true),
      ("The first man-made satellite was Sputnik.", true),
      ("The Amazon River is in Africa.", false),
      ("Lobsters were historically considered a poor man's food.", true),
      ("The capital of Japan is Tokyo.", true),
      ("Bees are the only insects that produce food for humans.", true),
      ("Giraffes have the same number of neck vertebrae as humans.", true),
      ("A group of frogs is called an army.", true),
      ("The capital of Spain is Barcelona.", false),
      ("Aluminum is the most abundant metal in the Earth's crust.", true),
      ("World War II ended in 1945.", true),
      ("The currency of China is the yuan.", true),
      ("Crocodiles cannot stick out their tongues.", true),
      ("The Moon causes ocean tides.", true),
    ]);

    // GK Quiz 3 (50 questions)
    addPreloadedQuiz("General Knowledge 3", "Challenge your knowledge with another 50 questions!", [
      ("The capital of Italy is Rome.", true),
      ("A snail can sleep for three years.", true),
      ("Human blood is always red.", false),
      ("The Eiffel Tower grows in summer.", true),
      ("Cats have five toes on their front paws.", true),
      ("The speed of sound is about 343 m/s in air.", true),
      ("Cleopatra was alive closer to the moon landing than to the building of the pyramids.", true),
      ("Octopuses have three hearts.", true),
      ("Glass is technically a solid.", true),
      ("Birds are direct descendants of dinosaurs.", true),
      ("The capital of Mexico is Mexico City.", true),
      ("More people are killed by vending machines than sharks annually.", true),
      ("Lobsters are immortal.", false),
      ("Atoms are mostly empty space.", true),
      ("The world's oceans cover about 71% of Earth's surface.", true),
      ("Starfish have no brain.", true),
      ("The capital of South Africa is Johannesburg.", false),
      ("Hot water freezes faster than cold water.", true),
      ("Humans are the only primates with chins.", true),
      ("Rainbows are full circles.", true),
      ("The average person walks about 100,000 miles in their lifetime.", true),
      ("Chocolate is produced from the seeds of the cacao tree.", true),
      ("Scotland's national animal is the unicorn.", true),
      ("A group of flamingos is called a flamboyance.", true),
      ("Rubber bands last longer when refrigerated.", true),
      ("The shortest war in history lasted about 38 minutes.", true),
      ("An ostrich's eye is bigger than its brain.", true),
      ("Wombats produce cube-shaped droppings.", true),
      ("The capital of Turkey is Istanbul.", false),
      ("Rats laugh when tickled.", true),
      ("A day on Venus is longer than a year on Venus.", true),
      ("The capital of Nigeria is Lagos.", false),
      ("Sloths can hold their breath longer than dolphins.", true),
      ("Humans share DNA with bananas.", true),
      ("A group of porcupines is called a prickle.", true),
      ("Clouds are made of water vapour.", false),
      ("Butterflies can see ultraviolet light.", true),
      ("The first email was sent in 1971.", true),
      ("Elephants are the only animals with four knees.", true),
      ("The world's most spoken language is Mandarin Chinese.", true),
      ("Penguins proposed to their mate with a pebble.", true),
      ("A group of rhinos is called a crash.", true),
      ("Tigers have striped skin, not just striped fur.", true),
      ("Ants never sleep.", false),
      ("The blue whale's heart is the size of a small car.", true),
      ("A group of jellyfish is called a smack.", true),
      ("Catfish can taste with their entire body.", true),
      ("The Great Wall of China is one continuous wall.", false),
      ("The capital of Greece is Athens.", true),
      ("Honeybees can recognise human faces.", true),
    ]);

    // Science & Nature (50 questions)
    addPreloadedQuiz("Science & Nature", "Explore the wonders of science and the natural world!", [
      ("DNA stands for Deoxyribonucleic Acid.", true),
      ("The Earth is the third planet from the Sun.", true),
      ("Mitochondria are the powerhouse of the cell.", true),
      ("Gravity pulls objects toward each other.", true),
      ("Photosynthesis requires sunlight.", true),
      ("Electrons have a positive charge.", false),
      ("The speed of light is constant in a vacuum.", true),
      ("All mammals give birth to live young.", false),
      ("Black holes have infinite density.", true),
      ("Plants absorb carbon dioxide.", true),
      ("Atoms are the smallest unit of matter.", false),
      ("The human body contains more bacteria than cells.", true),
      ("Neptune is farther from the Sun than Uranus.", true),
      ("Water expands when it freezes.", true),
      ("Sound cannot travel in a vacuum.", true),
      ("The heart has four chambers.", true),
      ("All metals are magnetic.", false),
      ("Chemical reactions always produce new substances.", true),
      ("Jupiter is the largest planet in our solar system.", true),
      ("Viruses are living organisms.", false),
      ("The ozone layer protects Earth from UV radiation.", true),
      ("Light bends when it passes through water.", true),
      ("Insects have six legs.", true),
      ("Every element has a unique atomic number.", true),
      ("Mammals are cold-blooded animals.", false),
      ("Evaporation turns water from a liquid to a gas.", true),
      ("The nucleus of an atom contains protons and neutrons.", true),
      ("Mars has oxygen in its atmosphere.", false),
      ("Plants and animals are made of cells.", true),
      ("Static electricity can produce sparks.", true),
      ("The force of gravity is the same everywhere on Earth.", false),
      ("DNA is the same in every cell of the body.", true),
      ("The Sun is the center of the Milky Way galaxy.", false),
      ("Earthquakes are measured on the Richter scale.", true),
      ("Human eyes have three types of color receptors.", true),
      ("Covalent bonds share electrons.", true),
      ("All chemical elements occur naturally.", false),
      ("A compass points toward magnetic north.", true),
      ("Plants can grow without sunlight.", false),
      ("The immune system fights pathogens.", true),
      ("Climate change is entirely natural.", false),
      ("Tectonic plates cause earthquakes and volcanoes.", true),
      ("All bacteria are harmful to humans.", false),
      ("Electric current is the flow of electrons.", true),
      ("Metals generally conduct electricity.", true),
      ("The Moon has active volcanoes.", false),
      ("Fungi are neither plants nor animals.", true),
      ("Newton's first law is about inertia.", true),
      ("Photons have mass.", false),
      ("Stars are made mostly of hydrogen and helium.", true),
    ]);

    // History & Geography (50 questions)
    addPreloadedQuiz("History & Geography", "Journey through time and explore the world!", [
      ("World War I began in 1914.", true),
      ("The French Revolution started in 1789.", true),
      ("The Roman Empire fell in 476 AD.", true),
      ("Columbus reached the Americas in 1492.", true),
      ("The Cold War was a direct military conflict.", false),
      ("India gained independence in 1947.", true),
      ("The Great Wall of China was built in one dynasty.", false),
      ("The Aztec Empire was in South America.", false),
      ("Nelson Mandela was South Africa's first black president.", true),
      ("The Magna Carta was signed in 1215.", true),
      ("Egypt is in North Africa.", true),
      ("The Silk Road connected Europe and China.", true),
      ("The United Nations was founded after World War II.", true),
      ("Japan attacked Pearl Harbor in 1942.", false),
      ("The Amazon Rainforest is primarily in Brazil.", true),
      ("The Mediterranean Sea borders three continents.", true),
      ("The Vikings discovered America before Columbus.", true),
      ("The Industrial Revolution began in France.", false),
      ("The Suez Canal is in Egypt.", true),
      ("Gandhi advocated for non-violent protest.", true),
      ("The Berlin Wall was built in 1961.", true),
      ("New Zealand was the first country to give women the vote.", true),
      ("The first atomic bomb was dropped on Hiroshima.", true),
      ("Genghis Khan founded the Ottoman Empire.", false),
      ("South America is entirely in the Southern Hemisphere.", false),
      ("The capital of Russia is Moscow.", true),
      ("The Black Death wiped out half of Europe's population.", true),
      ("The longest river in Africa is the Nile.", true),
      ("Australia was originally a British penal colony.", true),
      ("The Taj Mahal was built by Shah Jahan.", true),
      ("The Panama Canal connects the Atlantic and Pacific Oceans.", true),
      ("The Russian Revolution took place in 1917.", true),
      ("Africa is the largest continent by population.", false),
      ("The pyramids of Egypt were built as pharaohs' tombs.", true),
      ("Cleopatra was the last pharaoh of ancient Egypt.", true),
      ("The Korean War ended with a peace treaty.", false),
      ("The longest mountain range is in South America.", true),
      ("Canada is the second largest country in the world.", true),
      ("The Ottoman Empire was centered in Turkey.", true),
      ("Julius Caesar was assassinated in 44 BC.", true),
      ("Africa has the most countries of any continent.", true),
      ("The Sahara Desert is growing.", true),
      ("The first human civilization arose in Egypt.", false),
      ("China has the longest continuous civilization.", true),
      ("The Great Depression began in 1929.", true),
      ("The Pacific Ocean borders Asia and the Americas.", true),
      ("The capital of Brazil was always Brasilia.", false),
      ("The Thirty Years War was fought in Europe.", true),
      ("Greenland is a territory of Denmark.", true),
      ("Marco Polo traveled to China in the 13th century.", true),
    ]);

    // Movies & Pop Culture (50 questions)
    addPreloadedQuiz("Movies & Pop Culture", "Test your knowledge of films, music and pop culture!", [
      ("The Beatles were from Liverpool, England.", true),
      ("Star Wars was directed by George Lucas.", true),
      ("Michael Jackson was known as the King of Pop.", true),
      ("The Godfather won the Academy Award for Best Picture.", true),
      ("Harry Potter is a character created by J.K. Rowling.", true),
      ("Elvis Presley was born in Mississippi.", true),
      ("Titanic starred Leonardo DiCaprio.", true),
      ("The Simpsons first aired in the 1990s.", false),
      ("James Bond was created by Ian Fleming.", true),
      ("Avengers: Endgame is the highest-grossing film of all time.", true),
      ("Madonna is known as the Queen of Pop.", true),
      ("The first Star Wars movie came out in 1977.", true),
      ("Leonardo DiCaprio won an Oscar for The Revenant.", true),
      ("Marilyn Monroe's real name was Norma Jeane.", true),
      ("The Joker is a Marvel Comics villain.", false),
      ("Oprah Winfrey has her own talk show.", true),
      ("Breaking Bad is about a chemistry teacher.", true),
      ("Stephen King wrote Harry Potter.", false),
      ("Michael Jordan played for the Chicago Bulls.", true),
      ("The Oscars are officially called the Academy Awards.", true),
      ("Freddie Mercury was the lead singer of Queen.", true),
      ("Taylor Swift started her career as a country artist.", true),
      ("The Lion King is set in Africa.", true),
      ("Christopher Nolan directed The Dark Knight.", true),
      ("Netflix started as a DVD rental service.", true),
      ("Coco is a Disney Pixar film about music.", true),
      ("Bruce Lee was a martial artist and actor.", true),
      ("Audrey Hepburn won an Oscar for Roman Holiday.", true),
      ("The Lord of the Rings trilogy was filmed in Australia.", false),
      ("Beyonce is part of the group Destiny's Child.", true),
      ("The first iPhone was released in 2007.", true),
      ("Sherlock Holmes was created by Arthur Conan Doyle.", true),
      ("Spider-Man is a DC Comics character.", false),
      ("The Hunger Games is set in a dystopian future.", true),
      ("James Cameron directed Titanic and Avatar.", true),
      ("Elvis Presley never performed outside North America.", true),
      ("The Grammys honor achievements in music.", true),
      ("Toy Story was the first fully computer-animated feature film.", true),
      ("Muhammad Ali was born Cassius Clay.", true),
      ("Game of Thrones is based on a book series.", true),
      ("The Simpsons is the longest-running American sitcom.", true),
      ("Lady Gaga's real name is Stefani Germanotta.", true),
      ("Jackie Chan does his own stunts.", true),
      ("The Marvel Cinematic Universe began with Iron Man.", true),
      ("Nirvana was a band from Seattle.", true),
      ("Friends ended in 2004.", true),
      ("Drake is a Canadian rapper.", true),
      ("The Wizard of Oz was filmed in black and white and color.", true),
      ("Walt Disney voiced Mickey Mouse originally.", true),
      ("Adele's first studio album was called 19.", true),
    ]);
  };

  // Initialize preloaded quizzes on first use
  initPreloadedQuizzes();

  ///////////////////////////////////////////////////////////////////////////
  // Owner Functions
  ///////////////////////////////////////////////////////////////////////////

  public query func getOwner() : async Principal {
    OWNER_PRINCIPAL
  };

  public query ({ caller }) func isCallerOwner() : async Bool {
    isOwner(caller)
  };

  ///////////////////////////////////////////////////////////////////////////
  // Rank Assignment (Owner only)
  ///////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func assignPlayerRank(player : Principal, rank : AssignedRank) : async () {
    if (not isOwner(caller)) { Runtime.trap("Unauthorized: Only the owner can assign ranks") };
    if (rank == "") {
      assignedRanks.remove(player)
    } else {
      assignedRanks.add(player, rank)
    }
  };

  public query func getPlayerAssignedRank(player : Principal) : async ?AssignedRank {
    assignedRanks.get(player)
  };

  public query func getAllAssignedRanks() : async [PlayerRankEntry] {
    assignedRanks.toArray().map(func((player, rank) : (Principal, AssignedRank)) : PlayerRankEntry {
      { player; rank }
    })
  };

  ///////////////////////////////////////////////////////////////////////////
  // User Role / Auth Functions (for compatibility with frontend IDL)
  ///////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func assignCallerUserRole() : async () {
    requireAuth(caller);
    registeredUsers.add(caller, true)
  };

  public query ({ caller }) func getCallerUserRole() : async Text {
    if (isOwner(caller)) { return "owner" };
    if (registeredUsers.containsKey(caller)) { return "user" };
    "anonymous"
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    if (isOwner(caller)) { return true };
    switch (getTopPlayerSync()) {
      case null { false };
      case (?top) { Principal.equal(caller, top) };
    }
  };

  ///////////////////////////////////////////////////////////////////////////
  // User Profile Functions
  ///////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func createUserProfile(username : Text) : async () {
    requireAuth(caller);
    if (userProfiles.containsKey(caller)) { Runtime.trap("User already exists") };
    registeredUsers.add(caller, true);
    userProfiles.add(caller, { username; isVip = false })
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    requireAuth(caller);
    userProfiles.get(caller)
  };

  public query func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user)
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    requireAuth(caller);
    userProfiles.add(caller, profile)
  };

  public shared ({ caller }) func updateUserProfile(username : Text) : async () {
    requireAuth(caller);
    let existing = switch (userProfiles.get(caller)) {
      case null { { username; isVip = false } };
      case (?p) { { p with username } };
    };
    userProfiles.add(caller, existing)
  };

  public query ({ caller }) func searchUsers(searchQuery : Text) : async [(Principal, UserProfile)] {
    requireAuth(caller);
    userProfiles.toArray().filter(
      func((p, u) : (Principal, UserProfile)) : Bool {
        not Principal.equal(p, caller) and u.username.contains(#text searchQuery)
      }
    )
  };

  ///////////////////////////////////////////////////////////////////////////
  // VIP Purchase
  ///////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func purchaseVip() : async () {
    requireAuthAndNotBanned(caller);
    if (isOwner(caller)) { Runtime.trap("Owner already has all privileges") };
    let pts = getPoints(caller);
    let VIP_COST : Nat = 1_000_000;
    if (pts < VIP_COST) { Runtime.trap("Insufficient points: VIP costs 1,000,000 points") };
    userPoints.add(caller, pts - VIP_COST);
    let profile = switch (userProfiles.get(caller)) {
      case null { { username = "Unknown"; isVip = true } };
      case (?p) { { p with isVip = true } };
    };
    userProfiles.add(caller, profile)
  };

  ///////////////////////////////////////////////////////////////////////////
  // Points System
  ///////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func awardPoints(amount : Nat) : async () {
    requireAuthAndNotBanned(caller);
    if (isOwner(caller)) { return };
    let current = getPoints(caller);
    userPoints.add(caller, current + amount)
  };

  public shared ({ caller }) func giftPoints(recipient : Principal, amount : Nat) : async () {
    requireAuthAndNotBanned(caller);
    if (Principal.equal(caller, recipient)) { Runtime.trap("Cannot gift points to yourself") };
    if (amount == 0) { Runtime.trap("Amount must be greater than zero") };
    if (not isOwner(caller)) {
      let callerPts = getPoints(caller);
      if (callerPts < amount) { Runtime.trap("Insufficient points") };
      userPoints.add(caller, callerPts - amount);
    };
    let recipientPts = getPoints(recipient);
    if (not isOwner(recipient)) {
      userPoints.add(recipient, recipientPts + amount)
    }
  };

  public query ({ caller }) func getMyPoints() : async Nat {
    getPoints(caller)
  };

  public query func getTopPlayer() : async ?Principal {
    getTopPlayerSync()
  };

  public query func getAllPlayerPoints() : async [PointsEntry] {
    let entries = userPoints.toArray().map(
      func((player, points) : (Principal, Nat)) : PointsEntry { { player; points } }
    );
    entries.sort()
  };

  ///////////////////////////////////////////////////////////////////////////
  // Points Purchase
  ///////////////////////////////////////////////////////////////////////////

  public query func getPointPackages() : async [PointPackage] {
    POINT_PACKAGES
  };

  public query func getMonthlyLimit() : async Nat {
    MONTHLY_LIMIT_PAISE
  };

  public query ({ caller }) func getMyMonthlySpend() : async Nat {
    let currentMonth = monthIndex(Time.now());
    var total : Nat = 0;
    for (p in purchases.values()) {
      if (Principal.equal(p.buyer, caller) and monthIndex(p.timestamp) == currentMonth) {
        total += p.priceInPaise
      }
    };
    total
  };

  public shared ({ caller }) func fulfillPointsPurchase(packageId : Nat, sessionId : Text) : async Nat {
    requireAuthAndNotBanned(caller);
    if (packageId >= POINT_PACKAGES.size()) { Runtime.trap("Invalid package ID") };
    let pkg = POINT_PACKAGES[packageId];
    let currentMonth = monthIndex(Time.now());
    var monthlySpent : Nat = 0;
    for (p in purchases.values()) {
      if (Principal.equal(p.buyer, caller) and monthIndex(p.timestamp) == currentMonth) {
        monthlySpent += p.priceInPaise
      }
    };
    if (monthlySpent + pkg.priceInPaise > MONTHLY_LIMIT_PAISE) {
      Runtime.trap("Monthly spending limit of Rs 10,000 exceeded")
    };
    for (p in purchases.values()) {
      if (p.sessionId == sessionId) { Runtime.trap("Purchase already fulfilled") }
    };
    let purchaseId = nextPurchaseId;
    nextPurchaseId += 1;
    purchases.add(purchaseId, {
      id = purchaseId;
      buyer = caller;
      packageId;
      pointsAwarded = pkg.points;
      priceInPaise = pkg.priceInPaise;
      timestamp = Time.now();
      sessionId;
    });
    if (not isOwner(caller)) {
      let current = getPoints(caller);
      userPoints.add(caller, current + pkg.points)
    };
    pkg.points
  };

  ///////////////////////////////////////////////////////////////////////////
  // Quiz Functions
  ///////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func createQuiz(title : Text, description : Text) : async Nat {
    requireAuthAndNotBanned(caller);
    let quizId = nextQuizId;
    nextQuizId += 1;
    quizzes.add(quizId, { id = quizId; title; description; creator = caller; timestamp = Time.now() });
    quizId
  };

  public shared ({ caller }) func deleteQuiz(quizId : Nat) : async () {
    requireAuth(caller);
    let quiz = switch (quizzes.get(quizId)) {
      case null { Runtime.trap("Quiz does not exist") };
      case (?q) { q };
    };
    if (not isOwner(caller) and not Principal.equal(quiz.creator, caller)) {
      Runtime.trap("Unauthorized: Only the owner or quiz creator can delete this quiz")
    };
    quizzes.remove(quizId);
    let remaining = questions.toArray().filter(func((_, q) : (Nat, Question)) : Bool { q.quizId != quizId });
    questions.clear();
    for ((k, v) in remaining.values()) { questions.add(k, v) };
    resultsByQuiz.remove(quizId);
    let remainingResults = quizResults.toArray().filter(func((_, r) : (Nat, Result)) : Bool { r.quizId != quizId });
    quizResults.clear();
    for ((k, v) in remainingResults.values()) { quizResults.add(k, v) };
    switch (postsByQuiz.get(quizId)) {
      case null {};
      case (?quizPosts) {
        for (post in quizPosts.values()) {
          posts.remove(post.id);
          likes.remove(post.id);
          comments.remove(post.id);
        }
      };
    };
    postsByQuiz.remove(quizId)
  };

  public shared ({ caller }) func addQuestion(quizId : Nat, question : Question) : async Nat {
    requireAuth(caller);
    let quiz = switch (quizzes.get(quizId)) {
      case null { Runtime.trap("Quiz does not exist") };
      case (?q) { q };
    };
    if (not Principal.equal(quiz.creator, caller) and not isOwner(caller)) {
      Runtime.trap("Unauthorized: Only the quiz creator or owner can add questions")
    };
    let questionId = nextQuestionId;
    nextQuestionId += 1;
    questions.add(questionId, { question with id = questionId; quizId });
    questionId
  };

  public shared ({ caller }) func submitQuizAnswers(quizId : Nat, answers : [Answer]) : async Nat {
    requireAuthAndNotBanned(caller);
    if (not quizzes.containsKey(quizId)) { Runtime.trap("Quiz does not exist") };
    var correctCount : Nat = 0;
    for (answer in answers.values()) {
      switch (questions.get(answer.questionId)) {
        case null { Runtime.trap("Question does not exist") };
        case (?question) {
          switch (question.questionType) {
            case (#multipleChoice { correctOption }) {
              switch (answer.answer) {
                case (#multipleChoice val) { if (correctOption == val) { correctCount += 1 } };
                case _ {};
              }
            };
            case (#trueFalse { correctAnswer }) {
              switch (answer.answer) {
                case (#trueFalse val) { if (correctAnswer == val) { correctCount += 1 } };
                case _ {};
              }
            };
          }
        };
      }
    };
    let username = switch (userProfiles.get(caller)) {
      case null { "Anonymous" };
      case (?u) { u.username };
    };
    let resultId = nextResultId;
    nextResultId += 1;
    let result : Result = {
      quizId; player = caller; username;
      score = correctCount; totalQuestions = answers.size();
      timestamp = Time.now()
    };
    quizResults.add(resultId, result);
    let existing = switch (resultsByQuiz.get(quizId)) {
      case null { [] };
      case (?r) { r };
    };
    resultsByQuiz.add(quizId, existing.concat([result]));
    // Award 1 point per correct answer
    if (not isOwner(caller)) {
      let current = getPoints(caller);
      userPoints.add(caller, current + correctCount)
    };
    correctCount
  };

  public query func getAllQuizzes() : async [Quiz] {
    quizzes.values().toArray().sort()
  };

  public query func getQuiz(quizId : Nat) : async Quiz {
    switch (quizzes.get(quizId)) {
      case null { Runtime.trap("Quiz does not exist") };
      case (?q) { q };
    }
  };

  public query func getQuizQuestions(quizId : Nat) : async [Question] {
    questions.values().toArray().filter(func(q : Question) : Bool { q.quizId == quizId }).sort(
      
    )
  };

  public query func getQuizLeaderboard(quizId : Nat) : async ?[Result] {
    switch (resultsByQuiz.get(quizId)) {
      case null { null };
      case (?results) {
        let sorted = results.sort();
        ?Array.tabulate(Nat.min(10, sorted.size()), func(i : Nat) : Result { sorted[i] })
      };
    }
  };

  public query func getQuizStats() : async [QuizStats] {
    quizzes.values().toArray().map(
      func(quiz : Quiz) : QuizStats {
        let results = switch (resultsByQuiz.get(quiz.id)) {
          case null { [] };
          case (?r) { r };
        };
        let totalAttemptCount = results.size();
        let totalCorrectCount = results.foldLeft(0, func(acc : Nat, r : Result) : Nat { acc + r.score });
        { quizId = quiz.id; title = quiz.title; totalAttemptCount; totalCorrectCount }
      }
    ).sort(QuizStats.compareByAverageScore)
  };

  public query ({ caller }) func getUserQuizResults() : async [Result] {
    quizResults.values().toArray().filter(func(r : Result) : Bool {
      Principal.equal(r.player, caller)
    })
  };

  public query ({ caller }) func getAdminQuizAnswers() : async [QuizWithAnswers] {
    if (not isOwner(caller)) {
      switch (getTopPlayerSync()) {
        case null { Runtime.trap("Unauthorized: No top player exists yet") };
        case (?top) {
          if (not Principal.equal(caller, top)) {
            Runtime.trap("Unauthorized: Only the owner or top player can access this")
          }
        };
      }
    };
    quizzes.values().toArray().map(
      func(quiz : Quiz) : QuizWithAnswers {
        let qs = questions.values().toArray().filter(func(q : Question) : Bool { q.quizId == quiz.id }).sort(
          
        );
        { quiz; questions = qs }
      }
    )
  };

  ///////////////////////////////////////////////////////////////////////////
  // Social Feed
  ///////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func createPost(quizId : Nat, message : Text) : async Nat {
    requireAuthAndNotBanned(caller);
    if (not quizzes.containsKey(quizId)) { Runtime.trap("Referenced quiz does not exist") };
    let postId = nextPostId;
    nextPostId += 1;
    let post : Post = { id = postId; author = caller; quizId; message; timestamp = Time.now() };
    posts.add(postId, post);
    let existing = switch (postsByQuiz.get(quizId)) { case null { [] }; case (?p) { p } };
    postsByQuiz.add(quizId, existing.concat([post]));
    postId
  };

  public shared ({ caller }) func likePost(postId : Nat) : async () {
    requireAuthAndNotBanned(caller);
    if (not posts.containsKey(postId)) { Runtime.trap("Post does not exist") };
    let existing = switch (likes.get(postId)) { case null { [] }; case (?l) { l } };
    if (existing.any(func(l : Like) : Bool { Principal.equal(l.user, caller) })) {
      Runtime.trap("User already liked this post")
    };
    likes.add(postId, existing.concat([{ postId; user = caller; timestamp = Time.now() }]))
  };

  public shared ({ caller }) func unlikePost(postId : Nat) : async () {
    requireAuthAndNotBanned(caller);
    if (not posts.containsKey(postId)) { Runtime.trap("Post does not exist") };
    let existing = switch (likes.get(postId)) { case null { [] }; case (?l) { l } };
    likes.add(postId, existing.filter(func(l : Like) : Bool { not Principal.equal(l.user, caller) }))
  };

  public shared ({ caller }) func addComment(postId : Nat, content : Text) : async Nat {
    requireAuthAndNotBanned(caller);
    if (not posts.containsKey(postId)) { Runtime.trap("Post does not exist") };
    let commentId = nextCommentId;
    nextCommentId += 1;
    let comment : Comment = { id = commentId; postId; author = caller; content; timestamp = Time.now() };
    let existing = switch (comments.get(postId)) { case null { [] }; case (?c) { c } };
    comments.add(postId, existing.concat([comment]));
    commentId
  };

  public query func getAllPostsWithStats() : async [PostWithStats] {
    let raw = posts.values().toArray().map(
      func(post : Post) : PostWithStats {
        let likeCount = switch (likes.get(post.id)) { case null { 0 }; case (?l) { l.size() } };
        let commentCount = switch (comments.get(post.id)) { case null { 0 }; case (?c) { c.size() } };
        { post; likeCount; commentCount }
      }
    );
    raw.sort()
  };

  public query func getPostsByQuizId(quizId : Nat) : async [PostWithStats] {
    switch (postsByQuiz.get(quizId)) {
      case null { [] };
      case (?quizPosts) {
        quizPosts.map(func(post : Post) : PostWithStats {
          let likeCount = switch (likes.get(post.id)) { case null { 0 }; case (?l) { l.size() } };
          let commentCount = switch (comments.get(post.id)) { case null { 0 }; case (?c) { c.size() } };
          { post; likeCount; commentCount }
        })
      };
    }
  };

  public query func getCommentsByPostId(postId : Nat) : async [Comment] {
    switch (comments.get(postId)) { case null { [] }; case (?c) { c } }
  };

  public query func getPostWithComments(postId : Nat) : async ?PostWithComment {
    switch (posts.get(postId)) {
      case null { null };
      case (?post) {
        let postComments = switch (comments.get(postId)) { case null { [] }; case (?c) { c } };
        ?{ post; comments = postComments }
      };
    }
  };

  public query func getUserPosts(user : Principal) : async [PostWithStats] {
    let raw = posts.values().toArray().filter(func(post : Post) : Bool { Principal.equal(post.author, user) }).map(
      func(post : Post) : PostWithStats {
        let likeCount = switch (likes.get(post.id)) { case null { 0 }; case (?l) { l.size() } };
        let commentCount = switch (comments.get(post.id)) { case null { 0 }; case (?c) { c.size() } };
        { post; likeCount; commentCount }
      }
    );
    raw.sort()
  };

  ///////////////////////////////////////////////////////////////////////////
  // Chat
  ///////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func sendMessage(content : Text) : async Nat {
    requireAuthAndNotBanned(caller);
    if (content.size() == 0) { Runtime.trap("Message cannot be empty") };
    let msgId = nextChatMessageId;
    nextChatMessageId += 1;
    chatMessages.add(msgId, { id = msgId; author = caller; content; timestamp = Time.now() });
    msgId
  };

  public query func getMessages() : async [ChatMessage] {
    chatMessages.values().toArray().sort(
      func(a : ChatMessage, b : ChatMessage) : Order.Order { Int.compare(a.timestamp, b.timestamp) }
    )
  };

  ///////////////////////////////////////////////////////////////////////////
  // Private Messaging
  ///////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func sendPrivateMessage(recipient : Principal, content : Text) : async Nat {
    requireAuthAndNotBanned(caller);
    if (content.size() == 0) { Runtime.trap("Message cannot be empty") };
    if (Principal.equal(recipient, caller)) { Runtime.trap("Cannot send message to self") };
    let msgId = nextMessageId;
    nextMessageId += 1;
    privateMessages.add(msgId, { id = msgId; sender = caller; recipient; content; timestamp = Time.now(); isRead = false });
    msgId
  };

  public query ({ caller }) func getConversation(otherUser : Principal) : async [PrivateMessage] {
    requireAuth(caller);
    privateMessages.values().toArray().filter(
      func(m : PrivateMessage) : Bool {
        (Principal.equal(m.sender, caller) and Principal.equal(m.recipient, otherUser)) or
        (Principal.equal(m.recipient, caller) and Principal.equal(m.sender, otherUser))
      }
    )
  };

  public query ({ caller }) func getMyConversations() : async [ConversationSummary] {
    requireAuth(caller);
    let myMessages = privateMessages.values().toArray().filter(
      func(m : PrivateMessage) : Bool {
        Principal.equal(m.sender, caller) or Principal.equal(m.recipient, caller)
      }
    );
    let summaryMap = Map.empty<Principal, ConversationSummary>();
    for (msg in myMessages.values()) {
      let otherUser = if (Principal.equal(msg.sender, caller)) { msg.recipient } else { msg.sender };
      let unread : Nat = if (Principal.equal(msg.recipient, caller) and not msg.isRead) { 1 } else { 0 };
      switch (summaryMap.get(otherUser)) {
        case null {
          summaryMap.add(otherUser, {
            otherUser; lastMessage = msg.content;
            lastTimestamp = msg.timestamp; unreadCount = unread
          })
        };
        case (?existing) {
          if (msg.timestamp > existing.lastTimestamp) {
            summaryMap.add(otherUser, {
              otherUser; lastMessage = msg.content;
              lastTimestamp = msg.timestamp;
              unreadCount = existing.unreadCount + unread
            })
          } else {
            summaryMap.add(otherUser, { existing with unreadCount = existing.unreadCount + unread })
          }
        };
      }
    };
    summaryMap.values().toArray()
  };

  public query ({ caller }) func getUnreadMessageCount() : async Nat {
    requireAuth(caller);
    privateMessages.values().toArray().filter(
      func(m : PrivateMessage) : Bool { Principal.equal(m.recipient, caller) and not m.isRead }
    ).size()
  };

  public shared ({ caller }) func markConversationRead(otherUser : Principal) : async () {
    requireAuth(caller);
    for (msg in privateMessages.values()) {
      if (Principal.equal(msg.sender, otherUser) and Principal.equal(msg.recipient, caller) and not msg.isRead) {
        privateMessages.add(msg.id, { msg with isRead = true })
      }
    }
  };

  ///////////////////////////////////////////////////////////////////////////
  // Mini Games
  ///////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func recordMemoryGamePlay() : async () {
    requireAuthAndNotBanned(caller);
    let now = Time.now();
    let lastEntry = getCooldownEntry(caller, "memoryGame");
    switch (lastEntry) {
      case (?e) {
        if (now - e.lastPlayed < ONE_DAY_NS) {
          Runtime.trap("Memory Game is on cooldown")
        }
      };
      case null {};
    };
    setCooldownEntry(caller, "memoryGame", now)
  };

  public query ({ caller }) func getMemoryGameCooldown() : async ?Time.Time {
    switch (getCooldownEntry(caller, "memoryGame")) {
      case null { null };
      case (?e) { ?e.lastPlayed };
    }
  };

  public shared ({ caller }) func recordSpinWheelPlay() : async () {
    requireAuthAndNotBanned(caller);
    let now = Time.now();
    let lastEntry = getCooldownEntry(caller, "spinWheel");
    switch (lastEntry) {
      case (?e) {
        if (now - e.lastPlayed < THREE_DAYS_NS) {
          Runtime.trap("Spin Wheel is on cooldown")
        }
      };
      case null {};
    };
    setCooldownEntry(caller, "spinWheel", now)
  };

  public query ({ caller }) func getSpinWheelCooldown() : async ?Time.Time {
    switch (getCooldownEntry(caller, "spinWheel")) {
      case null { null };
      case (?e) { ?e.lastPlayed };
    }
  };

  ///////////////////////////////////////////////////////////////////////////
  // Daily Bonus Items
  ///////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func claimDailyChest() : async Nat {
    requireAuthAndNotBanned(caller);
    let now = Time.now();
    switch (getCooldownEntry(caller, DAILY_CHEST_KEY)) {
      case (?e) {
        if (now - e.lastPlayed < TWO_HUNDRED_HOURS_NS) {
          Runtime.trap("Daily Chest is on cooldown")
        }
      };
      case null {};
    };
    setCooldownEntry(caller, DAILY_CHEST_KEY, now);
    let reward = 10 + Int.abs(now) % 191; // 10-200 points
    if (not isOwner(caller)) {
      let current = getPoints(caller);
      userPoints.add(caller, current + reward)
    };
    reward
  };

  public shared ({ caller }) func claimMysteryBonus() : async Nat {
    requireAuthAndNotBanned(caller);
    let now = Time.now();
    switch (getCooldownEntry(caller, MYSTERY_BONUS_KEY)) {
      case (?e) {
        if (now - e.lastPlayed < TWO_HUNDRED_HOURS_NS) {
          Runtime.trap("Mystery Bonus is on cooldown")
        }
      };
      case null {};
    };
    setCooldownEntry(caller, MYSTERY_BONUS_KEY, now);
    let reward = 10 + (Int.abs(now) / 7) % 191;
    if (not isOwner(caller)) {
      let current = getPoints(caller);
      userPoints.add(caller, current + reward)
    };
    reward
  };

  public shared ({ caller }) func claimLuckyStar() : async Nat {
    requireAuthAndNotBanned(caller);
    let now = Time.now();
    switch (getCooldownEntry(caller, LUCKY_STAR_KEY)) {
      case (?e) {
        if (now - e.lastPlayed < TWO_HUNDRED_HOURS_NS) {
          Runtime.trap("Lucky Star is on cooldown")
        }
      };
      case null {};
    };
    setCooldownEntry(caller, LUCKY_STAR_KEY, now);
    let reward = 10 + (Int.abs(now) / 13) % 191;
    if (not isOwner(caller)) {
      let current = getPoints(caller);
      userPoints.add(caller, current + reward)
    };
    reward
  };

  public query ({ caller }) func getDailyChestCooldown() : async ?Time.Time {
    switch (getCooldownEntry(caller, DAILY_CHEST_KEY)) {
      case null { null };
      case (?e) { ?e.lastPlayed };
    }
  };

  public query ({ caller }) func getMysteryBonusCooldown() : async ?Time.Time {
    switch (getCooldownEntry(caller, MYSTERY_BONUS_KEY)) {
      case null { null };
      case (?e) { ?e.lastPlayed };
    }
  };

  public query ({ caller }) func getLuckyStarCooldown() : async ?Time.Time {
    switch (getCooldownEntry(caller, LUCKY_STAR_KEY)) {
      case null { null };
      case (?e) { ?e.lastPlayed };
    }
  };

  ///////////////////////////////////////////////////////////////////////////
  // Custom Games
  ///////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func createCustomTrivia(title : Text, qs : [CustomTriviaQuestion]) : async Nat {
    requireAuthAndNotBanned(caller);
    if (not isTopPlayerOrOwner(caller)) {
      Runtime.trap("Unauthorized: Only the owner or top player can create custom games")
    };
    let gameId = nextCustomGameId;
    nextCustomGameId += 1;
    customGames.add(gameId, { id = gameId; title; creator = caller; gameType = #customTrivia({ questions = qs }) });
    gameId
  };

  public shared ({ caller }) func createCustomSpinWheel(title : Text, segments : [SpinWheelSegment]) : async Nat {
    requireAuthAndNotBanned(caller);
    if (not isTopPlayerOrOwner(caller)) {
      Runtime.trap("Unauthorized: Only the owner or top player can create custom games")
    };
    let gameId = nextCustomGameId;
    nextCustomGameId += 1;
    customGames.add(gameId, { id = gameId; title; creator = caller; gameType = #customSpinWheel({ segments }) });
    gameId
  };

  public query func getAllCustomGames() : async [CustomGame] {
    customGames.values().toArray()
  };

  public shared ({ caller }) func playCustomTrivia(gameId : Nat, answers : [{ questionId : Nat; answerIndex : Nat }]) : async Nat {
    requireAuthAndNotBanned(caller);
    let now = Time.now();
    let cooldownKey = "customGame_" # gameId.toText();
    switch (getCooldownEntry(caller, cooldownKey)) {
      case (?e) {
        if (now - e.lastPlayed < ONE_DAY_NS) { Runtime.trap("Custom game is on cooldown") }
      };
      case null {};
    };
    let game = switch (customGames.get(gameId)) {
      case null { Runtime.trap("Custom game does not exist") };
      case (?g) { g };
    };
    let qs = switch (game.gameType) {
      case (#customTrivia { questions }) { questions };
      case _ { Runtime.trap("Invalid game type") };
    };
    var score : Nat = 0;
    for (answer in answers.values()) {
      if (answer.questionId < qs.size()) {
        let question = qs[answer.questionId];
        if (question.correctOption == answer.answerIndex) { score += question.pointsReward }
      }
    };
    setCooldownEntry(caller, cooldownKey, now);
    if (not isOwner(caller)) {
      let current = getPoints(caller);
      userPoints.add(caller, current + score)
    };
    score
  };

  public shared ({ caller }) func playCustomSpinWheel(gameId : Nat) : async Nat {
    requireAuthAndNotBanned(caller);
    let now = Time.now();
    let cooldownKey = "customGame_" # gameId.toText();
    switch (getCooldownEntry(caller, cooldownKey)) {
      case (?e) {
        if (now - e.lastPlayed < ONE_DAY_NS) { Runtime.trap("Custom game is on cooldown") }
      };
      case null {};
    };
    let game = switch (customGames.get(gameId)) {
      case null { Runtime.trap("Custom game does not exist") };
      case (?g) { g };
    };
    let segments = switch (game.gameType) {
      case (#customSpinWheel { segments }) { segments };
      case _ { Runtime.trap("Invalid game type") };
    };
    if (segments.size() == 0) { return 0 };
    let randomIndex = Int.abs(now) % segments.size();
    let pointsWon = segments[randomIndex].points;
    setCooldownEntry(caller, cooldownKey, now);
    if (not isOwner(caller)) {
      let current = getPoints(caller);
      userPoints.add(caller, current + pointsWon)
    };
    pointsWon
  };

  ///////////////////////////////////////////////////////////////////////////
  // Visitor Tracking
  ///////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func trackVisit() : async () {
    visitors.add(caller, { principalId = caller; timestamp = Time.now() })
  };

  public query func getTotalVisitors() : async Nat {
    visitors.size()
  };

  ///////////////////////////////////////////////////////////////////////////
  // Ban Management
  ///////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func banPlayer(player : Principal) : async () {
    if (not isOwner(caller)) { Runtime.trap("Unauthorized: Only the owner can ban players") };
    if (isOwner(player)) { Runtime.trap("Cannot ban the owner") };
    bannedPlayers.add(player, true)
  };

  public shared ({ caller }) func unbanPlayer(player : Principal) : async () {
    if (not isOwner(caller)) { Runtime.trap("Unauthorized: Only the owner can unban players") };
    bannedPlayers.remove(player)
  };

  public query func getBannedPlayers() : async [Principal] {
    bannedPlayers.keys().toArray()
  };

  public query ({ caller }) func isCallerBanned() : async Bool {
    bannedPlayers.containsKey(caller)
  };

  public query func isPlayerBanned(player : Principal) : async Bool {
    bannedPlayers.containsKey(player)
  };

  ///////////////////////////////////////////////////////////////////////////
  // Point Deduction
  ///////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func deductPoints(player : Principal, amount : Nat) : async Nat {
    if (not isOwner(caller)) { Runtime.trap("Unauthorized: Only the owner can deduct points") };
    let current = switch (userPoints.get(player)) {
      case null { 0 };
      case (?p) { p };
    };
    let newPoints : Nat = if (current >= amount) { current - amount } else { 0 };
    userPoints.add(player, newPoints);
    newPoints
  };

  ///////////////////////////////////////////////////////////////////////////
  // Troll Button
  ///////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func trollPlayer(target : Principal) : async Nat {
    requireAuthAndNotBanned(caller);
    if (isOwner(target)) { Runtime.trap("Cannot troll the owner") };
    if (Principal.equal(caller, target)) { Runtime.trap("Cannot troll yourself") };
    let now = Time.now();
    let trollKey = caller.toText() # ":" # target.toText();
    switch (trollCooldowns.get(trollKey)) {
      case (?lastTime) {
        if (now - lastTime < ONE_HOUR_NS) {
          Runtime.trap("Troll button is on cooldown")
        }
      };
      case null {};
    };
    trollCooldowns.add(trollKey, now);
    let targetPts = switch (userPoints.get(target)) {
      case null { 0 };
      case (?p) { p };
    };
    // Steal 1-10 points (random using time)
    let stealAmount = Nat.min(targetPts, 1 + Int.abs(now) % 10);
    if (stealAmount > 0) {
      userPoints.add(target, targetPts - stealAmount);
      if (not isOwner(caller)) {
        let callerPts = getPoints(caller);
        userPoints.add(caller, callerPts + stealAmount)
      }
    };
    stealAmount
  };

  public query ({ caller }) func getTrollCooldown(target : Principal) : async ?Time.Time {
    let trollKey = caller.toText() # ":" # target.toText();
    trollCooldowns.get(trollKey)
  };

};
