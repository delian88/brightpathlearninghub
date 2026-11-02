export interface StorySentence {
  text: string;
  syllableGuide: Record<string, string>; // e.g., { sitting: "Sit-ting", morning: "Mor-ning" }
  phonicsHint: string;
}

export interface ReadingStory {
  id: string;
  title: string;
  level: string;
  fullText: string;
  sentences: StorySentence[];
  phonicsCards: {
    sound: string;
    letters: string;
    exampleWord: string;
    syllables: string;
    tip: string;
  }[];
  comprehensionQuestions: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }[];
}

export const BRIGHT_BUDDY_STORIES: ReadingStory[] = [
  {
    id: "story-cat-mat",
    title: "Sam the Cat on the Sunny Mat",
    level: "LKG – Grade 2 • Phonics & Early Reading",
    fullText:
      "The cat is sitting on the mat. A little red bird hops by the window. Sam the cat wags his tail and smiles warmly in the morning sun.",
    sentences: [
      {
        text: "The cat is sitting on the mat.",
        syllableGuide: {
          sitting: "Sit-ting",
          cat: "c-a-t",
          mat: "m-a-t",
        },
        phonicsHint: "Short 'a' in cat/mat (/æ/) and double 't' in sit-ting.",
      },
      {
        text: "A little red bird hops by the window.",
        syllableGuide: {
          little: "Lit-tle",
          window: "Win-dow",
          bird: "b-ir-d",
        },
        phonicsHint: "Notice the 'ir' sound in bird and two syllables in win-dow.",
      },
      {
        text: "Sam the cat wags his tail and smiles warmly in the morning sun.",
        syllableGuide: {
          warmly: "Warm-ly",
          morning: "Mor-ning",
          smiles: "s-m-i-l-e-s",
        },
        phonicsHint: "Long 'a' in tail (/eɪ/) and 'or' blend in mor-ning.",
      },
    ],
    phonicsCards: [
      {
        sound: "/ɪŋ/ (-ing)",
        letters: "s-i-t-t-i-n-g",
        exampleWord: "sitting",
        syllables: "Sit-ting",
        tip: "Break double consonants in the middle: Sit + ting = Sitting!",
      },
      {
        sound: "Short /æ/ (-at family)",
        letters: "c-a-t & m-a-t",
        exampleWord: "cat / mat",
        syllables: "cat • mat",
        tip: "Open your mouth wide for the short 'a' sound in cat, mat, hat, and sat.",
      },
      {
        sound: "/wɪn/ + /doʊ/",
        letters: "w-i-n-d-o-w",
        exampleWord: "window",
        syllables: "Win-dow",
        tip: "Clap twice as you say Win - dow!",
      },
      {
        sound: "/ɔːr/ (or)",
        letters: "m-o-r-n-i-n-g",
        exampleWord: "morning",
        syllables: "Mor-ning",
        tip: "Blend 'm-or' first, then add '-ning'.",
      },
    ],
    comprehensionQuestions: [
      {
        id: "q1",
        question: "Where is the cat sitting?",
        options: ["On the mat", "In a tree", "Under the bed"],
        correctAnswer: "On the mat",
        explanation: "The first sentence says: 'The cat is sitting on the mat.'",
      },
      {
        id: "q2",
        question: "What hops by the window?",
        options: ["A green frog", "A little red bird", "A puppy"],
        correctAnswer: "A little red bird",
        explanation: "A little red bird hops by the window!",
      },
      {
        id: "q3",
        question: "How do we break the word 'sitting' into syllables?",
        options: ["Sit-ting", "Si-tting-g", "Sitt-in"],
        correctAnswer: "Sit-ting",
        explanation: "We split between the double 't': Sit-ting!",
      },
    ],
  },
  {
    id: "story-sunbird",
    title: "The Golden Sunbird of Abuja",
    level: "Grade 2 – Grade 4 • Fluency & Expression",
    fullText:
      "Every bright morning, a little golden sunbird flew over the green garden. It sang a cheerful melody and helped the colourful flowers bloom in the warm sunshine.",
    sentences: [
      {
        text: "Every bright morning, a little golden sunbird flew over the green garden.",
        syllableGuide: {
          bright: "b-r-igh-t",
          morning: "Mor-ning",
          golden: "Gol-den",
          sunbird: "Sun-bird",
          garden: "Gar-den",
        },
        phonicsHint: "'igh' makes the long 'i' sound in bright!",
      },
      {
        text: "It sang a cheerful melody and helped the colourful flowers bloom in the warm sunshine.",
        syllableGuide: {
          cheerful: "Cheer-ful",
          melody: "Mel-o-dy",
          colourful: "Col-our-ful",
          flowers: "Flow-ers",
          sunshine: "Sun-shine",
        },
        phonicsHint: "'ch' + 'eer' in cheer-ful and 'oo' in bloom.",
      },
    ],
    phonicsCards: [
      {
        sound: "/aɪ/ (igh)",
        letters: "b-r-i-g-h-t",
        exampleWord: "bright",
        syllables: "bright",
        tip: "The letters i-g-h work together to say the long 'I' sound.",
      },
      {
        sound: "/tʃ/ (ch)",
        letters: "c-h-e-e-r-f-u-l",
        exampleWord: "cheerful",
        syllables: "Cheer-ful",
        tip: "Start with a crisp 'ch' sound like a train: ch-ch-cheerful!",
      },
      {
        sound: "/uː/ (oo)",
        letters: "b-l-o-o-m",
        exampleWord: "bloom",
        syllables: "bloom",
        tip: "Round your lips for the long 'oo' sound in bloom and moon.",
      },
    ],
    comprehensionQuestions: [
      {
        id: "sq1",
        question: "Where did the golden sunbird fly?",
        options: ["Over the green garden", "Across the ocean", "Inside the classroom"],
        correctAnswer: "Over the green garden",
        explanation: "The golden sunbird flew over the green garden every bright morning.",
      },
      {
        id: "sq2",
        question: "What did the sunbird help the colourful flowers do?",
        options: ["Go to sleep", "Bloom in the warm sunshine", "Hide from the rain"],
        correctAnswer: "Bloom in the warm sunshine",
        explanation: "Its cheerful song helped the flowers bloom in the warm sunshine!",
      },
    ],
  },
  {
    id: "story-superspeaker",
    title: "Maya's Confident Stage Speech",
    level: "Grade 4 – Grade 8 • Public Speaking & Vocabulary",
    fullText:
      "Maya stood tall on the school stage and took a calm breath. She spoke with clarity and enthusiasm about protecting nature. The audience applauded her magnificent presentation.",
    sentences: [
      {
        text: "Maya stood tall on the school stage and took a calm breath.",
        syllableGuide: {
          school: "s-ch-oo-l",
          stage: "s-t-a-ge",
          breath: "b-r-ea-th",
        },
        phonicsHint: "'ea' in breath makes a short 'e' sound (/e/).",
      },
      {
        text: "She spoke with clarity and enthusiasm about protecting nature.",
        syllableGuide: {
          clarity: "Clar-i-ty",
          enthusiasm: "En-thu-si-a-sm",
          protecting: "Pro-tec-ting",
          nature: "Na-ture",
        },
        phonicsHint: "Practise 'En-thu-si-a-sm' slowly syllable by syllable.",
      },
      {
        text: "The audience applauded her magnificent presentation.",
        syllableGuide: {
          audience: "Au-di-ence",
          applauded: "Ap-plau-ded",
          magnificent: "Mag-nif-i-cent",
          presentation: "Pres-en-ta-tion",
        },
        phonicsHint: "Notice '-tion' at the end of presentation sounds like 'shun'.",
      },
    ],
    phonicsCards: [
      {
        sound: "Clar • i • ty",
        letters: "c-l-a-r-i-t-y",
        exampleWord: "clarity",
        syllables: "Clar-i-ty",
        tip: "Speaking with clarity means pronouncing every consonant clearly.",
      },
      {
        sound: "Mag • nif • i • cent",
        letters: "m-a-g-n-i-f-i-c-e-n-t",
        exampleWord: "magnificent",
        syllables: "Mag-nif-i-cent",
        tip: "Stress the second syllable: mag-NIF-i-cent!",
      },
      {
        sound: "/ʃən/ (-tion)",
        letters: "p-r-e-s-e-n-t-a-t-i-o-n",
        exampleWord: "presentation",
        syllables: "Pres-en-ta-tion",
        tip: "The suffix '-tion' is pronounced 'shun'.",
      },
    ],
    comprehensionQuestions: [
      {
        id: "mq1",
        question: "What did Maya do before she started speaking on stage?",
        options: [
          "Stood tall and took a calm breath",
          "Ran off the stage",
          "Read silently to herself",
        ],
        correctAnswer: "Stood tall and took a calm breath",
        explanation: "Standing tall and breathing calmly helps speakers feel confident!",
      },
      {
        id: "mq2",
        question: "What was Maya's speech about?",
        options: ["Protecting nature", "Space rockets", "Cooking dinner"],
        correctAnswer: "Protecting nature",
        explanation: "She spoke with clarity and enthusiasm about protecting nature.",
      },
    ],
  },
];

