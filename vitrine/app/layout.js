import {Inter} from "next/font/google";
import "./globals.css";
import Head from 'next/head';

const inter = Inter({subsets: ["latin"]});

export const metadata = {
    title: "DisplayHub",
    description: "DisplayHub, une solution de gestion d'affichage dynamique."
};

export default function RootLayout({children}) {
    return (
        <html lang="fr">
        <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </Head>
        <body className={inter.className}>{children}</body>
        </html>
    );
}
