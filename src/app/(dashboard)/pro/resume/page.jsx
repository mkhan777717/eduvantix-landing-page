"use client";

import React from "react";
import ProFeaturePreview from "@/components/pro/ProFeaturePreview";
import { FileText } from "lucide-react";

export default function ResumeAnalysisPage() {
  return (
    <ProFeaturePreview 
      icon={FileText}
      title="Resume Analysis"
      description="Get AI-powered insights on your resume to improve your ATS score and land more interviews."
      requirement="Complete your Career Profile first."
    />
  );
}
