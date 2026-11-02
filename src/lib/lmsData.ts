export type QuestionType =
  | "multiple-choice"
  | "true-false"
  | "matching"
  | "fill-in-blank"
  | "spelling"
  | "reading-comprehension"
  | "handwriting"
  | "creative-writing"
  | "recorded-reading"
  // Legacy aliases for backward compatibility
  | "objective"
  | "subjective";

export type MarkingMethod =
  | "automatic"
  | "automatic-accepted-rules"
  | "ai-assisted-teacher-review"
  | "ai-teacher-review"
  | "teacher-with-ai-suggestions"
  | "teacher-ai-suggestions";

export type AssignmentLifecycleStatus =
  | "Draft"
  | "Published"
  | "In Progress"
  | "Submitted"
  | "Under Review"
  | "Graded"
  | "Returned";

export interface MatchingPair {
  left: string;
  right: string;
}

export interface HomeworkAttachment {
  id: string;
  name?: string;
  title?: string;
  fileName?: string;
  type: "pdf" | "image" | "audio" | "material";
  url: string; // Data URL or external URL
  sizeLabel?: string;
}

export interface HomeworkQuestion {
  id: string;
  type: QuestionType;
  markingMethod?: MarkingMethod;
  prompt: string;
  passageText?: string; // For reading comprehension or recorded reading
  readingPassage?: string; // Alias for reading comprehension or recorded reading passage
  spellingWord?: string; // For simple spelling (spoken aloud by TTS)
  options?: string[]; // For multiple-choice or true-false
  correctAnswer?: string; // For MC, True/False, Simple Spelling
  acceptedAnswers?: string[]; // For fill-in-the-blank accepted-answer rules
  matchingPairs?: MatchingPair[]; // For matching questions
  allowDrawing?: boolean; // Allow interactive handwriting/drawing canvas
  allowImageUpload?: boolean; // Allow uploading photo of handwritten work
  allowVoiceRecording?: boolean; // Allow recording voice reading
  points: number;
  skillTag?: string;
}

export interface HomeworkAssignment {
  id: string;
  title: string;
  subject?: string;
  topic?: string;
  description: string;
  audioInstructionText?: string;
  audioInstructionUrl?: string; // Recorded or uploaded teacher audio instruction
  attachments?: HomeworkAttachment[]; // PDF worksheets, images, learning materials
  courseName: string;
  grade: string;
  targetType: "all" | "course" | "group" | "student";
  targetGroupName?: string;
  assignedStudentUsername?: string;
  assignedStudentName?: string;
  dueDate: string;
  scheduledPublishDate?: string;
  assignmentStatus?: "Draft" | "Published";
  totalPoints: number;
  passingScore?: number; // e.g., 60 (points or %)
  allowLateSubmission?: boolean;
  allowResubmission?: boolean;
  questions: HomeworkQuestion[];
  createdAt: string;
}

export interface StudentQuestionAnswer {
  questionId: string;
  textAnswer?: string;
  matchingAnswers?: Record<string, string>; // left -> selected right
  drawingDataUrl?: string; // Canvas drawing / handwriting PNG data URL
  uploadedImageUrl?: string; // Photo of handwritten work data URL
  uploadedImageName?: string;
  uploadedFileName?: string;
  voiceRecordingUrl?: string; // Recorded audio data URL
  voiceTranscript?: string; // Speech-to-text transcript of recorded reading
}

