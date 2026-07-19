import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import StoreHydrator from "@/components/meta/StoreHydrator";
import AppHeader from "@/components/AppHeader";
import NavTracker from "@/components/meta/NavTracker";
import OnboardingGate from "@/components/meta/OnboardingGate";
import CouplingModals from "@/components/CouplingModals";
import ToastHost from "@/components/ToastHost";

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

/**
 * The document shell and the persistent app chrome around every route.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lato.variable} h-full`}>
      <body className="flex min-h-screen flex-col bg-canvas font-ui text-ink antialiased">
        {/* Triggers store rehydration, and must stay outside OnboardingGate:
            the gate renders nothing until hydration finishes, so nesting this
            inside it would leave it waiting on the very thing it starts. */}
        <StoreHydrator />
        <a
          href="#nc-main"
          className="absolute -top-15 left-3 z-50 rounded-b-lg bg-ink px-4 py-3 text-sm font-semibold text-white no-underline transition-all duration-150 ease-in-out focus:top-0"
        >
          Skip to main content
        </a>
        <AppHeader />
        <NavTracker />
        <main id="nc-main" className="flex-1 px-4 pb-8 sm:px-8">
          <OnboardingGate>{children}</OnboardingGate>
        </main>
        {/* Toasts render last so they paint above the coupling modals:
            Tailwind's baseline z-scale tops out at z-50, so both land on the
            same layer and paint order decides. */}
        <CouplingModals />
        <ToastHost />
      </body>
    </html>
  );
}
