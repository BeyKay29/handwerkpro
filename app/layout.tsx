import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HandwerkPro | Professionelle Handwerkssoftware",
  description:
    "Die moderne SaaS-Lösung für Handwerksbetriebe. Angebote, Rechnungen, Projekte und Zeiterfassung in einer Anwendung.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="dark">
      <body className={`${inter.variable} ${outfit.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
