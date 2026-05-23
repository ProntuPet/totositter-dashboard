import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TotoSitter — visão geral",
  description: "Dashboard do dispositivo TotoSitter",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-bg font-sans text-ink">{children}</body>
    </html>
  );
}
