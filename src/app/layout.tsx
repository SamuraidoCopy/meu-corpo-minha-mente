import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

export const dynamic = 'force-dynamic'

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
});

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
        <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
            {/* mesh-gradient is applied here globally, might want to remove it for pages that have their own background or specific styling */}
            <body className="antialiased mesh-gradient min-h-screen">
                {children}
            </body>
        </html>
    );
}
