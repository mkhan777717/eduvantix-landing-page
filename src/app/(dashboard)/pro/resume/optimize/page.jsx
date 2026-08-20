"use client";

import React from "react";
import ProFeaturePreview from "@/components/pro/ProFeaturePreview";
import { Zap } from "lucide-react";

export default function ResumeOptimizerPage() {
  return (
    <ProFeaturePreview 
      icon={Zap}
      title="Resume Optimizer"
      description="Automatically tailor your resume for specific job descriptions with one click."
      requirement="Upload a base resume first."
    />
  );
}