export const ALPHABET_PHONICS = [
  { letter: "A", lower: "a", sound: "ah", word: "Apple", emoji: "🍎", phonicsText: "A is for Apple. /æ/ /æ/ Apple!" },
  { letter: "B", lower: "b", sound: "buh", word: "Book", emoji: "📘", phonicsText: "B is for Book. /b/ /b/ Book!" },
  { letter: "C", lower: "c", sound: "kuh", word: "Cat", emoji: "🐱", phonicsText: "C is for Cat. /k/ /k/ Cat!" },
  { letter: "D", lower: "d", sound: "duh", word: "Drum", emoji: "🥁", phonicsText: "D is for Drum. /d/ /d/ Drum!" },
  { letter: "E", lower: "e", sound: "eh", word: "Elephant", emoji: "🐘", phonicsText: "E is for Elephant. /e/ /e/ Elephant!" },
  { letter: "F", lower: "f", sound: "fff", word: "Fish", emoji: "🐠", phonicsText: "F is for Fish. /f/ /f/ Fish!" },
  { letter: "G", lower: "g", sound: "guh", word: "Garden", emoji: "🌻", phonicsText: "G is for Garden. /g/ /g/ Garden!" },
  { letter: "H", lower: "h", sound: "huh", word: "House", emoji: "🏠", phonicsText: "H is for House. /h/ /h/ House!" },
  { letter: "I", lower: "i", sound: "ih", word: "Igloo", emoji: "🧊", phonicsText: "I is for Igloo. /ɪ/ /ɪ/ Igloo!" },
  { letter: "J", lower: "j", sound: "juh", word: "Juice", emoji: "🧃", phonicsText: "J is for Juice. /dʒ/ /dʒ/ Juice!" },
  { letter: "K", lower: "k", sound: "kuh", word: "Kite", emoji: "🪁", phonicsText: "K is for Kite. /k/ /k/ Kite!" },
  { letter: "L", lower: "l", sound: "lll", word: "Lion", emoji: "🦁", phonicsText: "L is for Lion. /l/ /l/ Lion!" },
  { letter: "M", lower: "m", sound: "mmm", word: "Moon", emoji: "🌙", phonicsText: "M is for Moon. /m/ /m/ Moon!" },
  { letter: "N", lower: "n", sound: "nnn", word: "Nest", emoji: "🪺", phonicsText: "N is for Nest. /n/ /n/ Nest!" },
  { letter: "O", lower: "o", sound: "oh", word: "Orange", emoji: "🍊", phonicsText: "O is for Orange. /ɒ/ /ɒ/ Orange!" },
  { letter: "P", lower: "p", sound: "puh", word: "Pencil", emoji: "✏️", phonicsText: "P is for Pencil. /p/ /p/ Pencil!" },
  { letter: "Q", lower: "q", sound: "kwuh", word: "Queen", emoji: "👑", phonicsText: "Q is for Queen. /kw/ /kw/ Queen!" },
  { letter: "R", lower: "r", sound: "rrr", word: "Rainbow", emoji: "🌈", phonicsText: "R is for Rainbow. /r/ /r/ Rainbow!" },
  { letter: "S", lower: "s", sound: "sss", word: "Sun", emoji: "☀️", phonicsText: "S is for Sun. /s/ /s/ Sun!" },
  { letter: "T", lower: "t", sound: "tuh", word: "Tree", emoji: "🌳", phonicsText: "T is for Tree. /t/ /t/ Tree!" },
  { letter: "U", lower: "u", sound: "uh", word: "Umbrella", emoji: "☂️", phonicsText: "U is for Umbrella. /ʌ/ /ʌ/ Umbrella!" },
  { letter: "V", lower: "v", sound: "vvv", word: "Violin", emoji: "🎻", phonicsText: "V is for Violin. /v/ /v/ Violin!" },
  { letter: "W", lower: "w", sound: "wuh", word: "Water", emoji: "💧", phonicsText: "W is for Water. /w/ /w/ Water!" },
  { letter: "X", lower: "x", sound: "ks", word: "Xylophone", emoji: "🎶", phonicsText: "X is in Box and Xylophone!" },
  { letter: "Y", lower: "y", sound: "yuh", word: "Yacht", emoji: "⛵", phonicsText: "Y is for Yacht. /j/ /j/ Yacht!" },
  { letter: "Z", lower: "z", sound: "zzz", word: "Zebra", emoji: "🦓", phonicsText: "Z is for Zebra. /z/ /z/ Zebra!" },
];

