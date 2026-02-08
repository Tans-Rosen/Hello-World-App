import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Word Cloud",
  description: "Word cloud from captions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
