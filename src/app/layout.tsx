import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meu Corpo Minha Mente",
  description: "Plataforma de autodiagnóstico e acompanhamento emocional",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
