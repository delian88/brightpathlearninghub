import { NextResponse } from "next/server";
import { getLmsData, saveLmsData, getStudentAccounts } from "@/db";
import {
  getOrCreateStudentProgress,
  evaluateHomeworkQuestion,
  computeStudentRewardsAndAchievements,
  type HomeworkAssignment,
  type HomeworkQuestion,
  type HomeworkSubmission,
  type StudentQuestionAnswer,
  type QuestionGradeEvaluation,
  type AssignmentLifecycleStatus,
  type StudentReportCard,
  type PortalNotification,
  type AiPracticeLog,
  type BadgeCategory,
  type AdminSystemUser,
} from "@/lib/lmsData";
import { sendReportCardEmail, sendCalendarEventEmail } from "@/lib/email";

function inferMarkingMethod(type: string) {
  switch (type) {
    case "multiple-choice":
    case "true-false":
    case "matching":
    case "fill-in-blank":
    case "spelling":
    case "objective":
      return "automatic" as const;
    case "creative-writing":
      return "teacher-ai-suggestions" as const;
    case "reading-comprehension":
    case "handwriting":
    case "recorded-reading":
    case "subjective":
    default:
      return "ai-teacher-review" as const;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentUsername = searchParams.get("studentUsername")?.trim().toUpperCase();
    const studentName = searchParams.get("studentName")?.trim() || "Bright Scholar";
    const courseName = searchParams.get("courseName")?.trim() || "";

    const lms = await getLmsData();

    if (studentUsername) {
      const progress = getOrCreateStudentProgress(lms, studentUsername, studentName);
      const todayIso = new Date().toISOString().split("T")[0];

      const assignedHomework = lms.assignments.filter((hw) => {
        // Hide Draft assignments from students
        if (hw.assignmentStatus === "Draft") return false;
        // If scheduled for a future date, hide until that date arrives
        if (hw.scheduledPublishDate && hw.scheduledPublishDate > todayIso) {
          return false;
        }
        if (hw.targetType === "student") {
          const matchUsername =
            Boolean(hw.assignedStudentUsername) &&
            hw.assignedStudentUsername!.trim().toUpperCase() === studentUsername;
          const matchName =
            Boolean(hw.assignedStudentName) &&
            hw.assignedStudentName!.trim().toLowerCase() === studentName.toLowerCase();
          return matchUsername || matchName;
        }
        if (hw.targetType === "all" || hw.targetType === "group") return true;
        if (
          hw.targetType === "course" &&
          courseName &&
          hw.courseName.toLowerCase() === courseName.toLowerCase()
        ) {
          return true;
        }
        return hw.targetType === "course" && !courseName;
      });

      const mySubmissions = lms.submissions.filter(
        (sub) => sub.studentUsername.toUpperCase() === studentUsername
      );

      const myReports = lms.reportCards.filter(
        (rc) => rc.studentUsername.toUpperCase() === studentUsername
      );

      const myNotifications = lms.notifications.filter(
        (n) =>
          n.targetStudentUsername === "ALL" ||
          n.targetStudentUsername.toUpperCase() === studentUsername
      );

      const myAiLogs = lms.aiLogs.filter(
        (log) => log.studentUsername.toUpperCase() === studentUsername
      );

      const leaderboardSettings = lms.leaderboardSettings || {
        enabled: true,
        anonymizeNames: true,
        hideForEarlyYears: true,
      };

      // Build privacy-controlled leaderboard across all progress records
      const leaderboard = Object.values(lms.progressRecords || {})
        .filter((rec) => rec.leaderboardPrivacy !== "private")
        .map((rec) => {
          const u = rec.studentUsername.toUpperCase();
          const subs = lms.submissions.filter(
            (s) => s.studentUsername.toUpperCase() === u
          );
          const logs = lms.aiLogs.filter(
            (l) => l.studentUsername.toUpperCase() === u
          );
          const rewards = computeStudentRewardsAndAchievements(
            rec,
            subs,
            logs,
            rec.studentName,
            u
          );
          const nameParts = (rec.studentName || "Scholar").trim().split(/\s+/);
          const initialsName =
            nameParts.length > 1
              ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
              : nameParts[0];

          const displayName =
            u === studentUsername
              ? `${rec.studentName} (You)`
              : leaderboardSettings.anonymizeNames || rec.leaderboardPrivacy === "initials"
              ? initialsName
              : rec.studentName;

          return {
            studentUsername: u,
            displayName,
            avatarUrl: rec.avatarUrl,
            totalPoints: rewards.totalPoints,
            homeworkPoints: rewards.homeworkPoints,
            streakDays: rewards.streakDays,
            badgesCount: rewards.unlockedBadges.length,
            starLevelTitle: rewards.starLevel.title,
            isCurrentUser: u === studentUsername,
          };
        })
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .map((item, idx) => ({ ...item, rank: idx + 1 }));

      const myTimetable = (lms.timetableSlots || []).filter(
        (t) =>
          t.targetStudentUsername === "ALL" ||
          t.targetStudentUsername.toUpperCase() === studentUsername
      );

      const myAttendanceLogs = (lms.attendanceLogs || []).filter(
        (a) => a.studentUsername.toUpperCase() === studentUsername
      );

      const myMaterials = (lms.learningMaterials || []).filter(
        (m) =>
          m.targetStudentUsername === "ALL" ||
          m.targetStudentUsername.toUpperCase() === studentUsername
      );

      const myMessages = (lms.messages || []).filter(
        (m) => m.studentUsername.toUpperCase() === studentUsername
      );

      const mySupportTickets = (lms.supportTickets || []).filter(
        (t) => t.studentUsername.toUpperCase() === studentUsername
      );

      const customCalendarEvents = (lms.calendarEvents || []).filter(
        (ev) =>
          ev.targetStudentUsername === "ALL" ||
          ev.targetStudentUsername.toUpperCase() === studentUsername
      );

      return NextResponse.json({
        success: true,
        assignments: assignedHomework,
        submissions: mySubmissions,
        reportCards: myReports,
        notifications: myNotifications,
        progress,
        aiLogs: myAiLogs,
        leaderboard,
        leaderboardSettings,
        timetableSlots: myTimetable,
        attendanceLogs: myAttendanceLogs,
        learningMaterials: myMaterials,
        messages: myMessages,
        supportTickets: mySupportTickets,
        calendarEvents: customCalendarEvents,
      });
    }

    return NextResponse.json({
      success: true,
      data: lms,
    });
  } catch (error: any) {
    console.error("GET /api/lms error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load learning hub data." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;
    const lms = await getLmsData();

    // 1. TEACHER/ADMIN: Create & Assign Homework (Supports Draft/Published, Scheduled Date, Attachments, Audio, 9 Question Types)
    if (action === "create-homework") {
      const {
        title,
        description,
        courseName,
        subject,
        topic,
        grade = "All Grades",
        targetType = "all",
        targetGroupName,
        assignedStudentUsername,
        assignedStudentName,
        audioInstructionText,
        audioInstructionUrl,
        attachments = [],
        passingScore = 60,
        dueDate,
        scheduledPublishDate,
        assignmentStatus = "Published",
        assessmentCategory = "homework",
        timeLimitMinutes,
        allowLateSubmission = true,
        allowResubmission = true,
        questions = [],
      } = body;

      if (!title || !questions.length) {
        return NextResponse.json(
          { success: false, message: "Please provide a homework title and at least one question." },
          { status: 400 }
        );
      }

      const totalPoints = questions.reduce(
        (sum: number, q: any) => sum + Number(q.points || 10),
        0
      );

      const resolvedCourse = String(courseName || subject || "English Phonics & Reading").trim();
      const resolvedSubject = String(subject || resolvedCourse).trim();
      const resolvedTopic = String(topic || title).trim();

      const formattedQuestions: HomeworkQuestion[] = questions.map((q: any, idx: number) => {
        const qType = q.type || "multiple-choice";
        return {
          id: q.id || `q-${Date.now()}-${idx}`,
          type: qType,
          markingMethod: q.markingMethod || inferMarkingMethod(qType),
          prompt: String(q.prompt || "").trim(),
          options: Array.isArray(q.options) ? q.options : undefined,
          correctAnswer: q.correctAnswer !== undefined ? String(q.correctAnswer).trim() : undefined,
          acceptedAnswers: Array.isArray(q.acceptedAnswers)
            ? q.acceptedAnswers.map((a: any) => String(a).trim()).filter(Boolean)
            : undefined,
          matchingPairs: Array.isArray(q.matchingPairs) ? q.matchingPairs : undefined,
          readingPassage: q.readingPassage ? String(q.readingPassage).trim() : undefined,
          points: Number(q.points || 20),
          skillTag: String(q.skillTag || resolvedTopic || resolvedCourse || "General Mastery"),
        };
      });

      const statusFlag: "Draft" | "Published" =
        assignmentStatus === "Draft" ? "Draft" : "Published";

      const newAssignment: HomeworkAssignment = {
        id: `hw-${Date.now()}`,
        title: String(title).trim(),
        description: String(
          description || "Read or listen to the instructions carefully and complete all questions."
        ).trim(),
        courseName: resolvedCourse,
        subject: resolvedSubject,
        topic: resolvedTopic,
        grade: String(grade).trim(),
        targetType,
        targetGroupName: targetGroupName ? String(targetGroupName).trim() : undefined,
        assignedStudentUsername: assignedStudentUsername
          ? String(assignedStudentUsername).trim().toUpperCase()
          : undefined,
        assignedStudentName: assignedStudentName ? String(assignedStudentName).trim() : undefined,
        audioInstructionText: audioInstructionText ? String(audioInstructionText).trim() : undefined,
        audioInstructionUrl: audioInstructionUrl ? String(audioInstructionUrl) : undefined,
        attachments: Array.isArray(attachments) ? attachments : [],
        dueDate:
          dueDate || new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0],
        scheduledPublishDate: scheduledPublishDate ? String(scheduledPublishDate) : undefined,
        assessmentCategory:
          assessmentCategory === "quiz" ||
          assessmentCategory === "test" ||
          assessmentCategory === "examination"
            ? assessmentCategory
            : "homework",
        timeLimitMinutes: timeLimitMinutes ? Number(timeLimitMinutes) : undefined,
        totalPoints,
        passingScore: Number(passingScore || 60),
        assignmentStatus: statusFlag,
        allowLateSubmission: Boolean(allowLateSubmission),
        allowResubmission: Boolean(allowResubmission),
        questions: formattedQuestions,
        createdAt: new Date().toISOString(),
      };

      lms.assignments.unshift(newAssignment);

      if (statusFlag === "Published") {
        const notif: PortalNotification = {
          id: `notif-${Date.now()}`,
          targetStudentUsername:
            targetType === "student" && assignedStudentUsername
              ? String(assignedStudentUsername).toUpperCase()
              : "ALL",
          type: "homework",
          title: `New Homework Assigned: ${newAssignment.title}`,
          message: `Subject: ${newAssignment.subject} (${newAssignment.topic}) • Due: ${newAssignment.dueDate} • Pass Mark: ${newAssignment.passingScore}%`,
          createdAt: new Date().toISOString(),
        };
        lms.notifications.unshift(notif);
      }

      await saveLmsData(lms);
      return NextResponse.json({
        success: true,
        message:
          statusFlag === "Draft"
            ? "Homework saved as Draft! Publish it anytime when ready."
            : "Homework assignment published and assigned to students!",
        assignment: newAssignment,
      });
    }

    // 1b. TEACHER/ADMIN: Toggle Homework Status (Draft <-> Published)
    if (action === "toggle-homework-status") {
      const { id, assignmentStatus } = body;
      const hw = lms.assignments.find((a) => a.id === id);
      if (!hw) {
        return NextResponse.json(
          { success: false, message: "Homework assignment not found." },
          { status: 404 }
        );
      }

      const nextStatus: "Draft" | "Published" =
        assignmentStatus === "Draft"
          ? "Draft"
          : assignmentStatus === "Published"
          ? "Published"
          : hw.assignmentStatus === "Draft"
          ? "Published"
          : "Draft";

      hw.assignmentStatus = nextStatus;

      if (nextStatus === "Published") {
        lms.notifications.unshift({
          id: `notif-${Date.now()}`,
          targetStudentUsername:
            hw.targetType === "student" && hw.assignedStudentUsername
              ? hw.assignedStudentUsername.toUpperCase()
              : "ALL",
          type: "homework",
          title: `New Homework Published: ${hw.title}`,
          message: `Subject: ${hw.subject || hw.courseName} • Due: ${hw.dueDate} (${hw.totalPoints} pts)`,
          createdAt: new Date().toISOString(),
        });
      }

      await saveLmsData(lms);
      return NextResponse.json({
        success: true,
        message: `Assignment status updated to ${nextStatus}.`,
        assignment: hw,
      });
    }

    // 2. TEACHER/ADMIN: Delete Homework
    if (action === "delete-homework") {
      const { id } = body;
      lms.assignments = lms.assignments.filter((a) => a.id !== id);
      await saveLmsData(lms);
      return NextResponse.json({
        success: true,
        message: "Homework assignment removed.",
      });
    }

    // 2b. STUDENT: Save Unfinished Work ("In Progress")
    if (action === "save-homework-progress") {
      const {
        homeworkId,
        studentUsername,
        studentName,
        parentEmail,
        grade = "Grade 2",
        answers = {},
        richAnswers = {},
      } = body;

      const assignment = lms.assignments.find((a) => a.id === homeworkId);
      if (!assignment) {
        return NextResponse.json(
          { success: false, message: "Homework assignment not found." },
          { status: 404 }
        );
      }

      const cleanUser = String(studentUsername || "STUDENT").toUpperCase();
      const existingIdx = lms.submissions.findIndex(
        (s) => s.homeworkId === homeworkId && s.studentUsername.toUpperCase() === cleanUser
      );

      const existing = existingIdx >= 0 ? lms.submissions[existingIdx] : undefined;

      const draftSub: HomeworkSubmission = {
        id: existing?.id || `sub-draft-${Date.now()}`,
        homeworkId: assignment.id,
        homeworkTitle: assignment.title,
        courseName: assignment.courseName,
        subject: assignment.subject || assignment.courseName,
        topic: assignment.topic || assignment.title,
        studentUsername: cleanUser,
        studentName: String(studentName || existing?.studentName || "Bright Scholar"),
        parentEmail: parentEmail ? String(parentEmail) : existing?.parentEmail,
        grade: String(grade || existing?.grade || "Grade 2"),
        answers,
        richAnswers,
        questionEvaluations: existing?.questionEvaluations || {},
        objectiveScore: existing?.objectiveScore || 0,
        subjectiveScore: existing?.subjectiveScore || 0,
        totalScore: existing?.totalScore || 0,
        maxPoints: assignment.totalPoints || 100,
        percentage: existing?.percentage || 0,
        passingScore: assignment.passingScore || 60,
        passed: existing?.passed || false,
        status: "in-progress",
        lifecycleStatus: "In Progress",
        isLate: false,
        resubmissionCount: existing?.resubmissionCount || 0,
        allowResubmission: assignment.allowResubmission ?? true,
        teacherFeedback:
          existing?.teacherFeedback ||
          "Unfinished work saved! You can return anytime to complete and submit.",
        weakSkillsIdentified: existing?.weakSkillsIdentified || [],
        savedAt: new Date().toISOString(),
        submittedAt: existing?.submittedAt || new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        lms.submissions[existingIdx] = draftSub;
      } else {
        lms.submissions.unshift(draftSub);
      }

      await saveLmsData(lms);

      return NextResponse.json({
        success: true,
        message: "Unfinished homework saved ('In Progress')! You can continue anytime.",
        submission: draftSub,
      });
    }

    // 3. STUDENT: Submit Homework Online (Auto-grades Objective + AI-Assists Subjective/Reading/Handwriting!)
    if (action === "submit-homework") {
      const {
        homeworkId,
        studentUsername,
        studentName,
        parentEmail,
        grade = "Grade 2",
        answers = {},
        richAnswers = {},
      } = body;

      const assignment = lms.assignments.find((a) => a.id === homeworkId);
      if (!assignment) {
        return NextResponse.json(
          { success: false, message: "Homework assignment not found." },
          { status: 404 }
        );
      }

      const cleanUser = String(studentUsername || "STUDENT").toUpperCase();
      const previousSub = lms.submissions.find(
        (s) => s.homeworkId === homeworkId && s.studentUsername.toUpperCase() === cleanUser
      );

      let objectiveScore = 0;
      let subjectiveAutoEstimate = 0;
      let requiresTeacherReview = false;
      const weakSkillsIdentified: string[] = [];
      const questionEvaluations: Record<string, QuestionGradeEvaluation> = {};

      for (const q of assignment.questions) {
        const rawText = String(answers[q.id] || "").trim();
        const rich: StudentQuestionAnswer | undefined = richAnswers[q.id];
        const evaluation = evaluateHomeworkQuestion(q, rawText, rich);
        questionEvaluations[q.id] = evaluation;

        if (evaluation.markingMethod === "automatic") {
          objectiveScore += evaluation.finalScore;
          if (!evaluation.isCorrect && q.skillTag && !weakSkillsIdentified.includes(q.skillTag)) {
            weakSkillsIdentified.push(q.skillTag);
          }
        } else {
          requiresTeacherReview = true;
          subjectiveAutoEstimate += evaluation.finalScore;
          if (
            evaluation.finalScore < Number(q.points || 20) * 0.65 &&
            q.skillTag &&
            !weakSkillsIdentified.includes(q.skillTag)
          ) {
            weakSkillsIdentified.push(q.skillTag);
          }
        }
      }

      const maxPoints = assignment.totalPoints || 100;
      const totalScore = objectiveScore + subjectiveAutoEstimate;
      const percentage = Math.min(100, Math.round((totalScore / maxPoints) * 100));
      const passingScore = assignment.passingScore || 60;
      const passed = percentage >= passingScore;

      const todayDate = new Date().toISOString().split("T")[0];
      const isLate = Boolean(assignment.dueDate && todayDate > assignment.dueDate);

      const wasPreviouslySubmitted =
        previousSub &&
        previousSub.lifecycleStatus !== "In Progress" &&
        previousSub.status !== "in-progress";
      const resubmissionCount = wasPreviouslySubmitted
        ? (previousSub?.resubmissionCount || 0) + 1
        : previousSub?.resubmissionCount || 0;

      const lifecycleStatus: AssignmentLifecycleStatus = requiresTeacherReview
        ? "Under Review"
        : "Graded";

      const autoFeedback = !requiresTeacherReview
        ? percentage >= 85
          ? "Excellent work! All automatic questions were graded with high accuracy."
          : `Good effort! Your automatic questions were graded (${percentage}%). Review ${
              weakSkillsIdentified.join(", ") || "the missed questions"
            } for 100% mastery.`
        : `Automatic questions scored ${objectiveScore} pts. AI-assisted assessment (${subjectiveAutoEstimate} pts) is now Under Review by your teacher.`;

      // Remove previous submission record for this student + homework
      lms.submissions = lms.submissions.filter(
        (s) => !(s.homeworkId === homeworkId && s.studentUsername.toUpperCase() === cleanUser)
      );

      const newSubmission: HomeworkSubmission = {
        id: previousSub?.id && !previousSub.id.startsWith("sub-draft-") ? previousSub.id : `sub-${Date.now()}`,
        homeworkId: assignment.id,
        homeworkTitle: assignment.title,
        courseName: assignment.courseName,
        subject: assignment.subject || assignment.courseName,
        topic: assignment.topic || assignment.title,
        studentUsername: cleanUser,
        studentName: String(studentName || "Bright Scholar"),
        parentEmail: parentEmail ? String(parentEmail) : undefined,
        grade: String(grade),
        answers,
        richAnswers,
        questionEvaluations,
        objectiveScore,
        subjectiveScore: subjectiveAutoEstimate,
        totalScore,
        maxPoints,
        percentage,
        passingScore,
        passed,
        status: requiresTeacherReview ? "submitted" : "graded",
        lifecycleStatus,
        isLate,
        resubmissionCount,
        allowResubmission: assignment.allowResubmission ?? true,
        teacherFeedback: autoFeedback,
        weakSkillsIdentified,
        savedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        gradedAt: requiresTeacherReview ? undefined : new Date().toISOString(),
      };

      lms.submissions.unshift(newSubmission);

      // Update student academic progress & badges
      const prog = getOrCreateStudentProgress(lms, cleanUser, newSubmission.studentName);
      prog.lessonsCompleted = (prog.lessonsCompleted || 0) + 1;
      prog.learningHours = Number(((prog.learningHours || 0) + 0.5).toFixed(1));

      if (weakSkillsIdentified.length > 0) {
        for (const skill of weakSkillsIdentified) {
          const note = `Needs additional practice in ${skill}`;
          if (!prog.customImprovements.includes(note)) {
            prog.customImprovements.unshift(note);
          }
        }
      }

      const hasHwBadge = prog.badges.some((b) => b.id === "badge-hw-hero");
      if (!hasHwBadge) {
        prog.badges.unshift({
          id: "badge-hw-hero",
          title: "Homework Hero",
          description: "Submitted online homework & completed interactive assessment",
          icon: "📝",
          earnedAt: new Date().toISOString(),
          color: "#8b5cf6",
        });
      }

      if (percentage >= 90 && !prog.badges.some((b) => b.id === "badge-ace")) {
        prog.badges.unshift({
          id: "badge-ace",
          title: "90%+ High Achiever",
          description: "Scored 90% or above on an academic assessment",
          icon: "🏅",
          earnedAt: new Date().toISOString(),
          color: "#10b981",
        });
      }

      prog.updatedAt = new Date().toISOString();
      lms.progressRecords[cleanUser] = prog;

      await saveLmsData(lms);

      return NextResponse.json({
        success: true,
        message: requiresTeacherReview
          ? `Homework submitted (${lifecycleStatus})! Auto-marked: ${objectiveScore} pts, AI provisional: ${subjectiveAutoEstimate} pts (${percentage}%).`
          : `Homework submitted & automatically graded! You scored ${totalScore}/${maxPoints} (${percentage}%).`,
        submission: newSubmission,
        progress: prog,
      });
    }

    // 4. TEACHER/ADMIN: Grade Submission, Override Any AI/Auto Score, or Return for Resubmission
    if (action === "grade-submission") {
      const {
        submissionId,
        subjectiveScore,
        totalScore,
        teacherFeedback,
        weakSkillsIdentified,
        questionOverrides,
        lifecycleStatus = "Graded",
        allowResubmission,
      } = body;

      const sub = lms.submissions.find((s) => s.id === submissionId);
      if (!sub) {
        return NextResponse.json(
          { success: false, message: "Submission not found." },
          { status: 404 }
        );
      }

      const assignment = lms.assignments.find((a) => a.id === sub.homeworkId);

      // Apply per-question teacher overrides if provided
      if (questionOverrides && typeof questionOverrides === "object") {
        if (!sub.questionEvaluations) sub.questionEvaluations = {};
        let newObjScore = 0;
        let newSubjScore = 0;

        const questionsList = assignment?.questions || [];
        for (const q of questionsList) {
          const existingEval =
            sub.questionEvaluations[q.id] ||
            evaluateHomeworkQuestion(q, String(sub.answers?.[q.id] || ""), sub.richAnswers?.[q.id]);

          const overrideEntry = questionOverrides[q.id];
          if (overrideEntry !== undefined) {
            const overrideNum =
              typeof overrideEntry === "number"
                ? overrideEntry
                : overrideEntry.score !== undefined
                ? Number(overrideEntry.score)
                : existingEval.finalScore;

            const clampedScore = Math.max(0, Math.min(Number(q.points || 20), overrideNum));
            existingEval.teacherOverrideScore = clampedScore;
            existingEval.finalScore = clampedScore;
            if (typeof overrideEntry === "object" && overrideEntry.comment !== undefined) {
              existingEval.teacherComment = String(overrideEntry.comment);
            }
          }

          sub.questionEvaluations[q.id] = existingEval;
          if (existingEval.markingMethod === "automatic") {
            newObjScore += existingEval.finalScore;
          } else {
            newSubjScore += existingEval.finalScore;
          }
        }

        sub.objectiveScore = newObjScore;
        sub.subjectiveScore = newSubjScore;
        sub.totalScore = newObjScore + newSubjScore;
      } else {
        if (subjectiveScore !== undefined) {
          sub.subjectiveScore = Number(subjectiveScore);
        }
        if (totalScore !== undefined) {
          sub.totalScore = Number(totalScore);
        } else {
          sub.totalScore = sub.objectiveScore + sub.subjectiveScore;
        }
      }

      sub.percentage = Math.min(100, Math.round((sub.totalScore / (sub.maxPoints || 100)) * 100));
      sub.passed = sub.percentage >= (sub.passingScore || assignment?.passingScore || 60);

      const resolvedLifecycle: AssignmentLifecycleStatus =
        lifecycleStatus === "Returned"
          ? "Returned"
          : lifecycleStatus === "Under Review"
          ? "Under Review"
          : "Graded";

      sub.lifecycleStatus = resolvedLifecycle;
      sub.status =
        resolvedLifecycle === "Returned"
          ? "returned"
          : resolvedLifecycle === "Under Review"
          ? "under-review"
          : "graded";

      if (resolvedLifecycle === "Returned") {
        sub.allowResubmission = true;
        sub.returnedAt = new Date().toISOString();
      } else if (allowResubmission !== undefined) {
        sub.allowResubmission = Boolean(allowResubmission);
      }

      if (teacherFeedback !== undefined) {
        sub.teacherFeedback = String(teacherFeedback).trim();
      }
      if (Array.isArray(weakSkillsIdentified)) {
        sub.weakSkillsIdentified = weakSkillsIdentified;
      }
      sub.gradedAt = new Date().toISOString();

      // Notify student
      lms.notifications.unshift({
        id: `notif-grade-${Date.now()}`,
        targetStudentUsername: sub.studentUsername.toUpperCase(),
        type: "grade",
        title:
          resolvedLifecycle === "Returned"
            ? `Homework Returned for Revision: ${sub.homeworkTitle}`
            : `Homework Graded: ${sub.homeworkTitle}`,
        message:
          resolvedLifecycle === "Returned"
            ? `Current Score: ${sub.totalScore}/${sub.maxPoints} (${sub.percentage}%) • Teacher Note: "${sub.teacherFeedback}" — Please review and resubmit.`
            : `Score: ${sub.totalScore}/${sub.maxPoints} (${sub.percentage}% • ${
                sub.passed ? "PASSED" : "Needs Practice"
              }) • Teacher Feedback: "${sub.teacherFeedback}"`,
        createdAt: new Date().toISOString(),
      });

      await saveLmsData(lms);

      return NextResponse.json({
        success: true,
        message:
          resolvedLifecycle === "Returned"
            ? `Returned submission to ${sub.studentName} for revision & resubmission.`
            : `Graded submission for ${sub.studentName} (${sub.percentage}% • ${resolvedLifecycle})!`,
        submission: sub,
      });
    }

    // 5. STUDENT: Log Bright Buddy AI Learning Session & Assessment (Reading, Writing, Speaking, Math)
    if (action === "log-ai-practice") {
      const {
        studentUsername,
        studentName,
        mode = "reading",
        topic,
        score = 90,
        feedback,
        improvementArea,
        skillsPractised = [],
        questionsAttempted = 0,
        correctAnswers = 0,
        incorrectAnswers = 0,
        wordsPronouncedCorrectly = [],
        wordsNeedingImprovement = [],
        wordsImprovedOnRetry = [],
        readingSpeedWpm,
        readingAccuracy,
        timeSpentMinutes = 5,
        masteryLevel,
        recommendedNextActivity,
      } = body;

      const cleanUser = String(studentUsername || "STUDENT").toUpperCase();
      const numScore = Number(score);
      const computedMastery =
        masteryLevel ||
        (numScore >= 90
          ? "Mastered"
          : numScore >= 75
          ? "Proficient"
          : numScore >= 60
          ? "Developing"
          : "Emerging");

      const newLog: AiPracticeLog = {
        id: `ai-${Date.now()}`,
        studentUsername: cleanUser,
        studentName: String(studentName || "Bright Scholar"),
        mode,
        topic: String(topic || "Bright Buddy AI Learning Session"),
        score: numScore,
        feedback: String(feedback || "Great effort practising with Bright Buddy!"),
        improvementArea: improvementArea ? String(improvementArea) : undefined,
        skillsPractised: Array.isArray(skillsPractised) ? skillsPractised.map(String) : [],
        questionsAttempted: Number(questionsAttempted || 0),
        correctAnswers: Number(correctAnswers || 0),
        incorrectAnswers: Number(incorrectAnswers || 0),
        wordsPronouncedCorrectly: Array.isArray(wordsPronouncedCorrectly)
          ? wordsPronouncedCorrectly.map(String)
          : [],
        wordsNeedingImprovement: Array.isArray(wordsNeedingImprovement)
          ? wordsNeedingImprovement.map(String)
          : [],
        wordsImprovedOnRetry: Array.isArray(wordsImprovedOnRetry)
          ? wordsImprovedOnRetry.map(String)
          : [],
        readingSpeedWpm: readingSpeedWpm !== undefined ? Number(readingSpeedWpm) : undefined,
        readingAccuracy: readingAccuracy !== undefined ? Number(readingAccuracy) : undefined,
        timeSpentMinutes: Math.max(1, Number(timeSpentMinutes || 5)),
        masteryLevel: computedMastery,
        recommendedNextActivity: recommendedNextActivity
          ? String(recommendedNextActivity)
          : "Continue daily 15-minute practice with Bright Buddy",
        createdAt: new Date().toISOString(),
      };

      lms.aiLogs.unshift(newLog);

      const prog = getOrCreateStudentProgress(lms, cleanUser, newLog.studentName);
      const addedHours = Math.max(0.1, Number(((newLog.timeSpentMinutes || 5) / 60).toFixed(2)));
      prog.learningHours = Number(((prog.learningHours || 0) + addedHours).toFixed(1));

      if (mode === "reading" || mode === "pronunciation" || mode === "speaking") {
        prog.readingProgress = Math.min(100, Math.max(prog.readingProgress || 0, numScore));
      }

      if (improvementArea && !prog.customImprovements.includes(improvementArea)) {
        prog.customImprovements.unshift(improvementArea);
      }
      if (Array.isArray(wordsNeedingImprovement) && wordsNeedingImprovement.length > 0) {
        const wordNote = `Pronunciation & decoding practice needed for: ${wordsNeedingImprovement
          .slice(0, 5)
          .join(", ")}`;
        if (!prog.customImprovements.includes(wordNote)) {
          prog.customImprovements.unshift(wordNote);
        }
      }
      if (numScore >= 85 && Array.isArray(skillsPractised) && skillsPractised.length > 0) {
        const strengthNote = `Strong ${mode} performance in: ${skillsPractised.slice(0, 3).join(", ")} (${numScore}%)`;
        if (!prog.customStrengths.includes(strengthNote)) {
          prog.customStrengths.unshift(strengthNote);
        }
      }

      if (!prog.badges.some((b) => b.id === "badge-ai-buddy")) {
        prog.badges.unshift({
          id: "badge-ai-buddy",
          title: "Bright Buddy Explorer",
          description: "Practised reading, writing, speaking & math with Bright Buddy AI Tutor",
          icon: "🤖",
          earnedAt: new Date().toISOString(),
          color: "#06b6d4",
        });
      }

      prog.updatedAt = new Date().toISOString();
      lms.progressRecords[cleanUser] = prog;

      await saveLmsData(lms);
      return NextResponse.json({
        success: true,
        log: newLog,
        progress: prog,
      });
    }

    // 6. STUDENT/TEACHER: Update Student Progress, Subject Tracks, Periods, Observations & Alerts
    if (action === "update-student-profile") {
      const {
        studentUsername,
        studentName,
        avatarUrl,
        completedActivityId,
        lessonsCompleted,
        attendanceRate,
        learningHours,
        readingProgress,
        customStrengths,
        customImprovements,
        subjectTracks,
        periodSummaries,
        teacherObservations,
        newObservation,
        improvementRecommendations,
        flaggedForAttention,
        flagReason,
        bonusPoints,
        streakDays,
        activeDaysOfWeek,
        leaderboardPrivacy,
        earlyYearsFocusMode,
        enrolledSubjects,
        learningGoals,
        bioNote,
        liveClassroomUrl,
      } = body;

      const cleanUser = String(studentUsername || "STUDENT").toUpperCase();
      const prog = getOrCreateStudentProgress(lms, cleanUser, String(studentName || "Bright Scholar"));

      if (avatarUrl) prog.avatarUrl = String(avatarUrl);
      if (completedActivityId) {
        if (prog.completedActivityIds.includes(completedActivityId)) {
          prog.completedActivityIds = prog.completedActivityIds.filter(
            (id) => id !== completedActivityId
          );
        } else {
          prog.completedActivityIds.push(completedActivityId);
          prog.lessonsCompleted = (prog.lessonsCompleted || 0) + 1;
          prog.learningHours = Number(((prog.learningHours || 0) + 0.5).toFixed(1));
        }
      }
      if (lessonsCompleted !== undefined) prog.lessonsCompleted = Number(lessonsCompleted);
      if (attendanceRate !== undefined) prog.attendanceRate = Number(attendanceRate);
      if (learningHours !== undefined) prog.learningHours = Number(learningHours);
      if (readingProgress !== undefined) prog.readingProgress = Number(readingProgress);
      if (Array.isArray(customStrengths)) prog.customStrengths = customStrengths;
      if (Array.isArray(customImprovements)) prog.customImprovements = customImprovements;
      if (Array.isArray(subjectTracks)) prog.subjectTracks = subjectTracks;
      if (periodSummaries && typeof periodSummaries === "object") {
        prog.periodSummaries = periodSummaries;
      }
      if (Array.isArray(teacherObservations)) {
        prog.teacherObservations = teacherObservations;
      }
      if (newObservation && newObservation.observation) {
        if (!prog.teacherObservations) prog.teacherObservations = [];
        prog.teacherObservations.unshift({
          id: `obs-${Date.now()}`,
          subject: String(newObservation.subject || "General Academic"),
          observation: String(newObservation.observation),
          recommendation: newObservation.recommendation
            ? String(newObservation.recommendation)
            : undefined,
          teacherName: String(newObservation.teacherName || "Bright Path Educator"),
          createdAt: new Date().toISOString(),
        });
      }
      if (Array.isArray(improvementRecommendations)) {
        prog.improvementRecommendations = improvementRecommendations;
      }
      if (flaggedForAttention !== undefined) {
        prog.flaggedForAttention = Boolean(flaggedForAttention);
      }
      if (flagReason !== undefined) {
        prog.flagReason = String(flagReason);
      }
      if (bonusPoints !== undefined) {
        prog.bonusPoints = Number(bonusPoints);
      }
      if (streakDays !== undefined) {
        prog.streakDays = Number(streakDays);
      }
      if (Array.isArray(activeDaysOfWeek)) {
        prog.activeDaysOfWeek = activeDaysOfWeek;
      }
      if (leaderboardPrivacy) {
        prog.leaderboardPrivacy = leaderboardPrivacy;
      }
      if (earlyYearsFocusMode !== undefined) {
        prog.earlyYearsFocusMode = Boolean(earlyYearsFocusMode);
      }
      if (Array.isArray(enrolledSubjects)) {
        prog.enrolledSubjects = enrolledSubjects;
      }
      if (Array.isArray(learningGoals)) {
        prog.learningGoals = learningGoals;
      }
      if (bioNote !== undefined) {
        prog.bioNote = String(bioNote);
      }
      if (liveClassroomUrl !== undefined) {
        prog.liveClassroomUrl = String(liveClassroomUrl);
      }

      prog.updatedAt = new Date().toISOString();
      lms.progressRecords[cleanUser] = prog;

      await saveLmsData(lms);
      return NextResponse.json({
        success: true,
        message: "Student progress & subject mastery profile updated!",
        progress: prog,
      });
    }

    // 7. TEACHER/ADMIN: Generate & Send Downloadable PDF Report Card to Parent
    if (action === "generate-report-card") {
      const {
        studentUsername,
        studentName,
        parentName,
        parentEmail,
        grade = "Grade 2",
        courseName = "English Phonics & Reading",
        termPeriod = "First Term • 2026",
        dateRangeStart = "",
        dateRangeEnd = "",
        attendanceRate = 96,
        lessonsCompleted = 18,
        learningHours = 22,
        homeworkCompletionRate = 95,
        homeworkSummary,
        readingProgress = 88,
        aiLearningSummary,
        subjectScores = [],
        strengths = [],
        areasForImprovement = [],
        recommendations = [],
        teacherName = "Bright Path Class Teacher",
        teacherComment = "Shows remarkable curiosity and steady improvement in 1-on-1 live classes.",
        adminName = "Bright Path Academic Director",
        schoolRemarks = "",
        published = true,
        includeSections,
        portalUrl,
      } = body;

      const cleanUser = String(studentUsername || "STUDENT").toUpperCase();
      const scoresList =
        Array.isArray(subjectScores) && subjectScores.length > 0
          ? subjectScores
          : [
              {
                subject: "English Phonics & Reading Fluency",
                score: 90,
                grade: "A+",
                remark: "Excellent phonemic awareness and reading confidence",
              },
              {
                subject: "Word Pronunciation & Public Speaking",
                score: 86,
                grade: "A",
                remark: "Clear articulation and expressive delivery",
              },
              {
                subject: "Creative Writing & Grammar",
                score: 84,
                grade: "A",
                remark: "Strong sentence formation and vocabulary growth",
              },
              {
                subject: "Conceptual Math & Logical Thinking",
                score: 88,
                grade: "A",
                remark: "Quick mental math and analytical problem solving",
              },
            ];

      const avgScore = Math.round(
        scoresList.reduce((acc: number, s: any) => acc + Number(s.score || 85), 0) /
          scoresList.length
      );
      const overallGrade =
        avgScore >= 90
          ? "A+"
          : avgScore >= 80
          ? "A"
          : avgScore >= 70
          ? "B+"
          : avgScore >= 60
          ? "B"
          : avgScore >= 50
          ? "C"
          : "D";

      const reportRef = `BPRC-${Math.floor(10000 + Math.random() * 90000)}`;
      const isPublished = Boolean(published);

      const newReport: StudentReportCard = {
        id: `rc-${Date.now()}`,
        reportRef,
        studentUsername: cleanUser,
        studentName: String(studentName || "Bright Scholar"),
        parentName: String(parentName || "Parent / Guardian"),
        parentEmail: String(parentEmail || ""),
        grade: String(grade),
        courseName: String(courseName),
        termPeriod: String(termPeriod),
        dateRangeStart: String(dateRangeStart || ""),
        dateRangeEnd: String(dateRangeEnd || ""),
        attendanceRate: Number(attendanceRate),
        lessonsCompleted: Number(lessonsCompleted),
        learningHours: Number(learningHours),
        homeworkCompletionRate: Number(homeworkCompletionRate),
        homeworkSummary: homeworkSummary || undefined,
        overallScore: avgScore,
        overallGrade,
        readingProgress: Number(readingProgress),
        aiLearningSummary: aiLearningSummary || undefined,
        subjectScores: scoresList,
        strengths:
          Array.isArray(strengths) && strengths.length > 0
            ? strengths
            : [
                "Strong reading fluency and phonics decoding skills",
                "Active participation in 1-on-1 interactive lessons",
                "Consistent homework completion",
              ],
        areasForImprovement:
          Array.isArray(areasForImprovement) && areasForImprovement.length > 0
            ? areasForImprovement
            : [
                "Practising multi-syllable vocabulary pronunciation aloud",
                "Using more descriptive adjectives in creative writing",
              ],
        recommendations:
          Array.isArray(recommendations) && recommendations.length > 0
            ? recommendations
            : [
                "Complete 15 minutes of daily reading aloud with Bright Buddy",
                "Review weekly phonics flashcards and spelling words with parent",
              ],
        teacherName: String(teacherName || "Bright Path Class Teacher"),
        teacherComment: String(teacherComment),
        adminName: String(adminName || "Bright Path Academic Director"),
        schoolRemarks: String(
          schoolRemarks ||
            `${studentName || "This student"} has demonstrated commendable dedication this term. Bright Path Learning Hub is proud of their academic growth.`
        ),
        issuedBy: String(adminName || "Bright Path Academic Director"),
        published: isPublished,
        includeSections: includeSections || {
          attendance: true,
          homework: true,
          assessments: true,
          aiProgress: true,
          strengthsWeaknesses: true,
          recommendations: true,
          teacherComments: true,
          adminComments: true,
        },
        createdAt: new Date().toISOString(),
      };

      lms.reportCards.unshift(newReport);

      if (isPublished) {
        lms.notifications.unshift({
          id: `notif-rc-${Date.now()}`,
          targetStudentUsername: cleanUser,
          type: "report",
          title: `New Academic Report Card Published (${reportRef} • ${termPeriod})`,
          message: `Overall Grade: ${overallGrade} (${avgScore}%) • Open 'My Reports' to view, print, or download your official PDF Report Card.`,
          createdAt: new Date().toISOString(),
        });
      }

      await saveLmsData(lms);

      const resolvedPortalUrl =
        portalUrl ||
        `${
          request.headers.get("origin") || "https://brightpathlearninghub.vercel.app"
        }/portal`;

      let emailSent = false;
      if (isPublished && newReport.parentEmail && newReport.parentEmail.includes("@")) {
        try {
          const emailRes = await sendReportCardEmail(newReport, resolvedPortalUrl);
          emailSent = emailRes.sent;
        } catch (err) {
          console.error("Failed to send report card email:", err);
        }
      }

      return NextResponse.json({
        success: true,
        message: !isPublished
          ? `Report Card ${reportRef} saved as Draft! Click 'Publish to Portal' when ready.`
          : emailSent
          ? `Report Card ${reportRef} published to Student & Parent Portals and emailed to ${newReport.parentEmail}!`
          : `Report Card ${reportRef} generated and published to Student & Parent Portals!`,
        reportCard: newReport,
        emailSent,
      });
    }

    // 7B. TEACHER/ADMIN: Toggle Publish Status of Report Card to Student & Parent Portals
    if (action === "toggle-report-publish") {
      const { reportId } = body;
      const rc = lms.reportCards.find((r) => r.id === reportId);
      if (!rc) {
        return NextResponse.json(
          { success: false, message: "Report card not found." },
          { status: 404 }
        );
      }
      const nextPublished = rc.published === false ? true : false;
      rc.published = nextPublished;

      if (nextPublished) {
        lms.notifications.unshift({
          id: `notif-rc-pub-${Date.now()}`,
          targetStudentUsername: rc.studentUsername,
          type: "report",
          title: `Academic Report Card Published (${rc.reportRef} • ${rc.termPeriod})`,
          message: `Your ${rc.termPeriod} Report Card is now available in 'My Reports' for viewing, printing, and PDF download.`,
          createdAt: new Date().toISOString(),
        });
      }

      await saveLmsData(lms);
      return NextResponse.json({
        success: true,
        message: nextPublished
          ? `Report Card ${rc.reportRef} is now published to Student & Parent Portals!`
          : `Report Card ${rc.reportRef} moved to unpublished Draft state.`,
        reportCard: rc,
      });
    }

    // 7C. TEACHER/ADMIN: Delete Report Card
    if (action === "delete-report-card") {
      const { reportId } = body;
      lms.reportCards = lms.reportCards.filter((r) => r.id !== reportId);
      await saveLmsData(lms);
      return NextResponse.json({
        success: true,
        message: "Report card deleted.",
      });
    }

    // 8. TEACHER/ADMIN: Post Notification / Announcement
    if (action === "post-announcement") {
      const { targetStudentUsername = "ALL", type = "announcement", title, message } = body;
      if (!title || !message) {
        return NextResponse.json(
          { success: false, message: "Title and message are required." },
          { status: 400 }
        );
      }

      const notif: PortalNotification = {
        id: `notif-${Date.now()}`,
        targetStudentUsername: String(targetStudentUsername).toUpperCase(),
        type,
        title: String(title).trim(),
        message: String(message).trim(),
        createdAt: new Date().toISOString(),
      };

      lms.notifications.unshift(notif);
      await saveLmsData(lms);

      return NextResponse.json({
        success: true,
        message: "Notification sent to students & parents!",
        notification: notif,
      });
    }

    // 9. MODULE F: TEACHER-AWARDED ACHIEVEMENTS (BADGES, BONUS POINTS & CERTIFICATES)
    if (action === "award-student-achievement") {
      const {
        studentUsername,
        studentName = "Bright Scholar",
        grade = "All Grades",
        courseName = "English Phonics & Reading",
        awardType = "badge", // "badge" | "certificate" | "points"
        title,
        description,
        icon = "🏅",
        color = "#f59e0b",
        category = "teacher-award" as BadgeCategory,
        pointsValue = 50,
        awardedBy = "Bright Path Class Teacher",
      } = body;

      const cleanUser = String(studentUsername || "STUDENT").toUpperCase();
      const prog = getOrCreateStudentProgress(lms, cleanUser, String(studentName));

      if (awardType === "points") {
        prog.bonusPoints = (prog.bonusPoints || 0) + Number(pointsValue || 50);
      } else if (awardType === "certificate") {
        if (!prog.certificates) prog.certificates = [];
        const certRef = `BPCERT-${Math.floor(10000 + Math.random() * 90000)}`;
        prog.certificates.unshift({
          id: `cert-${Date.now()}`,
          certRef,
          studentUsername: cleanUser,
          studentName: String(studentName),
          grade: String(grade),
          courseName: String(courseName),
          title: String(title || "Certificate of Academic Excellence"),
          citation: String(
            description ||
              `Awarded to ${studentName} for outstanding dedication and learning progress at Bright Path Learning Hub.`
          ),
          category: category || "teacher-award",
          issuedBy: String(awardedBy || "Bright Path Academic Director"),
          issuedAt: new Date().toISOString(),
        });
        prog.bonusPoints = (prog.bonusPoints || 0) + Number(pointsValue || 100);
      } else {
        if (!prog.badges) prog.badges = [];
        prog.badges.unshift({
          id: `badge-t-${Date.now()}`,
          title: String(title || "Teacher's Star Achievement"),
          description: String(description || "Awarded for outstanding effort in class!"),
          icon: String(icon || "🌟"),
          color: String(color || "#f59e0b"),
          category: category || "teacher-award",
          awardedBy: String(awardedBy || "Bright Path Teacher"),
          pointsValue: Number(pointsValue || 50),
          earnedAt: new Date().toISOString(),
        });
      }

      prog.updatedAt = new Date().toISOString();
      lms.progressRecords[cleanUser] = prog;

      lms.notifications.unshift({
        id: `notif-awd-${Date.now()}`,
        targetStudentUsername: cleanUser,
        type: "announcement",
        title:
          awardType === "certificate"
            ? `🎓 New Official Certificate Awarded: ${title}`
            : `🏅 New Teacher-Awarded Achievement: ${title} (+${pointsValue || 50} pts!)`,
        message: `${description || "Congratulations on your awesome achievement!"} • Open 'Rewards & Badges' to view and celebrate!`,
        createdAt: new Date().toISOString(),
      });

      await saveLmsData(lms);

      return NextResponse.json({
        success: true,
        message:
          awardType === "certificate"
            ? `Official Certificate "${title}" awarded to ${studentName}!`
            : `Achievement "${title}" (+${pointsValue || 50} pts) awarded to ${studentName}!`,
        progress: prog,
      });
    }

    // 10. MODULE F: UPDATE GLOBAL LEADERBOARD & PRIVACY SETTINGS
    if (action === "update-leaderboard-settings") {
      const { enabled = true, anonymizeNames = true, hideForEarlyYears = true } = body;
      lms.leaderboardSettings = {
        enabled: Boolean(enabled),
        anonymizeNames: Boolean(anonymizeNames),
        hideForEarlyYears: Boolean(hideForEarlyYears),
      };
      await saveLmsData(lms);
      return NextResponse.json({
        success: true,
        message: "Leaderboard & privacy settings updated!",
        leaderboardSettings: lms.leaderboardSettings,
      });
    }

    // 11. ADDITIONAL MODULES: TIMETABLE MANAGEMENT
    if (action === "save-timetable-slot") {
      const {
        targetStudentUsername = "ALL",
        dayOfWeek = "Monday",
        startTime = "16:00",
        endTime = "16:45",
        subject = "English Phonics & Reading",
        topic = "1-on-1 Live Interactive Session",
        teacherName = "Bright Path Class Educator",
        meetingUrl = "https://meet.google.com/new",
      } = body;

      if (!lms.timetableSlots) lms.timetableSlots = [];
      const slot = {
        id: `tt-${Date.now()}`,
        targetStudentUsername: String(targetStudentUsername).toUpperCase(),
        dayOfWeek,
        startTime: String(startTime),
        endTime: String(endTime),
        subject: String(subject),
        topic: String(topic),
        teacherName: String(teacherName),
        meetingUrl: String(meetingUrl),
        createdAt: new Date().toISOString(),
      };
      lms.timetableSlots.unshift(slot);
      await saveLmsData(lms);
      return NextResponse.json({
        success: true,
        message: "Class schedule slot added to timetable!",
        slot,
      });
    }

    if (action === "delete-timetable-slot") {
      const { slotId } = body;
      lms.timetableSlots = (lms.timetableSlots || []).filter((s) => s.id !== slotId);
      await saveLmsData(lms);
      return NextResponse.json({ success: true, message: "Timetable slot removed." });
    }

    // 12. ADDITIONAL MODULES: ATTENDANCE RECORDS & ABSENCE HISTORY
    if (action === "record-attendance") {
      const {
        studentUsername,
        studentName = "Bright Scholar",
        date = new Date().toISOString().split("T")[0],
        subject = "English Phonics & Reading",
        status = "Present",
        absenceReason = "",
        teacherNote = "",
        recordedBy = "Bright Path Class Teacher",
      } = body;

      const cleanUser = String(studentUsername || "STUDENT").toUpperCase();
      if (!lms.attendanceLogs) lms.attendanceLogs = [];
      const entry = {
        id: `att-${Date.now()}`,
        studentUsername: cleanUser,
        studentName: String(studentName),
        date: String(date),
        subject: String(subject),
        status: status as "Present" | "Late" | "Excused" | "Absent",
        absenceReason: String(absenceReason || ""),
        teacherNote: String(teacherNote || ""),
        recordedBy: String(recordedBy),
        createdAt: new Date().toISOString(),
      };
      lms.attendanceLogs.unshift(entry);

      // Update student's overall attendanceRate automatically
      const studentLogs = lms.attendanceLogs.filter(
        (a) => a.studentUsername.toUpperCase() === cleanUser
      );
      if (studentLogs.length > 0) {
        const presentOrExcused = studentLogs.filter(
          (a) => a.status === "Present" || a.status === "Late" || a.status === "Excused"
        ).length;
        const prog = getOrCreateStudentProgress(lms, cleanUser, String(studentName));
        prog.attendanceRate = Math.round((presentOrExcused / studentLogs.length) * 100);
        if (status === "Present" || status === "Late") {
          prog.lessonsCompleted = (prog.lessonsCompleted || 0) + 1;
        }
        lms.progressRecords[cleanUser] = prog;
      }

      await saveLmsData(lms);
      return NextResponse.json({
        success: true,
        message: `Attendance (${status}) recorded for ${studentName}!`,
        entry,
      });
    }

    // 13. ADDITIONAL MODULES: LEARNING MATERIALS (WORKSHEETS, PDFS, VIDEOS, AUDIO)
    if (action === "save-learning-material") {
      const {
        title,
        description = "",
        subject = "English Phonics & Reading",
        grade = "All Grades",
        category = "PDF Worksheet",
        fileUrl = "",
        fileName = "",
        targetStudentUsername = "ALL",
        uploadedBy = "Bright Path Teacher",
      } = body;

      if (!lms.learningMaterials) lms.learningMaterials = [];
      const mat = {
        id: `mat-${Date.now()}`,
        title: String(title || "Learning Resource"),
        description: String(description),
        subject: String(subject),
        grade: String(grade),
        category: category as
          | "PDF Worksheet"
          | "Video Lesson"
          | "Audio Phonics / Story"
          | "Study Guide",
        fileUrl: String(fileUrl),
        fileName: String(fileName || ""),
        targetStudentUsername: String(targetStudentUsername).toUpperCase(),
        uploadedBy: String(uploadedBy),
        createdAt: new Date().toISOString(),
      };
      lms.learningMaterials.unshift(mat);
      await saveLmsData(lms);
      return NextResponse.json({
        success: true,
        message: `Learning material "${mat.title}" published!`,
        material: mat,
      });
    }

    if (action === "delete-learning-material") {
      const { materialId } = body;
      lms.learningMaterials = (lms.learningMaterials || []).filter(
        (m) => m.id !== materialId
      );
      await saveLmsData(lms);
      return NextResponse.json({ success: true, message: "Material removed." });
    }

    // 14. ADDITIONAL MODULES: TWO-WAY TEACHER–PARENT MESSAGING
    if (action === "send-portal-message") {
      const {
        studentUsername,
        studentName = "Bright Scholar",
        parentName = "Parent / Guardian",
        senderRole = "parent",
        senderName = "Parent",
        subject = "Academic Update",
        message,
      } = body;

      if (!message) {
        return NextResponse.json(
          { success: false, message: "Please enter a message." },
          { status: 400 }
        );
      }

      const cleanUser = String(studentUsername || "STUDENT").toUpperCase();
      if (!lms.messages) lms.messages = [];
      const msgObj = {
        id: `msg-${Date.now()}`,
        studentUsername: cleanUser,
        studentName: String(studentName),
        parentName: String(parentName),
        senderRole: senderRole as "parent" | "student" | "teacher",
        senderName: String(senderName),
        subject: String(subject || "Direct Message"),
        message: String(message),
        createdAt: new Date().toISOString(),
      };
      lms.messages.unshift(msgObj);

      if (senderRole === "teacher") {
        lms.notifications.unshift({
          id: `notif-msg-${Date.now()}`,
          targetStudentUsername: cleanUser,
          type: "announcement",
          title: `💬 New Message from Teacher: ${subject}`,
          message: String(message).slice(0, 140),
          createdAt: new Date().toISOString(),
        });
      }

      await saveLmsData(lms);
      return NextResponse.json({
        success: true,
        message:
          senderRole === "teacher"
            ? `Message sent to ${studentName} & Parent!`
            : "Message sent to your Bright Path Teacher!",
        portalMessage: msgObj,
      });
    }

    // 15. ADDITIONAL MODULES: SUPPORT CENTRE (HELP REQUESTS & TECHNICAL SUPPORT)
    if (action === "create-support-ticket") {
      const {
        studentUsername,
        studentName = "Bright Scholar",
        category = "Technical Support",
        subject,
        description,
      } = body;

      if (!subject || !description) {
        return NextResponse.json(
          { success: false, message: "Please enter a subject and description." },
          { status: 400 }
        );
      }

      const cleanUser = String(studentUsername || "STUDENT").toUpperCase();
      if (!lms.supportTickets) lms.supportTickets = [];
      const ticket = {
        id: `tkt-${Date.now()}`,
        ticketRef: `BPTK-${Math.floor(1000 + Math.random() * 9000)}`,
        studentUsername: cleanUser,
        studentName: String(studentName),
        category: category as
          | "Technical Support"
          | "Class Reschedule"
          | "Academic / Homework Help"
          | "Account & Portal",
        subject: String(subject),
        description: String(description),
        status: "Open" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      lms.supportTickets.unshift(ticket);
      await saveLmsData(lms);
      return NextResponse.json({
        success: true,
        message: `Support request #${ticket.ticketRef} submitted! Our team will respond shortly.`,
        ticket,
      });
    }

    if (action === "resolve-support-ticket") {
      const { ticketId, adminReply = "", status = "Resolved" } = body;
      const tkt = (lms.supportTickets || []).find((t) => t.id === ticketId);
      if (tkt) {
        tkt.adminReply = String(adminReply);
        tkt.status = status as "Open" | "In Progress" | "Resolved";
        tkt.updatedAt = new Date().toISOString();
        lms.notifications.unshift({
          id: `notif-tkt-${Date.now()}`,
          targetStudentUsername: tkt.studentUsername,
          type: "announcement",
          title: `🛠️ Support Request #${tkt.ticketRef} Updated (${status})`,
          message: adminReply || "Your support request has been updated.",
          createdAt: new Date().toISOString(),
        });
        await saveLmsData(lms);
      }
      return NextResponse.json({
        success: true,
        message: "Support ticket updated!",
        ticket: tkt,
      });
    }

    // 16. ADDITIONAL MODULES: ACADEMIC CALENDAR EVENTS
    if (action === "save-calendar-event") {
      const {
        title,
        date = new Date().toISOString().split("T")[0],
        category = "School Event",
        description = "",
        targetStudentUsername = "ALL",
        sendEmailNotification = false,
      } = body;

      if (!lms.calendarEvents) lms.calendarEvents = [];
      const ev = {
        id: `cal-${Date.now()}`,
        title: String(title || "Academic Event"),
        date: String(date),
        category: category as
          | "Homework Deadline"
          | "Examination / Assessment"
          | "Live Class"
          | "School Event",
        description: String(description),
        targetStudentUsername: String(targetStudentUsername).toUpperCase(),
        emailNotificationSent: Boolean(sendEmailNotification),
        createdAt: new Date().toISOString(),
      };
      lms.calendarEvents.unshift(ev);

      // Email notification dispatch if requested
      let emailNotificationResult = null;
      if (sendEmailNotification) {
        try {
          const accounts = await getStudentAccounts();
          let targetEmails: string[] = [];
          let targetName = "";

          if (ev.targetStudentUsername !== "ALL") {
            const matched = accounts.find(
              (a) => a.username?.toUpperCase() === ev.targetStudentUsername
            );
            if (matched?.email) {
              targetEmails.push(matched.email);
              targetName = matched.studentName;
            }
          } else {
            targetEmails = accounts.map((a) => a.email).filter(Boolean);
          }

          emailNotificationResult = await sendCalendarEventEmail({
            title: ev.title,
            date: ev.date,
            category: ev.category,
            description: ev.description,
            targetStudentUsername: ev.targetStudentUsername,
            targetStudentName: targetName,
            recipientEmails: targetEmails,
          });
        } catch (mailErr) {
          console.error("Failed to send calendar event notification email:", mailErr);
        }
      }

      await saveLmsData(lms);
      return NextResponse.json({
        success: true,
        message: sendEmailNotification
          ? `Calendar event "${ev.title}" saved and email notifications queued!`
          : `Calendar event "${ev.title}" added!`,
        event: ev,
        emailResult: emailNotificationResult,
      });
    }

    if (action === "delete-calendar-event") {
      const { eventId } = body;
      lms.calendarEvents = (lms.calendarEvents || []).filter((e) => e.id !== eventId);
      await saveLmsData(lms);
      return NextResponse.json({ success: true, message: "Calendar event removed." });
    }

    // 17. USER MANAGEMENT, ROLES & PERMISSIONS
    if (action === "save-admin-user") {
      const {
        id,
        name,
        email,
        role = "teacher",
        status = "active",
        phone = "",
        permissions,
      } = body;

      if (!name || !email) {
        return NextResponse.json(
          { success: false, message: "User name and email are required." },
          { status: 400 }
        );
      }

      if (!lms.adminUsers) {
        // Seed default super admin user if list was empty
        lms.adminUsers = [
          {
            id: "user-superadmin-1",
            name: "Primary Administrator",
            email: "brightpathlearninghub6@gmail.com",
            role: "super_admin",
            status: "active",
            phone: "+234 806 320 2616",
            permissions: {
              canManageHomework: true,
              canManageProgress: true,
              canManageReports: true,
              canManageCampus: true,
              canManageCMS: true,
              canManageUsers: true,
            },
            createdAt: new Date().toISOString(),
          },
        ];
      }

      const roleDefaults = {
        super_admin: {
          canManageHomework: true,
          canManageProgress: true,
          canManageReports: true,
          canManageCampus: true,
          canManageCMS: true,
          canManageUsers: true,
        },
        admin: {
          canManageHomework: true,
          canManageProgress: true,
          canManageReports: true,
          canManageCampus: true,
          canManageCMS: true,
          canManageUsers: false,
        },
        teacher: {
          canManageHomework: true,
          canManageProgress: true,
          canManageReports: true,
          canManageCampus: true,
          canManageCMS: false,
          canManageUsers: false,
        },
        support: {
          canManageHomework: false,
          canManageProgress: false,
          canManageReports: false,
          canManageCampus: true,
          canManageCMS: false,
          canManageUsers: false,
        },
      };

      const resolvedPermissions =
        permissions || roleDefaults[role as keyof typeof roleDefaults] || roleDefaults.teacher;

      if (id) {
        const existingIdx = lms.adminUsers.findIndex((u) => u.id === id);
        if (existingIdx !== -1) {
          lms.adminUsers[existingIdx] = {
            ...lms.adminUsers[existingIdx],
            name: String(name),
            email: String(email).toLowerCase(),
            role,
            status,
            phone: String(phone || ""),
            permissions: resolvedPermissions,
          };
          await saveLmsData(lms);
          return NextResponse.json({
            success: true,
            message: `User ${name} updated successfully!`,
            user: lms.adminUsers[existingIdx],
          });
        }
      }

      const newUser: AdminSystemUser = {
        id: `user-${Date.now()}`,
        name: String(name),
        email: String(email).toLowerCase(),
        role,
        status,
        phone: String(phone || ""),
        permissions: resolvedPermissions,
        createdAt: new Date().toISOString(),
      };

      lms.adminUsers.push(newUser);
      await saveLmsData(lms);
      return NextResponse.json({
        success: true,
        message: `New team member ${name} (${role}) added!`,
        user: newUser,
      });
    }

    if (action === "delete-admin-user") {
      const { userId } = body;
      if (!lms.adminUsers) lms.adminUsers = [];
      const user = lms.adminUsers.find((u) => u.id === userId);
      if (user?.role === "super_admin") {
        return NextResponse.json(
          { success: false, message: "Super Administrator account cannot be deleted." },
          { status: 400 }
        );
      }
      lms.adminUsers = lms.adminUsers.filter((u) => u.id !== userId);
      await saveLmsData(lms);
      return NextResponse.json({ success: true, message: "Team member removed." });
    }

    return NextResponse.json(
      { success: false, message: "Unknown LMS action." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("POST /api/lms error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process learning hub request." },
      { status: 500 }
    );
  }
}
