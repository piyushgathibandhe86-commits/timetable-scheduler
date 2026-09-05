import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Timetable Scheduler",
  description: "Conflict-free weekly timetable generator for colleges",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
