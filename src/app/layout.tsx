import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0b2545",
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

export const metadata: Metadata = {
  metadataBase: new URL("https://brightpathlearninghub.com"),
  title: "Bright Path Learning Hub | 1-on-1 LIVE Online Classes for Kids (KG to Grade 8)",
  description:
    "Bright Path Learning Hub offers expert-led 1:1 online classes in English Phonics & Reading, Public Speaking, Coding, and Conceptual Math. Real skills for real-world success.",
  keywords: [
    "Bright Path Learning Hub",
    "online classes for kids",
    "phonics reading classes",
    "public speaking for children",
    "coding for kids",
    "math classes LKG Grade 8",
    "early childhood education",
  ],
  authors: [{ name: "Bright Path Learning Hub" }],
  openGraph: {
    title: "Bright Path Learning Hub - Beyond Textbooks, Preparing Kids for Life",
    description:
      "Expert-led 1-on-1 online classes for kids covering English Phonics, Public Speaking, Coding, and Math with guaranteed learning outcomes.",
    url: "https://brightpathlearninghub.com",
    siteName: "Bright Path Learning Hub",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Bright Path Learning Hub Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Bright Path Learning Hub",
  url: "https://brightpathlearninghub.com",
  logo: "https://brightpathlearninghub.com/logo.png",
  description:
    "1-on-1 LIVE Online Classes for Kids in English Phonics, Public Speaking, Coding, and Conceptual Math.",
  telephone: "+2348063202616",
  email: "brightpathlearninghub6@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kubwa",
    addressRegion: "Abuja",
    addressCountry: "NG",
  },
  sameAs: ["https://web.facebook.com/profile.php?id=61594197483487"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${outfit.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
