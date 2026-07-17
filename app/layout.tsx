import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Awaretrepreneur Tribe | Business Support That Goes Deeper",
  description:
    "The global business network combining deep human support, intelligent opportunity matching and practical peer mentoring.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/at-logo.png",
    shortcut: "/at-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Cormorant+Garamond:wght@500;600&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