export const WORD_FORMATION_EXERCISES = [
  {
    id: "wf-1",
    targetWord: "CAT",
    clue: "A furry pet that says meow and sits on the mat 🐱",
    scrambled: ["T", "C", "A"],
    phonics: "C - A - T",
  },
  {
    id: "wf-2",
    targetWord: "BOOK",
    clue: "We open it to read wonderful stories 📚",
    scrambled: ["O", "B", "K", "O"],
    phonics: "B - OO - K",
  },
  {
    id: "wf-3",
    targetWord: "SMILE",
    clue: "What you do with your face when you are happy 😊",
    scrambled: ["L", "S", "I", "E", "M"],
    phonics: "S - M - I - L - E",
  },
  {
    id: "wf-4",
    targetWord: "SCHOOL",
    clue: "A place where children learn with teachers and friends 🏫",
    scrambled: ["O", "S", "C", "L", "H", "O"],
    phonics: "S - CH - OO - L",
  },
  {
    id: "wf-5",
    targetWord: "GARDEN",
    clue: "A green place where flowers and trees grow 🌻",
    scrambled: ["D", "G", "R", "A", "N", "E"],
    phonics: "GAR - DEN",
  },
];

export const PICTURE_TO_WORD_EXERCISES = [
  { id: "pw-1", emoji: "☀️", word: "SUN", hint: "Starts with S and shines brightly in the sky", sampleSentence: "The yellow sun is warm." },
  { id: "pw-2", emoji: "🌳", word: "TREE", hint: "Starts with TR and has green leaves", sampleSentence: "The bird sat in the tall tree." },
  { id: "pw-3", emoji: "🐘", word: "ELEPHANT", hint: "A large gentle animal with a long trunk", sampleSentence: "The elephant has big ears." },
  { id: "pw-4", emoji: "🌈", word: "RAINBOW", hint: "Seven colourful arcs in the sky after rain", sampleSentence: "We saw a bright rainbow." },
  { id: "pw-5", emoji: "🚀", word: "ROCKET", hint: "Flies astronauts high into outer space", sampleSentence: "The silver rocket zoomed up." },
  { id: "pw-6", emoji: "🍎", word: "APPLE", hint: "A crunchy red fruit starting with A", sampleSentence: "I ate a sweet red apple." },
];

