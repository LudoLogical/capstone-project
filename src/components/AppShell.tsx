import type { ReactNode } from "react";
import AppHeader from "./AppHeader";
import PrivacyModal from "./PrivacyModal";
import CouplingModals from "./CouplingModals";
import ToastHost from "./ToastHost";

/**
 * The persistent chrome that used to live in App.tsx, around <Routes/>.
 *
 * Note the order: PrivacyModal renders *before* ToastHost. In the original CSS
 * the modal sat at z-index 100 and toasts at 200, but Tailwind's baseline scale
 * tops out at z-50, so both land on the same layer and paint order decides.
 * Rendering toasts last preserves toasts-above-modals.
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
      <main id="nc-main" className="flex-1">
        {children}
      </main>
      <PrivacyModal />
      <CouplingModals />
      <ToastHost />
    </>
  );
}
