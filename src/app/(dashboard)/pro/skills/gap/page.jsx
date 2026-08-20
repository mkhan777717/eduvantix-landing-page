"use client";

import React from "react";
import ProFeaturePreview from "@/components/pro/ProFeaturePreview";
import { Target } from "lucide-react";

export default function SkillGapPage() {
  return (
    <ProFeaturePreview 
      icon={Target}
      title="Skill Gap Analysis"
      description="Compare your current skills with industry standards for your target role and get targeted recommendations."
      requirement="Complete your Career Profile first."
    />
  );
}
