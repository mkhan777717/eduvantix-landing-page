"use client";

import React from "react";
import ProFeaturePreview from "@/components/pro/ProFeaturePreview";
import { Radio } from "lucide-react";

export default function AIVivaPage() {
  return (
    <ProFeaturePreview 
      icon={Radio}
      title="AI Viva"
      description="Interactive technical assessments on core computer science subjects."
    />
  );
}
