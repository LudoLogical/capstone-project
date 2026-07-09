import { Routes, Route } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import ToastHost from "@/components/ToastHost";
import PrivacyModal from "@/components/PrivacyModal";
import RequireAuth from "@/components/RequireAuth";
import LandingPage from "@/pages/LandingPage";
import StoryDetailPage from "@/pages/StoryDetailPage";
import DashboardPage from "@/pages/DashboardPage";
import AccountProfilePage from "@/pages/AccountProfilePage";
import SearchPage from "@/pages/SearchPage";
import GrantDetailPage from "@/pages/GrantDetailPage";
import FitAnalysisPage from "@/pages/FitAnalysisPage";
import DataCollectionWizardPage from "@/pages/DataCollectionWizardPage";
import CollaboratePage from "@/pages/CollaboratePage";
import OrgProfilePage from "@/pages/OrgProfilePage";
import ReportFlowPage from "@/pages/ReportFlowPage";

export default function App() {
  return (
    <>
      <a href="#nc-main" className="skip-link">
        Skip to main content
      </a>
      <AppHeader />
      <main id="nc-main" style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/stories/:storyId" element={<StoryDetailPage />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardPage />
              </RequireAuth>
            }
          />
          <Route
            path="/account"
            element={
              <RequireAuth>
                <AccountProfilePage />
              </RequireAuth>
            }
          />
          <Route
            path="/search"
            element={
              <RequireAuth>
                <SearchPage />
              </RequireAuth>
            }
          />
          <Route
            path="/grants/:grantId"
            element={
              <RequireAuth>
                <GrantDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="/grants/:grantId/fit"
            element={
              <RequireAuth>
                <FitAnalysisPage />
              </RequireAuth>
            }
          />
          <Route
            path="/grants/:grantId/collect"
            element={
              <RequireAuth>
                <DataCollectionWizardPage />
              </RequireAuth>
            }
          />
          <Route
            path="/grants/:grantId/collaborate"
            element={
              <RequireAuth>
                <CollaboratePage />
              </RequireAuth>
            }
          />
          <Route
            path="/grants/:grantId/collaborate/:orgId"
            element={
              <RequireAuth>
                <OrgProfilePage />
              </RequireAuth>
            }
          />
          <Route
            path="/grants/:grantId/report"
            element={
              <RequireAuth>
                <ReportFlowPage />
              </RequireAuth>
            }
          />
        </Routes>
      </main>
      <ToastHost />
      <PrivacyModal />
    </>
  );
}
