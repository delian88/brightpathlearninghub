import { NextResponse } from "next/server";
import { getLmsData, saveLmsData } from "@/db";
import {
  getOrCreateStudentProgress,
  evaluateHomeworkQuestion,
  type HomeworkAssignment,
  type HomeworkQuestion,
  type HomeworkSubmission,
  type StudentQuestionAnswer,
  type QuestionGradeEvaluation,
  type AssignmentLifecycleStatus,
  type StudentReportCard,
  type PortalNotification,
  type AiPracticeLog,
} from "@/lib/lmsData";
import { sendReportCardEmail } from "@/lib/email";

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

      return NextResponse.json({
        success: true,
        assignments: assignedHomework,
        submissions: mySubmissions,
        reportCards: myReports,
        notifications: myNotifications,
        progress,
        aiLogs: myAiLogs,
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

    // 5. STUDENT: Log AI Learning Buddy Practice (Reading, Pronunciation, Writing)
    if (action === "log-ai-practice") {
      const {
        studentUsername,
        studentName,
        mode = "reading",
        topic,
        score = 90,
        feedback,
        improvementArea,
      } = body;

      const cleanUser = String(studentUsername || "STUDENT").toUpperCase();
      const newLog: AiPracticeLog = {
        id: `ai-${Date.now()}`,
        studentUsername: cleanUser,
        studentName: String(studentName || "Bright Scholar"),
        mode,
        topic: String(topic || "AI Learning Buddy Session"),
        score: Number(score),
        feedback: String(feedback || "Great effort practising with AI Learning Buddy!"),
        improvementArea: improvementArea ? String(improvementArea) : undefined,
        createdAt: new Date().toISOString(),
      };

      lms.aiLogs.unshift(newLog);

      const prog = getOrCreateStudentProgress(lms, cleanUser, newLog.studentName);
      prog.learningHours = Number(((prog.learningHours || 0) + 0.3).toFixed(1));
      if (mode === "reading" || mode === "pronunciation") {
        prog.readingProgress = Math.min(100, Math.max(prog.readingProgress || 0, Number(score)));
      }
      if (improvementArea && !prog.customImprovements.includes(improvementArea)) {
        prog.customImprovements.unshift(improvementArea);
      }

      if (!prog.badges.some((b) => b.id === "badge-ai-buddy")) {
        prog.badges.unshift({
          id: "badge-ai-buddy",
          title: "AI Learning Explorer",
          description: "Practised reading, pronunciation & writing with AI Buddy",
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

    // 6. STUDENT/TEACHER: Update Student Progress, Avatar, or Daily Activity
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

      prog.updatedAt = new Date().toISOString();
      lms.progressRecords[cleanUser] = prog;

      await saveLmsData(lms);
      return NextResponse.json({
        success: true,
        message: "Student progress profile updated!",
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
        termPeriod = "Current Academic Term • 2026",
        attendanceRate = 96,
        lessonsCompleted = 18,
        learningHours = 22,
        homeworkCompletionRate = 95,
        readingProgress = 88,
        subjectScores = [],
        strengths = [],
        areasForImprovement = [],
        teacherComment = "Shows remarkable curiosity and steady improvement in 1-on-1 live classes.",
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
        avgScore >= 90 ? "A+" : avgScore >= 80 ? "A" : avgScore >= 70 ? "B+" : "B";

      const reportRef = `BPRC-${Math.floor(10000 + Math.random() * 90000)}`;

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
        attendanceRate: Number(attendanceRate),
        lessonsCompleted: Number(lessonsCompleted),
        learningHours: Number(learningHours),
        homeworkCompletionRate: Number(homeworkCompletionRate),
        overallScore: avgScore,
        overallGrade,
        readingProgress: Number(readingProgress),
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
        teacherComment: String(teacherComment),
        issuedBy: "Bright Path Academic Director",
        createdAt: new Date().toISOString(),
      };

      lms.reportCards.unshift(newReport);

      lms.notifications.unshift({
        id: `notif-rc-${Date.now()}`,
        targetStudentUsername: cleanUser,
        type: "report",
        title: `New Academic Report Card Issued (${reportRef})`,
        message: `Overall Grade: ${overallGrade} (${avgScore}%) • Click 'My Reports' to view and download your official PDF Report Card.`,
        createdAt: new Date().toISOString(),
      });

      await saveLmsData(lms);

      const resolvedPortalUrl =
        portalUrl ||
        `${
          request.headers.get("origin") || "https://brightpathlearninghub.vercel.app"
        }/portal`;

      let emailSent = false;
      if (newReport.parentEmail && newReport.parentEmail.includes("@")) {
        try {
          const emailRes = await sendReportCardEmail(newReport, resolvedPortalUrl);
          emailSent = emailRes.sent;
        } catch (err) {
          console.error("Failed to send report card email:", err);
        }
      }

      return NextResponse.json({
        success: true,
        message: emailSent
          ? `Report Card ${reportRef} generated & sent via HTML email to ${newReport.parentEmail}!`
          : `Report Card ${reportRef} generated and published to Student & Parent Portal!`,
        reportCard: newReport,
        emailSent,
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
