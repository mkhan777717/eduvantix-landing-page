"use client";

import React from "react";
import ProFeaturePreview from "@/components/pro/ProFeaturePreview";
import { Code } from "lucide-react";

export default function ProjectsPage() {
  return (
    <ProFeaturePreview 
      icon={Code}
      title="Pro Projects"
      description="Build industry-level projects tailored to your target role to strengthen your portfolio."
    />
  );
}
