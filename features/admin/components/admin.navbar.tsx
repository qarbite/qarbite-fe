import { SearchBar } from "@/components/common/search_bar";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export function AdminNavbar() {
  return (
    <nav className="py-4 px-6 flex items-center justify-between border-b border-gray-200">
      <SearchBar />
      <div className="flex">
        <Image src="/notification.svg" alt="notification" width={20} height={20} className="ml-4" style={{ filter: "grayscale(100%) brightness(0)" }} />
        <Image src="/profile.png" alt="profile" width={32} height={32} className="ml-4 rounded-full" />
      </div>
    </nav>
  )
}