import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stock Panel",
  description: "Profesyonel stok takip sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}