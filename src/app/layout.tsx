import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0b2545",
  colorScheme: "light",
};

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700", "800", "900"],
  display: "swap",
});

const siteBaseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://brightpathlearninghub.com");

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl),
  title: {
    default: "Bright Path Learning Hub | 1-on-1 LIVE Online Classes for Kids (KG - Grade 8)",
    template: "%s | Bright Path Learning Hub",
  },
  description:
    "Beyond textbooks, preparing kids for life. Bright Path Learning Hub delivers 1:1 LIVE online classes in English Phonics & Reading, Public Speaking, Coding & AI, and Conceptual Math. 100% Outcome Guarantee with physical worksheets delivered home.",
  keywords: [
    "Bright Path Learning Hub",
    "1-on-1 online classes for kids",
    "online tutoring for children",
    "English phonics classes for kids",
    "reading fluency and phonics",
    "public speaking for children",
    "speech and communication classes kids",
    "coding for kids Grade 1 to 8",
    "AI fundamentals for children",
    "conceptual mathematics tutoring",
    "KG to Grade 8 online classes",
    "early childhood education Nigeria",
    "online school tutoring Abuja",
    "doorstep physical worksheets education",
    "kids academic improvement guarantee",
  ],
  authors: [{ name: "Bright Path Learning Hub", url: "https://brightpathlearninghub.com" }],
  creator: "Bright Path Learning Hub",
  publisher: "Bright Path Learning Hub",
  category: "Education",
  applicationName: "Bright Path Learning Hub",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://brightpathlearninghub.com",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon.png", type: "image/png", sizes: "192x192" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/logo.png",
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Bright Path Learning Hub | 1-on-1 LIVE Online Classes for Kids (KG - Grade 8)",
    description:
      "Beyond textbooks, preparing kids for life. Personalized 1:1 LIVE online classes in English Phonics & Reading, Public Speaking, Coding, and Conceptual Math with 100% Guaranteed Outcome.",
    url: siteBaseUrl,
    siteName: "Bright Path Learning Hub",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "Bright Path Learning Hub Official Logo",
        type: "image/png",
      },
      {
        url: "/logo.jpg",
        width: 1024,
        height: 1024,
        alt: "Bright Path Learning Hub Official Logo",
        type: "image/jpeg",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bright Path Learning Hub | 1-on-1 LIVE Online Classes for Kids",
    description:
      "Beyond textbooks, preparing kids for life. Expert 1:1 online classes in English Phonics, Public Speaking, Coding, and Math with physical worksheets delivered home.",
    images: ["/logo.png"],
    creator: "@BrightPathHub",
    site: "@BrightPathHub",
  },
  verification: {
    google: "google-site-verification-brightpath",
  },
};

// Rich Structured Data (JSON-LD) for Search Engines
const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": "https://brightpathlearninghub.com/#organization",
      name: "Bright Path Learning Hub",
      alternateName: "Bright Path",
      url: "https://brightpathlearninghub.com",
      logo: {
        "@type": "ImageObject",
        url: "https://brightpathlearninghub.com/logo.png",
        caption: "Bright Path Learning Hub Logo",
      },
      image: "https://brightpathlearninghub.com/og-image.png",
      description:
        "Comprehensive early learning and academic tutoring platform offering personalized 1:1 LIVE online classes for kids (KG to Grade 8) in English Phonics, Public Speaking, Coding, and Conceptual Math.",
      telephone: "+2348063202616",
      email: "brightpathlearninghub6@gmail.com",
      identifier: {
        "@type": "PropertyValue",
        name: "Business Registration Number",
        value: "9840276",
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Kubwa",
        addressRegion: "Abuja",
        addressCountry: "NG",
      },
      sameAs: [
        "https://web.facebook.com/profile.php?id=61594197483487",
        "https://wa.me/2348063202616",
      ],
      priceRange: "$$",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        bestRating: "5",
        ratingCount: "52400",
        reviewCount: "52400",
      },
    },
    {
      "@type": "ItemList",
      "@id": "https://brightpathlearninghub.com/#courses",
      name: "Flagship 1:1 Early Learning Courses",
      itemListElement: [
        {
          "@type": "Course",
          position: 1,
          name: "English Superstar: Phonics, Reading & Vocabulary",
          description:
            "1-on-1 LIVE Phonics and Reading program for kids from LKG to Grade 8, enhancing pronunciation, syllable blending, and vocabulary mastery.",
          provider: {
            "@id": "https://brightpathlearninghub.com/#organization",
          },
        },
        {
          "@type": "Course",
          position: 2,
          name: "Superspeakers: Public Speaking & Confident Speech",
          description:
            "Personalized communication course developing speech articulation, body language, debate skills, and extempore confidence for children.",
          provider: {
            "@id": "https://brightpathlearninghub.com/#organization",
          },
        },
        {
          "@type": "Course",
          position: 3,
          name: "Supercoders: Coding, Logic & AI Classes for Kids",
          description:
            "Interactive computer programming and computational logic classes teaching block coding, game development, and modern AI fundamentals.",
          provider: {
            "@id": "https://brightpathlearninghub.com/#organization",
          },
        },
        {
          "@type": "Course",
          position: 4,
          name: "Supermath: Conceptual & Mental Mathematics",
          description:
            "Conceptual math program removing math fear through visualization, visual problem solving, mental math shortcuts, and speed calculations.",
          provider: {
            "@id": "https://brightpathlearninghub.com/#organization",
          },
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://brightpathlearninghub.com/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is Bright Path Learning Hub?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Bright Path Learning Hub is a comprehensive online education platform offering 1-on-1 live interactive classes for kids from KG to Grade 8. It delivers structured early childhood education courses designed to build essential skills that go far beyond standard school curricula to make students confident and future-ready.",
          },
        },
        {
          "@type": "Question",
          name: "Which age group are these online classes suitable for?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "These online classes are specially designed for children aged 4 to 14 years (LKG through Grade 8), featuring age-appropriate interactive content, customized worksheets, and personalized learning paths for every stage of child development.",
          },
        },
        {
          "@type": "Question",
          name: "What courses are included in Bright Path Learning Hub?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Bright Path Learning Hub offers four core flagship programs: English Phonics & Reading, Public Speaking & Speech Communication, Coding Classes for Kids, and Bright Math (Conceptual Mathematics).",
          },
        },
        {
          "@type": "Question",
          name: "Are these online classes personalized?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, absolutely. All courses are conducted via LIVE 1-on-1 sessions, ensuring dedicated individual attention from our certified instructors. Each child learns at their own pace without peer pressure.",
          },
        },
        {
          "@type": "Question",
          name: "Why should parents choose Bright Path Learning Hub over other platforms?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Bright Path Learning Hub stands out due to our vetted 'Teachers by Choice', live 1-on-1 interaction, physical worksheets delivered home, 100% Outcome Guarantee, and a registered academic framework (Business Reg. #9840276) dedicated to measurable student progress.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${outfit.variable}`}>
      <head>
        {/* Favicon fallback tags */}
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="shortcut icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Structured Data (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
