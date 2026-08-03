import { redirect } from "next/navigation";

export default function SettingsRedirect() {
  redirect("/settings/ai-providers");
}