export const SENTENCE_CONSTRUCTION_PUZZLES = [
  {
    id: "sc-1",
    scrambledWords: ["mat.", "the", "on", "sitting", "is", "cat", "The"],
    correctSentence: "The cat is sitting on the mat.",
    grammarTip: "Start with 'The' (capital letter) and end with 'mat.' (full stop).",
  },
  {
    id: "sc-2",
    scrambledWords: ["books", "every", "reads", "She", "day."],
    correctSentence: "She reads books every day.",
    grammarTip: "Subject (She) + Action Verb (reads) + Object (books) + Time (every day.).",
  },
  {
    id: "sc-3",
    scrambledWords: ["brightly", "shines", "sun", "golden", "The", "today."],
    correctSentence: "The golden sun shines brightly today.",
    grammarTip: "Adjectives like 'golden' come before the noun 'sun'.",
  },
];

export const GRAMMAR_MINI_LESSONS = [
  {
    id: "gram-1",
    title: "1. Capital Letters & Full Stops",
    rule: "Every sentence begins with a CAPITAL letter (A, B, C) and ends with a punctuation mark (. ! ?). Names of people and places also start with a capital letter!",
    wrongExample: "amina reads a book in abuja",
    rightExample: "Amina reads a book in Abuja.",
    question: "Which sentence is written correctly?",
    options: [
      "The dog ran across the park.",
      "the dog ran across the park",
      "The dog ran across the park",
    ],
    correctAnswer: "The dog ran across the park.",
  },
  {
    id: "gram-2",
    title: "2. Nouns, Verbs & Adjectives",
    rule: "A Noun is a person, place, or thing (cat, school). A Verb is an action word (run, read, sit). An Adjective describes a noun (golden, happy, little).",
    wrongExample: "Identify the action word (verb) in: 'The happy child jumps high.'",
    rightExample: "'jumps' is the action verb! 'happy' is the adjective, and 'child' is the noun.",
    question: "In the sentence 'The clever girl solved the puzzle', which word is the ADJECTIVE?",
    options: ["clever", "girl", "solved"],
    correctAnswer: "clever",
  },
  {
    id: "gram-3",
    title: "3. Using 'is' vs 'are' & 'a' vs 'an'",
    rule: "Use 'is' for one person/thing (singular) and 'are' for more than one (plural). Use 'an' before vowel sounds (a, e, i, o, u) like 'an apple' or 'an elephant'!",
    wrongExample: "A elephant are eating a orange.",
    rightExample: "An elephant is eating an orange.",
    question: "Choose the correct word: 'We saw ___ eagle flying in the sky.'",
    options: ["an", "a", "are"],
    correctAnswer: "an",
  },
];

