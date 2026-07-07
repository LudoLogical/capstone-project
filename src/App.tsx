import { useStore } from "./state/store";
import { TopNav } from "./components/TopNav";
import { Modals } from "./components/Modals";
import { Onboarding } from "./pages/Onboarding";
import { Dashboard } from "./pages/Dashboard";
import { Explore } from "./pages/Explore";
import { GrantDetail } from "./pages/GrantDetail";
import { Track } from "./pages/Track";
import { Flow } from "./pages/Flow";
import { Brief } from "./pages/Brief";
import { Profile } from "./pages/Profile";
import { Collab } from "./pages/Collab";
import { OrgProfile } from "./pages/OrgProfile";
import { ReportSelect } from "./pages/ReportSelect";

export default function App() {
  const { page } = useStore();

  if (page === "onboarding") {
    return (
      <>
        <Onboarding />
        <Modals />
      </>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <TopNav />
      <div style={{ flex: 1 }}>
        {page === "dashboard" && <Dashboard />}
        {page === "explore" && <Explore />}
        {page === "grantDetail" && <GrantDetail />}
        {page === "track" && <Track />}
        {(page === "flow" || page === "collect") && <Flow />}
        {page === "brief" && <Brief />}
        {page === "profile" && <Profile />}
        {page === "collab" && <Collab />}
        {page === "orgProfile" && <OrgProfile />}
        {page === "reportSelect" && <ReportSelect />}
      </div>
      <Modals />
    </div>
  );
}
