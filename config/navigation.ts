import { 
  LayoutDashboard, 
  Settings, 
  ClipboardCheck, 
  Wrench, 
  BarChart3, 
  FileText, 
  History 
} from "lucide-react";

export const sidebarMenus = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Machines", path: "/machines", icon: Settings },
  { title: "Inspections", path: "/inspections", icon: ClipboardCheck },
  { title: "Maintenance", path: "/maintenance", icon: Wrench },
  { title: "Analytics", path: "/analytics", icon: BarChart3 },
  { title: "Reports", path: "/reports", icon: FileText },
  { title: "Activity Log", path: "/activity-log", icon: History },
];