import Image from "next/image";
import { Input } from "../ui/input";

export function SearchBar() {
  return (
    <div className="flex gap-2 bg-white rounded-full px-4 items-center border border-gray-300 shadow-sm w-[30%] focus-within:ring-2 focus-within:ring-gray-500/50 transition-all duration-200">
      <Image src="/search.svg" alt="search" width={20} height={20} />
      <Input type="text" placeholder="Search machines, sensors, or alerts..." className="border-none shadow-none focus-visible:ring-0" />
    </div>
  )
}