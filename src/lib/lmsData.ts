export interface HomeworkQuestion {
  id: string;
  type: "objective" | "subjective";
  prompt: string;
  options?: string[]; // For objective multiple-choice questions
  correctAnswer?: string; // For automatic grading of objective questions
  points: number;
  skillTag?: string; // e.g., "Phonics & Reading", "Pronunciation", "Writing & Grammar", "Public Speaking", "Mathematics", "Coding"
}

export interface HomeworkAssignment {
  id: string;
  title: string;
  description: string;
  courseName: string;
  grade: string; // e.g., "All Grades" or "Grade 2"
  targetType: "all" | "course" | "student";
  assignedStudentUsername?: string;
  assignedStudentName?: string;
  dueDate: string;
  totalPoints: number;
  questions: HomeworkQuestion[];
  createdAt: string;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  homeworkTitle: string;
  courseName: string;
  studentUsername: string;
  studentName: string;
  parentEmail?: string;
  grade: string;
  answers: Record<string, string>;
  objectiveScore: number;
  subjectiveScore: number;
  totalScore: number;
  maxPoints: number;
  percentage: number;
  status: "submitted" | "graded";
  teacherFeedback: string;
  weakSkillsIdentified: string[];
  submittedAt: string;
  gradedAt?: string;
}

export interface StudentBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  color: string;
}

export interface DailyLearningActivity {
  id: string;
  title: string;
  category: "Live Class" | "AI Reading" | "Homework" | "Writing Practice" | "Pronunciation";
  duration: string;
  completed: boolean;
  description: string;
}

export interface AiPracticeLog {
  id: string;
  studentUsername: string;
  studentName: string;
  mode: "reading" | "pronunciation" | "writing" | "chat";
  topic: string;
  score: number;
  feedback: string;
  improvementArea?: string;
  createdAt: string;
}

export interface StudentReportCard {
  id: string;
  reportRef: string;
  studentUsername: string;
  studentName: string;
  parentName: string;
  parentEmail: string;
  grade: string;
  courseName: string;
  termPeriod: string;
  attendanceRate: number;
  lessonsCompleted: number;
  learningHours: number;
  homeworkCompletionRate: number;
  overallScore: number;
  overallGrade: string;
  readingProgress: number;
  subjectScores: {
    subject: string;
    score: number;
    grade: string;
    remark: string;
  }[];
  strengths: string[];
  areasForImprovement: string[];
  teacherComment: string;
  issuedBy: string;
  createdAt: string;
}

export interface PortalNotification {
  id: string;
  targetStudentUsername: string; // "ALL" or specific username
  type: "homework" | "grade" | "report" | "announcement" | "reminder";
  title: string;
  message: string;
  createdAt: string;
  readBy?: string[];
}

export interface StudentProgressRecord {
  studentUsername: string;
  studentName: string;
  avatarUrl: string;
  lessonsCompleted: number;
  totalLessons: number;
  attendanceRate: number;
  learningHours: number;
  readingProgress: number;
  customStrengths: string[];
  customImprovements: string[];
  completedActivityIds: string[];
  badges: StudentBadge[];
  updatedAt: string;
}

export interface LmsStateData {
  assignments: HomeworkAssignment[];
  submissions: HomeworkSubmission[];
  reportCards: StudentReportCard[];
  notifications: PortalNotification[];
  progressRecords: Record<string, StudentProgressRecord>;
  aiLogs: AiPracticeLog[];
}

export const DEFAULT_AVATARS = [
  { id: "scholar-girl", label: "Star Reader", emoji: "👧🏽", bg: "linear-gradient(135deg, #f59e0b, #ec4899)" },
  { id: "scholar-boy", label: "Young Explorer", emoji: "👦🏽", bg: "linear-gradient(135deg, #3b82f6, #10b981)" },
  { id: "coder-kid", label: "Tech Innovator", emoji: "🧑🏾‍💻", bg: "linear-gradient(135deg, #6366f1, #06b6d4)" },
  { id: "speaker-star", label: "Orator Champion", emoji: "🎤", bg: "linear-gradient(135deg, #10b981, #059669)" },
  { id: "math-genius", label: "Math Wizard", emoji: "🚀", bg: "linear-gradient(135deg, #8b5cf6, #ec4899)" },
];

