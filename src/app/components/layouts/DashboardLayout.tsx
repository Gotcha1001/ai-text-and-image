"use client";
import { useSidebarStore } from "@/store/useSidebarStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded } = useSidebarStore();
  return (
    <main
      className={`transition-all duration-300 ${isExpanded ? "md:ml-72" : "md:ml-20"}`}
    >
      {children}
    </main>
  );
}
