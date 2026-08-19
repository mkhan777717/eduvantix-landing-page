"use client";
import { Brain } from "lucide-react";
import { ProEmptyState } from "@/components/pro/ProDashboardCard";
export default function SkillGapPage() {
  return <ProEmptyState icon={Brain} title="Skill Gap Analysis" description="Our AI will compare your current skills against your target role requirements and generate a prioritised learning plan." phase="4" />;
}
