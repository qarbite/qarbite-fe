import { redirect } from "next/navigation";

export default function RootPage() {
  // const isAuthenticated = true; 

  // if (isAuthenticated) {
    redirect("/dashboard");
  // } else {
  //   redirect("/login");
  // }
}