"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  BookOpen,
  PenTool,
  MessageCircle,
  Calculator,
  Award,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Upload,
  Play,
  HelpCircle,
} from "lucide-react";
import {
  BRIGHT_BUDDY_STORIES,
  ALPHABET_PHONICS,
  WORD_FORMATION_EXERCISES,
  PICTURE_TO_WORD_EXERCISES,
  SENTENCE_CONSTRUCTION_PUZZLES,
  GRAMMAR_MINI_LESSONS,
  SUPERSPEAKERS_ACTIVITIES,
  MATH_SHAPES_LIBRARY,
  MATH_WORD_PROBLEMS,
} from "@/lib/brightBuddyData";
import {
  PRONUNCIATION_WORDS,
  WRITING_PROMPTS,
  type AiPracticeLog,
  type BrightBuddyMode,
  type MasteryLevel,
} from "@/lib/lmsData";
import type { ToastType } from "@/components/ToastNotification";

interface BrightBuddyModuleProps {
  studentUsername: string;
  studentName: string;
  aiLogs: AiPracticeLog[];
  initialMode?: BrightBuddyMode;
  onSessionSaved: () => void;
  showToast: (message: string, type?: ToastType) => void;
}

export default function BrightBuddyModule({
  studentUsername,
  studentName,
  aiLogs,
  initialMode = "reading",
  onSessionSaved,
  showToast,
}: BrightBuddyModuleProps) {
  const [activePillar, setActivePillar] = useState<
    "reading" | "writing" | "speaking" | "math" | "assessment"
  >(
    initialMode === "pronunciation" || initialMode === "chat"
      ? "speaking"
      : initialMode === "writing" ||
        initialMode === "math" ||
        initialMode === "assessment"
      ? initialMode
      : "reading"
  );

  // Voice & Speech Synthesis State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListeningCommand, setIsListeningCommand] = useState(false);
  const [voiceCommandTranscript, setVoiceCommandTranscript] = useState("");
  const [buddyGreeting, setBuddyGreeting] = useState(
    `Hi ${studentName.split(" ")[0]}! I am Bright Buddy, your patient learning companion. Press the microphone and say "Bright Buddy, I want to read a story" or pick any learning adventure below!`
  );

  // Live Session Assessment Tracker (Module 5)
  const sessionStartRef = useRef<number>(Date.now());
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(1);
  const [skillsPractised, setSkillsPractised] = useState<string[]>([
    "Story Reading & Phonics",
  ]);
  const [questionsAttempted, setQuestionsAttempted] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState<number>(0);
  const [wordsPronouncedCorrectly, setWordsPronouncedCorrectly] = useState<string[]>([]);
  const [wordsNeedingImprovement, setWordsNeedingImprovement] = useState<string[]>([]);
  const [wordsImprovedOnRetry, setWordsImprovedOnRetry] = useState<string[]>([]);
  const [readingSpeedWpm, setReadingSpeedWpm] = useState<number | undefined>(undefined);
  const [readingAccuracy, setReadingAccuracy] = useState<number | undefined>(undefined);
  const [savingAssessment, setSavingAssessment] = useState(false);

  // ============================================================================
  // 1. AI READING ASSISTANT STATE
  // ============================================================================
  const [storyIdx, setStoryIdx] = useState(0);
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [isReadingMicOn, setIsReadingMicOn] = useState(false);
  const [readingStartTime, setReadingStartTime] = useState<number | null>(null);
  const [childSpokenSentence, setChildSpokenSentence] = useState("");
  const [struggledWord, setStruggledWord] = useState<string | null>(null);
  const [struggledSyllables, setStruggledSyllables] = useState<string>("");
  const [buddyReadingCoachMsg, setBuddyReadingCoachMsg] = useState<string>("");
  const [retryImproved, setRetryImproved] = useState<boolean | null>(null);
  const [storyQuizAnswers, setStoryQuizAnswers] = useState<Record<string, string>>({});
  const [storyQuizFeedback, setStoryQuizFeedback] = useState<Record<string, string>>({});

  // ============================================================================
  // 2. AI WRITING ASSISTANT STATE
  // ============================================================================
  const [writingSubTab, setWritingSubTab] = useState<
    "alphabet" | "tracing" | "words-spelling" | "picture-sentence" | "grammar-handwriting"
  >("tracing");
  const [selectedAlphaIdx, setSelectedAlphaIdx] = useState(0);
  const [alphaQuizTarget, setAlphaQuizTarget] = useState(ALPHABET_PHONICS[0]);
  const [alphaQuizMsg, setAlphaQuizMsg] = useState("");
  const [traceCase, setTraceCase] = useState<"upper" | "lower" | "both">("both");
  const [traceStrokeCount, setTraceStrokeCount] = useState(0);
  const traceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  const [wordFormIdx, setWordFormIdx] = useState(0);
  const [builtWord, setBuiltWord] = useState("");
  const [wordFormFeedback, setWordFormFeedback] = useState("");
  const [spellingIdx, setSpellingIdx] = useState(0);
  const [spellingInput, setSpellingInput] = useState("");
  const [spellingCoachMsg, setSpellingCoachMsg] = useState("");

  const [picWordIdx, setPicWordIdx] = useState(0);
  const [picWordInput, setPicWordInput] = useState("");
  const [picWordFeedback, setPicWordFeedback] = useState("");
  const [sentencePuzzleIdx, setSentencePuzzleIdx] = useState(0);
  const [selectedSentenceWords, setSelectedSentenceWords] = useState<string[]>([]);
  const [sentencePuzzleMsg, setSentencePuzzleMsg] = useState("");
  const [guidedWritingIdx, setGuidedWritingIdx] = useState(0);
  const [guidedWritingText, setGuidedWritingText] = useState("");
  const [guidedWritingFeedback, setGuidedWritingFeedback] = useState<string>("");

  const [grammarIdx, setGrammarIdx] = useState(0);
  const [grammarSelectedOpt, setGrammarSelectedOpt] = useState("");
  const [grammarFeedback, setGrammarFeedback] = useState("");
  const [uploadedWorksheetName, setUploadedWorksheetName] = useState("");
  const [uploadedWorksheetPreview, setUploadedWorksheetPreview] = useState("");

  // ============================================================================
  // 3. AI SPEAKING ASSISTANT (SUPERSPEAKERS) STATE
  // ============================================================================
  const [speakingSubTab, setSpeakingSubTab] = useState<
    "conversation" | "pronunciation" | "storytelling" | "listening-qa"
  >("conversation");
  const [convIdx, setConvIdx] = useState(0);
  const [exchangeIdx, setExchangeIdx] = useState(0);
  const [convChildReply, setConvChildReply] = useState("");
  const [convCoachFeedback, setConvCoachFeedback] = useState("");
  const [pronWordIdx, setPronWordIdx] = useState(0);
  const [pronSpokenText, setPronSpokenText] = useState("");
  const [pronEvaluation, setPronEvaluation] = useState<string>("");
  const [storyStarterIdx, setStoryStarterIdx] = useState(0);
  const [childStoryTranscript, setChildStoryTranscript] = useState("");
  const [storyCoachingFeedback, setStoryCoachingFeedback] = useState("");
  const [listeningIdx, setListeningIdx] = useState(0);
  const [showListeningScript, setShowListeningScript] = useState(false);
  const [listeningAnswers, setListeningAnswers] = useState<Record<number, string>>({});
  const [qaIdx, setQaIdx] = useState(0);
  const [qaReply, setQaReply] = useState("");
  const [qaFeedback, setQaFeedback] = useState("");

  // ============================================================================
  // 4. AI MATHEMATICS ASSISTANT STATE
  // ============================================================================
  const [mathSubTab, setMathSubTab] = useState<
    "numbers-counting" | "operations" | "shapes" | "word-problems"
  >("numbers-counting");
  const [targetNumber, setTargetNumber] = useState<number>(7);
  const [numberQuizChoices, setNumberQuizChoices] = useState<number[]>([5, 7, 9, 12]);
  const [numberQuizFeedback, setNumberQuizFeedback] = useState("");
  const [countingTarget, setCountingTarget] = useState<number>(6);
  const [countedSoFar, setCountedSoFar] = useState<number>(0);

  const [mathOpType, setMathOpType] = useState<"+" | "-" | "×">("+");
  const [mathNumA, setMathNumA] = useState<number>(5);
  const [mathNumB, setMathNumB] = useState<number>(3);
  const [mathUserAns, setMathUserAns] = useState<string>("");
  const [mathExplanation, setMathExplanation] = useState<string>("");
  const [mathIsCorrect, setMathIsCorrect] = useState<boolean | null>(null);

  const [shapeIdx, setShapeIdx] = useState<number>(0);
  const [shapeQuizAns, setShapeQuizAns] = useState<string>("");
  const [shapeQuizMsg, setShapeQuizMsg] = useState<string>("");

  const [wordProbIdx, setWordProbIdx] = useState<number>(0);
  const [wordProbInput, setWordProbInput] = useState<string>("");
  const [wordProbFeedback, setWordProbFeedback] = useState<string>("");
  const [showWordProbSteps, setShowWordProbSteps] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const mins = Math.max(1, Math.round((Date.now() - sessionStartRef.current) / 60000));
      setElapsedMinutes(mins);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const addSkill = (skill: string) => {
    setSkillsPractised((prev) => (prev.includes(skill) ? prev : [...prev, skill]));
  };

  const recordQuestionResult = (isCorrect: boolean, skillName?: string) => {
    if (skillName) addSkill(skillName);
    setQuestionsAttempted((q) => q + 1);
    if (isCorrect) {
      setCorrectAnswers((c) => c + 1);
    } else {
      setIncorrectAnswers((i) => i + 1);
    }
  };

  // ============================================================================
  // VOICE SYNTHESIS & SPEECH RECOGNITION
  // ============================================================================
  const speakText = (text: string, rate = 0.94) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      showToast("Voice playback is not supported on this browser.", "warning");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.1;
    utterance.lang = "en-US";
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Handle voice commands such as "Bright Buddy, I want to read a story."
  const processVoiceCommand = (rawCommand: string) => {
    const cmd = rawCommand.toLowerCase().trim();
    setVoiceCommandTranscript(rawCommand);

    if (cmd.includes("read") || cmd.includes("story") || cmd.includes("book")) {
      setActivePillar("reading");
      addSkill("Story Reading & Phonics");
      const story = BRIGHT_BUDDY_STORIES[storyIdx];
      const msg = `Wonderful! Let's read "${story.title}" together. Listen to me first: ${story.sentences[0].text}`;
      setBuddyGreeting(msg);
      speakText(msg, 0.92);
      return;
    }
    if (
      cmd.includes("write") ||
      cmd.includes("trace") ||
      cmd.includes("alphabet") ||
      cmd.includes("spell")
    ) {
      setActivePillar("writing");
      addSkill("Guided Writing & Letter Tracing");
      const msg =
        "Let's practise writing and letter tracing together! Pick a letter or word to trace and spell.";
      setBuddyGreeting(msg);
      speakText(msg, 0.94);
      return;
    }
    if (
      cmd.includes("speak") ||
      cmd.includes("talk") ||
      cmd.includes("conversation") ||
      cmd.includes("pronounce")
    ) {
      setActivePillar("speaking");
      addSkill("SuperSpeakers Oral Communication");
      const msg =
        "Welcome to SuperSpeakers! Let's practise speaking clearly and confidently together.";
      setBuddyGreeting(msg);
      speakText(msg, 0.94);
      return;
    }
    if (
      cmd.includes("math") ||
      cmd.includes("count") ||
      cmd.includes("number") ||
      cmd.includes("add") ||
      cmd.includes("shape")
    ) {
      setActivePillar("math");
      addSkill("Conceptual Mathematics");
      const msg =
        "Let's explore numbers, counting, shapes, and step-by-step math puzzles together!";
      setBuddyGreeting(msg);
      speakText(msg, 0.94);
      return;
    }

    const fallback = `I heard you say: "${rawCommand}". You can ask me to read a story, trace letters, practise speaking, or solve math puzzles!`;
    setBuddyGreeting(fallback);
    speakText(fallback, 0.94);
  };

  const listenWithMic = (onTranscriptReady: (transcript: string) => void) => {
    if (typeof window === "undefined") return;
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      showToast(
        "Microphone speech recognition works best in Chrome, Edge, or Safari. You can also type or use the interactive buttons!",
        "info"
      );
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    const recognition = new SpeechRec();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    let latestTranscript = "";
    recognition.onresult = (event: any) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript + " ";
      }
      latestTranscript = text.trim();
      onTranscriptReady(latestTranscript);
    };

    recognition.onerror = () => {
      setIsListeningCommand(false);
      setIsReadingMicOn(false);
    };

    recognition.onend = () => {
      setIsListeningCommand(false);
      setIsReadingMicOn(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // ============================================================================
  // 1. READING ASSISTANT EVALUATION (Detecting struggled words & syllables)
  // ============================================================================
  const evaluateSentenceReading = (
    spokenText: string,
    forcedStruggleWord?: string
  ) => {
    const story = BRIGHT_BUDDY_STORIES[storyIdx];
    const currentSentenceObj = story.sentences[sentenceIdx];
    const targetSentence = currentSentenceObj.text;

    addSkill("Story Reading Aloud");
    addSkill("Phonics & Pronunciation");

    const cleanTargetWords = targetSentence
      .replace(/[^a-zA-Z\s]/g, "")
      .split(/\s+/)
      .filter(Boolean);

    const cleanSpokenWords = spokenText
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(Boolean);

    const durationSec = readingStartTime
      ? Math.max(2, (Date.now() - readingStartTime) / 1000)
      : Math.max(3, cleanTargetWords.length * 0.6);
    const wpm = Math.min(160, Math.max(35, Math.round((cleanTargetWords.length / durationSec) * 60)));
    setReadingSpeedWpm(wpm);

    if (forcedStruggleWord) {
      const syl =
        currentSentenceObj.syllableGuide[forcedStruggleWord.toLowerCase()] ||
        forcedStruggleWord;
      setStruggledWord(forcedStruggleWord);
      setStruggledSyllables(syl);
      setRetryImproved(null);
      const acc = Math.round(((cleanTargetWords.length - 1) / cleanTargetWords.length) * 100);
      setReadingAccuracy(acc);

      const correctOthers = cleanTargetWords.filter(
        (w) => w.toLowerCase() !== forcedStruggleWord.toLowerCase()
      );
      setWordsPronouncedCorrectly((prev) =>
        Array.from(new Set([...prev, ...correctOthers]))
      );
      setWordsNeedingImprovement((prev) =>
        Array.from(new Set([...prev, forcedStruggleWord.toLowerCase()]))
      );

      const coachResponse = `Wonderful try! Let's say it together. ${syl}. Can you try again?`;
      setBuddyReadingCoachMsg(coachResponse);
      speakText(coachResponse, 0.88);
      recordQuestionResult(false, "Sentence Reading & Syllable Decoding");
      return;
    }

    const correctList: string[] = [];
    const missedList: string[] = [];

    cleanTargetWords.forEach((tw) => {
      const lower = tw.toLowerCase();
      if (cleanSpokenWords.includes(lower)) {
        correctList.push(tw);
      } else {
        missedList.push(tw);
      }
    });

    const acc =
      cleanTargetWords.length > 0
        ? Math.round((correctList.length / cleanTargetWords.length) * 100)
        : 100;
    setReadingAccuracy(acc);

    if (correctList.length > 0) {
      setWordsPronouncedCorrectly((prev) =>
        Array.from(new Set([...prev, ...correctList]))
      );
    }

    if (missedList.length > 0) {
      // Pick the most important struggled word
      const focusMissed =
        missedList.find((w) => currentSentenceObj.syllableGuide[w.toLowerCase()]) ||
        missedList[0];
      const syl =
        currentSentenceObj.syllableGuide[focusMissed.toLowerCase()] || focusMissed;

      setStruggledWord(focusMissed);
      setStruggledSyllables(syl);
      setRetryImproved(null);
      setWordsNeedingImprovement((prev) =>
        Array.from(new Set([...prev, ...missedList.map((m) => m.toLowerCase())]))
      );

      const coachResponse = `Wonderful try! Let's say it together. ${syl}. Can you try again?`;
      setBuddyReadingCoachMsg(coachResponse);
      speakText(coachResponse, 0.88);
      recordQuestionResult(false, "Sentence Reading & Syllable Decoding");
    } else {
      setStruggledWord(null);
      setStruggledSyllables("");
      setRetryImproved(true);
      const praise = `Fantastic reading! You read every word clearly at ${wpm} words per minute (${acc}% accuracy)!`;
      setBuddyReadingCoachMsg(praise);
      speakText(praise, 0.94);
      recordQuestionResult(true, "Sentence Reading Fluency");
    }
  };

  const handleRetryStruggledWord = (spokenRetry?: string) => {
    if (!struggledWord) return;
    const wordLower = struggledWord.toLowerCase();
    const succeeded =
      !spokenRetry || spokenRetry.toLowerCase().includes(wordLower);

    if (succeeded) {
      setRetryImproved(true);
      setWordsImprovedOnRetry((prev) => Array.from(new Set([...prev, wordLower])));
      setWordsPronouncedCorrectly((prev) =>
        Array.from(new Set([...prev, struggledWord]))
      );
      setReadingAccuracy(100);
      const msg = `Bravo, ${studentName.split(" ")[0]}! You pronounced "${struggledWord}" (${struggledSyllables}) clearly on your retry! I have recorded your improvement.`;
      setBuddyReadingCoachMsg(msg);
      speakText(msg, 0.94);
      recordQuestionResult(true, `Retry Pronunciation (${struggledWord})`);
    } else {
      const msg = `Almost there! Listen closely: ${struggledSyllables}. ${struggledWord}. Try one more time!`;
      setBuddyReadingCoachMsg(msg);
      speakText(msg, 0.82);
    }
  };

  // ============================================================================
  // 2. LETTER TRACING CANVAS HELPERS
  // ============================================================================
  const drawLetterGuideOnCanvas = () => {
    const canvas = traceCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw primary handwriting lines (top, dashed middle, baseline)
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    [45, 175].forEach((y) => {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(canvas.width - 20, y);
      ctx.stroke();
    });

    ctx.strokeStyle = "#94a3b8";
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(20, 110);
    ctx.lineTo(canvas.width - 20, 110);
    ctx.stroke();

    // Draw dotted guide letter(s)
    const alpha = ALPHABET_PHONICS[selectedAlphaIdx];
    const displayStr =
      traceCase === "upper"
        ? `${alpha.letter}   ${alpha.letter}`
        : traceCase === "lower"
        ? `${alpha.lower}   ${alpha.lower}`
        : `${alpha.letter}${alpha.lower}   ${alpha.word}`;

    ctx.setLineDash([4, 4]);
    ctx.font = "bold 96px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.strokeStyle = "#93c5fd";
    ctx.lineWidth = 3;
    ctx.strokeText(displayStr, canvas.width / 2, 168);
    ctx.fillStyle = "rgba(219, 234, 254, 0.35)";
    ctx.fillText(displayStr, canvas.width / 2, 168);
    ctx.setLineDash([]);
  };

  useEffect(() => {
    if (activePillar === "writing" && writingSubTab === "tracing") {
      setTimeout(drawLetterGuideOnCanvas, 40);
    }
  }, [activePillar, writingSubTab, selectedAlphaIdx, traceCase]);

  const startTraceDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = traceCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    isDrawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = "#1d4ed8";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  const moveTraceDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = traceCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endTraceDraw = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      setTraceStrokeCount((c) => c + 1);
      addSkill("Letter Tracing & Handwriting");
    }
  };

  // ============================================================================
  // 5. COMPUTE MASTERY & SAVE AI LEARNING ASSESSMENT
  // ============================================================================
  const accuracyRatio =
    questionsAttempted > 0
      ? Math.round((correctAnswers / questionsAttempted) * 100)
      : readingAccuracy ?? 88;

  const currentMasteryLevel: MasteryLevel =
    accuracyRatio >= 90
      ? "Mastered"
      : accuracyRatio >= 75
      ? "Proficient"
      : accuracyRatio >= 60
      ? "Developing"
      : "Emerging";

  const recommendedNextActivity =
    wordsNeedingImprovement.length > 0
      ? `Practise syllable decoding & pronunciation for: ${wordsNeedingImprovement
          .slice(0, 4)
          .join(", ")}`
      : incorrectAnswers > correctAnswers
      ? "Review guided examples in Writing & Step-by-Step Math with Bright Buddy"
      : activePillar === "reading"
      ? "Try SuperSpeakers Storytelling or Sentence Construction next!"
      : "Advance to the next story level and complete a 5-question comprehension check";

  const handleSaveSessionAssessment = async () => {
    setSavingAssessment(true);
    try {
      const res = await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "log-ai-practice",
          studentUsername,
          studentName,
          mode: activePillar,
          topic: `Bright Buddy Session (${skillsPractised.slice(0, 3).join(", ")})`,
          score: accuracyRatio,
          feedback: `Mastery: ${currentMasteryLevel} (${accuracyRatio}%). Practised ${skillsPractised.join(
            ", "
          )}. Attempted ${questionsAttempted} questions (${correctAnswers} correct, ${incorrectAnswers} incorrect). Recommended next: ${recommendedNextActivity}`,
          improvementArea:
            wordsNeedingImprovement.length > 0
              ? `Words needing pronunciation practice: ${wordsNeedingImprovement.join(", ")}`
              : undefined,
          skillsPractised,
          questionsAttempted,
          correctAnswers,
          incorrectAnswers,
          wordsPronouncedCorrectly,
          wordsNeedingImprovement,
          wordsImprovedOnRetry,
          readingSpeedWpm,
          readingAccuracy,
          timeSpentMinutes: elapsedMinutes,
          masteryLevel: currentMasteryLevel,
          recommendedNextActivity,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          "Bright Buddy AI Learning Assessment saved to your Progress & Teacher Dashboard!",
          "success"
        );
        onSessionSaved();
      }
    } catch {
      showToast("Could not save assessment. Please check your connection.", "error");
    } finally {
      setSavingAssessment(false);
    }
  };
  const currentStory = BRIGHT_BUDDY_STORIES[storyIdx];
  const currentSentence = currentStory.sentences[sentenceIdx] || currentStory.sentences[0];
  const currentAlpha = ALPHABET_PHONICS[selectedAlphaIdx];
  const currentWordForm = WORD_FORMATION_EXERCISES[wordFormIdx];
  const currentSpelling = PRONUNCIATION_WORDS[spellingIdx % PRONUNCIATION_WORDS.length];
  const currentPicWord = PICTURE_TO_WORD_EXERCISES[picWordIdx];
  const currentSentencePuzzle = SENTENCE_CONSTRUCTION_PUZZLES[sentencePuzzleIdx];
  const currentGrammar = GRAMMAR_MINI_LESSONS[grammarIdx];
  const currentConv = SUPERSPEAKERS_ACTIVITIES.conversations[convIdx];
  const currentExchange =
    currentConv.exchanges[exchangeIdx] || currentConv.exchanges[0];
  const currentStoryStarter = SUPERSPEAKERS_ACTIVITIES.storytellingPrompts[storyStarterIdx];
  const currentListening = SUPERSPEAKERS_ACTIVITIES.listeningExercises[listeningIdx];
  const currentQa = SUPERSPEAKERS_ACTIVITIES.qaPrompts[qaIdx];
  const currentShape = MATH_SHAPES_LIBRARY[shapeIdx];
  const currentWordProb = MATH_WORD_PROBLEMS[wordProbIdx];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* =====================================================================
          TOP BANNER: BRIGHT BUDDY VOICE COMMAND BAR & COMPANION GREETING
          ===================================================================== */}
      <div
        style={{
          background: "linear-gradient(135deg, #071527 0%, #1e3a8a 65%, #0f766e 100%)",
          color: "#ffffff",
          borderRadius: 22,
          padding: "24px 26px",
          boxShadow: "0 14px 34px rgba(7, 21, 39, 0.18)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 18,
          }}
        >
          <div style={{ flex: "1 1 420px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span
                style={{
                  background: "rgba(52, 211, 153, 0.22)",
                  color: "#6ee7b7",
                  border: "1px solid rgba(52, 211, 153, 0.4)",
                  padding: "4px 12px",
                  borderRadius: 999,
                  fontSize: "0.73rem",
                  fontWeight: 800,
                }}
              >
                🤖 BRIGHT BUDDY • PATIENT AI VOICE LEARNING COMPANION
              </span>
              <span
                style={{
                  background: "rgba(255,255,255,0.12)",
                  color: "#fde68a",
                  padding: "4px 10px",
                  borderRadius: 999,
                  fontSize: "0.72rem",
                  fontWeight: 800,
                }}
              >
                ⏱️ Session Time: {elapsedMinutes} min
              </span>
            </div>

            <h2 style={{ margin: "0 0 6px", fontSize: "1.45rem", fontWeight: 900, color: "#fff" }}>
              Hello {studentName.split(" ")[0]}! I’m Bright Buddy 👋
            </h2>
            <p
              style={{
                margin: "0 0 14px",
                fontSize: "0.92rem",
                color: "#e2e8f0",
                lineHeight: 1.55,
                background: "rgba(255,255,255,0.08)",
                padding: "10px 14px",
                borderRadius: 12,
                borderLeft: "4px solid #34d399",
              }}
            >
              “{buddyGreeting}”
            </p>

            {/* Voice Command Trigger + Quick Voice Command Chips */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
              <button
                type="button"
                onClick={() => {
                  if (isListeningCommand) {
                    setIsListeningCommand(false);
                    if (recognitionRef.current) recognitionRef.current.stop();
                    return;
                  }
                  setIsListeningCommand(true);
                  showToast('🎤 Say: "Bright Buddy, I want to read a story"', "info");
                  listenWithMic((txt) => {
                    processVoiceCommand(txt);
                  });
                }}
                style={{
                  background: isListeningCommand ? "#ef4444" : "#10b981",
                  color: "#ffffff",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: "0.84rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
                }}
              >
                {isListeningCommand ? <MicOff size={16} /> : <Mic size={16} />}
                <span>
                  {isListeningCommand
                    ? "Listening... Speak Now"
                    : '🎤 Say Command ("Bright Buddy, I want to read a story")'}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  processVoiceCommand("Bright Buddy, I want to read a story.")
                }
                style={{
                  background: "rgba(255,255,255,0.14)",
                  color: "#ffffff",
                  border: "1px solid rgba(255,255,255,0.28)",
                  padding: "8px 13px",
                  borderRadius: 999,
                  fontSize: "0.76rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                🗣️ “Bright Buddy, I want to read a story.”
              </button>

              {isSpeaking && (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  style={{
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: 999,
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  ⏹ Stop Voice
                </button>
              )}
            </div>

            {voiceCommandTranscript && (
              <div style={{ marginTop: 8, fontSize: "0.78rem", color: "#a7f3d0" }}>
                🎤 You said: <strong>“{voiceCommandTranscript}”</strong>
              </div>
            )}
          </div>

          {/* Live Mini Assessment Card */}
          <div
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 16,
              padding: "14px 18px",
              minWidth: 250,
            }}
          >
            <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#fde68a", textTransform: "uppercase" }}>
              Live Session Mastery
            </div>
            <div style={{ fontSize: "1.35rem", fontWeight: 900, margin: "4px 0" }}>
              {currentMasteryLevel} ({accuracyRatio}%)
            </div>
            <div style={{ fontSize: "0.76rem", color: "#cbd5e1", marginBottom: 10 }}>
              Questions: {questionsAttempted} ({correctAnswers} ✓ / {incorrectAnswers} ✗) •{" "}
              Words Mastered: {wordsPronouncedCorrectly.length}
            </div>
            <button
              type="button"
              onClick={handleSaveSessionAssessment}
              disabled={savingAssessment}
              style={{
                width: "100%",
                background: "#f59e0b",
                color: "#071527",
                border: "none",
                padding: "8px 12px",
                borderRadius: 10,
                fontWeight: 800,
                fontSize: "0.78rem",
                cursor: "pointer",
              }}
            >
              {savingAssessment ? "Saving Session..." : "💾 Save Session Assessment"}
            </button>
          </div>
        </div>

        {/* 5 Core Pillar Switcher */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
            gap: 10,
            marginTop: 20,
            paddingTop: 18,
            borderTop: "1px solid rgba(255,255,255,0.16)",
          }}
        >
          {[
            {
              id: "reading",
              label: "1. AI Reading Assistant",
              sub: "Stories, Phonics & Syllables",
              icon: <BookOpen size={17} />,
            },
            {
              id: "writing",
              label: "2. AI Writing Assistant",
              sub: "Tracing, Spelling & Grammar",
              icon: <PenTool size={17} />,
            },
            {
              id: "speaking",
              label: "3. AI Speaking Assistant",
              sub: "SuperSpeakers & Storytelling",
              icon: <MessageCircle size={17} />,
            },
            {
              id: "math",
              label: "4. AI Mathematics",
              sub: "Counting, Operations & Shapes",
              icon: <Calculator size={17} />,
            },
            {
              id: "assessment",
              label: "5. Learning Assessment",
              sub: "Mastery & Teacher History",
              icon: <Award size={17} />,
            },
          ].map((tab) => {
            const active = activePillar === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActivePillar(tab.id as any)}
                style={{
                  background: active ? "#ffffff" : "rgba(255,255,255,0.09)",
                  color: active ? "#071527" : "#ffffff",
                  border: active ? "2px solid #34d399" : "1px solid rgba(255,255,255,0.18)",
                  borderRadius: 14,
                  padding: "12px 14px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: "0.85rem" }}>
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: active ? "#475569" : "#cbd5e1",
                    marginTop: 3,
                    fontWeight: 600,
                  }}
                >
                  {tab.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          MODULE 1: AI READING ASSISTANT
          ===================================================================== */}
      {activePillar === "reading" && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: 20,
            padding: 24,
            border: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Story Selector */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "#0284c7", textTransform: "uppercase" }}>
                1. AI Reading Assistant • Sentence-by-Sentence & Phonics Coach
              </span>
              <h3 style={{ margin: "2px 0 0", fontSize: "1.25rem", fontWeight: 900, color: "#0f172a" }}>
                📖 {currentStory.title}
              </h3>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {BRIGHT_BUDDY_STORIES.map((st, idx) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    setStoryIdx(idx);
                    setSentenceIdx(0);
                    setStruggledWord(null);
                    setBuddyReadingCoachMsg("");
                    setChildSpokenSentence("");
                  }}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 10,
                    border: storyIdx === idx ? "2px solid #0284c7" : "1px solid #cbd5e1",
                    background: storyIdx === idx ? "#e0f2fe" : "#f8fafc",
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Story {idx + 1}: {st.title}
                </button>
              ))}
            </div>
          </div>

          {/* Full Story Display with Highlighted Active Sentence */}
          <div
            style={{
              background: "#f8fafc",
              border: "2px solid #bae6fd",
              borderRadius: 16,
              padding: 20,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#0369a1" }}>
                {currentStory.level} • Click any sentence to practice reading it aloud!
              </span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => speakText(currentStory.fullText, 0.9)}
                  style={{
                    background: "#0284c7",
                    color: "#fff",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Volume2 size={15} /> Read Entire Story Aloud
                </button>
                <button
                  type="button"
                  onClick={() => speakText(currentSentence.text, 0.86)}
                  style={{
                    background: "#0f172a",
                    color: "#fff",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  🔊 Hear Sentence {sentenceIdx + 1}
                </button>
              </div>
            </div>

            {/* Interactive Sentences */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {currentStory.sentences.map((s, idx) => {
                const isActive = sentenceIdx === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSentenceIdx(idx);
                      setStruggledWord(null);
                      setBuddyReadingCoachMsg("");
                    }}
                    style={{
                      padding: "14px 16px",
                      borderRadius: 12,
                      background: isActive ? "#ffffff" : "#f1f5f9",
                      border: isActive ? "2px solid #0284c7" : "1px solid #cbd5e1",
                      cursor: "pointer",
                      boxShadow: isActive ? "0 6px 16px rgba(2,132,199,0.12)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 800, color: isActive ? "#0284c7" : "#64748b" }}>
                        SENTENCE {idx + 1} {isActive ? "• SELECTED FOR READING PRACTICE" : ""}
                      </span>
                      <span style={{ fontSize: "0.74rem", color: "#475569" }}>
                        💡 {s.phonicsHint}
                      </span>
                    </div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {s.text.split(" ").map((word, wIdx) => {
                        const cleanW = word.replace(/[^a-zA-Z]/g, "").toLowerCase();
                        const isStruggled =
                          struggledWord && struggledWord.toLowerCase() === cleanW;
                        return (
                          <span
                            key={wIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              speakText(cleanW, 0.78);
                            }}
                            title="Click to hear this word pronounced"
                            style={{
                              padding: "2px 6px",
                              borderRadius: 6,
                              background: isStruggled ? "#fef3c7" : "transparent",
                              border: isStruggled ? "2px solid #f59e0b" : "none",
                              color: isStruggled ? "#b45309" : "#0f172a",
                              cursor: "pointer",
                            }}
                          >
                            {word}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Child Microphone Reading & Struggled Word Detection Box */}
          <div
            style={{
              background: "#ffffff",
              border: "2px solid #e2e8f0",
              borderRadius: 16,
              padding: 20,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
              <div>
                <h4 style={{ margin: 0, fontSize: "1.02rem", fontWeight: 800, color: "#0f172a" }}>
                  🎤 Step 2: Read Sentence {sentenceIdx + 1} Aloud to Bright Buddy
                </h4>
                <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#64748b" }}>
                  Target Sentence: <strong>“{currentSentence.text}”</strong>
                </p>
              </div>

              {(readingSpeedWpm !== undefined || readingAccuracy !== undefined) && (
                <div style={{ display: "flex", gap: 8 }}>
                  {readingSpeedWpm !== undefined && (
                    <span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "5px 12px", borderRadius: 999, fontSize: "0.78rem", fontWeight: 800 }}>
                      ⚡ Speed: {readingSpeedWpm} WPM
                    </span>
                  )}
                  {readingAccuracy !== undefined && (
                    <span style={{ background: "#ecfdf5", color: "#059669", padding: "5px 12px", borderRadius: 999, fontSize: "0.78rem", fontWeight: 800 }}>
                      🎯 Accuracy: {readingAccuracy}%
                    </span>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
              <button
                type="button"
                onClick={() => {
                  if (isReadingMicOn) {
                    setIsReadingMicOn(false);
                    if (recognitionRef.current) recognitionRef.current.stop();
                    return;
                  }
                  setIsReadingMicOn(true);
                  setReadingStartTime(Date.now());
                  listenWithMic((txt) => {
                    setChildSpokenSentence(txt);
                  });
                }}
                style={{
                  background: isReadingMicOn ? "#ef4444" : "#10b981",
                  color: "#ffffff",
                  border: "none",
                  padding: "11px 18px",
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {isReadingMicOn ? <MicOff size={17} /> : <Mic size={17} />}
                <span>
                  {isReadingMicOn
                    ? "Stop Microphone"
                    : "🎤 Press Mic & Read Sentence Aloud"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => evaluateSentenceReading(childSpokenSentence)}
                style={{
                  background: "#0f172a",
                  color: "#ffffff",
                  border: "none",
                  padding: "11px 18px",
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                Check My Reading
              </button>

              {/* Interactive Demo Button for the exact "sitting" struggle scenario */}
              <button
                type="button"
                onClick={() => {
                  setStoryIdx(0);
                  setSentenceIdx(0);
                  setChildSpokenSentence("The cat is ... s-sit ... on the mat.");
                  evaluateSentenceReading("The cat is on the mat", "sitting");
                }}
                style={{
                  background: "#fffbeb",
                  color: "#b45309",
                  border: "1px solid #fcd34d",
                  padding: "11px 16px",
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                💡 Demo Struggle with “sitting” (“Sit-ting”)
              </button>
            </div>

            <input
              type="text"
              className="form-input"
              placeholder="Words heard by microphone appear here (or type what the child read)..."
              value={childSpokenSentence}
              onChange={(e) => setChildSpokenSentence(e.target.value)}
            />

            {/* Bright Buddy Pronunciation & Struggled Word Coaching Box */}
            {buddyReadingCoachMsg && (
              <div
                style={{
                  marginTop: 14,
                  padding: 18,
                  borderRadius: 14,
                  background: struggledWord && !retryImproved ? "#fffbeb" : "#ecfdf5",
                  border:
                    struggledWord && !retryImproved
                      ? "2px solid #f59e0b"
                      : "2px solid #10b981",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 800, color: struggledWord && !retryImproved ? "#b45309" : "#047857", textTransform: "uppercase" }}>
                      🤖 Bright Buddy Reading Coach
                    </div>
                    <div style={{ fontSize: "1.08rem", fontWeight: 900, color: "#0f172a", marginTop: 4 }}>
                      “{buddyReadingCoachMsg}”
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => speakText(buddyReadingCoachMsg, 0.86)}
                    style={{
                      background: "#0284c7",
                      color: "#fff",
                      border: "none",
                      padding: "8px 14px",
                      borderRadius: 10,
                      fontWeight: 800,
                      fontSize: "0.78rem",
                      cursor: "pointer",
                    }}
                  >
                    🔊 Hear Bright Buddy
                  </button>
                </div>

                {struggledWord && (
                  <div
                    style={{
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: "1px dashed #cbd5e1",
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span style={{ fontSize: "0.84rem", fontWeight: 800, color: "#0f172a" }}>
                      Target Word: <span style={{ color: "#d97706" }}>{struggledWord}</span> ({struggledSyllables})
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        speakText(`${struggledSyllables}. ${struggledWord}.`, 0.72)
                      }
                      style={{
                        background: "#ffffff",
                        border: "1px solid #f59e0b",
                        color: "#b45309",
                        padding: "7px 14px",
                        borderRadius: 999,
                        fontWeight: 800,
                        fontSize: "0.78rem",
                        cursor: "pointer",
                      }}
                    >
                      🐢 Hear Slowly: “{struggledSyllables}”
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRetryStruggledWord(struggledWord)}
                      style={{
                        background: "#10b981",
                        color: "#ffffff",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: 999,
                        fontWeight: 800,
                        fontSize: "0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      🎤 Try Saying “{struggledWord}” Again (Record Improvement)
                    </button>

                    {retryImproved && (
                      <span
                        style={{
                          background: "#dcfce7",
                          color: "#15803d",
                          padding: "4px 10px",
                          borderRadius: 999,
                          fontSize: "0.75rem",
                          fontWeight: 800,
                        }}
                      >
                        ✅ Retry Improved & Logged!
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Phonics & Letter Sounds Section + Story Comprehension Questions */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
            {/* Letter Sounds & Phonics Cards */}
            <div style={{ background: "#f8fafc", borderRadius: 16, padding: 18, border: "1px solid #e2e8f0" }}>
              <h4 style={{ margin: "0 0 10px", fontSize: "0.98rem", fontWeight: 800, color: "#0f172a" }}>
                🔤 Letter Sounds & Phonics Breakdown
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {currentStory.phonicsCards.map((pc, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "#ffffff",
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid #cbd5e1",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "#0f172a" }}>
                        {pc.sound} → <span style={{ color: "#0284c7" }}>{pc.exampleWord}</span> ({pc.syllables})
                      </div>
                      <div style={{ fontSize: "0.76rem", color: "#64748b", marginTop: 2 }}>
                        Letters: <strong>{pc.letters}</strong> • {pc.tip}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        addSkill("Letter Sounds & Phonics");
                        speakText(`${pc.exampleWord}. ${pc.syllables}. ${pc.tip}`, 0.85);
                      }}
                      style={{
                        background: "#eff6ff",
                        color: "#1d4ed8",
                        border: "1px solid #bfdbfe",
                        padding: "6px 12px",
                        borderRadius: 8,
                        fontWeight: 800,
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      🔊 Hear Sound
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Simple Questions About the Story */}
            <div style={{ background: "#f8fafc", borderRadius: 16, padding: 18, border: "1px solid #e2e8f0" }}>
              <h4 style={{ margin: "0 0 10px", fontSize: "0.98rem", fontWeight: 800, color: "#0f172a" }}>
                ❓ Story Comprehension Questions
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {currentStory.comprehensionQuestions.map((q, qIdx) => {
                  const chosen = storyQuizAnswers[q.id];
                  const fb = storyQuizFeedback[q.id];
                  return (
                    <div
                      key={q.id}
                      style={{
                        background: "#ffffff",
                        padding: 12,
                        borderRadius: 12,
                        border: "1px solid #cbd5e1",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontWeight: 800, fontSize: "0.86rem", color: "#0f172a" }}>
                          Q{qIdx + 1}: {q.question}
                        </span>
                        <button
                          type="button"
                          onClick={() => speakText(q.question, 0.92)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#0284c7",
                            fontWeight: 800,
                            fontSize: "0.75rem",
                            cursor: "pointer",
                          }}
                        >
                          🔊 Hear
                        </button>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {q.options.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setStoryQuizAnswers((prev) => ({ ...prev, [q.id]: opt }));
                              const isRight = opt === q.correctAnswer;
                              recordQuestionResult(isRight, "Reading Comprehension");
                              const msg = isRight
                                ? `✅ Correct! ${q.explanation}`
                                : `💡 Good try! Remember: ${q.explanation}`;
                              setStoryQuizFeedback((prev) => ({ ...prev, [q.id]: msg }));
                              speakText(msg, 0.94);
                            }}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 8,
                              border:
                                chosen === opt ? "2px solid #0284c7" : "1px solid #cbd5e1",
                              background: chosen === opt ? "#e0f2fe" : "#f8fafc",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                      {fb && (
                        <div style={{ marginTop: 6, fontSize: "0.78rem", fontWeight: 700, color: chosen === q.correctAnswer ? "#059669" : "#b45309" }}>
                          {fb}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODULE 2: AI WRITING ASSISTANT (Guided learning, never writes for them)
          ===================================================================== */}
      {activePillar === "writing" && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: 20,
            padding: 24,
            border: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "#7c3aed", textTransform: "uppercase" }}>
                2. AI Writing Assistant • Learn to Write Step-by-Step
              </span>
              <h3 style={{ margin: "2px 0 0", fontSize: "1.25rem", fontWeight: 900, color: "#0f172a" }}>
                ✍️ Alphabet, Letter Tracing, Word Formation, Spelling & Grammar
              </h3>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[
                { id: "tracing", label: "✏️ Letter Tracing (Upper & Lower)" },
                { id: "alphabet", label: "🔤 Alphabet Recognition" },
                { id: "words-spelling", label: "🧩 Word Formation & Spelling" },
                { id: "picture-sentence", label: "🖼️ Picture-to-Word & Sentences" },
                { id: "grammar-handwriting", label: "📘 Grammar & Worksheet Upload" },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setWritingSubTab(st.id as any)}
                  style={{
                    padding: "8px 13px",
                    borderRadius: 10,
                    border: writingSubTab === st.id ? "2px solid #7c3aed" : "1px solid #cbd5e1",
                    background: writingSubTab === st.id ? "#f5f3ff" : "#f8fafc",
                    color: "#0f172a",
                    fontWeight: 800,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                  }}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* SUB-TAB: LETTER TRACING & UPPERCASE/LOWERCASE PRACTICE */}
          {writingSubTab === "tracing" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {ALPHABET_PHONICS.map((item, idx) => (
                  <button
                    key={item.letter}
                    type="button"
                    onClick={() => {
                      setSelectedAlphaIdx(idx);
                      speakText(item.phonicsText, 0.92);
                    }}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      border:
                        selectedAlphaIdx === idx ? "2px solid #1d4ed8" : "1px solid #cbd5e1",
                      background: selectedAlphaIdx === idx ? "#dbeafe" : "#f8fafc",
                      fontWeight: 900,
                      fontSize: "0.84rem",
                      cursor: "pointer",
                    }}
                  >
                    {item.letter}
                    {item.lower}
                  </button>
                ))}
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: 16,
                  padding: 20,
                  border: "1px solid #cbd5e1",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900 }}>
                      {currentAlpha.emoji} Trace Letter {currentAlpha.letter}{currentAlpha.lower} — {currentAlpha.word}
                    </h4>
                    <div style={{ fontSize: "0.8rem", color: "#475569" }}>
                      Use your mouse, finger, or stylus to trace over the dotted letters on the primary handwriting lines!
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[
                      { id: "both", label: "Aa + Word" },
                      { id: "upper", label: "Uppercase Only (A)" },
                      { id: "lower", label: "Lowercase Only (a)" },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setTraceCase(c.id as any)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 8,
                          border: traceCase === c.id ? "2px solid #1d4ed8" : "1px solid #cbd5e1",
                          background: traceCase === c.id ? "#eff6ff" : "#fff",
                          fontSize: "0.76rem",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        {c.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={drawLetterGuideOnCanvas}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        background: "#fff",
                        fontSize: "0.76rem",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      🔄 Clear & Reset Lines
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        recordQuestionResult(true, `Letter Tracing (${currentAlpha.letter}${currentAlpha.lower})`);
                        const msg = `Awesome letter tracing, ${studentName.split(" ")[0]}! Your uppercase ${currentAlpha.letter} and lowercase ${currentAlpha.lower} for ${currentAlpha.word} look super neat!`;
                        showToast(msg, "success");
                        speakText(msg, 0.94);
                      }}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        border: "none",
                        background: "#10b981",
                        color: "#fff",
                        fontSize: "0.78rem",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      ✅ Check My Tracing
                    </button>
                  </div>
                </div>

                <canvas
                  ref={traceCanvasRef}
                  width={720}
                  height={220}
                  onMouseDown={startTraceDraw}
                  onMouseMove={moveTraceDraw}
                  onMouseUp={endTraceDraw}
                  onMouseLeave={endTraceDraw}
                  onTouchStart={startTraceDraw}
                  onTouchMove={moveTraceDraw}
                  onTouchEnd={endTraceDraw}
                  style={{
                    width: "100%",
                    height: 220,
                    background: "#ffffff",
                    borderRadius: 12,
                    border: "2px solid #93c5fd",
                    touchAction: "none",
                    cursor: "crosshair",
                  }}
                />
              </div>
            </div>
          )}

          {/* SUB-TAB: ALPHABET RECOGNITION */}
          {writingSubTab === "alphabet" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: 14,
                  padding: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 900, fontSize: "0.95rem", color: "#1e3a8a" }}>
                    🎧 Alphabet Sound Detective Game
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "#334155" }}>
                    Click “Hear Mystery Letter Sound”, then tap the matching letter card below!
                  </div>
                  {alphaQuizMsg && (
                    <div style={{ marginTop: 6, fontWeight: 800, fontSize: "0.84rem", color: "#059669" }}>
                      {alphaQuizMsg}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const rand =
                      ALPHABET_PHONICS[Math.floor(Math.random() * ALPHABET_PHONICS.length)];
                    setAlphaQuizTarget(rand);
                    setAlphaQuizMsg("");
                    speakText(
                      `Find the letter that makes the "${rand.sound}" sound, like in ${rand.word}!`,
                      0.9
                    );
                  }}
                  style={{
                    background: "#1d4ed8",
                    color: "#fff",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                  }}
                >
                  🔊 Hear Mystery Letter Sound
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(115px, 1fr))",
                  gap: 10,
                }}
              >
                {ALPHABET_PHONICS.map((item) => (
                  <button
                    key={item.letter}
                    type="button"
                    onClick={() => {
                      speakText(item.phonicsText, 0.92);
                      if (alphaQuizTarget && item.letter === alphaQuizTarget.letter) {
                        recordQuestionResult(true, "Alphabet Recognition");
                        setAlphaQuizMsg(
                          `🎉 Correct! ${item.letter}${item.lower} is for ${item.word}!`
                        );
                      }
                    }}
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #cbd5e1",
                      borderRadius: 12,
                      padding: 12,
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: "1.4rem" }}>{item.emoji}</div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#0f172a" }}>
                      {item.letter} {item.lower}
                    </div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>
                      {item.word}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SUB-TAB: WORD FORMATION & SPELLING EXERCISES */}
          {writingSubTab === "words-spelling" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
              {/* Word Formation Tile Builder */}
              <div style={{ background: "#f8fafc", borderRadius: 16, padding: 18, border: "1px solid #cbd5e1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 900 }}>
                    🧩 Word Formation (Tap Letter Tiles)
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setWordFormIdx((wordFormIdx + 1) % WORD_FORMATION_EXERCISES.length);
                      setBuiltWord("");
                      setWordFormFeedback("");
                    }}
                    style={{
                      background: "#fff",
                      border: "1px solid #cbd5e1",
                      padding: "4px 10px",
                      borderRadius: 8,
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Next Word →
                  </button>
                </div>
                <p style={{ margin: "0 0 10px", fontSize: "0.84rem", color: "#334155" }}>
                  Clue: <strong>{currentWordForm.clue}</strong>
                </p>
                <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                  {currentWordForm.scrambled.map((ch, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setBuiltWord((prev) => prev + ch)}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: "#eff6ff",
                        border: "2px solid #3b82f6",
                        fontWeight: 900,
                        fontSize: "1.1rem",
                        color: "#1e3a8a",
                        cursor: "pointer",
                      }}
                    >
                      {ch}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setBuiltWord("")}
                    style={{
                      padding: "0 12px",
                      borderRadius: 10,
                      border: "1px solid #cbd5e1",
                      background: "#fff",
                      fontSize: "0.76rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Clear
                  </button>
                </div>
                <div style={{ padding: "10px 14px", background: "#fff", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: "1.2rem", fontWeight: 900, letterSpacing: "0.18em", minHeight: 44 }}>
                  {builtWord || "TAP TILES ABOVE"}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const isRight = builtWord.toUpperCase() === currentWordForm.targetWord;
                    recordQuestionResult(isRight, "Word Formation");
                    const msg = isRight
                      ? `🎉 Spot on! You formed the word ${currentWordForm.targetWord} (${currentWordForm.phonics})!`
                      : `💡 Keep trying! Listen to the sounds: ${currentWordForm.phonics}. Starts with '${currentWordForm.targetWord[0]}'.`;
                    setWordFormFeedback(msg);
                    speakText(msg, 0.92);
                  }}
                  style={{
                    marginTop: 10,
                    background: "#7c3aed",
                    color: "#fff",
                    border: "none",
                    padding: "9px 16px",
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                  }}
                >
                  Check Word Formation
                </button>
                {wordFormFeedback && (
                  <div style={{ marginTop: 8, fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>
                    {wordFormFeedback}
                  </div>
                )}
              </div>

              {/* Audio Spelling Coach */}
              <div style={{ background: "#f8fafc", borderRadius: 16, padding: 18, border: "1px solid #cbd5e1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 900 }}>
                    🐝 Audio Spelling Coach
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setSpellingIdx((spellingIdx + 1) % PRONUNCIATION_WORDS.length);
                      setSpellingInput("");
                      setSpellingCoachMsg("");
                    }}
                    style={{
                      background: "#fff",
                      border: "1px solid #cbd5e1",
                      padding: "4px 10px",
                      borderRadius: 8,
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Next Word →
                  </button>
                </div>
                <p style={{ margin: "0 0 10px", fontSize: "0.83rem", color: "#334155" }}>
                  Meaning: <strong>{currentSpelling.meaning}</strong>
                </p>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <button
                    type="button"
                    onClick={() =>
                      speakText(
                        `Spell the word: ${currentSpelling.word}. ${currentSpelling.sentence}`,
                        0.85
                      )
                    }
                    style={{
                      background: "#0284c7",
                      color: "#fff",
                      border: "none",
                      padding: "8px 14px",
                      borderRadius: 10,
                      fontWeight: 800,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    🔊 Hear Word & Sentence
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSpellingCoachMsg(
                        `Syllable hint: ${currentSpelling.syllables} (${currentSpelling.word.length} letters, starts with "${currentSpelling.word[0]}")`
                      )
                    }
                    style={{
                      background: "#fff",
                      border: "1px solid #cbd5e1",
                      padding: "8px 12px",
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: "0.78rem",
                      cursor: "pointer",
                    }}
                  >
                    💡 Give Me a Hint (Don’t Show Answer)
                  </button>
                </div>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type your spelling attempt here..."
                  value={spellingInput}
                  onChange={(e) => setSpellingInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => {
                    const cleanUser = spellingInput.trim().toLowerCase();
                    const cleanTarget = currentSpelling.word.toLowerCase();
                    const isRight = cleanUser === cleanTarget;
                    recordQuestionResult(isRight, "Spelling Practice");
                    if (isRight) {
                      const msg = `🌟 Fantastic spelling! You spelled "${currentSpelling.word}" correctly!`;
                      setSpellingCoachMsg(msg);
                      speakText(msg, 0.94);
                    } else {
                      // Coach without giving away the full answer immediately
                      const msg = `Good effort! Let's sound out the syllables together: ${currentSpelling.syllables}. It starts with "${currentSpelling.word.slice(
                        0,
                        2
                      )}..." and has ${currentSpelling.word.length} letters. Try again!`;
                      setSpellingCoachMsg(msg);
                      speakText(msg, 0.88);
                    }
                  }}
                  style={{
                    marginTop: 10,
                    background: "#10b981",
                    color: "#fff",
                    border: "none",
                    padding: "9px 16px",
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                  }}
                >
                  Check My Spelling
                </button>
                {spellingCoachMsg && (
                  <div style={{ marginTop: 8, fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>
                    {spellingCoachMsg}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB: PICTURE-TO-WORD & SENTENCE CONSTRUCTION */}
          {writingSubTab === "picture-sentence" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
              {/* Picture-to-Word Exercise */}
              <div style={{ background: "#f8fafc", borderRadius: 16, padding: 18, border: "1px solid #cbd5e1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 900 }}>
                    🖼️ Picture-to-Word Exercise
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setPicWordIdx((picWordIdx + 1) % PICTURE_TO_WORD_EXERCISES.length);
                      setPicWordInput("");
                      setPicWordFeedback("");
                    }}
                    style={{
                      background: "#fff",
                      border: "1px solid #cbd5e1",
                      padding: "4px 10px",
                      borderRadius: 8,
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Next Picture →
                  </button>
                </div>
                <div style={{ textAlign: "center", padding: "12px 0" }}>
                  <div style={{ fontSize: "4rem" }}>{currentPicWord.emoji}</div>
                  <div style={{ fontSize: "0.82rem", color: "#475569", marginTop: 4 }}>
                    Hint: {currentPicWord.hint}
                  </div>
                </div>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type the word for this picture..."
                  value={picWordInput}
                  onChange={(e) => setPicWordInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => {
                    const isRight =
                      picWordInput.trim().toUpperCase() === currentPicWord.word;
                    recordQuestionResult(isRight, "Picture-to-Word Writing");
                    const msg = isRight
                      ? `✅ Wonderful! That is a ${currentPicWord.word}! Example sentence: "${currentPicWord.sampleSentence}"`
                      : `💡 Look closely at the hint: ${currentPicWord.hint}. It starts with "${currentPicWord.word[0]}"!`;
                    setPicWordFeedback(msg);
                    speakText(msg, 0.92);
                  }}
                  style={{
                    marginTop: 10,
                    background: "#0284c7",
                    color: "#fff",
                    border: "none",
                    padding: "9px 16px",
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                  }}
                >
                  Check Picture Word
                </button>
                {picWordFeedback && (
                  <div style={{ marginTop: 8, fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>
                    {picWordFeedback}
                  </div>
                )}
              </div>

              {/* Sentence Construction Puzzle */}
              <div style={{ background: "#f8fafc", borderRadius: 16, padding: 18, border: "1px solid #cbd5e1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 900 }}>
                    🧱 Sentence Construction Builder
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setSentencePuzzleIdx(
                        (sentencePuzzleIdx + 1) % SENTENCE_CONSTRUCTION_PUZZLES.length
                      );
                      setSelectedSentenceWords([]);
                      setSentencePuzzleMsg("");
                    }}
                    style={{
                      background: "#fff",
                      border: "1px solid #cbd5e1",
                      padding: "4px 10px",
                      borderRadius: 8,
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Next Sentence →
                  </button>
                </div>
                <p style={{ margin: "0 0 10px", fontSize: "0.8rem", color: "#475569" }}>
                  Tap the scrambled words in the right order to build a complete sentence!
                </p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                  {currentSentencePuzzle.scrambledWords.map((w, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedSentenceWords((prev) => [...prev, w])}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        background: "#fff",
                        border: "1px solid #93c5fd",
                        fontWeight: 800,
                        fontSize: "0.82rem",
                        cursor: "pointer",
                      }}
                    >
                      {w}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedSentenceWords([])}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      background: "#fee2e2",
                      color: "#b91c1c",
                      border: "none",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Reset
                  </button>
                </div>
                <div style={{ padding: 12, background: "#fff", borderRadius: 10, border: "1px solid #cbd5e1", minHeight: 44, fontWeight: 800, fontSize: "0.95rem" }}>
                  {selectedSentenceWords.join(" ") || "Your sentence will appear here..."}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const built = selectedSentenceWords.join(" ").trim();
                    const isRight = built === currentSentencePuzzle.correctSentence;
                    recordQuestionResult(isRight, "Sentence Construction");
                    const msg = isRight
                      ? `🌟 Great sentence construction! "${built}"`
                      : `💡 Tip: ${currentSentencePuzzle.grammarTip}`;
                    setSentencePuzzleMsg(msg);
                    speakText(msg, 0.92);
                  }}
                  style={{
                    marginTop: 10,
                    background: "#7c3aed",
                    color: "#fff",
                    border: "none",
                    padding: "9px 16px",
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                  }}
                >
                  Check Sentence Order
                </button>
                {sentencePuzzleMsg && (
                  <div style={{ marginTop: 8, fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>
                    {sentencePuzzleMsg}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB: SIMPLE GRAMMAR LESSONS & HANDWRITING WORKSHEET UPLOAD */}
          {writingSubTab === "grammar-handwriting" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
              <div style={{ background: "#f8fafc", borderRadius: 16, padding: 18, border: "1px solid #cbd5e1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 900 }}>
                    📘 {currentGrammar.title}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setGrammarIdx((grammarIdx + 1) % GRAMMAR_MINI_LESSONS.length);
                      setGrammarSelectedOpt("");
                      setGrammarFeedback("");
                    }}
                    style={{
                      background: "#fff",
                      border: "1px solid #cbd5e1",
                      padding: "4px 10px",
                      borderRadius: 8,
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Next Lesson →
                  </button>
                </div>
                <p style={{ fontSize: "0.84rem", color: "#334155", lineHeight: 1.5 }}>
                  {currentGrammar.rule}
                </p>
                <div style={{ background: "#fff", padding: 10, borderRadius: 10, border: "1px solid #e2e8f0", fontSize: "0.8rem", marginBottom: 12 }}>
                  <div style={{ color: "#dc2626" }}>✗ {currentGrammar.wrongExample}</div>
                  <div style={{ color: "#059669", fontWeight: 800, marginTop: 4 }}>
                    ✓ {currentGrammar.rightExample}
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: "0.84rem", marginBottom: 8 }}>
                  Quick Check: {currentGrammar.question}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {currentGrammar.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setGrammarSelectedOpt(opt);
                        const isRight = opt === currentGrammar.correctAnswer;
                        recordQuestionResult(isRight, "Grammar Practice");
                        const msg = isRight
                          ? "✅ Correct grammar choice!"
                          : `💡 Remember the rule: ${currentGrammar.rule}`;
                        setGrammarFeedback(msg);
                        speakText(msg, 0.94);
                      }}
                      style={{
                        textAlign: "left",
                        padding: "8px 12px",
                        borderRadius: 8,
                        border:
                          grammarSelectedOpt === opt
                            ? "2px solid #7c3aed"
                            : "1px solid #cbd5e1",
                        background: grammarSelectedOpt === opt ? "#f5f3ff" : "#fff",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {grammarFeedback && (
                  <div style={{ marginTop: 8, fontSize: "0.82rem", fontWeight: 800, color: "#059669" }}>
                    {grammarFeedback}
                  </div>
                )}
              </div>

              {/* Handwriting Worksheet Upload & Own Sentence Coach */}
              <div style={{ background: "#f8fafc", borderRadius: 16, padding: 18, border: "1px solid #cbd5e1" }}>
                <h4 style={{ margin: "0 0 8px", fontSize: "1rem", fontWeight: 900 }}>
                  📷 Upload Handwritten Worksheet & Guided Writing Coach
                </h4>
                <p style={{ margin: "0 0 10px", fontSize: "0.8rem", color: "#475569" }}>
                  Practised handwriting on paper? Upload a photo of your worksheet or write your own sentences below for Bright Buddy coaching!
                </p>
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#ffffff",
                    border: "1px dashed #7c3aed",
                    color: "#6d28d9",
                    padding: "8px 14px",
                    borderRadius: 10,
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    marginBottom: 10,
                  }}
                >
                  <Upload size={15} />
                  <span>Upload Photo of Handwritten Worksheet</span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadedWorksheetName(file.name);
                      const reader = new FileReader();
                      reader.onload = () => {
                        setUploadedWorksheetPreview(String(reader.result || ""));
                        addSkill("Handwriting Worksheet Practice");
                        recordQuestionResult(true, "Handwriting Worksheet Upload");
                        const msg =
                          "Wonderful handwriting upload! Your letter spacing and line alignment are improving nicely.";
                        setGuidedWritingFeedback(msg);
                        speakText(msg, 0.94);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>

                {uploadedWorksheetPreview && (
                  <div style={{ marginBottom: 10 }}>
                    <img
                      src={uploadedWorksheetPreview}
                      alt={uploadedWorksheetName}
                      style={{ maxHeight: 110, borderRadius: 8, border: "1px solid #cbd5e1" }}
                    />
                  </div>
                )}

                <textarea
                  rows={3}
                  className="form-input"
                  placeholder="Write 2–3 sentences of your own here (Bright Buddy will coach your grammar & capitalization without writing it for you)..."
                  value={guidedWritingText}
                  onChange={(e) => setGuidedWritingText(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => {
                    const txt = guidedWritingText.trim();
                    if (!txt) return;
                    const startsCap = /^[A-Z]/.test(txt);
                    const endsPunct = /[.!?]$/.test(txt);
                    const wordCount = txt.split(/\s+/).filter(Boolean).length;
                    const isGood = startsCap && endsPunct && wordCount >= 4;
                    recordQuestionResult(isGood, "Guided Sentence Writing");
                    const tips: string[] = [];
                    if (!startsCap) tips.push("Start your first word with a CAPITAL letter");
                    if (!endsPunct) tips.push("Add a full stop (.) or exclamation mark (!) at the end");
                    if (wordCount < 5) tips.push("Try adding an adjective to describe your noun");
                    const msg =
                      tips.length === 0
                        ? `🌟 Super writing! You wrote ${wordCount} words with a capital letter and proper punctuation!`
                        : `💡 Great start (${wordCount} words)! To make your writing even stronger: ${tips.join(
                            "; "
                          )}.`;
                    setGuidedWritingFeedback(msg);
                    speakText(msg, 0.92);
                  }}
                  style={{
                    marginTop: 8,
                    background: "#0f172a",
                    color: "#fff",
                    border: "none",
                    padding: "9px 16px",
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Check My Writing
                </button>
                {guidedWritingFeedback && (
                  <div style={{ marginTop: 8, fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>
                    {guidedWritingFeedback}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          MODULE 3: AI SPEAKING ASSISTANT (SUPERSPEAKERS PROGRAMME)
          ===================================================================== */}
      {activePillar === "speaking" && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: 20,
            padding: 24,
            border: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "#059669", textTransform: "uppercase" }}>
                3. AI Speaking Assistant • SuperSpeakers Programme
              </span>
              <h3 style={{ margin: "2px 0 0", fontSize: "1.25rem", fontWeight: 900, color: "#0f172a" }}>
                🎙️ Everyday Conversations, Pronunciation, Storytelling & Listening Q&A
              </h3>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[
                { id: "conversation", label: "💬 Everyday Conversations" },
                { id: "pronunciation", label: "🗣️ Pronunciation & Vocabulary" },
                { id: "storytelling", label: "🌟 Storytelling & Confidence Stage" },
                { id: "listening-qa", label: "🎧 Listening Detective & Q&A" },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSpeakingSubTab(st.id as any)}
                  style={{
                    padding: "8px 13px",
                    borderRadius: 10,
                    border: speakingSubTab === st.id ? "2px solid #059669" : "1px solid #cbd5e1",
                    background: speakingSubTab === st.id ? "#ecfdf5" : "#f8fafc",
                    color: "#0f172a",
                    fontWeight: 800,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                  }}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* SUB-TAB 1: EVERYDAY ENGLISH CONVERSATIONS */}
          {speakingSubTab === "conversation" && (
            <div style={{ background: "#f8fafc", borderRadius: 16, padding: 20, border: "1px solid #cbd5e1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 900 }}>
                    💬 {currentConv.title}
                  </h4>
                  <div style={{ fontSize: "0.8rem", color: "#475569" }}>{currentConv.scenario}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {SUPERSPEAKERS_ACTIVITIES.conversations.map((c, idx) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setConvIdx(idx);
                        setExchangeIdx(0);
                        setConvChildReply("");
                        setConvCoachFeedback("");
                      }}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        border: convIdx === idx ? "2px solid #059669" : "1px solid #cbd5e1",
                        background: convIdx === idx ? "#ecfdf5" : "#fff",
                        fontSize: "0.76rem",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      Dialogue {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background: "#ffffff", padding: 16, borderRadius: 12, border: "1px solid #bae6fd", marginBottom: 12 }}>
                <div style={{ fontSize: "0.74rem", fontWeight: 800, color: "#0284c7" }}>
                  🤖 BRIGHT BUDDY SAYS (Turn {exchangeIdx + 1} of {currentConv.exchanges.length}):
                </div>
                <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", margin: "6px 0" }}>
                  “{currentExchange.aiLine}”
                </div>
                <div style={{ fontSize: "0.78rem", color: "#059669", fontWeight: 700 }}>
                  💡 Speaking Tip ({currentExchange.focusSkill}): Try saying something like:{" "}
                  <em>“{currentExchange.suggestedReply}”</em>
                </div>
                <button
                  type="button"
                  onClick={() => speakText(currentExchange.aiLine, 0.92)}
                  style={{
                    marginTop: 8,
                    background: "#0284c7",
                    color: "#fff",
                    border: "none",
                    padding: "7px 14px",
                    borderRadius: 8,
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  🔊 Hear Bright Buddy Speak
                </button>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                <button
                  type="button"
                  onClick={() =>
                    listenWithMic((txt) => {
                      setConvChildReply(txt);
                    })
                  }
                  style={{
                    background: "#10b981",
                    color: "#fff",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                  }}
                >
                  🎤 Speak My Reply Aloud
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const words = convChildReply.trim().split(/\s+/).filter(Boolean);
                    const isGood = words.length >= 4;
                    recordQuestionResult(isGood, "Everyday English Conversation");
                    const msg = isGood
                      ? `🌟 Confident speaking, ${studentName.split(" ")[0]}! You replied in a clear, polite sentence!`
                      : `💡 Try speaking a complete sentence of at least 5 words! Example: "${currentExchange.suggestedReply}"`;
                    setConvCoachFeedback(msg);
                    speakText(msg, 0.94);
                  }}
                  style={{
                    background: "#0f172a",
                    color: "#fff",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                  }}
                >
                  Evaluate My Spoken Reply
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExchangeIdx((exchangeIdx + 1) % currentConv.exchanges.length);
                    setConvChildReply("");
                    setConvCoachFeedback("");
                  }}
                  style={{
                    background: "#fff",
                    border: "1px solid #cbd5e1",
                    padding: "10px 14px",
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Next Conversation Turn →
                </button>
              </div>

              <input
                type="text"
                className="form-input"
                placeholder="Your spoken conversation reply appears here (or type to test)..."
                value={convChildReply}
                onChange={(e) => setConvChildReply(e.target.value)}
              />
              {convCoachFeedback && (
                <div style={{ marginTop: 10, fontWeight: 800, fontSize: "0.85rem", color: "#059669" }}>
                  {convCoachFeedback}
                </div>
              )}
            </div>
          )}

          {/* SUB-TAB 2: PRONUNCIATION & VOCABULARY DEVELOPMENT */}
          {speakingSubTab === "pronunciation" && (
            <div style={{ background: "#f8fafc", borderRadius: 16, padding: 20, border: "1px solid #cbd5e1" }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                {PRONUNCIATION_WORDS.map((pw, idx) => (
                  <button
                    key={pw.word}
                    type="button"
                    onClick={() => {
                      setPronWordIdx(idx);
                      setPronSpokenText("");
                      setPronEvaluation("");
                    }}
                    style={{
                      padding: "7px 14px",
                      borderRadius: 999,
                      border: pronWordIdx === idx ? "2px solid #059669" : "1px solid #cbd5e1",
                      background: pronWordIdx === idx ? "#ecfdf5" : "#fff",
                      fontWeight: 800,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    {pw.word}
                  </button>
                ))}
              </div>

              {(() => {
                const pw = PRONUNCIATION_WORDS[pronWordIdx];
                return (
                  <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#059669" }}>
                      SYLLABLES: {pw.syllables} • PHONETIC GUIDE: [{pw.phonetic}]
                    </div>
                    <h4 style={{ fontSize: "2rem", fontWeight: 900, margin: "6px 0", color: "#0f172a" }}>
                      {pw.word}
                    </h4>
                    <p style={{ margin: "0 0 6px", fontSize: "0.88rem", color: "#334155" }}>
                      <strong>Vocabulary Meaning:</strong> {pw.meaning}
                    </p>
                    <p style={{ margin: "0 0 14px", fontSize: "0.86rem", fontStyle: "italic", color: "#0284c7" }}>
                      Example Sentence: “{pw.sentence}”
                    </p>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                      <button
                        type="button"
                        onClick={() => speakText(pw.word, 0.94)}
                        style={{
                          background: "#0284c7",
                          color: "#fff",
                          border: "none",
                          padding: "9px 16px",
                          borderRadius: 10,
                          fontWeight: 800,
                          fontSize: "0.8rem",
                          cursor: "pointer",
                        }}
                      >
                        🔊 Hear Normal Speed
                      </button>
                      <button
                        type="button"
                        onClick={() => speakText(`${pw.syllables}. ${pw.word}`, 0.65)}
                        style={{
                          background: "#f59e0b",
                          color: "#071527",
                          border: "none",
                          padding: "9px 16px",
                          borderRadius: 10,
                          fontWeight: 800,
                          fontSize: "0.8rem",
                          cursor: "pointer",
                        }}
                      >
                        🐢 Hear Syllable-by-Syllable
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          listenWithMic((txt) => {
                            setPronSpokenText(txt);
                            const match = txt.toLowerCase().includes(pw.word.toLowerCase());
                            recordQuestionResult(match, "Vocabulary & Pronunciation");
                            if (match) {
                              setWordsPronouncedCorrectly((prev) =>
                                Array.from(new Set([...prev, pw.word]))
                              );
                              const msg = `🎉 Spot-on pronunciation of "${pw.word}"! Now try using "${pw.word}" in your own spoken sentence!`;
                              setPronEvaluation(msg);
                              speakText(msg, 0.94);
                            } else {
                              setWordsNeedingImprovement((prev) =>
                                Array.from(new Set([...prev, pw.word.toLowerCase()]))
                              );
                              const msg = `Wonderful try! Let's say it together: ${pw.syllables}. Can you try again?`;
                              setPronEvaluation(msg);
                              speakText(msg, 0.86);
                            }
                          });
                        }}
                        style={{
                          background: "#10b981",
                          color: "#fff",
                          border: "none",
                          padding: "9px 16px",
                          borderRadius: 10,
                          fontWeight: 800,
                          fontSize: "0.8rem",
                          cursor: "pointer",
                        }}
                      >
                        🎤 Say “{pw.word}” into Mic
                      </button>
                    </div>
                    {pronEvaluation && (
                      <div style={{ padding: 12, borderRadius: 10, background: "#ecfdf5", fontWeight: 800, fontSize: "0.84rem", color: "#065f46" }}>
                        {pronEvaluation}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* SUB-TAB 3: STORYTELLING & CONFIDENCE-BUILDING SPEAKING */}
          {speakingSubTab === "storytelling" && (
            <div style={{ background: "#f8fafc", borderRadius: 16, padding: 20, border: "1px solid #cbd5e1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 900 }}>
                  🌟 SuperSpeakers Storytelling Stage: {currentStoryStarter.title}
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setStoryStarterIdx(
                      (storyStarterIdx + 1) % SUPERSPEAKERS_ACTIVITIES.storytellingPrompts.length
                    );
                    setChildStoryTranscript("");
                    setStoryCoachingFeedback("");
                  }}
                  style={{
                    background: "#fff",
                    border: "1px solid #cbd5e1",
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontSize: "0.76rem",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Next Story Prompt →
                </button>
              </div>
              <div style={{ background: "#fff", padding: 14, borderRadius: 12, border: "1px solid #cbd5e1", marginBottom: 12 }}>
                <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.95rem" }}>
                  Story Starter: “{currentStoryStarter.starter}”
                </div>
                <ul style={{ margin: "8px 0", paddingLeft: 18, fontSize: "0.82rem", color: "#475569" }}>
                  {currentStoryStarter.guidingQuestions.map((gq, i) => (
                    <li key={i}>{gq}</li>
                  ))}
                </ul>
                <div style={{ fontSize: "0.78rem", color: "#059669", fontWeight: 800 }}>
                  Power Words to Try Using: {currentStoryStarter.powerWords.join(" • ")}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                <button
                  type="button"
                  onClick={() => speakText(currentStoryStarter.starter, 0.92)}
                  style={{
                    background: "#0284c7",
                    color: "#fff",
                    border: "none",
                    padding: "9px 14px",
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  🔊 Hear Story Starter
                </button>
                <button
                  type="button"
                  onClick={() =>
                    listenWithMic((txt) => {
                      setChildStoryTranscript(txt);
                    })
                  }
                  style={{
                    background: "#10b981",
                    color: "#fff",
                    border: "none",
                    padding: "9px 16px",
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  🎤 Tell My Story Aloud
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const words = childStoryTranscript.trim().split(/\s+/).filter(Boolean);
                    const usedPower = currentStoryStarter.powerWords.filter((pw) =>
                      childStoryTranscript.toLowerCase().includes(pw.toLowerCase())
                    );
                    recordQuestionResult(words.length >= 6, "Storytelling & Sentence Formation");
                    const msg =
                      words.length >= 6
                        ? `👏 Standing ovation, ${studentName.split(" ")[0]}! You told a vivid story of ${
                            words.length
                          } words${
                            usedPower.length > 0
                              ? ` and used power vocabulary (${usedPower.join(", ")})`
                              : ""
                          }!`
                        : "💡 Great start! Try adding 2 or 3 full sentences to describe what happened next in your adventure!";
                    setStoryCoachingFeedback(msg);
                    speakText(msg, 0.94);
                  }}
                  style={{
                    background: "#0f172a",
                    color: "#fff",
                    border: "none",
                    padding: "9px 16px",
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Get SuperSpeakers Feedback
                </button>
              </div>
              <textarea
                rows={3}
                className="form-input"
                placeholder="Your spoken story appears here (or type your speech to practise)..."
                value={childStoryTranscript}
                onChange={(e) => setChildStoryTranscript(e.target.value)}
              />
              {storyCoachingFeedback && (
                <div style={{ marginTop: 10, fontWeight: 800, fontSize: "0.85rem", color: "#059669" }}>
                  {storyCoachingFeedback}
                </div>
              )}
            </div>
          )}

          {/* SUB-TAB 4: LISTENING EXERCISES & Q&A SESSIONS */}
          {speakingSubTab === "listening-qa" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
              <div style={{ background: "#f8fafc", borderRadius: 16, padding: 18, border: "1px solid #cbd5e1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 900 }}>
                    🎧 {currentListening.title}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setListeningIdx(
                        (listeningIdx + 1) % SUPERSPEAKERS_ACTIVITIES.listeningExercises.length
                      );
                      setListeningAnswers({});
                      setShowListeningScript(false);
                    }}
                    style={{
                      background: "#fff",
                      border: "1px solid #cbd5e1",
                      padding: "4px 10px",
                      borderRadius: 8,
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Next Audio →
                  </button>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <button
                    type="button"
                    onClick={() => speakText(currentListening.audioScript, 0.9)}
                    style={{
                      background: "#0284c7",
                      color: "#fff",
                      border: "none",
                      padding: "9px 14px",
                      borderRadius: 10,
                      fontWeight: 800,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    🔊 Play Listening Passage
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowListeningScript(!showListeningScript)}
                    style={{
                      background: "#fff",
                      border: "1px solid #cbd5e1",
                      padding: "9px 12px",
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: "0.76rem",
                      cursor: "pointer",
                    }}
                  >
                    {showListeningScript ? "Hide Text" : "Show Transcript"}
                  </button>
                </div>
                {showListeningScript && (
                  <p style={{ fontSize: "0.82rem", background: "#fff", padding: 10, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                    {currentListening.audioScript}
                  </p>
                )}
                {currentListening.questions.map((lq, qIdx) => (
                  <div key={qIdx} style={{ marginTop: 10 }}>
                    <div style={{ fontWeight: 800, fontSize: "0.84rem", marginBottom: 6 }}>
                      {lq.q}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {lq.options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setListeningAnswers((prev) => ({ ...prev, [qIdx]: opt }));
                            const isRight = opt === lq.answer;
                            recordQuestionResult(isRight, "Active Listening Comprehension");
                            speakText(
                              isRight
                                ? "Great listening ears! That is correct!"
                                : "Listen to the passage one more time and try again!",
                              0.94
                            );
                          }}
                          style={{
                            textAlign: "left",
                            padding: "7px 12px",
                            borderRadius: 8,
                            border:
                              listeningAnswers[qIdx] === opt
                                ? "2px solid #0284c7"
                                : "1px solid #cbd5e1",
                            background: listeningAnswers[qIdx] === opt ? "#e0f2fe" : "#fff",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Confidence Q&A Session */}
              <div style={{ background: "#f8fafc", borderRadius: 16, padding: 18, border: "1px solid #cbd5e1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 900 }}>
                    🎤 Confidence Q&A Session
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setQaIdx((qaIdx + 1) % SUPERSPEAKERS_ACTIVITIES.qaPrompts.length);
                      setQaReply("");
                      setQaFeedback("");
                    }}
                    style={{
                      background: "#fff",
                      border: "1px solid #cbd5e1",
                      padding: "4px 10px",
                      borderRadius: 8,
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Next Question →
                  </button>
                </div>
                <p style={{ fontSize: "0.9rem", fontWeight: 800, color: "#0f172a" }}>
                  “{currentQa.question}”
                </p>
                <p style={{ fontSize: "0.78rem", color: "#059669", fontWeight: 700 }}>
                  💡 {currentQa.tip}
                </p>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <button
                    type="button"
                    onClick={() => speakText(currentQa.question, 0.92)}
                    style={{
                      background: "#0284c7",
                      color: "#fff",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: 8,
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    🔊 Ask Me Aloud
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      listenWithMic((txt) => {
                        setQaReply(txt);
                      })
                    }
                    style={{
                      background: "#10b981",
                      color: "#fff",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: 8,
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    🎤 Speak Answer
                  </button>
                </div>
                <textarea
                  rows={2}
                  className="form-input"
                  placeholder="Your spoken Q&A response..."
                  value={qaReply}
                  onChange={(e) => setQaReply(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => {
                    const count = qaReply.trim().split(/\s+/).filter(Boolean).length;
                    recordQuestionResult(count >= 5, "Confidence Q&A Speaking");
                    const msg =
                      count >= 5
                        ? `🌟 Articulate and thoughtful answer (${count} words)!`
                        : "💡 Try answering in a full sentence with 'because'!";
                    setQaFeedback(msg);
                    speakText(msg, 0.94);
                  }}
                  style={{
                    marginTop: 8,
                    background: "#0f172a",
                    color: "#fff",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: 8,
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Check Q&A Response
                </button>
                {qaFeedback && (
                  <div style={{ marginTop: 8, fontSize: "0.82rem", fontWeight: 800, color: "#059669" }}>
                    {qaFeedback}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          MODULE 4: AI MATHEMATICS ASSISTANT
          ===================================================================== */}
      {activePillar === "math" && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: 20,
            padding: 24,
            border: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "#d97706", textTransform: "uppercase" }}>
                4. AI Mathematics Assistant • Interactive Visual Math
              </span>
              <h3 style={{ margin: "2px 0 0", fontSize: "1.25rem", fontWeight: 900, color: "#0f172a" }}>
                🧮 Number Recognition, Counting, +, −, ×, Shapes & Word Problems
              </h3>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[
                { id: "numbers-counting", label: "🔢 Numbers & Counting" },
                { id: "operations", label: "➕➖✖️ Addition, Subtraction & Multiplication" },
                { id: "shapes", label: "🔺 2D & 3D Shapes" },
                { id: "word-problems", label: "📘 Step-by-Step Word Problems" },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setMathSubTab(st.id as any)}
                  style={{
                    padding: "8px 13px",
                    borderRadius: 10,
                    border: mathSubTab === st.id ? "2px solid #d97706" : "1px solid #cbd5e1",
                    background: mathSubTab === st.id ? "#fffbeb" : "#f8fafc",
                    color: "#0f172a",
                    fontWeight: 800,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                  }}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* MATH SUB-TAB 1: NUMBER RECOGNITION & COUNTING */}
          {mathSubTab === "numbers-counting" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
              {/* Audio Number Recognition */}
              <div style={{ background: "#f8fafc", borderRadius: 16, padding: 18, border: "1px solid #cbd5e1" }}>
                <h4 style={{ margin: "0 0 8px", fontSize: "1rem", fontWeight: 900 }}>
                  🎧 Number Recognition Challenge
                </h4>
                <p style={{ margin: "0 0 12px", fontSize: "0.82rem", color: "#475569" }}>
                  Listen to Bright Buddy say a number aloud and tap the matching number!
                </p>
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  <button
                    type="button"
                    onClick={() => speakText(`Find the number ${targetNumber}!`, 0.92)}
                    style={{
                      background: "#0284c7",
                      color: "#fff",
                      border: "none",
                      padding: "9px 14px",
                      borderRadius: 10,
                      fontWeight: 800,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    🔊 Hear Target Number
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const nextTarget = Math.floor(Math.random() * 20) + 1;
                      const setChoices = new Set<number>([nextTarget]);
                      while (setChoices.size < 4) {
                        setChoices.add(Math.floor(Math.random() * 20) + 1);
                      }
                      const shuffled = Array.from(setChoices).sort(() => Math.random() - 0.5);
                      setTargetNumber(nextTarget);
                      setNumberQuizChoices(shuffled);
                      setNumberQuizFeedback("");
                      speakText(`Find the number ${nextTarget}!`, 0.92);
                    }}
                    style={{
                      background: "#fff",
                      border: "1px solid #cbd5e1",
                      padding: "9px 14px",
                      borderRadius: 10,
                      fontWeight: 800,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    🔄 New Number
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                  {numberQuizChoices.map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        const isRight = num === targetNumber;
                        recordQuestionResult(isRight, "Number Recognition");
                        const msg = isRight
                          ? `🎉 Yes! That is the number ${num}!`
                          : `💡 That is ${num}. Listen again and look for ${targetNumber}!`;
                        setNumberQuizFeedback(msg);
                        speakText(msg, 0.94);
                      }}
                      style={{
                        padding: "16px 0",
                        borderRadius: 12,
                        background: "#fff",
                        border: "2px solid #93c5fd",
                        fontSize: "1.5rem",
                        fontWeight: 900,
                        color: "#1e3a8a",
                        cursor: "pointer",
                      }}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                {numberQuizFeedback && (
                  <div style={{ marginTop: 10, fontWeight: 800, fontSize: "0.84rem", color: "#059669" }}>
                    {numberQuizFeedback}
                  </div>
                )}
              </div>

              {/* Interactive Visual Counting */}
              <div style={{ background: "#f8fafc", borderRadius: 16, padding: 18, border: "1px solid #cbd5e1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 900 }}>
                    🍎 Interactive Object Counting ({countedSoFar} of {countingTarget})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const next = Math.floor(Math.random() * 8) + 3;
                      setCountingTarget(next);
                      setCountedSoFar(0);
                    }}
                    style={{
                      background: "#fff",
                      border: "1px solid #cbd5e1",
                      padding: "4px 10px",
                      borderRadius: 8,
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    New Count →
                  </button>
                </div>
                <p style={{ margin: "0 0 10px", fontSize: "0.82rem", color: "#475569" }}>
                  Tap each apple one by one to count aloud with Bright Buddy up to{" "}
                  <strong>{countingTarget}</strong>!
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", padding: 12, background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                  {Array.from({ length: countingTarget }).map((_, idx) => {
                    const isCounted = idx < countedSoFar;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const nextVal = idx + 1;
                          setCountedSoFar(nextVal);
                          speakText(String(nextVal), 1.0);
                          if (nextVal === countingTarget) {
                            recordQuestionResult(true, "Object Counting");
                            setTimeout(() => {
                              speakText(
                                `Awesome counting! You counted all ${countingTarget} apples!`,
                                0.94
                              );
                            }, 500);
                          }
                        }}
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 12,
                          border: isCounted ? "2px solid #10b981" : "1px dashed #cbd5e1",
                          background: isCounted ? "#ecfdf5" : "#f8fafc",
                          fontSize: "1.6rem",
                          cursor: "pointer",
                          position: "relative",
                        }}
                      >
                        🍎
                        {isCounted && (
                          <span
                            style={{
                              position: "absolute",
                              bottom: 2,
                              right: 4,
                              fontSize: "0.7rem",
                              fontWeight: 900,
                              color: "#059669",
                            }}
                          >
                            {idx + 1}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* MATH SUB-TAB 2: ADDITION, SUBTRACTION & MULTIPLICATION */}
          {mathSubTab === "operations" && (
            <div style={{ background: "#f8fafc", borderRadius: 16, padding: 20, border: "1px solid #cbd5e1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  {[
                    { op: "+", label: "➕ Addition" },
                    { op: "-", label: "➖ Subtraction" },
                    { op: "×", label: "✖️ Multiplication" },
                  ].map((item) => (
                    <button
                      key={item.op}
                      type="button"
                      onClick={() => {
                        setMathOpType(item.op as any);
                        setMathUserAns("");
                        setMathExplanation("");
                        setMathIsCorrect(null);
                        if (item.op === "-") {
                          setMathNumA(9);
                          setMathNumB(4);
                        } else if (item.op === "×") {
                          setMathNumA(3);
                          setMathNumB(4);
                        } else {
                          setMathNumA(5);
                          setMathNumB(3);
                        }
                      }}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 10,
                        border: mathOpType === item.op ? "2px solid #d97706" : "1px solid #cbd5e1",
                        background: mathOpType === item.op ? "#fffbeb" : "#fff",
                        fontWeight: 800,
                        fontSize: "0.82rem",
                        cursor: "pointer",
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const a = Math.floor(Math.random() * 7) + 3;
                    const b = Math.floor(Math.random() * (mathOpType === "-" ? a - 1 : 6)) + 1;
                    setMathNumA(a);
                    setMathNumB(b);
                    setMathUserAns("");
                    setMathExplanation("");
                    setMathIsCorrect(null);
                  }}
                  style={{
                    background: "#0f172a",
                    color: "#fff",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  🎲 New Math Question
                </button>
              </div>

              {/* Visual Manipulatives Representation */}
              <div style={{ background: "#fff", padding: 18, borderRadius: 14, border: "1px solid #e2e8f0", marginBottom: 14 }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0f172a", marginBottom: 8 }}>
                  {mathNumA} {mathOpType} {mathNumB} = ?
                </div>
                <div style={{ fontSize: "1.2rem", marginBottom: 12 }}>
                  {mathOpType === "+" && (
                    <span>
                      {"⭐".repeat(mathNumA)} <strong>+</strong> {"🌟".repeat(mathNumB)}
                    </span>
                  )}
                  {mathOpType === "-" && (
                    <span>
                      Start with {"🍎".repeat(mathNumA)} → Take away {mathNumB}
                    </span>
                  )}
                  {mathOpType === "×" && (
                    <span>
                      {Array.from({ length: mathNumA })
                        .map(() => `[${"🟦".repeat(mathNumB)}]`)
                        .join(" + ")}{" "}
                      ({mathNumA} equal groups of {mathNumB})
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    type="number"
                    className="form-input"
                    style={{ maxWidth: 160, fontSize: "1.1rem", fontWeight: 800 }}
                    placeholder="Your answer"
                    value={mathUserAns}
                    onChange={(e) => setMathUserAns(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const expected =
                        mathOpType === "+"
                          ? mathNumA + mathNumB
                          : mathOpType === "-"
                          ? mathNumA - mathNumB
                          : mathNumA * mathNumB;
                      const isRight = Number(mathUserAns) === expected;
                      setMathIsCorrect(isRight);
                      recordQuestionResult(
                        isRight,
                        mathOpType === "+"
                          ? "Addition"
                          : mathOpType === "-"
                          ? "Subtraction"
                          : "Multiplication"
                      );

                      const explanation =
                        mathOpType === "+"
                          ? `Interactive Explanation: Start at ${mathNumA} and count forward ${mathNumB} steps (${Array.from(
                              { length: mathNumB },
                              (_, i) => mathNumA + i + 1
                            ).join(" → ")}). So ${mathNumA} + ${mathNumB} = ${expected}!`
                          : mathOpType === "-"
                          ? `Interactive Explanation: Start with ${mathNumA} items and count backward ${mathNumB} steps (${Array.from(
                              { length: mathNumB },
                              (_, i) => mathNumA - i - 1
                            ).join(" → ")}). So ${mathNumA} - ${mathNumB} = ${expected}!`
                          : `Interactive Explanation: ${mathNumA} × ${mathNumB} means ${mathNumA} equal groups of ${mathNumB}: ${Array.from(
                              { length: mathNumA },
                              () => mathNumB
                            ).join(" + ")} = ${expected}!`;

                      const prefix = isRight
                        ? `🎉 Correct! ${mathNumA} ${mathOpType} ${mathNumB} = ${expected}! `
                        : `💡 Almost! Let's solve it step-by-step together. `;
                      setMathExplanation(prefix + explanation);
                      speakText(prefix + explanation, 0.92);
                    }}
                    style={{
                      background: "#10b981",
                      color: "#fff",
                      border: "none",
                      padding: "10px 18px",
                      borderRadius: 10,
                      fontWeight: 800,
                      fontSize: "0.84rem",
                      cursor: "pointer",
                    }}
                  >
                    Check & Hear Step-by-Step Explanation
                  </button>
                </div>

                {mathExplanation && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 14,
                      borderRadius: 12,
                      background: mathIsCorrect ? "#ecfdf5" : "#fffbeb",
                      border: mathIsCorrect ? "1px solid #a7f3d0" : "1px solid #fde68a",
                      fontWeight: 700,
                      fontSize: "0.86rem",
                      color: "#0f172a",
                    }}
                  >
                    {mathExplanation}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MATH SUB-TAB 3: SHAPES */}
          {mathSubTab === "shapes" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              {MATH_SHAPES_LIBRARY.map((sh, idx) => (
                <div
                  key={sh.name}
                  onClick={() => {
                    setShapeIdx(idx);
                    addSkill("Geometry & Shapes");
                    speakText(
                      `${sh.name}. ${sh.description} Real world examples include: ${sh.realWorld}.`,
                      0.92
                    );
                  }}
                  style={{
                    background: shapeIdx === idx ? "#fffbeb" : "#f8fafc",
                    border: shapeIdx === idx ? "2px solid #d97706" : "1px solid #cbd5e1",
                    borderRadius: 14,
                    padding: 16,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: "2.4rem" }}>{sh.emoji}</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#0f172a", marginTop: 4 }}>
                    {sh.name}
                  </div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#d97706", margin: "4px 0" }}>
                    Sides: {sh.sides} • Corners: {sh.corners}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#334155" }}>{sh.description}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 6 }}>
                    <strong>Real-world:</strong> {sh.realWorld}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MATH SUB-TAB 4: SIMPLE WORD PROBLEMS */}
          {mathSubTab === "word-problems" && (
            <div style={{ background: "#f8fafc", borderRadius: 16, padding: 20, border: "1px solid #cbd5e1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 900 }}>
                  📘 {currentWordProb.title}
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setWordProbIdx((wordProbIdx + 1) % MATH_WORD_PROBLEMS.length);
                    setWordProbInput("");
                    setWordProbFeedback("");
                    setShowWordProbSteps(false);
                  }}
                  style={{
                    background: "#fff",
                    border: "1px solid #cbd5e1",
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontSize: "0.76rem",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Next Word Problem →
                </button>
              </div>

              <div style={{ background: "#fff", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 12 }}>
                <p style={{ margin: "0 0 10px", fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
                  {currentWordProb.visualEmoji} “{currentWordProb.story}”
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => speakText(currentWordProb.story, 0.9)}
                    style={{
                      background: "#0284c7",
                      color: "#fff",
                      border: "none",
                      padding: "7px 12px",
                      borderRadius: 8,
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    🔊 Read Problem Aloud
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowWordProbSteps(true);
                      speakText(currentWordProb.steps.join(" "), 0.9);
                    }}
                    style={{
                      background: "#fffbeb",
                      color: "#b45309",
                      border: "1px solid #fcd34d",
                      padding: "7px 12px",
                      borderRadius: 8,
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    💡 Show Interactive Step-by-Step Hint
                  </button>
                </div>
              </div>

              {showWordProbSteps && (
                <div style={{ background: "#fffbeb", padding: 14, borderRadius: 12, border: "1px solid #fde68a", marginBottom: 12 }}>
                  {currentWordProb.steps.map((st, i) => (
                    <div key={i} style={{ fontSize: "0.84rem", fontWeight: 700, color: "#78350f", marginBottom: 4 }}>
                      {st}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="number"
                  className="form-input"
                  style={{ maxWidth: 160 }}
                  placeholder="Answer..."
                  value={wordProbInput}
                  onChange={(e) => setWordProbInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => {
                    const isRight = Number(wordProbInput) === currentWordProb.answer;
                    recordQuestionResult(isRight, "Math Word Problems");
                    setShowWordProbSteps(true);
                    const msg = isRight
                      ? `🎉 Spot on! ${currentWordProb.numA} ${currentWordProb.operator} ${currentWordProb.numB} = ${currentWordProb.answer}!`
                      : `💡 Let's look at the 3 steps above: ${currentWordProb.numA} ${currentWordProb.operator} ${currentWordProb.numB} = ${currentWordProb.answer}.`;
                    setWordProbFeedback(msg);
                    speakText(msg, 0.92);
                  }}
                  style={{
                    background: "#10b981",
                    color: "#fff",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                  }}
                >
                  Check Word Problem
                </button>
              </div>
              {wordProbFeedback && (
                <div style={{ marginTop: 10, fontWeight: 800, fontSize: "0.85rem", color: "#059669" }}>
                  {wordProbFeedback}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          MODULE 5: AI LEARNING ASSESSMENT & COMPLETE HISTORY
          ===================================================================== */}
      {activePillar === "assessment" && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: 20,
            padding: 24,
            border: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "#4f46e5", textTransform: "uppercase" }}>
                5. AI Learning Assessment • Automatically Synced with Teacher Dashboard
              </span>
              <h3 style={{ margin: "2px 0 0", fontSize: "1.25rem", fontWeight: 900, color: "#0f172a" }}>
                📊 Current Session Summary & Complete AI Learning History
              </h3>
            </div>

            <button
              type="button"
              onClick={handleSaveSessionAssessment}
              disabled={savingAssessment}
              className="btn btn-primary shining"
              style={{ padding: "10px 20px" }}
            >
              <CheckCircle2 size={16} />
              <span>
                {savingAssessment
                  ? "Saving Session Assessment..."
                  : "Save Current Session to Teacher & Parent Report"}
              </span>
            </button>
          </div>

          {/* 9 Required Assessment Metrics Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 14,
            }}
          >
            <div style={{ background: "#f8fafc", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b" }}>1. SKILLS PRACTISED</div>
              <div style={{ fontSize: "0.86rem", fontWeight: 800, color: "#0f172a", marginTop: 4 }}>
                {skillsPractised.join(", ")}
              </div>
            </div>
            <div style={{ background: "#f8fafc", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b" }}>2. QUESTIONS ATTEMPTED</div>
              <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#1d4ed8", marginTop: 4 }}>
                {questionsAttempted}
              </div>
            </div>
            <div style={{ background: "#ecfdf5", padding: 14, borderRadius: 12, border: "1px solid #a7f3d0" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#047857" }}>3. CORRECT ANSWERS</div>
              <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#059669", marginTop: 4 }}>
                {correctAnswers}
              </div>
            </div>
            <div style={{ background: "#fef2f2", padding: 14, borderRadius: 12, border: "1px solid #fecaca" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#b91c1c" }}>4. INCORRECT ANSWERS</div>
              <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#dc2626", marginTop: 4 }}>
                {incorrectAnswers}
              </div>
            </div>
            <div style={{ background: "#f8fafc", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b" }}>
                5. WORDS PRONOUNCED CORRECTLY
              </div>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#059669", marginTop: 4 }}>
                {wordsPronouncedCorrectly.length > 0
                  ? wordsPronouncedCorrectly.join(", ")
                  : "Practise reading aloud to populate"}
              </div>
            </div>
            <div style={{ background: "#fffbeb", padding: 14, borderRadius: 12, border: "1px solid #fde68a" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#b45309" }}>
                6. WORDS NEEDING IMPROVEMENT
              </div>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#92400e", marginTop: 4 }}>
                {wordsNeedingImprovement.length > 0
                  ? wordsNeedingImprovement.join(", ")
                  : "None flagged in this session"}
                {wordsImprovedOnRetry.length > 0 && (
                  <div style={{ color: "#15803d", marginTop: 2 }}>
                    ✓ Improved on retry: {wordsImprovedOnRetry.join(", ")}
                  </div>
                )}
              </div>
            </div>
            <div style={{ background: "#f8fafc", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b" }}>7. TIME SPENT LEARNING</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "#0f172a", marginTop: 4 }}>
                {elapsedMinutes} min(s)
              </div>
            </div>
            <div style={{ background: "#eef2ff", padding: 14, borderRadius: 12, border: "1px solid #c7d2fe" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#4338ca" }}>8. CURRENT MASTERY LEVEL</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "#4f46e5", marginTop: 4 }}>
                {currentMasteryLevel} ({accuracyRatio}%)
              </div>
            </div>
            <div style={{ background: "#f0fdf4", padding: 14, borderRadius: 12, border: "1px solid #bbf7d0" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#15803d" }}>
                9. RECOMMENDED NEXT ACTIVITY
              </div>
              <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#065f46", marginTop: 4 }}>
                {recommendedNextActivity}
              </div>
            </div>
          </div>

          {/* Saved History List */}
          <div>
            <h4 style={{ margin: "0 0 10px", fontSize: "1rem", fontWeight: 900 }}>
              📜 Saved Bright Buddy Sessions ({aiLogs.length})
            </h4>
            {aiLogs.length === 0 ? (
              <div style={{ padding: 18, background: "#f8fafc", borderRadius: 12, color: "#64748b", fontSize: "0.85rem" }}>
                No saved sessions yet. Click “Save Current Session to Teacher & Parent Report” above after practising!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {aiLogs.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      padding: 14,
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, fontWeight: 800, fontSize: "0.88rem" }}>
                      <span>
                        {log.topic} • Mastery: {log.masteryLevel || "Proficient"} ({log.score}%)
                      </span>
                      <span style={{ color: "#64748b", fontSize: "0.76rem" }}>
                        ⏱️ {log.timeSpentMinutes || 5} mins •{" "}
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#334155", marginTop: 4 }}>
                      {log.feedback}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
