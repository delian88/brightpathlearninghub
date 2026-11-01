import { NextResponse } from "next/server";

export const coursesData = [
  {
    id: "english-phonics",
    title: "English Phonics & Reading",
    brandLabel: "ENGLISH SUPERSTAR",
    grades: "LKG - Grade 8",
    accentColor: "#43A047", // Vibrant Green
    bgGradient: "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)",
    headerColor: "#43A047",
    tagline: "Confidence & personality-building program for your child's bright future",
    description:
      "A foundational English program that builds phonics, reading fluency, and comprehension skills through structured 1-on-1 personalized learning.",
    highlights: [
      "Letter-sound correspondence & blending",
      "Vocabulary building & story comprehension",
      "Pronunciation & accent neutralization",
      "Over 100+ decodable storybooks",
    ],
    ageGroup: "Age 4 - 14",
    hours: "60 Hours Live 1:1",
    worksheetsCount: "48 Physical Books",
  },
  {
    id: "public-speaking",
    title: "Public Speaking & Communication",
    brandLabel: "SUPERSPEAKERS",
    grades: "LKG - Grade 8",
    accentColor: "#1E88E5", // Bright Royal Blue
    bgGradient: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
    headerColor: "#1E88E5",
    tagline: "Master fluency, clarity, and fearless expression in English",
    description:
      "A confidence-building English communication program focused on public speaking, expressive voice modulation, debates, and presentation mastery.",
    highlights: [
      "Overcoming stage fear & shy behavior",
      "Body language, posture & eye contact",
      "Extempore & speech structure techniques",
      "Trinity College London performance prep",
    ],
    ageGroup: "Age 4 - 14",
    hours: "60 Hours Live 1:1",
    worksheetsCount: "Interactive Speech Labs",
  },
  {
    id: "coding",
    title: "Coding Classes for Kids",
    brandLabel: "SUPERCODERS",
    grades: "Grade 1 - 8",
    accentColor: "#E53935", // Crimson/Coral Red
    bgGradient: "linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)",
    headerColor: "#E53935",
    tagline: "Introduce your child to the world of coding, games & AI thinking",
    description:
      "An introductory-to-advanced coding track developing algorithmic reasoning, creative problem solving, game design, and app building.",
    highlights: [
      "Visual block coding & logic puzzles",
      "Game development in Scratch & Roblox",
      "Python basics & web fundamentals",
      "AI literacy & creative computational thinking",
    ],
    ageGroup: "Age 6 - 14",
    hours: "60 Hours Live 1:1",
    worksheetsCount: "12 Real-world Projects",
  },
  {
    id: "v-math",
    title: "Bright Math - Conceptual Mathematics",
    brandLabel: "SUPERMATH",
    grades: "KG - Grade 8",
    accentColor: "#F59E0B", // Amber Gold
    bgGradient: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
    headerColor: "#F59E0B",
    tagline: "Give your child 2x faster learning than school with deep concept mastery",
    description:
      "A personalized math learning program that strengthens conceptual understanding, mental calculation, and Olympiad problem-solving beyond rote memorization.",
    highlights: [
      "Visual geometry & arithmetic models",
      "Vedic math speed tricks & mental shortcuts",
      "Word-problem deconstruction frameworks",
      "IMO & School exam excellence",
    ],
    ageGroup: "Age 5 - 14",
    hours: "60 Hours Live 1:1",
    worksheetsCount: "60 Physical Math Worksheets",
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    courses: coursesData,
  });
}
