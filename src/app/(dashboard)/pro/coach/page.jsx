"use client";

import React from "react";
import ProFeaturePreview from "@/components/pro/ProFeaturePreview";
import { Bot } from "lucide-react";

export default function AICoachPage() {
  return (
    <ProFeaturePreview 
      icon={Bot}
      title="AI Career Coach"
      description="24/7 personalized guidance, mentorship, and answers to all your career-related questions."
    />
  );
}
