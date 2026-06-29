import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Artech Stok Takip",
  description: "Artech stok takip uygulaması",
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