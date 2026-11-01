export interface SiteContentData {
  general: {
    siteName: string;
    registrationNo: string;
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    facebookUrl: string;
    workingHours: string;
    footerDescription: string;
  };
  hero: {
    badgeText: string;
    titleLine1Prefix: string;
    titleLine1Highlight: string;
    titleLine2Prefix: string;
    titleLine2Highlight: string;
    titleLine3Prefix: string;
    rotatingWords: string[];
    subtitle: string;
    ratingText: string;
    leadPrompt: string;
    sealTitle: string;
    sealBadge: string;
    sealDescription: string;
  };
  benefits: {
    title: string;
    sub: string;
  }[];
  coursesSection: {
    pill: string;
    title: string;
    subtitle: string;
    courses: {
      id: string;
      title: string;
      brandLabel: string;
      grades: string;
      headerColor: string;
      tagline: string;
      highlights: string[];
      hours: string;
      worksheetsCount: string;
    }[];
  };
  whySection: {
    pill: string;
    title: string;
    subtitle: string;
    points: {
      title: string;
      subtitle: string;
      desc: string;
      bg: string;
    }[];
  };
  testimonialsSection: {
    pill: string;
    title: string;
    subtitle: string;
    videoUrl: string;
    videoCardTitle: string;
    videoCardSubtitle: string;
    items: {
      quote: string;
      author: string;
      relation: string;
      rating: number;
      city: string;
    }[];
  };
  shiningStarsSection: {
    pill: string;
    title: string;
    subtitle: string;
    stars: {
      name: string;
      grade: string;
      program: string;
      achievements: string[];
      badgeColor: string;
      initials: string;
    }[];
  };
  guaranteeSection: {
    badgeText: string;
    title: string;
    description: string;
    promises: {
      title: string;
      subtitle: string;
    }[];
    bottomBannerText: string;
    sealTitle: string;
    sealQuote: string;
    sealDirectorate: string;
    sealCouncil: string;
  };
  faqSection: {
    pill: string;
    title: string;
    subtitle: string;
    faqs: {
      q: string;
      a: string;
    }[];
  };
  curriculumSection: {
    pill: string;
    title: string;
    subtitle: string;
    rows: {
      course: string;
      grades: string;
      focus: string;
      mode: string;
    }[];
  };
}

