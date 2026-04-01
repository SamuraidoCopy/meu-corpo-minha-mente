import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { ValidationHub } from "@/components/validation-hub";
import { Suspense } from "react";

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

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    let isAdmin = false
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
        isAdmin = profile?.role === 'admin'
    }

    return (
        <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
            <body className="antialiased mesh-gradient min-h-screen relative">
                {children}
                <Suspense fallback={null}>
                    <ValidationHub isAdmin={isAdmin} />
                </Suspense>
            </body>
        </html>
    );
}
