import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import StoreHydrator from "@/components/StoreHydrator";

// Lato is the whole type system, per the design system: UI, body, and headings
// (matched to newsunrising.org). Headings are Lato 700 - the condensed Oswald
// substitute was retired for readability. next/font self-hosts it and exposes it
// as a CSS variable, which globals.css maps onto `font-ui` / `font-display`.
const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
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
      className={`${lato.variable} h-full`}
    >
      <body className="flex min-h-screen flex-col bg-canvas font-ui text-ink antialiased">
        <StoreHydrator />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
