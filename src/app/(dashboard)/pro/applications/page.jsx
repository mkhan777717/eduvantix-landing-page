"use client";
import { ClipboardList } from "lucide-react";
import { ProEmptyState } from "@/components/pro/ProDashboardCard";
export default function ApplicationsPage() {
  return <ProEmptyState icon={ClipboardList} title="Application Tracking" description="Track all your job applications in one place. Monitor status, set reminders, and get AI-powered follow-up suggestions." phase="7" />;
}
