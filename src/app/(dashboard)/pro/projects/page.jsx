"use client";
import { FolderCode } from "lucide-react";
import { ProEmptyState } from "@/components/pro/ProDashboardCard";
export default function ProjectsPage() {
  return <ProEmptyState icon={FolderCode} title="Project Recommendations" description="Get AI-curated project ideas tailored to your target role and skill gaps. Build a portfolio that stands out to recruiters." phase="5" />;
}
