import type { Metadata } from "next";
import { Hanken_Grotesk, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import StoreHydrator from "@/components/StoreHydrator";

// tokens.css named both of these fonts but nothing ever loaded them, so the
// Vite app silently fell back to the system sans/serif. next/font self-hosts
// them and exposes each as a CSS variable, which globals.css maps onto the
// `font-ui` / `font-serif` utilities.
const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vibrancy Portal App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hankenGrotesk.variable} ${sourceSerif.variable} h-full`}
    >
      <body className="flex min-h-screen flex-col bg-canvas font-ui text-ink antialiased">
        <StoreHydrator />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
