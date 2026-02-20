import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hofzeit - Zeiterfassung Bauhof",
  description: "Webbasierte Zeiterfassung für kommunale Bauhöfe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
