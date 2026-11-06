import { getCurrentUser } from "@/server-actions/getCurrentUser";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  } else {
    redirect("/chat");
  }
}
