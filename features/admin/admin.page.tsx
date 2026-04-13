import DashboardSidebar from "@/components/common/dashboard_sidebar";
import { Sidebar } from "lucide-react";
import { AdminNavbar } from "./components/admin.navbar";

export function AdminDashboard() {
  return (
    <section>
      <DashboardSidebar />
      <AdminNavbar />
    </section>
  )
}