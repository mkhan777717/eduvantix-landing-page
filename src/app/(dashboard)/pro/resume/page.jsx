"use client";
import { FileText } from "lucide-react";
import { ProEmptyState } from "@/components/pro/ProDashboardCard";
export default function ResumePage() {
  return <ProEmptyState icon={FileText} title="Resume Intelligence" description="Upload your resume and our AI will analyse it for ATS compatibility, keyword gaps, and personalised improvements." phase="3" />;
}
