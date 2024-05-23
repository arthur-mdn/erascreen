import {Inter} from "next/font/google";
import "./globals.css";
import type, { Viewport } from 'next'

const inter = Inter({subsets: ["latin"]});

export const metadata = {
    title: "DisplayHub",
    description: "DisplayHub, une solution de gestion d'affichage dynamique."
};
export const viewport = {
    initialScale: 1,
    width: 'device-width',
    maximumScale: 1
}

export default function RootLayout({children}) {
    return (
        <html lang="fr">
        <body className={inter.className}>{children}</body>
        </html>
    );
}
