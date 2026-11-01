import { NextResponse } from "next/server";
import { getLmsData, saveLmsData } from "@/db";
import {
  getOrCreateStudentProgress,
  type HomeworkAssignment,
  type HomeworkSubmission,
  type StudentReportCard,
  type PortalNotification,
  type AiPracticeLog,
} from "@/lib/lmsData";
import { sendReportCardEmail } from "@/lib/email";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentUsername = searchParams.get("studentUsername")?.trim().toUpperCase();
    const studentName = searchParams.get("studentName")?.trim() || "Bright Scholar";
    const courseName = searchParams.get("courseName")?.trim() || "";

    const lms = await getLmsData();

    if (studentUsername) {
      const progress = getOrCreateStudentProgress(lms, studentUsername, studentName);

      const assignedHomework = lms.assignments.filter((hw) => {
        if (hw.targetType === "all") return true;
        if (
          hw.targetType === "student" &&
          hw.assignedStudentUsername?.toUpperCase() === studentUsername
        ) {
          return true;
        }
        if (
          hw.targetType === "course" &&
          courseName &&
          hw.courseName.toLowerCase() === courseName.toLowerCase()
        ) {
          return true;
        }
        return hw.targetType === "course";
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

    // 1. TEACHER/ADMIN: Create & Assign Homework (Individual Student or Entire Class)
    if (action === "create-homework") {
      const {
        title,
        description,
        courseName,
        grade = "All Grades",
        targetType = "all",
        assignedStudentUsername,
        assignedStudentName,
        dueDate,
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

      const newAssignment: HomeworkAssignment = {
        id: `hw-${Date.now()}`,
        title: String(title).trim(),
        description: String(description || "Complete all questions carefully and submit online.").trim(),
        courseName: String(courseName || "English Phonics & Reading").trim(),
        grade: String(grade).trim(),
        targetType,
        assignedStudentUsername: assignedStudentUsername
          ? String(assignedStudentUsername).trim().toUpperCase()
          : undefined,
        assignedStudentName: assignedStudentName ? String(assignedStudentName).trim() : undefined,
        dueDate:
          dueDate || new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0],
        totalPoints,
        questions: questions.map((q: any, idx: number) => ({
          id: q.id || `q-${Date.now()}-${idx}`,
          type: q.type === "subjective" ? "subjective" : "objective",
          prompt: String(q.prompt).trim(),
          options: q.type === "objective" ? q.options || [] : undefined,
          correctAnswer: q.type === "objective" ? String(q.correctAnswer || "").trim() : undefined,
          points: Number(q.points || 20),
          skillTag: String(q.skillTag || courseName || "General Mastery"),
        })),
        createdAt: new Date().toISOString(),
      };

      lms.assignments.unshift(newAssignment);

      const notif: PortalNotification = {
        id: `notif-${Date.now()}`,
        targetStudentUsername:
          targetType === "student" && assignedStudentUsername
            ? String(assignedStudentUsername).toUpperCase()
            : "ALL",
        type: "homework",
        title: `New Homework Assigned: ${newAssignment.title}`,
        message: `Course: ${newAssignment.courseName} • Due: ${newAssignment.dueDate} (${newAssignment.totalPoints} pts)`,
        createdAt: new Date().toISOString(),
      };
      lms.notifications.unshift(notif);

      await saveLmsData(lms);
      return NextResponse.json({
        success: true,
        message: "Homework assignment created and assigned successfully!",
        assignment: newAssignment,
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

    // 3. STUDENT: Submit Homework Online (Auto-grades Objective Questions!)
    if (action === "submit-homework") {
      const {
        homeworkId,
        studentUsername,
        studentName,
        parentEmail,
        grade = "Grade 2",
        answers = {},
      } = body;

      const assignment = lms.assignments.find((a) => a.id === homeworkId);
      if (!assignment) {
        return NextResponse.json(
          { success: false, message: "Homework assignment not found." },
          { status: 404 }
        );
      }

      let objectiveScore = 0;
      let subjectiveAutoEstimate = 0;
      let hasSubjective = false;
      const weakSkillsIdentified: string[] = [];

      for (const q of assignment.questions) {
        const studentAns = String(answers[q.id] || "").trim();
        if (q.type === "objective") {
          const isCorrect =
            studentAns.toLowerCase() === String(q.correctAnswer || "").trim().toLowerCase();
          if (isCorrect) {
            objectiveScore += Number(q.points || 0);
          } else if (q.skillTag && !weakSkillsIdentified.includes(q.skillTag)) {
            weakSkillsIdentified.push(q.skillTag);
          }
        } else {
          hasSubjective = true;
          // Provide a provisional writing score based on completeness until teacher reviews
          const wordCount = studentAns.split(/\s+/).filter(Boolean).length;
          if (wordCount >= 12) {
            subjectiveAutoEstimate += Number(q.points || 0);
          } else if (wordCount >= 5) {
            subjectiveAutoEstimate += Math.round(Number(q.points || 0) * 0.8);
          } else if (wordCount > 0) {
            subjectiveAutoEstimate += Math.round(Number(q.points || 0) * 0.5);
            weakSkillsIdentified.push(q.skillTag || "Sentence Expansion & Writing");
          } else {
            weakSkillsIdentified.push(q.skillTag || "Written Expression");
          }
        }
      }

      const maxPoints = assignment.totalPoints || 100;
      const totalScore = objectiveScore + subjectiveAutoEstimate;
      const percentage = Math.min(100, Math.round((totalScore / maxPoints) * 100));

      const autoFeedback = !hasSubjective
        ? percentage >= 85
          ? "Excellent work! All objective questions were automatically graded with high accuracy."
          : `Good effort! Your objective questions were auto-graded (${percentage}%). Review ${
              weakSkillsIdentified.join(", ") || "the missed questions"
            } for 100% mastery.`
        : `Objective questions auto-graded (${objectiveScore} pts). Written response received for teacher review.`;

      const cleanUser = String(studentUsername || "STUDENT").toUpperCase();

      // Remove any previous submission for the same homework by this student
      lms.submissions = lms.submissions.filter(
        (s) => !(s.homeworkId === homeworkId && s.studentUsername.toUpperCase() === cleanUser)
      );

      const newSubmission: HomeworkSubmission = {
        id: `sub-${Date.now()}`,
        homeworkId: assignment.id,
        homeworkTitle: assignment.title,
        courseName: assignment.courseName,
        studentUsername: cleanUser,
        studentName: String(studentName || "Bright Scholar"),
        parentEmail: parentEmail ? String(parentEmail) : undefined,
        grade: String(grade),
        answers,
        objectiveScore,
        subjectiveScore: subjectiveAutoEstimate,
        totalScore,
        maxPoints,
        percentage,
        status: hasSubjective ? "submitted" : "graded",
        teacherFeedback: autoFeedback,
        weakSkillsIdentified,
        submittedAt: new Date().toISOString(),
        gradedAt: hasSubjective ? undefined : new Date().toISOString(),
      };

      lms.submissions.unshift(newSubmission);

      // Update student academic progress & badges
      const prog = getOrCreateStudentProgress(lms, cleanUser, newSubmission.studentName);
      prog.lessonsCompleted = (prog.lessonsCompleted || 14) + 1;
      prog.learningHours = Number(((prog.learningHours || 18.5) + 0.5).toFixed(1));

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
          description: "Submitted online homework & completed auto-graded quiz",
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
        message: hasSubjective
          ? `Homework submitted! Objective score: ${objectiveScore} pts (${percentage}% overall).`
          : `Homework submitted & auto-graded! You scored ${totalScore}/${maxPoints} (${percentage}%).`,
        submission: newSubmission,
        progress: prog,
      });
    }

    // 4. TEACHER/ADMIN: Manually Grade Submission & Provide Feedback
    if (action === "grade-submission") {
      const {
        submissionId,
        subjectiveScore,
        totalScore,
        teacherFeedback,
        weakSkillsIdentified,
      } = body;

      const sub = lms.submissions.find((s) => s.id === submissionId);
      if (!sub) {
        return NextResponse.json(
          { success: false, message: "Submission not found." },
          { status: 404 }
        );
      }

      if (subjectiveScore !== undefined) {
        sub.subjectiveScore = Number(subjectiveScore);
      }
      if (totalScore !== undefined) {
        sub.totalScore = Number(totalScore);
      } else {
        sub.totalScore = sub.objectiveScore + sub.subjectiveScore;
      }
      sub.percentage = Math.min(100, Math.round((sub.totalScore / (sub.maxPoints || 100)) * 100));
      sub.status = "graded";
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
        title: `Homework Graded: ${sub.homeworkTitle}`,
        message: `Score: ${sub.totalScore}/${sub.maxPoints} (${sub.percentage}%) • Teacher Feedback: "${sub.teacherFeedback}"`,
        createdAt: new Date().toISOString(),
      });

      await saveLmsData(lms);

      return NextResponse.json({
        success: true,
        message: `Graded submission for ${sub.studentName} (${sub.percentage}%)!`,
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
      prog.learningHours = Number(((prog.learningHours || 18.5) + 0.3).toFixed(1));
      if (mode === "reading" || mode === "pronunciation") {
        prog.readingProgress = Math.min(100, Math.max(prog.readingProgress || 80, Number(score)));
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
          prog.lessonsCompleted = (prog.lessonsCompleted || 14) + 1;
          prog.learningHours = Number(((prog.learningHours || 18.5) + 0.5).toFixed(1));
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

