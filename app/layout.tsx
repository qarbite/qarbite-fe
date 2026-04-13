import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const manropeHeading = Manrope({
  subsets:['latin'],
  variable:'--font-heading'
});

const inter = Inter({
  subsets:['latin'],
  variable:'--font-sans'
});

export const metadata: Metadata = {
  title: "Qarbite - Industrial Precision",
  description: "Quality Assurance and Reliability-Based Inspection Tracking Engine for Industrial Machinery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", inter.variable, manropeHeading.variable)}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