export const READING_PRACTICE_PASSAGES = [
  {
    id: "passage-1",
    title: "The Golden Sunbird of Abuja",
    level: "LKG – Grade 3 (Phonics & Fluency)",
    text: "Every bright morning, a little golden sunbird flew over the green garden. It sang a sweet song and helped the colourful flowers bloom in the warm sunshine.",
    focusWords: ["bright", "morning", "golden", "garden", "flowers", "sunshine"],
  },
  {
    id: "passage-2",
    title: "How Computers Think Step by Step",
    level: "Grade 3 – Grade 6 (Reading & Vocabulary)",
    text: "A computer follows clear instructions called algorithms. When young creators write code, they solve puzzles with logic, creativity, and patience.",
    focusWords: ["computer", "instructions", "algorithms", "creators", "puzzles", "patience"],
  },
  {
    id: "passage-3",
    title: "Speaking with Courage and Clarity",
    level: "Grade 4 – Grade 8 (Public Speaking)",
    text: "Great speakers stand tall, breathe calmly, and share their ideas with confidence. When we listen carefully and speak clearly, our words can inspire the world.",
    focusWords: ["courage", "clarity", "confidence", "carefully", "inspire"],
  },
];

export const PRONUNCIATION_WORDS = [
  {
    word: "Phonics",
    phonetic: "FOH-niks",
    syllables: "Pho • nics",
    meaning: "Learning how letters and sounds work together to read words.",
    sentence: "Practising phonics helps me read new books with confidence.",
  },
  {
    word: "Magnificent",
    phonetic: "mag-NIF-i-sent",
    syllables: "Mag • nif • i • cent",
    meaning: "Extremely beautiful, impressive, or wonderful.",
    sentence: "The student gave a magnificent speech in front of the class.",
  },
  {
    word: "Algorithm",
    phonetic: "AL-go-rith-um",
    syllables: "Al • go • rith • m",
    meaning: "A step-by-step set of rules used to solve a problem.",
    sentence: "We wrote an algorithm to make our game character jump.",
  },
  {
    word: "Articulate",
    phonetic: "ar-TIK-yoo-lit",
    syllables: "Ar • tic • u • late",
    meaning: "Able to express thoughts and ideas clearly and effectively.",
    sentence: "She is a confident and articulate young speaker.",
  },
  {
    word: "Denominator",
    phonetic: "di-NOM-i-nay-tor",
    syllables: "De • nom • i • na • tor",
    meaning: "The bottom number in a mathematical fraction.",
    sentence: "In the fraction three-quarters, four is the denominator.",
  },
  {
    word: "Perseverance",
    phonetic: "pur-suh-VEER-uhns",
    syllables: "Per • se • ver • ance",
    meaning: "Continuing to try hard even when something is challenging.",
    sentence: "With perseverance and practice, every difficult skill becomes easy.",
  },
];

export const WRITING_PROMPTS = [
  {
    id: "write-1",
    title: "My Favourite Invention",
    prompt: "If you could invent a helpful robot or machine for your family or school, what would it do and how would it help people? Write 3 to 5 complete sentences.",
    keywords: ["because", "invent", "help", "future", "creative"],
  },
  {
    id: "write-2",
    title: "A Memorable Day of Kindness",
    prompt: "Describe a time when you helped a friend, classmate, or family member. How did it make both of you feel?",
    keywords: ["kindness", "friend", "together", "grateful", "happy"],
  },
  {
    id: "write-3",
    title: "Why Reading Opens New Worlds",
    prompt: "Explain why reading books is an important superpower for children. Give at least two reasons.",
    keywords: ["discover", "knowledge", "imagination", "learn", "world"],
  },
];

