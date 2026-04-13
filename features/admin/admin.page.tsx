import { DashboardSidebar } from "@/components/common/dashboard_sidebar";
import { AdminNavbar } from "./components/admin.navbar";
import { Button } from "@/components/ui/button";

export function AdminDashboard() {
  return (
    <section className="flex">
      <div>
        <DashboardSidebar />
      </div>
      <div className="w-full h-full">
        <AdminNavbar />
        <div className="flex p-8 justify-between">
          <div>
            <h1 className="text-3xl font-bold">Factory Overview</h1>
            <h2 className="text-xl">Real-time analytical layer for North Sector operations.</h2>
          </div>
          <div className="flex flex-row gap-2">
            <Button>Last 24 Hours</Button>
            <Button>Export Data</Button>
          </div>
        </div>
      </div>
    </section>
  )
}