export const SUPERSPEAKERS_ACTIVITIES = {
  conversations: [
    {
      id: "conv-1",
      title: "Greeting Your Teacher & Introducing Yourself",
      scenario: "Imagine you are meeting your new Bright Path teacher for the first time.",
      exchanges: [
        {
          aiLine: "Good morning, young scholar! Welcome to Bright Path. What is your name and how are you feeling today?",
          suggestedReply: "Good morning teacher! My name is ... and I am feeling happy and ready to learn today.",
          focusSkill: "Polite Greeting & Full Sentence Reply",
        },
        {
          aiLine: "It is wonderful to meet you! What is your favourite subject or storybook?",
          suggestedReply: "My favourite subject is reading because I love learning exciting new stories.",
          focusSkill: "Using 'because' to explain reasons",
        },
        {
          aiLine: "Fantastic! What is one goal you want to achieve this week?",
          suggestedReply: "This week, I want to read clearly and learn five new vocabulary words.",
          focusSkill: "Expressing goals with confidence",
        },
      ],
    },
    {
      id: "conv-2",
      title: "Helping a Friend at School",
      scenario: "Your classmate dropped their books and looks worried.",
      exchanges: [
        {
          aiLine: "Oh no! I dropped all my storybooks and I cannot find my pencil. Can you help me?",
          suggestedReply: "Don't worry! I will help you pick up your storybooks and you can borrow my extra pencil.",
          focusSkill: "Empathy & Kind Communication",
        },
        {
          aiLine: "Thank you so much! You are a very kind friend. Would you like to read together at break time?",
          suggestedReply: "You are welcome! Yes, I would love to read together during break time.",
          focusSkill: "Warm Social Conversation",
        },
      ],
    },
  ],
  storytellingPrompts: [
    {
      id: "st-1",
      title: "The Magic Library Key",
      starter: "One sunny afternoon, I opened my favourite book and found a glowing golden key hidden between the pages...",
      guidingQuestions: [
        "What door did the glowing key unlock?",
        "Who did you meet inside the magical world?",
        "How did your adventure end?",
      ],
      powerWords: ["mysterious", "courage", "sparkled", "adventure", "discovered"],
    },
    {
      id: "st-2",
      title: "If I Were Principal for a Day",
      starter: "If I became the Principal of my school for one exciting day, the very first rule I would make is...",
      guidingQuestions: [
        "What fun learning activity would every class do?",
        "How would you make the playground even better?",
        "Why would students love your school?",
      ],
      powerWords: ["creative", "kindness", "library", "celebrate", "inspire"],
    },
  ],
  listeningExercises: [
    {
      id: "list-1",
      title: "Listening Detective: Leo's Blue Bicycle",
      audioScript:
        "Listen carefully! On Saturday morning, seven-year-old Leo rode his shiny blue bicycle to the community park. He brought two ripe bananas and a bottle of cool water in his green backpack.",
      questions: [
        {
          q: "What colour was Leo's bicycle?",
          options: ["Shiny blue", "Bright red", "Yellow"],
          answer: "Shiny blue",
        },
        {
          q: "What did Leo carry inside his green backpack?",
          options: [
            "Two ripe bananas and a bottle of water",
            "Three apples and a football",
            "A comic book and crayons",
          ],
          answer: "Two ripe bananas and a bottle of water",
        },
      ],
    },
    {
      id: "list-2",
      title: "Listening Detective: The Honeybee's Dance",
      audioScript:
        "Listen carefully! Did you know that honeybees perform a special waggle dance? When a bee finds delicious nectar in yellow sunflowers, it dances in a figure-eight pattern to tell the other bees exactly where to fly!",
      questions: [
        {
          q: "Why does a honeybee perform a waggle dance?",
          options: [
            "To tell other bees where to find delicious nectar",
            "Because it is cold outside",
            "To scare away birds",
          ],
          answer: "To tell other bees where to find delicious nectar",
        },
      ],
    },
  ],
  qaPrompts: [
    {
      id: "qa-1",
      question: "If you could have any superpower to help people in your community, what superpower would you choose and why?",
      tip: "Start with: 'If I could have any superpower, I would choose... because...'",
    },
    {
      id: "qa-2",
      question: "What is something new you learned recently that made you feel proud of yourself?",
      tip: "Speak clearly and tell us how you practised!",
    },
    {
      id: "qa-3",
      question: "Why is it important to listen carefully when someone else is speaking?",
      tip: "Give one or two clear reasons in a complete sentence.",
    },
  ],
};

