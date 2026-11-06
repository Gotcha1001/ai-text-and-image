import { getCurrentUser } from "@/server-actions/getCurrentUser";
import DashboardLayout from "../components/layouts/DashboardLayout";
import Sidebar from "../components/sidebar/Sidebar";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }
  return (
    <div>
      <Sidebar />
      <DashboardLayout>{children}</DashboardLayout>
    </div>
  );
}
