"use client";

import React from "react";
import ProFeaturePreview from "@/components/pro/ProFeaturePreview";
import { Mic } from "lucide-react";

export default function AIInterviewPage() {
  return (
    <ProFeaturePreview 
      icon={Mic}
      title="AI Interview Practice"
      description="Simulate real-world technical and behavioral interviews with our conversational AI."
    />
  );
}
