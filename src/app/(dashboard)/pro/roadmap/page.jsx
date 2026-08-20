"use client";

import React from "react";
import ProFeaturePreview from "@/components/pro/ProFeaturePreview";
import { Map } from "lucide-react";

export default function MyRoadmapPage() {
  return (
    <ProFeaturePreview 
      icon={Map}
      title="My Roadmap"
      description="A highly personalized, step-by-step learning journey designed to reach your career goal."
      requirement="Complete your Career Profile and take the initial assessment."
    />
  );
}