export interface QuestionGradeEvaluation {
  questionId: string;
  maxPoints: number;
  markingMethod: MarkingMethod;
  autoOrAiScore: number;
  teacherOverrideScore?: number;
  finalScore: number;
  isCorrect?: boolean;
  aiSuggestionFeedback: string;
  teacherComment?: string;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  homeworkTitle: string;
  subject?: string;
  topic?: string;
  courseName: string;
  studentUsername: string;
  studentName: string;
  parentEmail?: string;
  grade: string;
  answers: Record<string, string>; // Legacy simple map
  richAnswers?: Record<string, StudentQuestionAnswer>; // Full multimodal answers
  questionEvaluations?: Record<string, QuestionGradeEvaluation>;
  objectiveScore: number;
  subjectiveScore: number;
  aiSuggestedTotalScore?: number;
  totalScore: number;
  maxPoints: number;
  passingScore?: number;
  passed?: boolean;
  percentage: number;
  status: "in-progress" | "submitted" | "under-review" | "graded" | "returned";
  lifecycleStatus?: AssignmentLifecycleStatus; // Draft -> Published -> In Progress -> Submitted -> Under Review -> Graded -> Returned
  isLate?: boolean;
  resubmissionCount?: number;
  allowResubmission?: boolean;
  teacherFeedback: string;
  weakSkillsIdentified: string[];
  lastSavedAt?: string;
  savedAt?: string;
  submittedAt: string;
  gradedAt?: string;
  returnedAt?: string;
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
  targetStudentUsername: string;
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

export const QUESTION_TYPE_LABELS: Record<
  string,
  { label: string; markingLabel: string; method: MarkingMethod }
> = {
  "multiple-choice": {
    label: "Multiple Choice",
    markingLabel: "Automatic",
    method: "automatic",
  },
  "true-false": {
    label: "True / False",
    markingLabel: "Automatic",
    method: "automatic",
  },
  matching: {
    label: "Matching Questions",
    markingLabel: "Automatic",
    method: "automatic",
  },
  "fill-in-blank": {
    label: "Fill in the Blanks",
    markingLabel: "Automatic (Accepted-Answer Rules)",
    method: "automatic-accepted-rules",
  },
  spelling: {
    label: "Simple Spelling (Audio Word)",
    markingLabel: "Automatic",
    method: "automatic",
  },
  "reading-comprehension": {
    label: "Reading Comprehension",
    markingLabel: "AI-Assisted + Teacher Review",
    method: "ai-assisted-teacher-review",
  },
  handwriting: {
    label: "Handwriting / Draw / Photo Upload",
    markingLabel: "AI-Assisted + Teacher Review",
    method: "ai-assisted-teacher-review",
  },
  "creative-writing": {
    label: "Essays & Creative Writing",
    markingLabel: "Teacher Grading with AI Suggestions",
    method: "teacher-with-ai-suggestions",
  },
  "recorded-reading": {
    label: "Recorded Voice Reading",
    markingLabel: "AI-Assisted Assessment + Teacher Review",
    method: "ai-assisted-teacher-review",
  },
  objective: {
    label: "Multiple Choice (Objective)",
    markingLabel: "Automatic",
    method: "automatic",
  },
  subjective: {
    label: "Written Response (Subjective)",
    markingLabel: "Teacher Grading with AI Suggestions",
    method: "teacher-with-ai-suggestions",
  },
};

export function evaluateHomeworkQuestion(
  q: HomeworkQuestion,
  rawTextAnswer: string,
  rich?: StudentQuestionAnswer
): QuestionGradeEvaluation {
  const maxPoints = Number(q.points || 10);
  const textAns = String(rich?.textAnswer ?? rawTextAnswer ?? "").trim();
  const qType = q.type === "objective" ? "multiple-choice" : q.type === "subjective" ? "creative-writing" : q.type;
  const meta = QUESTION_TYPE_LABELS[qType] || QUESTION_TYPE_LABELS["multiple-choice"];

  // 1. Multiple Choice / True-False / Simple Spelling -> Automatic
  if (qType === "multiple-choice" || qType === "true-false" || qType === "spelling") {
    const target = String(q.correctAnswer || q.spellingWord || "").trim().toLowerCase();
    const isCorrect = Boolean(target && textAns.toLowerCase() === target);
    const score = isCorrect ? maxPoints : 0;
    return {
      questionId: q.id,
      maxPoints,
      markingMethod: "automatic",
      autoOrAiScore: score,
      finalScore: score,
      isCorrect,
      aiSuggestionFeedback: isCorrect
        ? `Automatic Marking: Correct answer ("${textAns}"). Full marks awarded (${maxPoints}/${maxPoints}).`
        : `Automatic Marking: Student answered "${textAns || "No answer"}", expected "${q.correctAnswer || q.spellingWord}". (0/${maxPoints})`,
    };
  }

  // 2. Fill in the Blanks -> Automatic with accepted-answer rules
  if (qType === "fill-in-blank") {
    const acceptedList = [
      ...(q.acceptedAnswers || []),
      ...(q.correctAnswer ? q.correctAnswer.split(/[|,;]/).map((s) => s.trim()) : []),
    ]
      .map((s) => s.trim().toLowerCase().replace(/[.!?]+$/, ""))
      .filter(Boolean);

    const normalizedStudent = textAns.toLowerCase().replace(/[.!?]+$/, "").trim();
    const isCorrect = acceptedList.includes(normalizedStudent);
    const score = isCorrect ? maxPoints : 0;
    return {
      questionId: q.id,
      maxPoints,
      markingMethod: "automatic-accepted-rules",
      autoOrAiScore: score,
      finalScore: score,
      isCorrect,
      aiSuggestionFeedback: isCorrect
        ? `Accepted-Answer Rule Match: "${textAns}" matches accepted answers [${acceptedList.join(", ")}]. (${maxPoints}/${maxPoints})`
        : `Accepted-Answer Rule Mismatch: "${textAns || "Blank"}" did not match accepted list [${acceptedList.join(", ")}]. Teacher may override if partially valid.`,
    };
  }

  // 3. Matching Questions -> Automatic
  if (qType === "matching") {
    const pairs = q.matchingPairs || [];
    if (pairs.length === 0) {
      return {
        questionId: q.id,
        maxPoints,
        markingMethod: "automatic",
        autoOrAiScore: maxPoints,
        finalScore: maxPoints,
        isCorrect: true,
        aiSuggestionFeedback: "Automatic Matching: Full marks.",
      };
    }
    const studentMap = rich?.matchingAnswers || {};
    let correctPairs = 0;
    pairs.forEach((p) => {
      if (
        String(studentMap[p.left] || "").trim().toLowerCase() ===
        p.right.trim().toLowerCase()
      ) {
        correctPairs++;
      }
    });
    const score = Math.round((correctPairs / pairs.length) * maxPoints);
    const isCorrect = correctPairs === pairs.length;
    return {
      questionId: q.id,
      maxPoints,
      markingMethod: "automatic",
      autoOrAiScore: score,
      finalScore: score,
      isCorrect,
      aiSuggestionFeedback: `Automatic Matching: ${correctPairs} of ${pairs.length} pairs matched correctly (${score}/${maxPoints} pts).`,
    };
  }

  // 4. Recorded Reading -> AI-Assisted Assessment + Teacher Review
  if (qType === "recorded-reading") {
    const hasAudio = Boolean(rich?.voiceRecordingUrl);
    const transcript = String(rich?.voiceTranscript || textAns || "").trim();
    const passage = String(q.passageText || q.prompt || "").trim();

    if (!hasAudio && !transcript) {
      return {
        questionId: q.id,
        maxPoints,
        markingMethod: "ai-assisted-teacher-review",
        autoOrAiScore: 0,
        finalScore: 0,
        aiSuggestionFeedback: "No voice recording or reading transcript submitted yet.",
      };
    }

    const targetWords = passage
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(Boolean);
    const spokenWords = transcript
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(Boolean);

    let ratio = 0.88;
    if (targetWords.length > 0 && spokenWords.length > 0) {
      let matched = 0;
      targetWords.forEach((w) => {
        if (spokenWords.includes(w)) matched++;
      });
      ratio = Math.min(1, Math.max(0.6, matched / targetWords.length));
    }

    const aiScore = Math.round(maxPoints * ratio);
    return {
      questionId: q.id,
      maxPoints,
      markingMethod: "ai-assisted-teacher-review",
      autoOrAiScore: aiScore,
      finalScore: aiScore,
      aiSuggestionFeedback: `AI Reading Assessment: Voice recording received (${Math.round(
        ratio * 100
      )}% estimated pronunciation & fluency accuracy). Suggested Score: ${aiScore}/${maxPoints}. Teacher can listen and override.`,
    };
  }

  // 5. Handwriting / Drawing / Photo Upload -> AI-Assisted + Teacher Review
  if (qType === "handwriting") {
    const hasDrawing = Boolean(rich?.drawingDataUrl);
    const hasPhoto = Boolean(rich?.uploadedImageUrl);
    const hasText = Boolean(textAns);

    if (!hasDrawing && !hasPhoto && !hasText) {
      return {
        questionId: q.id,
        maxPoints,
        markingMethod: "ai-assisted-teacher-review",
        autoOrAiScore: 0,
        finalScore: 0,
        aiSuggestionFeedback: "No handwritten photo or canvas drawing submitted.",
      };
    }

    const aiScore = Math.round(maxPoints * (hasPhoto || hasDrawing ? 0.9 : 0.75));
    return {
      questionId: q.id,
      maxPoints,
      markingMethod: "ai-assisted-teacher-review",
      autoOrAiScore: aiScore,
      finalScore: aiScore,
      aiSuggestionFeedback: `AI Handwriting Pre-Check: ${
        hasPhoto ? "Handwritten worksheet photo uploaded" : "Interactive canvas handwriting submitted"
      }. Legibility & completion pre-scored at ${aiScore}/${maxPoints}. Awaiting teacher visual verification.`,
    };
  }

  // 6. Reading Comprehension & Creative Writing -> AI-Assisted / AI Suggestions + Teacher Review
  const words = textAns.split(/\s+/).filter(Boolean);
  const sentences = textAns
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const hasCapital = /^[A-Z]/.test(textAns);
  const hasEndPunct = /[.!?]$/.test(textAns);

  let ratio = 0;
  if (words.length >= 18) ratio = 0.92;
  else if (words.length >= 10) ratio = 0.84;
  else if (words.length >= 4) ratio = 0.68;
  else if (words.length > 0) ratio = 0.45;

  if (hasCapital && hasEndPunct && ratio > 0) {
    ratio = Math.min(1, ratio + 0.05);
  }

  const aiScore = Math.round(maxPoints * ratio);
  return {
    questionId: q.id,
    maxPoints,
    markingMethod:
      qType === "reading-comprehension"
        ? "ai-assisted-teacher-review"
        : "teacher-with-ai-suggestions",
    autoOrAiScore: aiScore,
    finalScore: aiScore,
    aiSuggestionFeedback: `AI Writing & Comprehension Assistant: ${words.length} words, ${
      sentences.length
    } sentence(s). ${
      hasCapital && hasEndPunct
        ? "Good capitalization and punctuation."
        : "Remind student to check capital letters and full stops."
    } AI Suggested Score: ${aiScore}/${maxPoints} (Teacher can override).`,
  };
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
      id: "hw-phonics-master-101",
      title: "Comprehensive Phonics, Spelling, Reading Aloud & Handwriting Assignment",
      subject: "English Phonics & Reading",
      topic: "Vowel Blends, Sight Words, Voice Reading & Handwriting",
      description:
        "Listen to the audio instructions first! Complete the multiple-choice, true/false, fill-in-the-gap, matching, spelling, voice reading, and handwriting/creative writing tasks. You can save your unfinished work anytime.",
      audioInstructionText:
        "Welcome to your weekly Phonics and Reading assignment! Read each question carefully. For the spelling question, click the speaker button to hear the word. For the reading question, record your voice reading the short story aloud. You can also draw or upload a photo of your handwritten work!",
      courseName: "English Phonics & Reading",
      grade: "All Grades",
      targetType: "all",
      dueDate: new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0],
      scheduledPublishDate: new Date().toISOString().split("T")[0],
      assignmentStatus: "Published",
      totalPoints: 100,
      passingScore: 60,
      allowLateSubmission: true,
      allowResubmission: true,
      attachments: [
        {
          id: "att-pdf-1",
          name: "BrightPath_Phonics_Vowel_Blends_Worksheet.pdf",
          type: "pdf",
          url: "/logo.png",
          sizeLabel: "PDF Worksheet • 240 KB",
        },
      ],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      questions: [
        {
          id: "q1",
          type: "multiple-choice",
          markingMethod: "automatic",
          prompt: "Which of these words contains a long 'EA' vowel sound as in 'READ'?",
          options: ["Bread", "Dream", "Head", "Heavy"],
          correctAnswer: "Dream",
          points: 10,
          skillTag: "Phonics & Vowel Blends",
        },
        {
          id: "q2",
          type: "true-false",
          markingMethod: "automatic",
          prompt: "True or False: The word 'MAGNIFICENT' has 4 syllables (Mag-nif-i-cent).",
          options: ["True", "False"],
          correctAnswer: "True",
          points: 10,
          skillTag: "Syllable Division",
        },
        {
          id: "q3",
          type: "fill-in-blank",
          markingMethod: "automatic-accepted-rules",
          prompt: "Fill in the missing word: Every sentence must begin with a _______ letter and end with a full stop.",
          correctAnswer: "capital",
          acceptedAnswers: ["capital", "capitalized", "uppercase", "big"],
          points: 10,
          skillTag: "Grammar & Punctuation",
        },
        {
          id: "q4",
          type: "matching",
          markingMethod: "automatic",
          prompt: "Match each word on the left with its correct meaning or opposite on the right:",
          matchingPairs: [
            { left: "Courage", right: "Bravery and confidence" },
            { left: "Ancient", right: "Very old" },
            { left: "Generous", right: "Kind and willing to share" },
          ],
          points: 15,
          skillTag: "Vocabulary Building",
        },
        {
          id: "q5",
          type: "spelling",
          markingMethod: "automatic",
          prompt: "Click 'Hear Word to Spell' and type the exact spelling of the word you hear:",
          spellingWord: "Confidence",
          correctAnswer: "Confidence",
          points: 10,
          skillTag: "Spelling Accuracy",
        },
        {
          id: "q6",
          type: "reading-comprehension",
          markingMethod: "ai-assisted-teacher-review",
          passageText:
            "Every bright morning, a little golden sunbird flew over the green garden in Abuja. It sang a sweet song and helped the colourful flowers bloom in the warm sunshine.",
          prompt:
            "Based on the short passage above, where did the little golden sunbird fly, and how did it help the garden?",
          points: 15,
          skillTag: "Reading Comprehension",
        },
        {
          id: "q7",
          type: "recorded-reading",
          markingMethod: "ai-assisted-teacher-review",
          passageText:
            "Great speakers stand tall, breathe calmly, and share their ideas with confidence and clarity.",
          prompt:
            "Record your voice reading the sentence above aloud clearly:",
          allowVoiceRecording: true,
          points: 15,
          skillTag: "Oral Reading Fluency",
        },
        {
          id: "q8",
          type: "handwriting",
          markingMethod: "ai-assisted-teacher-review",
          prompt:
            "Write the word 'BRIGHT PATH' neatly on the handwriting canvas below OR upload a clear photo of your handwritten notebook page:",
          allowDrawing: true,
          allowImageUpload: true,
          points: 15,
          skillTag: "Handwriting & Neatness",
        },
      ],
    },
    {
      id: "hw-math-102",
      title: "Mental Math, Number Patterns & Word Problem Challenge",
      subject: "Bright Math - Conceptual Mathematics",
      topic: "Number Sequences, Multiplication & Multi-Step Word Problems",
      description:
        "Practice rapid mental calculation, fill in the missing number, and show your step-by-step working (type, draw on the pad, or upload a photo of your rough work).",
      audioInstructionText:
        "Solve each math problem carefully. You can use the drawing pad or upload a picture of your notebook to show your working steps!",
      courseName: "Bright Math - Conceptual Mathematics",
      grade: "All Grades",
      targetType: "all",
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
      scheduledPublishDate: new Date().toISOString().split("T")[0],
      assignmentStatus: "Published",
      totalPoints: 100,
      passingScore: 65,
      allowLateSubmission: true,
      allowResubmission: true,
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      questions: [
        {
          id: "m1",
          type: "multiple-choice",
          markingMethod: "automatic",
          prompt: "What number comes next in the pattern: 6, 12, 18, 24, ___?",
          options: ["28", "30", "32", "36"],
          correctAnswer: "30",
          points: 30,
          skillTag: "Number Patterns",
        },
        {
          id: "m2",
          type: "fill-in-blank",
          markingMethod: "automatic-accepted-rules",
          prompt: "If one notebook costs 450 Naira, how much do 3 notebooks cost in Naira?",
          correctAnswer: "1350",
          acceptedAnswers: ["1350", "1,350", "1350 naira", "1,350 naira", "n1350"],
          points: 30,
          skillTag: "Multiplication",
        },
        {
          id: "m3",
          type: "creative-writing",
          markingMethod: "teacher-with-ai-suggestions",
          prompt:
            "Zainab read 14 pages on Monday and 18 pages on Tuesday. If her book has 50 pages in total, how many pages does she have left to read? Explain your steps or draw your working.",
          allowDrawing: true,
          allowImageUpload: true,
          points: 40,
          skillTag: "Word Problem Reasoning",
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
        "Open your Homework Center to listen to audio instructions, complete interactive questions, draw on the canvas, upload handwritten work, or record your reading aloud!",
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
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
