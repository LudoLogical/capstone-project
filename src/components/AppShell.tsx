import type { ReactNode } from "react";
import AppHeader from "./AppHeader";
import NavTracker from "./NavTracker";
import OnboardingGate from "./OnboardingGate";
import CouplingModals from "./CouplingModals";
import ToastHost from "./ToastHost";

/**
 * The persistent chrome that used to live in App.tsx, around <Routes/>.
 *
 * Toasts render last so they paint above the coupling modals: Tailwind's
 * baseline z-scale tops out at z-50, so both land on the same layer and paint
 * order decides.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
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
      <CouplingModals />
      <ToastHost />
    </>
  );
}
