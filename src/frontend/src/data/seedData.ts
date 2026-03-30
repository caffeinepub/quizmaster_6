export interface SeedQuestion {
  text: string;
  correctAnswer: boolean;
}

export interface SeedQuiz {
  title: string;
  description: string;
  questions: SeedQuestion[];
}

export const seedQuizzes: SeedQuiz[] = [
  {
    title: "General Knowledge",
    description:
      "A broad mix of trivia spanning history, science, culture, and everyday facts. Test how much you really know!",
    questions: [
      {
        text: "The Great Wall of China is visible from space with the naked eye.",
        correctAnswer: false,
      },
      {
        text: "A group of flamingos is called a flamboyance.",
        correctAnswer: true,
      },
      {
        text: "Water boils at 100°C (212°F) at sea level.",
        correctAnswer: true,
      },
      {
        text: "The Eiffel Tower was originally intended to be a permanent structure.",
        correctAnswer: false,
      },
      {
        text: "Bananas are technically berries in botanical classification.",
        correctAnswer: true,
      },
      { text: "The human body has 206 bones.", correctAnswer: true },
      {
        text: "Napoleon Bonaparte was unusually short for his era.",
        correctAnswer: false,
      },
      {
        text: "Lightning never strikes the same place twice.",
        correctAnswer: false,
      },
      {
        text: "The Amazon River flows into the Atlantic Ocean.",
        correctAnswer: true,
      },
      {
        text: "A day on Venus is longer than a year on Venus.",
        correctAnswer: true,
      },
      {
        text: "Goldfish have a memory span of only three seconds.",
        correctAnswer: false,
      },
      { text: "The capital of Australia is Sydney.", correctAnswer: false },
      {
        text: "Honey never spoils — archaeologists have found 3000-year-old honey still edible.",
        correctAnswer: true,
      },
      {
        text: "The human eye can distinguish about 10 million different colors.",
        correctAnswer: true,
      },
      {
        text: "Mount Everest is the tallest mountain on Earth measured from sea level.",
        correctAnswer: true,
      },
      { text: "All deserts are hot and sandy.", correctAnswer: false },
      {
        text: "The original Olympic Games were held in Athens, Greece.",
        correctAnswer: false,
      },
      { text: "A snail can sleep for up to three years.", correctAnswer: true },
      {
        text: "The Pacific Ocean is larger than all of Earth's landmasses combined.",
        correctAnswer: true,
      },
      { text: "Diamonds are made of carbon.", correctAnswer: true },
      {
        text: "The shortest war in history lasted 38 minutes.",
        correctAnswer: true,
      },
      {
        text: "Humans share 50% of their DNA with bananas.",
        correctAnswer: true,
      },
      {
        text: "The speed of light in a vacuum is approximately 300,000 km/s.",
        correctAnswer: true,
      },
      { text: "Chess was invented in China.", correctAnswer: false },
      {
        text: "The Sahara Desert is the world's largest desert.",
        correctAnswer: false,
      },
      {
        text: "There are more stars in the universe than grains of sand on Earth's beaches.",
        correctAnswer: true,
      },
      {
        text: "Turtles breathe air and must surface regularly.",
        correctAnswer: true,
      },
      { text: "The Mona Lisa has no eyebrows.", correctAnswer: true },
      {
        text: "A full moon occurs approximately every 29.5 days.",
        correctAnswer: true,
      },
      {
        text: "The tallest animal in the world is the elephant.",
        correctAnswer: false,
      },
      {
        text: "Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.",
        correctAnswer: true,
      },
      {
        text: "Rubber ducks were originally made of rubber.",
        correctAnswer: false,
      },
      { text: "The human brain is about 75% water.", correctAnswer: true },
      {
        text: "Switzerland has never been at war with any country.",
        correctAnswer: false,
      },
      {
        text: "The platypus is one of the few mammals that lays eggs.",
        correctAnswer: true,
      },
      {
        text: "Windex is safe to drink in small quantities.",
        correctAnswer: false,
      },
      {
        text: "Oxford University is older than the Aztec Empire.",
        correctAnswer: true,
      },
      { text: "The moon has its own atmosphere.", correctAnswer: false },
      {
        text: "A cockroach can survive for weeks without its head.",
        correctAnswer: true,
      },
      {
        text: "There are more possible iterations of a game of chess than atoms in the observable universe.",
        correctAnswer: true,
      },
      {
        text: "The first commercial flight took place in 1914.",
        correctAnswer: true,
      },
      {
        text: "Cats always land on their feet, no exceptions.",
        correctAnswer: false,
      },
      {
        text: "Crows can recognize and remember human faces.",
        correctAnswer: true,
      },
      {
        text: "Blood is blue inside the body before it hits oxygen.",
        correctAnswer: false,
      },
      { text: "The symbol for the element gold is Au.", correctAnswer: true },
      {
        text: "A jiffy is an actual unit of time (1/100th of a second).",
        correctAnswer: true,
      },
      {
        text: "Hot water freezes faster than cold water under certain conditions (Mpemba effect).",
        correctAnswer: true,
      },
      {
        text: "Elephants are the only animals that cannot jump.",
        correctAnswer: false,
      },
      {
        text: "The longest place name in the world is in New Zealand.",
        correctAnswer: true,
      },
      {
        text: "Human fingernails grow faster than toenails.",
        correctAnswer: true,
      },
    ],
  },
  {
    title: "Science & Nature",
    description:
      "Explore the wonders of biology, physics, chemistry, space, and the natural world. How science-savvy are you?",
    questions: [
      { text: "DNA stands for Deoxyribonucleic Acid.", correctAnswer: true },
      {
        text: "The speed of light is faster than the speed of sound.",
        correctAnswer: true,
      },
      {
        text: "The sun is a star classified as a red dwarf.",
        correctAnswer: false,
      },
      {
        text: "Black holes can emit radiation (Hawking radiation).",
        correctAnswer: true,
      },
      {
        text: "Atoms are the smallest possible unit of matter.",
        correctAnswer: false,
      },
      {
        text: "The periodic table was largely organized by Dmitri Mendeleev.",
        correctAnswer: true,
      },
      {
        text: "Humans have more bacteria cells than human cells in their body.",
        correctAnswer: true,
      },
      {
        text: "The boiling point of water decreases at higher altitudes.",
        correctAnswer: true,
      },
      { text: "Electrons have a positive charge.", correctAnswer: false },
      {
        text: "Photosynthesis converts light energy into chemical energy.",
        correctAnswer: true,
      },
      { text: "The chemical symbol for iron is Ir.", correctAnswer: false },
      {
        text: "Saturn is the least dense planet in our solar system — it could float in water.",
        correctAnswer: true,
      },
      {
        text: "Viruses are classified as living organisms.",
        correctAnswer: false,
      },
      {
        text: "Mitochondria is known as the powerhouse of the cell.",
        correctAnswer: true,
      },
      {
        text: "Sound travels faster in air than in water.",
        correctAnswer: false,
      },
      {
        text: "The human brain continues to develop until around age 25.",
        correctAnswer: true,
      },
      { text: "Jupiter has more than 90 known moons.", correctAnswer: true },
      { text: "All mammals are warm-blooded.", correctAnswer: true },
      {
        text: "Newton's first law states that objects in motion stay in motion unless acted upon by an external force.",
        correctAnswer: true,
      },
      {
        text: "Antibiotics are effective against viral infections.",
        correctAnswer: false,
      },
      {
        text: "The ozone layer is located in the stratosphere.",
        correctAnswer: true,
      },
      {
        text: "Plants release carbon dioxide during photosynthesis.",
        correctAnswer: false,
      },
      {
        text: "The human genome contains approximately 3 billion base pairs.",
        correctAnswer: true,
      },
      {
        text: "Mars has the largest volcano in the solar system (Olympus Mons).",
        correctAnswer: true,
      },
      {
        text: "The speed of sound is approximately 343 m/s in air at room temperature.",
        correctAnswer: true,
      },
      { text: "All insects have six legs.", correctAnswer: true },
      {
        text: "Humans can see ultraviolet light with the naked eye.",
        correctAnswer: false,
      },
      {
        text: "The nucleus of an atom contains protons and neutrons.",
        correctAnswer: true,
      },
      { text: "A light-year is a measure of time.", correctAnswer: false },
      {
        text: "The theory of evolution by natural selection was proposed by Charles Darwin.",
        correctAnswer: true,
      },
      { text: "The pH of pure water is 7 (neutral).", correctAnswer: true },
      { text: "Sharks are mammals.", correctAnswer: false },
      {
        text: "Einstein's E=mc² shows that mass and energy are interchangeable.",
        correctAnswer: true,
      },
      { text: "Bats are blind.", correctAnswer: false },
      {
        text: "The appendix has no known function in the human body.",
        correctAnswer: false,
      },
      { text: "An electron has less mass than a proton.", correctAnswer: true },
      {
        text: "Neptune was the first planet discovered using mathematics before observation.",
        correctAnswer: true,
      },
      {
        text: "Carbon dioxide makes up about 21% of Earth's atmosphere.",
        correctAnswer: false,
      },
      {
        text: "Trees are the longest-living organisms on Earth.",
        correctAnswer: false,
      },
      {
        text: "Identical twins always have the same fingerprints.",
        correctAnswer: false,
      },
      { text: "The human liver can regenerate itself.", correctAnswer: true },
      { text: "Absolute zero is −273.15°C.", correctAnswer: true },
      { text: "Whales are fish.", correctAnswer: false },
      {
        text: "The Milky Way galaxy is part of a group of galaxies called the Local Group.",
        correctAnswer: true,
      },
      { text: "All matter is made of atoms.", correctAnswer: true },
      { text: "Penguins live in the Arctic.", correctAnswer: false },
      {
        text: "Gold is the most electrically conductive metal.",
        correctAnswer: false,
      },
      { text: "Cows have four stomachs.", correctAnswer: true },
      {
        text: "The Big Bang occurred approximately 13.8 billion years ago.",
        correctAnswer: true,
      },
      {
        text: "Coral reefs are made of animal skeletons.",
        correctAnswer: true,
      },
    ],
  },
  {
    title: "History & Geography",
    description:
      "Journey through world history and global geography. From ancient civilizations to modern borders, how much do you know?",
    questions: [
      { text: "World War II ended in 1945.", correctAnswer: true },
      { text: "The Roman Empire fell in 476 AD.", correctAnswer: true },
      { text: "The Berlin Wall fell in 1989.", correctAnswer: true },
      {
        text: "Christopher Columbus was the first European to reach North America.",
        correctAnswer: false,
      },
      { text: "The French Revolution began in 1789.", correctAnswer: true },
      {
        text: "Russia is the largest country in the world by land area.",
        correctAnswer: true,
      },
      {
        text: "The Nile is the longest river in the world.",
        correctAnswer: true,
      },
      {
        text: "The United States declared independence in 1776.",
        correctAnswer: true,
      },
      {
        text: "The Great Wall of China was built in one continuous construction effort.",
        correctAnswer: false,
      },
      {
        text: "Ancient Egypt existed for over 3000 years.",
        correctAnswer: true,
      },
      { text: "The Titanic sank in 1912.", correctAnswer: true },
      {
        text: "The Ottoman Empire was one of the longest-lasting empires in history.",
        correctAnswer: true,
      },
      {
        text: "Brazil is the only country in South America where Portuguese is the official language.",
        correctAnswer: false,
      },
      { text: "The Moon landing first occurred in 1969.", correctAnswer: true },
      {
        text: "Vatican City is the smallest country in the world.",
        correctAnswer: true,
      },
      {
        text: "Canada has more lakes than all other countries combined.",
        correctAnswer: true,
      },
      { text: "The first World War started in 1914.", correctAnswer: true },
      {
        text: "India gained independence from Britain in 1947.",
        correctAnswer: true,
      },
      { text: "Alexander the Great was born in Rome.", correctAnswer: false },
      {
        text: "Africa is the world's second-largest continent by area.",
        correctAnswer: true,
      },
      {
        text: "The Aztec Empire was conquered by Hernán Cortés.",
        correctAnswer: true,
      },
      {
        text: "Antarctica is a continent with no permanent human population.",
        correctAnswer: true,
      },
      {
        text: "The Black Death killed roughly one-third of Europe's population.",
        correctAnswer: true,
      },
      {
        text: "The Suez Canal connects the Red Sea to the Mediterranean Sea.",
        correctAnswer: true,
      },
      {
        text: "New Zealand was the first country to give women the right to vote.",
        correctAnswer: true,
      },
      {
        text: "The Cold War ended in 1991 with the dissolution of the Soviet Union.",
        correctAnswer: true,
      },
      {
        text: "China has the largest population of any country in the world (as of 2023).",
        correctAnswer: false,
      },
      { text: "The Magna Carta was signed in 1215.", correctAnswer: true },
      { text: "The capital of Canada is Toronto.", correctAnswer: false },
      {
        text: "The Mongol Empire was the largest contiguous land empire in history.",
        correctAnswer: true,
      },
      {
        text: "The Korean War ended with a peace treaty.",
        correctAnswer: false,
      },
      {
        text: "The Amazon rainforest is located primarily in Brazil.",
        correctAnswer: true,
      },
      {
        text: "Julius Caesar was the first Roman Emperor.",
        correctAnswer: false,
      },
      {
        text: "Hawaii became the 50th U.S. state in 1959.",
        correctAnswer: true,
      },
      {
        text: "The Himalayas were formed by a collision between the Indian and Eurasian tectonic plates.",
        correctAnswer: true,
      },
      { text: "Apartheid ended in South Africa in 1994.", correctAnswer: true },
      {
        text: "The Silk Road was a single road connecting China to Europe.",
        correctAnswer: false,
      },
      {
        text: "Japan attacked Pearl Harbor on December 7, 1941.",
        correctAnswer: true,
      },
      {
        text: "The Sahara Desert spans across more than 10 countries in Africa.",
        correctAnswer: true,
      },
      { text: "The Renaissance began in France.", correctAnswer: false },
      {
        text: "The Seven Wonders of the Ancient World all still exist today.",
        correctAnswer: false,
      },
      {
        text: "The Pacific Ring of Fire is a region known for frequent earthquakes and volcanic activity.",
        correctAnswer: true,
      },
      {
        text: "The first human to walk on the moon was Neil Armstrong.",
        correctAnswer: true,
      },
      {
        text: "Australia is both a country and a continent.",
        correctAnswer: true,
      },
      {
        text: "The Colosseum in Rome could hold up to 80,000 spectators.",
        correctAnswer: true,
      },
      {
        text: "Iceland is the world's most geothermally active country.",
        correctAnswer: true,
      },
      {
        text: "The Spanish Armada was defeated by France.",
        correctAnswer: false,
      },
      {
        text: "The United Nations was founded after World War II.",
        correctAnswer: true,
      },
      {
        text: "The Danube River flows through more countries than any other river in the world.",
        correctAnswer: true,
      },
      { text: "Stonehenge is located in Scotland.", correctAnswer: false },
    ],
  },
  {
    title: "Movies & Pop Culture",
    description:
      "Lights, camera, trivia! Test your knowledge of Hollywood blockbusters, iconic TV shows, chart-topping music, and celebrity culture.",
    questions: [
      {
        text: "'The Godfather' (1972) won the Academy Award for Best Picture.",
        correctAnswer: true,
      },
      {
        text: "Michael Jackson's 'Thriller' is the best-selling album of all time.",
        correctAnswer: true,
      },
      {
        text: "The character of James Bond was created by author Ian Fleming.",
        correctAnswer: true,
      },
      {
        text: "'Titanic' was the first film to gross $1 billion worldwide.",
        correctAnswer: false,
      },
      {
        text: "Marilyn Monroe was born Norma Jeane Mortenson.",
        correctAnswer: true,
      },
      {
        text: "The TV show 'Friends' ran for ten seasons.",
        correctAnswer: true,
      },
      {
        text: "Walt Disney personally voiced Mickey Mouse in the early cartoons.",
        correctAnswer: true,
      },
      {
        text: "'Star Wars: Episode IV – A New Hope' was the first Star Wars film released.",
        correctAnswer: true,
      },
      {
        text: "The Beatles were originally from London.",
        correctAnswer: false,
      },
      {
        text: "'The Lion King' (1994) was based on Shakespeare's Hamlet.",
        correctAnswer: true,
      },
      {
        text: "Taylor Swift started her music career as a country artist.",
        correctAnswer: true,
      },
      {
        text: "'Avatar' (2009) is the highest-grossing film of all time (adjusted for inflation).",
        correctAnswer: false,
      },
      {
        text: "'Breaking Bad' is set in Albuquerque, New Mexico.",
        correctAnswer: true,
      },
      { text: "Audrey Hepburn was born in Belgium.", correctAnswer: true },
      {
        text: "Elvis Presley was called the 'King of Rock and Roll'.",
        correctAnswer: true,
      },
      {
        text: "'Harry Potter and the Philosopher's Stone' was published in 1997.",
        correctAnswer: true,
      },
      {
        text: "The Marvel Cinematic Universe began with 'Iron Man' in 2008.",
        correctAnswer: true,
      },
      {
        text: "Meryl Streep has won more Academy Awards than any other actor.",
        correctAnswer: true,
      },
      {
        text: "The TV series 'Game of Thrones' is based on books by George R.R. Martin.",
        correctAnswer: true,
      },
      {
        text: "Beyoncé was a solo artist before joining Destiny's Child.",
        correctAnswer: false,
      },
      {
        text: "'Schindler's List' was directed by Steven Spielberg.",
        correctAnswer: true,
      },
      { text: "Eminem's real name is Marshall Mathers.", correctAnswer: true },
      {
        text: "'The Simpsons' is the longest-running animated TV series in the US.",
        correctAnswer: true,
      },
      {
        text: "Lady Gaga's real name is Stefani Germanotta.",
        correctAnswer: true,
      },
      {
        text: "'Jurassic Park' (1993) was based on a novel by Michael Crichton.",
        correctAnswer: true,
      },
      {
        text: "Bruce Lee was primarily a basketball player before turning to acting.",
        correctAnswer: false,
      },
      {
        text: "'The Dark Knight' (2008) features Heath Ledger as the Joker.",
        correctAnswer: true,
      },
      { text: "Adele's debut album was called '19'.", correctAnswer: true },
      {
        text: "'Forrest Gump' won the Academy Award for Best Picture in 1995.",
        correctAnswer: true,
      },
      { text: "Cardi B and Offset are siblings.", correctAnswer: false },
      {
        text: "The TV show 'Seinfeld' was famously described as 'a show about nothing'.",
        correctAnswer: true,
      },
      {
        text: "Prince's real name was Prince Rogers Nelson.",
        correctAnswer: true,
      },
      {
        text: "'Inception' (2010) was directed by Christopher Nolan.",
        correctAnswer: true,
      },
      { text: "Shakira is originally from Colombia.", correctAnswer: true },
      {
        text: "'The Sopranos' ended with Tony Soprano being killed on screen.",
        correctAnswer: false,
      },
      { text: "Rihanna is from Barbados.", correctAnswer: true },
      {
        text: "'Lord of the Rings: Return of the King' swept all 11 of its Oscar nominations.",
        correctAnswer: true,
      },
      {
        text: "Michael Jackson and Paul McCartney collaborated on the song 'Say Say Say'.",
        correctAnswer: true,
      },
      {
        text: "'Parasite' (2019) was the first non-English-language film to win Best Picture at the Oscars.",
        correctAnswer: true,
      },
      {
        text: "The TV show 'The Office' (US) was based on a UK show.",
        correctAnswer: true,
      },
      {
        text: "Katy Perry's real name is Katheryn Hudson.",
        correctAnswer: true,
      },
      {
        text: "'Pulp Fiction' was Quentin Tarantino's directorial debut.",
        correctAnswer: false,
      },
      {
        text: "David Bowie's alter ego was called Ziggy Stardust.",
        correctAnswer: true,
      },
      {
        text: "'Avengers: Endgame' became the highest-grossing film of all time.",
        correctAnswer: true,
      },
      { text: "Jennifer Lopez's nickname is 'J.Lo'.", correctAnswer: true },
      {
        text: "'The Shawshank Redemption' won the Academy Award for Best Picture.",
        correctAnswer: false,
      },
      { text: "Keanu Reeves is from Canada.", correctAnswer: true },
      { text: "'Breaking Bad' has five seasons.", correctAnswer: true },
      { text: "Madonna is known as the 'Queen of Pop'.", correctAnswer: true },
      {
        text: "'Titanic' is the only film to win 11 Oscars.",
        correctAnswer: false,
      },
    ],
  },
];
