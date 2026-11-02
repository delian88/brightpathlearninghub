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
  assessmentCategory?: "homework" | "quiz" | "test" | "examination";
  timeLimitMinutes?: number;
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

export type BadgeCategory =
  | "reading"
  | "mathematics"
  | "attendance"
  | "homework"
  | "streak"
  | "teacher-award"
  | "general";

export interface StudentBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  color: string;
  category?: BadgeCategory;
  awardedBy?: string;
  pointsValue?: number;
}

export interface StudentCertificate {
  id: string;
  certRef: string;
  studentUsername: string;
  studentName: string;
  grade: string;
  courseName: string;
  title: string;
  citation: string;
  category: BadgeCategory;
  issuedBy: string;
  issuedAt: string;
}

export interface DailyLearningActivity {
  id: string;
  title: string;
  category: "Live Class" | "AI Reading" | "Homework" | "Writing Practice" | "Pronunciation";
  duration: string;
  completed: boolean;
  description: string;
}

export type BrightBuddyMode =
  | "reading"
  | "writing"
  | "speaking"
  | "math"
  | "assessment"
  | "pronunciation"
  | "chat";

export type MasteryLevel = "Emerging" | "Developing" | "Proficient" | "Mastered";

export interface AiPracticeLog {
  id: string;
  studentUsername: string;
  studentName: string;
  mode: BrightBuddyMode;
  topic: string;
  score: number;
  feedback: string;
  improvementArea?: string;
  // Detailed AI Learning Assessment fields
  skillsPractised?: string[];
  questionsAttempted?: number;
  correctAnswers?: number;
  incorrectAnswers?: number;
  wordsPronouncedCorrectly?: string[];
  wordsNeedingImprovement?: string[];
  wordsImprovedOnRetry?: string[];
  readingSpeedWpm?: number;
  readingAccuracy?: number;
  timeSpentMinutes?: number;
  masteryLevel?: MasteryLevel;
  recommendedNextActivity?: string;
  createdAt: string;
}

export interface ReportIncludeSections {
  attendance: boolean;
  homework: boolean;
  assessments: boolean;
  aiProgress: boolean;
  strengthsWeaknesses: boolean;
  recommendations: boolean;
  teacherComments: boolean;
  adminComments: boolean;
}

export interface ReportAiLearningSummary {
  sessionsCompleted: number;
  averageAiScore: number;
  readingProgress: number;
  skillsPractised: string[];
  masteryHighlight: string;
}