export const defaultLmsData: LmsStateData = {
  assignments: [
    {
      id: "hw-phonics-101",
      title: "Phonics Blending, Vowel Sounds & Reading Comprehension",
      description:
        "Complete the objective multiple-choice questions on vowel blends and write two complete sentences using today's vocabulary words.",
      courseName: "English Phonics & Reading",
      grade: "All Grades",
      targetType: "all",
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
      totalPoints: 100,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      questions: [
        {
          id: "q1",
          type: "objective",
          prompt: "Which of these words contains a long 'EA' vowel sound as in 'READ'?",
          options: ["Bread", "Dream", "Head", "Heavy"],
          correctAnswer: "Dream",
          points: 25,
          skillTag: "Phonics & Reading",
        },
        {
          id: "q2",
          type: "objective",
          prompt: "Choose the correct syllable breakdown for the word 'WONDERFUL':",
          options: ["Wond-erful", "Won-der-ful", "Wo-nder-ful", "Wonder-ful"],
          correctAnswer: "Won-der-ful",
          points: 25,
          skillTag: "Pronunciation & Syllables",
        },
        {
          id: "q3",
          type: "objective",
          prompt: "Which sentence uses correct punctuation and capitalization?",
          options: [
            "amina loves reading storybooks every evening",
            "Amina loves reading storybooks every evening.",
            "amina Loves reading Storybooks every evening?",
            "Amina loves reading storybooks every evening",
          ],
          correctAnswer: "Amina loves reading storybooks every evening.",
          points: 25,
          skillTag: "Writing & Grammar",
        },
        {
          id: "q4",
          type: "subjective",
          prompt:
            "Write 2 to 3 complete sentences about your favourite book or story character and explain what lesson you learned from them.",
          points: 25,
          skillTag: "Creative Writing",
        },
      ],
    },
    {
      id: "hw-math-102",
      title: "Mental Math, Number Patterns & Word Problem Challenge",
      description:
        "Practice rapid mental calculation and explain your step-by-step reasoning for the word problem.",
      courseName: "Bright Math - Conceptual Mathematics",
      grade: "All Grades",
      targetType: "all",
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
      totalPoints: 100,
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      questions: [
        {
          id: "m1",
          type: "objective",
          prompt: "What number comes next in the pattern: 6, 12, 18, 24, ___?",
          options: ["28", "30", "32", "36"],
          correctAnswer: "30",
          points: 30,
          skillTag: "Conceptual Math",
        },
        {
          id: "m2",
          type: "objective",
          prompt: "If one notebook costs 450 Naira, how much do 3 notebooks cost?",
          options: ["1,200 Naira", "1,350 Naira", "1,450 Naira", "900 Naira"],
          correctAnswer: "1,350 Naira",
          points: 35,
          skillTag: "Conceptual Math",
        },
        {
          id: "m3",
          type: "subjective",
          prompt:
            "Zainab read 14 pages on Monday and 18 pages on Tuesday. If her book has 50 pages in total, how many pages does she have left to read? Show your working steps.",
          points: 35,
          skillTag: "Problem Solving",
        },
      ],
    },
    {
      id: "hw-speaking-103",
      title: "Public Speaking Confidence & Vocabulary Builder",
      description:
        "Answer the speech structure questions and draft a short 3-sentence opening hook for your next presentation.",
      courseName: "Public Speaking & Communication",
      grade: "All Grades",
      targetType: "all",
      dueDate: new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0],
      totalPoints: 100,
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      questions: [
        {
          id: "s1",
          type: "objective",
          prompt: "What is the best way to begin a persuasive speech?",
          options: [
            "Look at the floor and speak very fast",
            "Start with a strong hook, smile, and make eye contact",
            "Apologize for being nervous",
            "Read quietly without looking up",
          ],
          correctAnswer: "Start with a strong hook, smile, and make eye contact",
          points: 50,
          skillTag: "Public Speaking",
        },
        {
          id: "s2",
          type: "subjective",
          prompt:
            "Write a powerful 3-sentence introduction for a speech titled 'How Young Leaders Can Make Their Community Better'.",
          points: 50,
          skillTag: "Speech Writing",
        },
      ],
    },
  ],
  submissions: [],
  reportCards: [],
  notifications: [
    {
      id: "notif-welcome-1",
      targetStudentUsername: "ALL",
      type: "announcement",
      title: "Welcome to the AI-Powered Student Learning Hub!",
      message:
        "Explore your daily learning goals, complete interactive homework, and practice reading & pronunciation with your voice-enabled AI Learning Buddy.",
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: "notif-hw-1",
      targetStudentUsername: "ALL",
      type: "homework",
      title: "New Homework Assigned: Phonics Blending & Reading Comprehension",
      message:
        "Your teacher has assigned a new interactive homework task. Complete it online to earn your Homework Champion badge!",
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
  ],
  progressRecords: {},
  aiLogs: [],
};

export function getOrCreateStudentProgress(
  state: LmsStateData,
  studentUsername: string,
  studentName: string
): StudentProgressRecord {
  const key = studentUsername.toUpperCase();
  if (state.progressRecords[key]) {
    return state.progressRecords[key];
  }

  return {
    studentUsername: key,
    studentName,
    avatarUrl: "scholar-girl",
    lessonsCompleted: 14,
    totalLessons: 24,
    attendanceRate: 96,
    learningHours: 18.5,
    readingProgress: 84,
    customStrengths: [
      "Strong enthusiasm during 1-on-1 live interactive sessions",
      "Good recognition of core phonics blends and sight words",
      "Consistent attendance and active classroom participation",
    ],
    customImprovements: [
      "Practising multi-syllable word pronunciation aloud",
      "Expanding sentence structure and descriptive vocabulary in writing",
    ],
    completedActivityIds: ["act-1"],
    badges: [
      {
        id: "badge-starter",
        title: "Rising Scholar",
        description: "Joined Bright Path 1-on-1 Live Learning Hub",
        icon: "🌟",
        earnedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        color: "#f59e0b",
      },
      {
        id: "badge-attendance",
        title: "95%+ Attendance Star",
        description: "Consistent punctuality in 1:1 live classes",
        icon: "🏆",
        earnedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        color: "#10b981",
      },
      {
        id: "badge-reader",
        title: "Confident Reader",
        description: "Completed phonics & reading fluency milestones",
        icon: "📚",
        earnedAt: new Date(Date.now() - 86400000).toISOString(),
        color: "#3b82f6",
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

