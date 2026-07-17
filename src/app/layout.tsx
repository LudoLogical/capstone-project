import type { Metadata } from "next";
import { Lato, Oswald } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import StoreHydrator from "@/components/StoreHydrator";

// The brand faces, per the design system: Lato for UI and body (matched to
// newsunrising.org) and Oswald for display - the semi-condensed face standing in
// for the site's condensed headings. next/font self-hosts both and exposes each
// as a CSS variable, which globals.css maps onto `font-ui` / `font-display`.
const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
      className={`${lato.variable} ${oswald.variable} h-full`}
    >
      <body className="flex min-h-screen flex-col bg-canvas font-ui text-ink antialiased">
        <StoreHydrator />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
