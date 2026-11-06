import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AI Image & Text Generator",
  description: "AI Image & Text Generator",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${poppins.className} antialiased`}>
      <body className="min-h-full flex flex-col bg-linear-to-b from-[#242124] to-[#000000] text-text">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
