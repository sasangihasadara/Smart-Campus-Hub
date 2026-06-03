import { Outlet } from "react-router-dom";
import { ResourceProvider, useResources } from "../../context/ResourceContext";
import DashboardTopbar from "./DashboardTopbar";
import Sidebar from "./Sidebar";

function ResourceModuleFrame() {
  const { error } = useResources();

  return (
    <div className="resource-shell">
      <Sidebar />

      <div className="resource-shell__main">
        <DashboardTopbar />

        {error ? <div className="resource-banner">{error}</div> : null}

        <main className="resource-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function ResourceModuleLayout() {
  return (
    <ResourceProvider>
      <div className="resource-app-shell" style={{ "--site-navbar-height": "0px" }}>
        <ResourceModuleFrame />
      </div>
    </ResourceProvider>
  );
}