export const defaultSiteContent: SiteContentData = {
  general: {
    siteName: "Bright Path Learning Hub",
    registrationNo: "9840276",
    phone: "+234 806 320 2616",
    whatsapp: "2348063202616",
    email: "brightpathlearninghub6@gmail.com",
    address: "Kubwa, Abuja",
    facebookUrl: "https://web.facebook.com/profile.php?id=61594197483487",
    workingHours: "Mon-Sat: 10 AM - 9 PM | Sun: 10 AM - 7 PM",
    footerDescription:
      "Bright Path Learning Hub offers expert-led 1:1 online programs in English Phonics, Public Speaking, Coding, and Conceptual Math for children from LKG to Grade 8. Personalized learning designed for your child’s holistic growth!",
  },
  hero: {
    badgeText: "Personalized Early Childhood Education (KG – Grade 8)",
    titleLine1Prefix: "Beyond",
    titleLine1Highlight: "textbooks,",
    titleLine2Prefix: "preparing",
    titleLine2Highlight: "kids",
    titleLine3Prefix: "for",
    rotatingWords: [
      "life.",
      "public speaking.",
      "creative coding.",
      "reading fluency.",
      "conceptual math.",
      "future leadership.",
    ],
    subtitle:
      "Real skills for real-world success. LIVE 1-on-1 personalized classes in English Phonics, Public Speaking, Coding, and Conceptual Math designed for confident and joyful learning.",
    ratingText: "Rated 4.8/5 on Trustpilot & Google",
    leadPrompt: "Enter your phone number to receive instant curriculum & demo details",
    sealTitle: "Bright Path Learning Hub",
    sealBadge: "Govt. Registered Business # 9840276",
    sealDescription:
      "Empowering Young Minds with Phonics, Public Speaking, Coding & Math Excellence",
  },
  benefits: [
    {
      title: "1:1 LIVE Classes",
      sub: "Dedicated teacher per child",
    },
    {
      title: "Physical Worksheets",
      sub: "Delivered directly to doorstep",
    },
    {
      title: "Personalized Attention",
      sub: "Paced to your child's rhythm",
    },
    {
      title: "Improvement Guarantee",
      sub: "100% measurable progress",
    },
  ],
  coursesSection: {
    pill: "Academic Excellence",
    title: "Our Flagship 1-on-1 Courses",
    subtitle:
      "Engineered by child-pedagogy specialists to nurture curiosity, fluency, analytical mindset, and lifelong self-confidence.",
    courses: [
      {
        id: "english-phonics",
        title: "English Phonics & Reading",
        brandLabel: "ENGLISH SUPERSTAR",
        grades: "LKG - Grade 8",
        headerColor: "#43A047",
        tagline: "Confidence & personality-building program for your child's bright future",
        highlights: [
          "Letter-sound correspondence & blending",
          "Vocabulary building & story comprehension",
          "Pronunciation & accent neutralization",
          "Over 100+ decodable storybooks",
        ],
        hours: "60 Hours Live 1:1",
        worksheetsCount: "48 Physical Books",
      },
      {
        id: "public-speaking",
        title: "Public Speaking & Communication",
        brandLabel: "SUPERSPEAKERS",
        grades: "LKG - Grade 8",
        headerColor: "#1E88E5",
        tagline: "Master fluency, clarity, and fearless expression in English",
        highlights: [
          "Overcoming stage fear & shy behavior",
          "Body language, posture & eye contact",
          "Extempore & speech structure techniques",
          "Trinity College London performance prep",
        ],
        hours: "60 Hours Live 1:1",
        worksheetsCount: "Interactive Speech Labs",
      },
      {
        id: "coding",
        title: "Coding Classes for Kids",
        brandLabel: "SUPERCODERS",
        grades: "Grade 1 - 8",
        headerColor: "#E53935",
        tagline: "Introduce your child to the world of coding, games & AI thinking",
        highlights: [
          "Visual block coding & logic puzzles",
          "Game development in Scratch & Roblox",
          "Python basics & web fundamentals",
          "AI literacy & creative computational thinking",
        ],
        hours: "60 Hours Live 1:1",
        worksheetsCount: "12 Real-world Projects",
      },
      {
        id: "v-math",
        title: "Bright Math - Conceptual Mathematics",
        brandLabel: "SUPERMATH",
        grades: "KG - Grade 8",
        headerColor: "#F59E0B",
        tagline: "Give your child 2x faster learning than school with deep concept mastery",
        highlights: [
          "Visual geometry & arithmetic models",
          "Vedic math speed tricks & mental shortcuts",
          "Word-problem deconstruction frameworks",
          "IMO & School exam excellence",
        ],
        hours: "60 Hours Live 1:1",
        worksheetsCount: "60 Physical Math Worksheets",
      },
    ],
  },
  whySection: {
    pill: "The Bright Path Edge",
    title: "Why Bright Path is the Best for Your Child",
    subtitle:
      "We believe that early childhood is the most fertile window for developing creative problem-solving, fearless expression, and foundational excellence.",
    points: [
      {
        bg: "#eff6ff",
        title: "High Quality 'Teachers by Choice'",
        subtitle: "Selected through rigorous 5-stage screening",
        desc: "Our educators are not teachers by accident, but by passion. Vetted by senior pedagogical leaders and trained continuously in modern child psychology and interactive teaching methodologies.",
      },
      {
        bg: "#fffbeb",
        title: "Interactive & Engaging Live Classes",
        subtitle: "Learning through play, stories & puzzles",
        desc: "Every single session is an immersive adventure. With animated storytelling, gamified coding challenges, and interactive math boards, children stay deeply invested from minute one.",
      },
      {
        bg: "#ecfdf5",
        title: "Learn, Practise, Master, Repeat",
        subtitle: "Structured mastery framework",
        desc: "We ditch rote memorization. Through physical hands-on worksheets, live doubt solving, and structured revision cycles, concepts transition effortlessly into long-term cognitive skills.",
      },
    ],
  },
  testimonialsSection: {
    pill: "Verified Parent Stories",
    title: "Hear It From Our Parents",
    subtitle:
      "Over 50,000 parents trust Bright Path Learning Hub to shape their children's communication, logic, and self-belief.",
    videoUrl: "https://www.youtube-nocookie.com/embed/Ha97Zv064VE?autoplay=1",
    videoCardTitle: "Watch Sharmistha & Mother's Journey",
    videoCardSubtitle: "2 min story • Phonics & Confidence",
    items: [
      {
        quote:
          "The teacher explained all the basic concepts to my child with such great patience. Now my daughter can spell and pronounce any word correctly and has become a confident English speaker in her class!",
        author: "Ritu Sengupta",
        relation: "Mother of Sharmistha (Grade 2, Phonics & Public Speaking)",
        rating: 5,
        city: "Bengaluru",
      },
      {
        quote:
          "My son used to be terrified of math word problems. Within just 6 weeks at Bright Path, he started solving visual puzzles faster than anyone in his school class! The 1:1 attention makes a massive difference.",
        author: "Arjun Verma",
        relation: "Father of Kabir (Grade 4, Bright Math Program)",
        rating: 5,
        city: "Mumbai",
      },
      {
        quote:
          "Finding an engaging coding teacher for an 8-year-old was difficult until we discovered Bright Path. Maya built her first interactive animated story in Scratch on week 3. She looks forward to every single session!",
        author: "Sarah Jenkins",
        relation: "Mother of Maya (Grade 3, Coding Classes)",
        rating: 5,
        city: "London / Global Online",
      },
    ],
  },
  shiningStarsSection: {
    pill: "Wall of Pride",
    title: "Shining Stars of Bright Path",
    subtitle:
      "Celebrate the triumphs of our young learners winning international olympiads, prestigious speech certifications, and coding honors.",
    stars: [
      {
        name: "Anika Bandhopadhyay",
        grade: "Grade 1",
        program: "English Phonics & Public Speaking",
        achievements: [
          "Trinity College London",
          "Bronze Young Performer Award",
          "Speech Fluency Top Rank",
        ],
        badgeColor: "#1d4ed8",
        initials: "AB",
      },
      {
        name: "Prisha Singh",
        grade: "SLEP - Grade 1",
        program: "English Superstar",
        achievements: [
          "SpellBee International Top Ranker",
          "Strategic Language Programme",
          "100% Phonics Word Mastery",
        ],
        badgeColor: "#059669",
        initials: "PS",
      },
      {
        name: "Penida Riyanshi",
        grade: "Grade 2",
        program: "English Superstar",
        achievements: [
          "International English Olympiad (IEO)",
          "Gold Medal of Distinction",
          "Certificate of Zonal Excellence",
        ],
        badgeColor: "#f59e0b",
        initials: "PR",
      },
      {
        name: "Reyansh Kulkarni",
        grade: "Grade 3",
        program: "Supercoders Track",
        achievements: [
          "National Junior Game Jam Winner",
          "Built 8 interactive Scratch games",
          "Algorithm Speed Distinction",
        ],
        badgeColor: "#dc2626",
        initials: "RK",
      },
      {
        name: "Aarav Patel",
        grade: "Grade 4",
        program: "Bright Math Program",
        achievements: [
          "International Math Olympiad (IMO) Rank 14",
          "Mental Math 2x Speed Champion",
          "Vedic Calculation Certified",
        ],
        badgeColor: "#7c3aed",
        initials: "AP",
      },
      {
        name: "Ananya Roy",
        grade: "Grade 2",
        program: "Superspeakers Track",
        achievements: [
          "Inter-School Storytelling Champion",
          "Fearless Stage Delivery Award",
          "Vocabulary Distinction",
        ],
        badgeColor: "#0284c7",
        initials: "AR",
      },
    ],
  },
  guaranteeSection: {
    badgeText: "Zero Risk • Measurable Results",
    title: "BRIGHT PATH’S 100% OUTCOME GUARANTEE",
    description:
      "At Bright Path Learning Hub, we believe in the transformative power of personalized education. If your child attends at least 90% of their scheduled sessions and completes guided worksheets, we guarantee tangible, measurable improvement in their reading fluency, public speaking, mathematical problem solving, or coding reasoning.",
    promises: [
      {
        title: "Personalized Learning",
        subtitle: "Custom progression tailored to your child's speed",
      },
      {
        title: "Expert-Led Classes",
        subtitle: "Top 1% vetted & background-checked educators",
      },
      {
        title: "Proven Outcomes",
        subtitle: "Standardized baseline & post-course assessment",
      },
    ],
    bottomBannerText:
      "If you don't observe clear improvement, we provide complimentary extra 1:1 sessions until mastery is achieved.",
    sealTitle: "Official Academic Seal",
    sealQuote:
      "We are committed to delivering results. We promise success. That is the Bright Path guarantee.",
    sealDirectorate: "Academic Directorate",
    sealCouncil: "Bright Path Learning Hub Academic Council",
  },
  faqSection: {
    pill: "Got Questions?",
    title: "Frequently Asked Questions",
    subtitle:
      "Everything you need to know about our 1:1 online sessions, curriculum, worksheets, and enrollment.",
    faqs: [
      {
        q: "What is Bright Path Learning Hub?",
        a: "Bright Path Learning Hub is a comprehensive online education platform offering 1-on-1 live interactive classes for kids from KG to Grade 8. It delivers structured early childhood education courses designed to build essential skills that go far beyond standard school curricula to make students confident and future-ready.",
      },
      {
        q: "Which age group are these online classes suitable for?",
        a: "These online classes are specially designed for children aged 4 to 14 years (LKG through Grade 8), featuring age-appropriate interactive content, customized worksheets, and personalized learning paths for every stage of child development.",
      },
      {
        q: "What courses are included in Bright Path Learning Hub?",
        a: "Bright Path Learning Hub offers four core flagship programs: English Phonics & Reading, Public Speaking & Speech Communication, Coding Classes for Kids, and Bright Math (Conceptual Mathematics). These courses focus on language fluency, communication confidence, logical thinking, creativity, and numeracy.",
      },
      {
        q: "Are these online classes personalized?",
        a: "Yes, absolutely. All courses are conducted via LIVE 1-on-1 sessions, ensuring dedicated individual attention from our certified instructors. Each child learns at their own pace without peer pressure.",
      },
      {
        q: "How are these classes different from school learning?",
        a: "Our programs go beyond traditional school rote memorization. They focus on foundational mastery, practical speaking fluency, interactive computational logic, and hands-on physical worksheets delivered to your home.",
      },
      {
        q: "Do these courses include interactive activity classes for kids?",
        a: "Yes! Every single class incorporates hands-on activities, such as story decoding games, extempore speech exercises, interactive block coding projects, and visual math manipulatives that make learning deeply enjoyable.",
      },
      {
        q: "Why should parents choose Bright Path Learning Hub over other platforms?",
        a: "Bright Path Learning Hub stands out due to our vetted 'Teachers by Choice', live 1-on-1 interaction, physical worksheets delivered home, 100% Outcome Guarantee, and a registered academic framework (Business Reg. #9840276) dedicated to measurable student progress.",
      },
      {
        q: "Are these early education courses suitable for beginners?",
        a: "Yes! All courses are welcoming to complete beginners. Every learner begins with an introductory baseline diagnostic session so our educators can tailor the starting module to the child's exact current level.",
      },
    ],
  },
  curriculumSection: {
    pill: "Curriculum Blueprint",
    title: "Program Overview for Young Learners",
    subtitle:
      "A comprehensive, grade-aligned framework engineered to accelerate foundational skills 2x faster than traditional schooling.",
    rows: [
      {
        course: "ENGLISH SUPERSTAR – English Phonics & Reading",
        grades: "LKG – Grade 8",
        focus: "Phonics-based reading, blending, accent neutralization, and vocabulary comprehension",
        mode: "1:1 Live Interactive + 48 Physical Storybooks",
      },
      {
        course: "SUPERSPEAKERS – Public Speaking & Oratory",
        grades: "LKG – Grade 8",
        focus: "Spoken English fluency, overcoming stage fear, voice modulation, and debate mastery",
        mode: "1:1 Live Speech Labs + Trinity College Prep",
      },
      {
        course: "SUPERCODERS – Coding & AI Classes for Kids",
        grades: "Grade 1 – Grade 8",
        focus: "Computational thinking, Scratch animation, game logic, Python syntax, and AI fundamentals",
        mode: "1:1 Live Coding IDE + 12 Hands-on Projects",
      },
      {
        course: "SUPERMATH – Bright Math Conceptual Program",
        grades: "KG – Grade 8",
        focus: "Concept-first mathematics, Vedic speed tricks, visual geometry, and Olympiad problem-solving",
        mode: "1:1 Live Whiteboard + 60 Physical Worksheets",
      },
    ],
  },
};
