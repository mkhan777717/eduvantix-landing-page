import { redirect } from "next/navigation";

export default function MyScheduleRedirect() {
  redirect("/admin/live");
}
