"use client";
import { Mic } from "lucide-react";
import { ProEmptyState } from "@/components/pro/ProDashboardCard";
export default function InterviewPage() {
  return <ProEmptyState icon={Mic} title="AI Interview Prep" description="Practice role-specific technical and behavioural interviews with real-time AI feedback and improvement tips." phase="6" />;
}
