"use client";

import React from "react";
import ProFeaturePreview from "@/components/pro/ProFeaturePreview";
import { Briefcase } from "lucide-react";

export default function JobMatchesPage() {
  return (
    <ProFeaturePreview 
      icon={Briefcase}
      title="Job Matches"
      description="Curated list of job opportunities matching your skills and career profile."
      requirement="Complete your Career Profile and upload a Resume."
    />
  );
}
