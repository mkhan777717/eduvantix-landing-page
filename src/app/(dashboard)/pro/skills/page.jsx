"use client";

import React from "react";
import ProFeaturePreview from "@/components/pro/ProFeaturePreview";
import { Brain } from "lucide-react";

export default function SkillIntelligencePage() {
  return (
    <ProFeaturePreview 
      icon={Brain}
      title="Skill Intelligence"
      description="Detailed analytics of your technical proficiency across languages and frameworks based on your activity."
    />
  );
}
