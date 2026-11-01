"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { defaultSiteContent, type SiteContentData } from "@/lib/defaultSiteContent";

interface SiteContentContextValue {
  content: SiteContentData;
  refreshContent: () => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextValue>({
  content: defaultSiteContent,
  refreshContent: async () => {},
});

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<SiteContentData>(defaultSiteContent);

  const refreshContent = async () => {
    try {
      const res = await fetch("/api/site-content", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.content) {
        setContent({
          ...defaultSiteContent,
          ...data.content,
          general: { ...defaultSiteContent.general, ...(data.content.general || {}) },
          hero: { ...defaultSiteContent.hero, ...(data.content.hero || {}) },
          coursesSection: {
            ...defaultSiteContent.coursesSection,
            ...(data.content.coursesSection || {}),
          },
          whySection: { ...defaultSiteContent.whySection, ...(data.content.whySection || {}) },
          testimonialsSection: {
            ...defaultSiteContent.testimonialsSection,
            ...(data.content.testimonialsSection || {}),
          },
          shiningStarsSection: {
            ...defaultSiteContent.shiningStarsSection,
            ...(data.content.shiningStarsSection || {}),
          },
          guaranteeSection: {
            ...defaultSiteContent.guaranteeSection,
            ...(data.content.guaranteeSection || {}),
          },
          faqSection: { ...defaultSiteContent.faqSection, ...(data.content.faqSection || {}) },
          curriculumSection: {
            ...defaultSiteContent.curriculumSection,
            ...(data.content.curriculumSection || {}),
          },
        });
      }
    } catch (err) {
      console.error("Failed to fetch site content:", err);
    }
  };

  useEffect(() => {
    refreshContent();
  }, []);

  return (
    <SiteContentContext.Provider value={{ content, refreshContent }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  return useContext(SiteContentContext);
}

