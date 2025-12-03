import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shared Expenses Dashboard",
  description: "Minimal expense sharing dashboard for close friends"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-background">
      <body className="min-h-screen bg-background text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
