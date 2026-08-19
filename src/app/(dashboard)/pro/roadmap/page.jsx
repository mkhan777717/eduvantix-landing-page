"use client";
import { Map } from "lucide-react";
import { ProEmptyState } from "@/components/pro/ProDashboardCard";
export default function RoadmapPage() {
  return <ProEmptyState icon={Map} title="Personalized Roadmap" description="Your AI-generated career roadmap will appear here after your career analysis is complete. It will include milestones, resources, and timelines." phase="5" />;
}
