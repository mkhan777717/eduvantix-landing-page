"use client";
import { Briefcase } from "lucide-react";
import { ProEmptyState } from "@/components/pro/ProDashboardCard";
export default function JobsPage() {
  return <ProEmptyState icon={Briefcase} title="Job Matches" description="AI-curated job opportunities matched to your skills, experience level, target role, and location preferences." phase="7" />;
}