export const MATH_SHAPES_LIBRARY = [
  {
    name: "Circle",
    emoji: "🟢",
    sides: 0,
    corners: 0,
    description: "A completely round 2D shape with 0 straight sides and 0 corners.",
    realWorld: "Clock face, coin, bicycle wheel, full moon",
  },
  {
    name: "Triangle",
    emoji: "🔺",
    sides: 3,
    corners: 3,
    description: "A 2D shape with 3 straight sides and 3 corners (vertices).",
    realWorld: "Slice of pizza, roof of a house, yield road sign",
  },
  {
    name: "Square",
    emoji: "🟦",
    sides: 4,
    corners: 4,
    description: "A 2D shape with 4 equal straight sides and 4 right-angle corners.",
    realWorld: "Chessboard tile, window pane, cracker",
  },
  {
    name: "Rectangle",
    emoji: "▭",
    sides: 4,
    corners: 4,
    description: "A 2D shape with 4 sides (opposite sides are equal) and 4 corners.",
    realWorld: "Storybook cover, classroom whiteboard, door",
  },
  {
    name: "Pentagon",
    emoji: "⬠",
    sides: 5,
    corners: 5,
    description: "A 5-sided polygon with 5 straight sides and 5 corners.",
    realWorld: "Black panels on a football, birdhouse front",
  },
  {
    name: "Hexagon",
    emoji: "⬡",
    sides: 6,
    corners: 6,
    description: "A 6-sided polygon with 6 equal sides and 6 corners.",
    realWorld: "Honeycomb cells made by bees, pencil cross-section",
  },
];

export const MATH_WORD_PROBLEMS = [
  {
    id: "wp-1",
    title: "Storybooks on the Library Shelf (Addition)",
    story: "Zainab read 6 storybooks last month and 5 storybooks this month. How many storybooks did she read altogether?",
    operation: "Addition (+)",
    numA: 6,
    numB: 5,
    operator: "+",
    answer: 11,
    visualEmoji: "📘",
    steps: [
      "Step 1 (What we know): Last month = 6 books. This month = 5 books.",
      "Step 2 (Clue word): 'Altogether' means we ADD the two groups: 6 + 5.",
      "Step 3 (Count on): Start at 6 and count up 5 more → 7, 8, 9, 10, 11!",
    ],
  },
  {
    id: "wp-2",
    title: "Sharing Sweet Mangoes (Subtraction)",
    story: "Tunde picked 14 ripe mangoes from the tree. He gave 6 mangoes to his neighbours. How many mangoes does Tunde have left?",
    operation: "Subtraction (-)",
    numA: 14,
    numB: 6,
    operator: "-",
    answer: 8,
    visualEmoji: "🥭",
    steps: [
      "Step 1 (What we know): Started with 14 mangoes. Gave away 6 mangoes.",
      "Step 2 (Clue words): 'Have left' means we SUBTRACT: 14 - 6.",
      "Step 3 (Solve): Take away 4 to reach 10, then take away 2 more → 8 mangoes left!",
    ],
  },
  {
    id: "wp-3",
    title: "Boxes of Colourful Crayons (Multiplication)",
    story: "There are 4 tables in the art room. Each table has a box with 5 crayons. How many crayons are there in total?",
    operation: "Multiplication (×)",
    numA: 4,
    numB: 5,
    operator: "×",
    answer: 20,
    visualEmoji: "🖍️",
    steps: [
      "Step 1 (What we know): 4 equal groups (tables) with 5 crayons in each group.",
      "Step 2 (Operation): Equal groups mean MULTIPLICATION: 4 × 5 (or 5 + 5 + 5 + 5).",
      "Step 3 (Skip count by 5s): 5, 10, 15, 20 → 20 crayons in total!",
    ],
  },
];
