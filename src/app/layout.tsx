import type { Metadata } from "next";
import { GoogleTagManager } from '@next/third-parties/google'
import Script from "next/script";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ValidationHub } from "@/components/validation-hub";
import { Suspense } from "react";

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

    return (
        <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
            <GoogleTagManager gtmId="GTM-TLJFCS46" />
            <body className="antialiased mesh-gradient min-h-screen relative">
                {/* Meta Pixel Code */}
                <Script id="facebook-pixel" strategy="afterInteractive">
                    {`
                    !function(f,b,e,v,n,t,s)
                    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                    n.queue=[];t=b.createElement(e);t.async=!0;
                    t.src=v;s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)}(window, document,'script',
                    'https://connect.facebook.net/en_US/fbevents.js');
                    fbq('init', '26603597735987202');
                    fbq('track', 'PageView');
                    `}
                </Script>
                <noscript>
                    <img 
                        height="1" 
                        width="1" 
                        style={{ display: 'none' }}
                        src="https://www.facebook.com/tr?id=26603597735987202&ev=PageView&noscript=1"
                        alt=""
                    />
                </noscript>
                {/* End Meta Pixel Code */}

                {children}
                <Suspense fallback={null}>
                    <ValidationHub />
                </Suspense>
            </body>
        </html>
    );
}