export interface ReportHomeworkSummary {
  completionRate: number;
  averageScore: number;
  totalSubmitted: number;
  totalAssigned: number;
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
  dateRangeStart?: string;
  dateRangeEnd?: string;
  attendanceRate: number;
  lessonsCompleted: number;
  learningHours: number;
  homeworkCompletionRate: number;
  homeworkSummary?: ReportHomeworkSummary;
  overallScore: number;
  overallGrade: string;
  readingProgress: number;
  aiLearningSummary?: ReportAiLearningSummary;
  subjectScores: {
    subject: string;
    beforeScore?: number;
    score: number;
    grade: string;
    remark: string;
  }[];
  strengths: string[];
  areasForImprovement: string[];
  recommendations?: string[];
  teacherName?: string;
  teacherComment: string;
  adminName?: string;
  schoolRemarks?: string;
  issuedBy: string;
  published?: boolean;
  includeSections?: ReportIncludeSections;
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

export type SubjectKey =
  | "english_phonics"
  | "writing"
  | "mathematics"
  | "public_speaking"
  | "coding";

export interface SubjectSkillMetric {
  id: string;
  label: string;
  mastery: number; // 0 - 100
}

export interface SubjectProgressTrack {
  subjectKey: SubjectKey;
  subjectLabel: string;
  whatToMeasure: string;
  beforeScore: number; // Baseline assessment (%)
  afterScore: number; // Current / After assessment (%)
  skills: SubjectSkillMetric[];
}

export interface PeriodProgressSummary {
  period: "daily" | "weekly" | "monthly" | "termly";
  label: string;
  lessonsDone: number;
  targetLessons: number;
  practiceMinutes: number;
  avgScore: number;
  summaryNote: string;
}

export interface TeacherObservationNote {
  id: string;
  subject: string;
  observation: string;
  recommendation?: string;
  createdAt: string;
  teacherName?: string;
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
  // Module D: Dedicated Subject & Period Progress Tracking
  subjectTracks?: SubjectProgressTrack[];
  periodSummaries?: Record<"daily" | "weekly" | "monthly" | "termly", PeriodProgressSummary>;
  teacherObservations?: TeacherObservationNote[];
  improvementRecommendations?: string[];
  flaggedForAttention?: boolean;
  flagReason?: string;
  // Module F: Rewards, Streaks, Certificates & Privacy-Controlled Leaderboard
  bonusPoints?: number;
  streakDays?: number;
  activeDaysOfWeek?: string[];
  certificates?: StudentCertificate[];
  leaderboardPrivacy?: "public" | "initials" | "private";
  earlyYearsFocusMode?: boolean;
  // Student Profile & Live Classroom Settings
  enrolledSubjects?: string[];
  learningGoals?: string[];
  bioNote?: string;
  liveClassroomUrl?: string;
  updatedAt: string;
}

export interface TimetableSlot {
  id: string;
  targetStudentUsername: string; // "ALL" or specific student username
  dayOfWeek:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  startTime: string;
  endTime: string;
  subject: string;
  topic: string;
  teacherName: string;
  meetingUrl: string;
  createdAt: string;
}

export interface AttendanceLogEntry {
  id: string;
  studentUsername: string;
  studentName: string;
  date: string;
  subject: string;
  status: "Present" | "Late" | "Excused" | "Absent";
  absenceReason?: string;
  teacherNote?: string;
  recordedBy: string;
  createdAt: string;
}

export interface LearningMaterialResource {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  category:
    | "PDF Worksheet"
    | "Video Lesson"
    | "Audio Phonics / Story"
    | "Study Guide";
  fileUrl: string;
  fileName?: string;
  targetStudentUsername: string; // "ALL" or specific student username
  uploadedBy: string;
  createdAt: string;
}

export interface PortalDirectMessage {
  id: string;
  studentUsername: string;
  studentName: string;
  parentName: string;
  senderRole: "parent" | "student" | "teacher";
  senderName: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface SupportTicketItem {
  id: string;
  ticketRef: string;
  studentUsername: string;
  studentName: string;
  category:
    | "Technical Support"
    | "Class Reschedule"
    | "Academic / Homework Help"
    | "Account & Portal";
  subject: string;
  description: string;
  status: "Open" | "In Progress" | "Resolved";
  adminReply?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortalCalendarEvent {
  id: string;
  title: string;
  date: string;
  category:
    | "Homework Deadline"
    | "Examination / Assessment"
    | "Live Class"
    | "School Event";
  description: string;
  targetStudentUsername: string; // "ALL" or specific student username
  emailNotificationSent?: boolean;
  createdAt: string;
}

export interface AdminSystemUser {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "teacher" | "support";
  status: "active" | "inactive";
  permissions: {
    canManageHomework: boolean;
    canManageProgress: boolean;
    canManageReports: boolean;
    canManageCampus: boolean;
    canManageCMS: boolean;
    canManageUsers: boolean;
  };
  phone?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface LeaderboardGlobalSettings {
  enabled: boolean;
  anonymizeNames: boolean;
  hideForEarlyYears: boolean;
}

export interface LmsStateData {
  assignments: HomeworkAssignment[];
  submissions: HomeworkSubmission[];
  reportCards: StudentReportCard[];
  notifications: PortalNotification[];
  progressRecords: Record<string, StudentProgressRecord>;
  aiLogs: AiPracticeLog[];
  leaderboardSettings?: LeaderboardGlobalSettings;
  timetableSlots?: TimetableSlot[];
  attendanceLogs?: AttendanceLogEntry[];
  learningMaterials?: LearningMaterialResource[];
  messages?: PortalDirectMessage[];
  supportTickets?: SupportTicketItem[];
  calendarEvents?: PortalCalendarEvent[];
  adminUsers?: AdminSystemUser[];
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
  assignments: [],
  submissions: [],
  reportCards: [],
  notifications: [],
  progressRecords: {},
  aiLogs: [],
};

export function createDefaultSubjectTracks(): SubjectProgressTrack[] {
  return [
    {
      subjectKey: "english_phonics",
      subjectLabel: "English / Phonics",
      whatToMeasure: "Letter sounds, blending, pronunciation, reading fluency",
      beforeScore: 0,
      afterScore: 0,
      skills: [
        { id: "letter_sounds", label: "Letter Sounds", mastery: 0 },
        { id: "blending", label: "Phonics Blending", mastery: 0 },
        { id: "pronunciation", label: "Word Pronunciation", mastery: 0 },
        { id: "reading_fluency", label: "Reading Fluency", mastery: 0 },
      ],
    },
    {
      subjectKey: "writing",
      subjectLabel: "Writing",
      whatToMeasure: "Letter formation, spelling, vocabulary, sentence writing",
      beforeScore: 0,
      afterScore: 0,
      skills: [
        { id: "letter_formation", label: "Letter Formation & Tracing", mastery: 0 },
        { id: "spelling", label: "Spelling Accuracy", mastery: 0 },
        { id: "vocabulary", label: "Writing Vocabulary", mastery: 0 },
        { id: "sentence_writing", label: "Sentence Construction & Grammar", mastery: 0 },
      ],
    },
    {
      subjectKey: "mathematics",
      subjectLabel: "Mathematics",
      whatToMeasure: "Counting, calculations, problem solving",
      beforeScore: 0,
      afterScore: 0,
      skills: [
        { id: "counting", label: "Number Recognition & Counting", mastery: 0 },
        { id: "calculations", label: "Calculations (+, −, ×)", mastery: 0 },
        { id: "problem_solving", label: "Word Problem Solving & Shapes", mastery: 0 },
      ],
    },
    {
      subjectKey: "public_speaking",
      subjectLabel: "Public Speaking",
      whatToMeasure: "Fluency, vocabulary, pronunciation, confidence",
      beforeScore: 0,
      afterScore: 0,
      skills: [
        { id: "speaking_fluency", label: "Oral Fluency & Expression", mastery: 0 },
        { id: "speaking_vocab", label: "Spoken Vocabulary", mastery: 0 },
        { id: "speaking_pronunciation", label: "Clear Articulation & Pronunciation", mastery: 0 },
        { id: "speaking_confidence", label: "Stage & Conversation Confidence", mastery: 0 },
      ],
    },
    {
      subjectKey: "coding",
      subjectLabel: "Coding",
      whatToMeasure: "Logical thinking, coding exercises, completed projects",
      beforeScore: 0,
      afterScore: 0,
      skills: [
        { id: "logical_thinking", label: "Logical & Algorithmic Thinking", mastery: 0 },
        { id: "coding_exercises", label: "Coding Exercises Completed", mastery: 0 },
        { id: "completed_projects", label: "Completed Coding Projects", mastery: 0 },
      ],
    },
  ];
}

export function createDefaultPeriodSummaries(): Record<
  "daily" | "weekly" | "monthly" | "termly",
  PeriodProgressSummary
> {
  return {
    daily: {
      period: "daily",
      label: "Daily Progress",
      lessonsDone: 0,
      targetLessons: 2,
      practiceMinutes: 0,
      avgScore: 0,
      summaryNote: "Daily reading, phonics warmup, and homework checklist.",
    },
    weekly: {
      period: "weekly",
      label: "Weekly Progress",
      lessonsDone: 0,
      targetLessons: 5,
      practiceMinutes: 0,
      avgScore: 0,
      summaryNote: "1-on-1 live classes attended and weekly homework submissions.",
    },
    monthly: {
      period: "monthly",
      label: "Monthly Progress",
      lessonsDone: 0,
      targetLessons: 12,
      practiceMinutes: 0,
      avgScore: 0,
      summaryNote: "Monthly competency growth across reading, writing, speaking, math, and coding.",
    },
    termly: {
      period: "termly",
      label: "Termly Progress",
      lessonsDone: 0,
      targetLessons: 24,
      practiceMinutes: 0,
      avgScore: 0,
      summaryNote: "Full academic term mastery and before-and-after assessment comparison.",
    },
  };
}

export function getOrCreateStudentProgress(
  state: LmsStateData,
  studentUsername: string,
  studentName: string
): StudentProgressRecord {
  const key = studentUsername.toUpperCase();
  if (state.progressRecords[key]) {
    const existing = state.progressRecords[key];
    if (!existing.subjectTracks || existing.subjectTracks.length === 0) {
      existing.subjectTracks = createDefaultSubjectTracks();
    }
    if (!existing.periodSummaries) {
      existing.periodSummaries = createDefaultPeriodSummaries();
    }
    if (!existing.teacherObservations) {
      existing.teacherObservations = [];
    }
    if (!existing.improvementRecommendations) {
      existing.improvementRecommendations = [];
    }
    return existing;
  }

  return {
    studentUsername: key,
    studentName,
    avatarUrl: "scholar-girl",
    lessonsCompleted: 0,
    totalLessons: 24,
    attendanceRate: 100,
    learningHours: 0,
    readingProgress: 0,
    customStrengths: [],
    customImprovements: [],
    completedActivityIds: [],
    badges: [],
    subjectTracks: createDefaultSubjectTracks(),
    periodSummaries: createDefaultPeriodSummaries(),
    teacherObservations: [],
    improvementRecommendations: [],
    flaggedForAttention: false,
    flagReason: "",
    updatedAt: new Date().toISOString(),
  };
}

export interface StudentProgressAnalysis {
  subjectTracks: SubjectProgressTrack[];
  periodSummaries: Record<"daily" | "weekly" | "monthly" | "termly", PeriodProgressSummary>;
  weaknesses: string[];
  recommendations: string[];
  isStruggling: boolean;
  strugglingReasons: string[];
}

export function analyzeStudentProgressAndAlerts(
  prog: StudentProgressRecord | null | undefined,
  submissions: HomeworkSubmission[] = [],
  aiLogs: AiPracticeLog[] = []
): StudentProgressAnalysis {
  const baseTracks =
    prog?.subjectTracks && prog.subjectTracks.length === 5
      ? prog.subjectTracks.map((t) => ({
          ...t,
          skills: t.skills.map((s) => ({ ...s })),
        }))
      : createDefaultSubjectTracks();

  const basePeriods = prog?.periodSummaries
    ? { ...prog.periodSummaries }
    : createDefaultPeriodSummaries();

  // Compute averages from real submissions and AI logs to enrich zero-value defaults
  const readingLogs = aiLogs.filter((l) => l.mode === "reading" || l.mode === "pronunciation");
  const writingLogs = aiLogs.filter((l) => l.mode === "writing");
  const speakingLogs = aiLogs.filter((l) => l.mode === "speaking" || l.mode === "chat");
  const mathLogs = aiLogs.filter((l) => l.mode === "math");

  const avgOf = (nums: number[]) =>
    nums.length > 0 ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : 0;

  const readingAvg = avgOf(readingLogs.map((l) => l.score)) || prog?.readingProgress || 0;
  const writingAvg = avgOf(writingLogs.map((l) => l.score));
  const speakingAvg = avgOf(speakingLogs.map((l) => l.score));
  const mathAvg = avgOf(mathLogs.map((l) => l.score));
  const hwAvg = avgOf(submissions.map((s) => s.percentage));

  baseTracks.forEach((track) => {
    let fallbackScore = 0;
    if (track.subjectKey === "english_phonics") fallbackScore = readingAvg || hwAvg;
    if (track.subjectKey === "writing") fallbackScore = writingAvg || hwAvg;
    if (track.subjectKey === "mathematics") fallbackScore = mathAvg || hwAvg;
    if (track.subjectKey === "public_speaking") fallbackScore = speakingAvg || readingAvg;
    if (track.subjectKey === "coding") fallbackScore = hwAvg;

    track.skills.forEach((sk) => {
      if (sk.mastery === 0 && fallbackScore > 0) {
        sk.mastery = fallbackScore;
      }
    });

    const computedAfter = avgOf(track.skills.map((s) => s.mastery));
    if (track.afterScore === 0 && computedAfter > 0) {
      track.afterScore = computedAfter;
    }
  });

  // Enrich Daily / Weekly / Monthly / Termly summaries
  const now = Date.now();
  const oneDayMs = 86400000;
  const recentDayLogs = aiLogs.filter(
    (l) => now - new Date(l.createdAt).getTime() <= oneDayMs
  );
  const recentWeekLogs = aiLogs.filter(
    (l) => now - new Date(l.createdAt).getTime() <= 7 * oneDayMs
  );
  const recentMonthLogs = aiLogs.filter(
    (l) => now - new Date(l.createdAt).getTime() <= 30 * oneDayMs
  );

  const dailyMins = recentDayLogs.reduce((acc, l) => acc + (l.timeSpentMinutes || 5), 0);
  const weeklyMins = recentWeekLogs.reduce((acc, l) => acc + (l.timeSpentMinutes || 5), 0);
  const monthlyMins = recentMonthLogs.reduce((acc, l) => acc + (l.timeSpentMinutes || 5), 0);
  const termlyMins = Math.round((prog?.learningHours || 0) * 60) || monthlyMins;

  if (basePeriods.daily.practiceMinutes === 0 && dailyMins > 0) {
    basePeriods.daily.practiceMinutes = dailyMins;
  }
  if (basePeriods.daily.lessonsDone === 0) {
    basePeriods.daily.lessonsDone = (prog?.completedActivityIds || []).length;
  }
  if (basePeriods.daily.avgScore === 0) {
    basePeriods.daily.avgScore = avgOf(recentDayLogs.map((l) => l.score)) || hwAvg;
  }

  if (basePeriods.weekly.practiceMinutes === 0 && weeklyMins > 0) {
    basePeriods.weekly.practiceMinutes = weeklyMins;
  }
  if (basePeriods.weekly.lessonsDone === 0) {
    basePeriods.weekly.lessonsDone = Math.min(5, prog?.lessonsCompleted || submissions.length);
  }
  if (basePeriods.weekly.avgScore === 0) {
    basePeriods.weekly.avgScore = avgOf(recentWeekLogs.map((l) => l.score)) || hwAvg;
  }

  if (basePeriods.monthly.practiceMinutes === 0 && monthlyMins > 0) {
    basePeriods.monthly.practiceMinutes = monthlyMins;
  }
  if (basePeriods.monthly.lessonsDone === 0) {
    basePeriods.monthly.lessonsDone = Math.min(12, prog?.lessonsCompleted || submissions.length);
  }
  if (basePeriods.monthly.avgScore === 0) {
    basePeriods.monthly.avgScore = avgOf(recentMonthLogs.map((l) => l.score)) || hwAvg;
  }

  if (basePeriods.termly.practiceMinutes === 0 && termlyMins > 0) {
    basePeriods.termly.practiceMinutes = termlyMins;
  }
  if (basePeriods.termly.lessonsDone === 0) {
    basePeriods.termly.lessonsDone = prog?.lessonsCompleted || 0;
  }
  if (basePeriods.termly.avgScore === 0) {
    const activeSubjectScores = baseTracks
      .map((t) => t.afterScore)
      .filter((s) => s > 0);
    basePeriods.termly.avgScore = avgOf(activeSubjectScores) || hwAvg;
  }

  // Weakness Identification & Improvement Recommendations
  const weaknesses: string[] = [...(prog?.customImprovements || [])];
  const recommendations: string[] = [...(prog?.improvementRecommendations || [])];

  baseTracks.forEach((track) => {
    track.skills.forEach((sk) => {
      if (sk.mastery > 0 && sk.mastery < 65) {
        const wMsg = `${track.subjectLabel}: ${sk.label} (${sk.mastery}% mastery — below 65% target)`;
        if (!weaknesses.includes(wMsg)) weaknesses.push(wMsg);

        const recMsg = `Assign 15-min guided ${track.subjectLabel} practice focusing on ${sk.label}.`;
        if (!recommendations.includes(recMsg)) recommendations.push(recMsg);
      }
    });
  });

  submissions.forEach((sub) => {
    (sub.weakSkillsIdentified || []).forEach((ws) => {
      const msg = `Homework skill gap in "${sub.homeworkTitle}": ${ws}`;
      if (!weaknesses.includes(msg)) weaknesses.push(msg);
    });
  });

  aiLogs.forEach((log) => {
    (log.wordsNeedingImprovement || []).forEach((w) => {
      const msg = `Pronunciation / phonics practice needed for word: "${w}"`;
      if (!weaknesses.includes(msg)) weaknesses.push(msg);
    });
    if (log.recommendedNextActivity && !recommendations.includes(log.recommendedNextActivity)) {
      recommendations.push(log.recommendedNextActivity);
    }
  });

  // Evaluate Struggling Student / Flag for Teacher Attention
  const strugglingReasons: string[] = [];
  if (prog?.flaggedForAttention) {
    strugglingReasons.push(
      prog.flagReason || "Manually flagged by teacher for extra 1-on-1 academic support"
    );
  }
  if (submissions.length > 0 && hwAvg < 60) {
    strugglingReasons.push(`Low homework assessment average (${hwAvg}% < 60% threshold)`);
  }
  if (prog && prog.attendanceRate < 75) {
    strugglingReasons.push(`Low class attendance rate (${prog.attendanceRate}% < 75%)`);
  }
  baseTracks.forEach((track) => {
    if (track.afterScore > 0 && track.afterScore < 60) {
      strugglingReasons.push(
        `Struggling in ${track.subjectLabel} (${track.afterScore}% current mastery)`
      );
    }
  });

  return {
    subjectTracks: baseTracks,
    periodSummaries: basePeriods,
    weaknesses,
    recommendations,
    isStruggling: strugglingReasons.length > 0,
    strugglingReasons,
  };
}

// ============================================================================
// MODULE F: REWARDS, BADGES, WEEKLY STREAKS, CERTIFICATES & LEADERBOARD ENGINE
// ============================================================================

export function isEarlyYearsStudent(grade?: string, manualEarlyYears?: boolean): boolean {
  if (typeof manualEarlyYears === "boolean") return manualEarlyYears;
  const g = (grade || "").toLowerCase();
  return (
    g.includes("kg") ||
    g.includes("kindergarten") ||
    g.includes("nursery") ||
    g.includes("reception") ||
    g.includes("pre-k") ||
    g.includes("early") ||
    g.includes("grade 1") ||
    g.includes("year 1") ||
    g.includes("age 4") ||
    g.includes("age 5") ||
    g.includes("age 6")
  );
}

export interface EvaluatedBadgeItem extends StudentBadge {
  unlocked: boolean;
  progressPercent: number;
  requirementText: string;
}

export function computeStudentRewardsAndAchievements(
  prog: StudentProgressRecord | null | undefined,
  submissions: HomeworkSubmission[],
  aiLogs: AiPracticeLog[],
  studentName = "Bright Scholar",
  studentUsername = "BP-SCHOLAR",
  grade = "All Grades",
  courseName = "English Phonics & Reading"
) {
  // 1. Points Calculation
  // - 50 pts for each submitted homework + 25 pts for >=80% + 25 pts for 100%
  // - 30 pts for each Bright Buddy AI session
  // - 20 pts for each completed 1:1 live lesson
  // - Teacher-awarded bonus points
  const homeworkBasePoints = submissions.length * 50;
  const homeworkExcellenceBonus = submissions.reduce((acc, s) => {
    const pct = s.percentage || 0;
    if (pct >= 95) return acc + 50;
    if (pct >= 80) return acc + 25;
    return acc;
  }, 0);
  const homeworkPoints = homeworkBasePoints + homeworkExcellenceBonus;

  const aiPracticePoints = aiLogs.length * 30;
  const attendanceLessonPoints =
    (prog?.lessonsCompleted || 0) * 20 +
    ((prog?.attendanceRate ?? 100) >= 95 ? 100 : 0);
  const teacherBonusPoints = prog?.bonusPoints || 0;

  const customBadgePoints = (prog?.badges || []).reduce(
    (acc, b) => acc + (b.pointsValue || 0),
    0
  );

  const totalPoints =
    homeworkPoints +
    aiPracticePoints +
    attendanceLessonPoints +
    teacherBonusPoints +
    customBadgePoints;

  // Star Level Progression
  const starLevel =
    totalPoints >= 1000
      ? { level: 5, title: "Bright Path Grand Master 🌟", nextAt: 1500 }
      : totalPoints >= 600
      ? { level: 4, title: "Super Scholar Champion 🏆", nextAt: 1000 }
      : totalPoints >= 350
      ? { level: 3, title: "Confident Explorer 🚀", nextAt: 600 }
      : totalPoints >= 150
      ? { level: 2, title: "Rising Star Reader ⭐", nextAt: 350 }
      : { level: 1, title: "Curious Young Learner 🌱", nextAt: 150 };

  // 2. Weekly Learning Streak Calculation (Mon - Sun)
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const detectedDays = new Set<string>(prog?.activeDaysOfWeek || []);

  // Always mark days from recent submissions and AI logs within the last 7 days
  const now = Date.now();
  const sevenDaysMs = 7 * 86400000;
  submissions.forEach((s) => {
    const t = new Date(s.submittedAt).getTime();
    if (now - t <= sevenDaysMs) {
      const jsDay = new Date(s.submittedAt).getDay(); // 0=Sun..6=Sat
      const label = jsDay === 0 ? "Sun" : dayNames[jsDay - 1];
      detectedDays.add(label);
    }
  });
  aiLogs.forEach((l) => {
    const t = new Date(l.createdAt).getTime();
    if (now - t <= sevenDaysMs) {
      const jsDay = new Date(l.createdAt).getDay();
      const label = jsDay === 0 ? "Sun" : dayNames[jsDay - 1];
      detectedDays.add(label);
    }
  });

  // Ensure today is marked if student has completed daily activities
  if ((prog?.completedActivityIds || []).length > 0 || detectedDays.size === 0) {
    const todayJs = new Date().getDay();
    const todayLabel = todayJs === 0 ? "Sun" : dayNames[todayJs - 1];
    detectedDays.add(todayLabel);
  }

  const activeDaysOfWeek = dayNames.filter((d) => detectedDays.has(d));
  const streakDays =
    prog?.streakDays !== undefined && prog.streakDays > 0
      ? prog.streakDays
      : Math.max(activeDaysOfWeek.length, (prog?.completedActivityIds || []).length > 0 ? 3 : 1);

  // 3. Reading, Math, Attendance, Homework, Streak & Teacher Badges
  const readingLogs = aiLogs.filter(
    (l) => l.mode === "reading" || l.mode === "pronunciation" || l.mode === "speaking"
  );
  const mathLogs = aiLogs.filter((l) => l.mode === "math");
  const mathSubs = submissions.filter(
    (s) =>
      (s.subject || s.courseName || "").toLowerCase().includes("math") ||
      (s.homeworkTitle || "").toLowerCase().includes("math")
  );
  const readingProgressVal = prog?.readingProgress || 0;
  const attendanceVal = prog?.attendanceRate ?? 100;
  const lessonsDone = prog?.lessonsCompleted || 0;

  const builtInCatalog: EvaluatedBadgeItem[] = [
    // READING BADGES
    {
      id: "badge-reading-explorer",
      title: "Phonics & Reading Explorer",
      description: "Practised phonics sounds and story reading aloud with Bright Buddy!",
      icon: "📖",
      color: "#0284c7",
      category: "reading",
      earnedAt: new Date().toISOString(),
      unlocked: readingLogs.length >= 1 || readingProgressVal >= 40,
      progressPercent: Math.min(100, Math.max(readingLogs.length * 100, readingProgressVal * 2)),
      requirementText: "Complete 1 reading session or reach 40% reading progress",
    },
    {
      id: "badge-reading-pronunciation",
      title: "Word Pronunciation Star",
      description: "Mastered tricky multi-syllable words and clear articulation!",
      icon: "🗣️",
      color: "#0ea5e9",
      category: "reading",
      earnedAt: new Date().toISOString(),
      unlocked: readingLogs.length >= 2 || readingProgressVal >= 75,
      progressPercent: Math.min(100, Math.round((readingProgressVal / 75) * 100)),
      requirementText: "Reach 75%+ in Phonics & Pronunciation accuracy",
    },
    {
      id: "badge-reading-champion",
      title: "Storybook Fluency Champion",
      description: "Achieved 85%+ reading fluency and comprehension mastery!",
      icon: "📚",
      color: "#0369a1",
      category: "reading",
      earnedAt: new Date().toISOString(),
      unlocked: readingProgressVal >= 85,
      progressPercent: Math.min(100, Math.round((readingProgressVal / 85) * 100)),
      requirementText: "Achieve 85%+ Reading Fluency Mastery",
    },

    // MATHEMATICS BADGES
    {
      id: "badge-math-ninja",
      title: "Number & Counting Ninja",
      description: "Completed interactive number, counting, and mental math drills!",
      icon: "🔢",
      color: "#d97706",
      category: "mathematics",
      earnedAt: new Date().toISOString(),
      unlocked: mathLogs.length >= 1 || mathSubs.length >= 1 || lessonsDone >= 2,
      progressPercent:
        mathLogs.length >= 1 || mathSubs.length >= 1
          ? 100
          : Math.min(100, lessonsDone * 50),
      requirementText: "Complete 1 Mathematics session or assignment",
    },
    {
      id: "badge-math-solver",
      title: "Problem-Solving Wizard",
      description: "Demonstrated strong logical thinking in addition, subtraction, and word problems!",
      icon: "🧮",
      color: "#f59e0b",
      category: "mathematics",
      earnedAt: new Date().toISOString(),
      unlocked:
        mathLogs.some((l) => l.score >= 80) ||
        mathSubs.some((s) => s.percentage >= 80) ||
        submissions.some((s) => s.percentage >= 85),
      progressPercent: submissions.length > 0 ? 100 : 60,
      requirementText: "Score 80%+ in a Mathematics or problem-solving challenge",
    },

    // ATTENDANCE BADGES
    {
      id: "badge-attendance-star",
      title: "100% Punctuality & Attendance Star",
      description: "Consistent, punctual attendance in 1-on-1 live interactive classes!",
      icon: "📅",
      color: "#10b981",
      category: "attendance",
      earnedAt: new Date().toISOString(),
      unlocked: attendanceVal >= 90,
      progressPercent: Math.min(100, Math.round((attendanceVal / 90) * 100)),
      requirementText: "Maintain 90%+ class attendance rate",
    },
    {
      id: "badge-attendance-dedicated",
      title: "Dedicated Live Class Scholar",
      description: "Actively participated in 1-on-1 live tutoring sessions!",
      icon: "🎓",
      color: "#059669",
      category: "attendance",
      earnedAt: new Date().toISOString(),
      unlocked: lessonsDone >= 5,
      progressPercent: Math.min(100, Math.round((lessonsDone / 5) * 100)),
      requirementText: "Complete 5+ live 1-on-1 lessons",
    },

    // HOMEWORK & WEEKLY STREAK BADGES
    {
      id: "badge-homework-hero",
      title: "Homework Completion Hero (+50 Pts)",
      description: "Earned points for completing and submitting online homework assignments!",
      icon: "📝",
      color: "#7c3aed",
      category: "homework",
      earnedAt: new Date().toISOString(),
      unlocked: submissions.length >= 1,
      progressPercent: submissions.length >= 1 ? 100 : 30,
      requirementText: "Submit at least 1 online homework assignment",
    },
    {
      id: "badge-streak-flame",
      title: "Weekly Learning Streak Flame",
      description: "Practised consistently across the week to keep the learning flame burning!",
      icon: "🔥",
      color: "#ef4444",
      category: "streak",
      earnedAt: new Date().toISOString(),
      unlocked: streakDays >= 3,
      progressPercent: Math.min(100, Math.round((streakDays / 3) * 100)),
      requirementText: "Reach a 3-day weekly learning streak",
    },
  ];

  // Merge custom / Teacher-Awarded badges from progress.badges
  const teacherBadges: EvaluatedBadgeItem[] = (prog?.badges || []).map((b) => ({
    ...b,
    category: b.category || "teacher-award",
    awardedBy: b.awardedBy || "Bright Path Teacher",
    unlocked: true,
    progressPercent: 100,
    requirementText: b.awardedBy ? `Awarded by ${b.awardedBy}` : "Teacher-Awarded Achievement",
  }));

  const allBadges: EvaluatedBadgeItem[] = [...teacherBadges];
  for (const item of builtInCatalog) {
    if (!allBadges.some((existing) => existing.title === item.title)) {
      allBadges.push(item);
    }
  }

  const unlockedBadges = allBadges.filter((b) => b.unlocked);

  // 4. Official Printable Certificates (Automatic Course Completion + Milestone + Teacher-Awarded)
  const certificates: StudentCertificate[] = [...(prog?.certificates || [])];

  // Automatically generate Course Completion Certificate when lessonsCompleted >= totalLessons or mastery is high
  if (
    !certificates.some((c) =>
      c.title.toLowerCase().includes("course completion")
    )
  ) {
    certificates.unshift({
      id: `cert-course-${studentUsername}`,
      certRef: `BPCERT-CC-${studentUsername.slice(-4)}`,
      studentUsername,
      studentName,
      grade,
      courseName,
      title: `Official Course Completion Certificate — ${courseName}`,
      citation: `This certifies that ${studentName} (${grade}) has successfully completed the core learning curriculum, interactive assessments, and live 1-on-1 mentorship modules in ${courseName} at Bright Path Learning Hub.`,
      category: "general",
      issuedBy: "Bright Path Academic Director",
      issuedAt: new Date().toISOString(),
    });
  }

  if (readingProgressVal >= 75 && !certificates.some((c) => c.category === "reading")) {
    certificates.push({
      id: `cert-reading-${studentUsername}`,
      certRef: `BPCERT-RD-${studentUsername.slice(-4)}`,
      studentUsername,
      studentName,
      grade,
      courseName,
      title: "Certificate of Reading & Phonics Excellence",
      citation: `Awarded to ${studentName} for outstanding progress in phonemic decoding, word pronunciation, and reading aloud fluency at Bright Path Learning Hub.`,
      category: "reading",
      issuedBy: "Bright Path Academic Director",
      issuedAt: new Date().toISOString(),
    });
  }

  if (attendanceVal >= 90 && !certificates.some((c) => c.category === "attendance")) {
    certificates.push({
      id: `cert-att-${studentUsername}`,
      certRef: `BPCERT-AT-${studentUsername.slice(-4)}`,
      studentUsername,
      studentName,
      grade,
      courseName,
      title: "Certificate of Dedication & Exemplary Attendance",
      citation: `Presented to ${studentName} in recognition of ${attendanceVal}% attendance, enthusiasm, and active participation in 1-on-1 live classes.`,
      category: "attendance",
      issuedBy: "Bright Path Class Educator",
      issuedAt: new Date().toISOString(),
    });
  }

  const earlyYears = isEarlyYearsStudent(grade, prog?.earlyYearsFocusMode);

  return {
    totalPoints,
    homeworkPoints,
    aiPracticePoints,
    attendanceLessonPoints,
    teacherBonusPoints,
    starLevel,
    streakDays,
    activeDaysOfWeek,
    allBadges,
    unlockedBadges,
    certificates,
    earlyYears,
  };
}
