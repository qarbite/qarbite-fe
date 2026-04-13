import Image from "next/image";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarProvider } from "../ui/sidebar";

interface sidebarMenuProps {
  icon: string
  label: string
  link: string
}

const sidebarMenuItems: sidebarMenuProps[] = [
  {
    icon: "/dashboard.svg",
    label: "Dashboard",
    link: "/dashboard"
  },
  {
    icon: "/claw.svg",
    label: "Machines",
    link: "/machines"
  },
  {
    icon: "/inspection.svg",
    label: "Inspections",
    link: "/inspections"
  },
  {
    icon: "/maintenance.svg",
    label: "Maintenance",
    link: "/maintenance"
  },
  {
    icon: "/analytics.svg",
    label: "Analytics",
    link: "/analytics"
  }, 
  {
    icon: "/report.svg",
    label: "Reports",
    link: "/reports"
  },
  {
    icon: "/history.svg",
    label: "Activity Log", 
    link: "/activity-log"
  }
]

export default function DashboardSidebar() {
  return (
    <SidebarProvider>
      <Sidebar className="px-4">
        <SidebarHeader className="pb-10">
          <div className="py-1">
            <h1 className="text-xl font-bold">QARBITE</h1>
            <h2 className="font-semibold">INDUSTRIAL PRECISION</h2>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2">
          <SidebarMenu className="flex">
            {sidebarMenuItems.map((item, index) => (
              <a key={index} href={item.link} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-200 font-medium">
                <Image src={item.icon} alt={`${item.label} icon`} width={20} height={20} style={{ filter: "grayscale(100%) brightness(0)" }} />
                {item.label}
              </a>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <a href="/settings.svg" className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-200 font-medium">
              <Image src="/settings.svg" alt="Settings icon" width={20} height={20} style={{ filter: "grayscale(100%) brightness(0)" }} />
              Settings
            </a>
          </SidebarMenu>
          <SidebarMenu>
            <a href="/support.svg" className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-200 font-medium">
              <Image src="/help.svg" alt="Support icon" width={20} height={20} style={{ filter: "grayscale(100%) brightness(0)" }} />
              Support
            </a>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}