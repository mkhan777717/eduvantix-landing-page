"use client";

import React from "react";
import ProFeaturePreview from "@/components/pro/ProFeaturePreview";
import { FileCheck } from "lucide-react";

export default function ApplicationsPage() {
  return (
    <ProFeaturePreview 
      icon={FileCheck}
      title="Application Tracker"
      description="Track the status of all your job applications in one central dashboard."
    />
  );
}
