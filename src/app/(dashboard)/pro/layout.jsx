import { redirect } from "next/navigation";

export const metadata = {
  title: "Career Dashboard",
  robots: { index: false, follow: false },
};

// All /pro/* routes live under the existing (dashboard) route group
// which already provides DashboardLayout. No extra layout wrapper needed.
export default function ProLayout({ children }) {
  return <>{children}</>;
}
