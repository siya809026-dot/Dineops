import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import Landing from "../pages/Landing";
import Login from "../pages/Auth/Login";
import LoginPortal from "../pages/LoginPortal";
import GetStarted from "../pages/GetStarted";
import Pricing from "../pages/Pricing";
import About from "../pages/About";
import AIpowered from "../pages/AIpowered";

import DashboardLayout from "../layouts/DashboardLayout";

import OwnerDashboard from "../pages/Dashboard/OwnerDashboard";
import BranchesPage from "../pages/Dashboard/BranchesPage";
import InventoryPage from "../pages/Dashboard/InventoryPage";
import SupplyRequestsPage from "../pages/Dashboard/SupplyRequestsPage";
import PosPage from "../pages/Dashboard/PosPage";
import RecipesPage from "../pages/Dashboard/RecipesPage";
import WastagePage from "../pages/Dashboard/WastagePage";
import SalesHistoryPage from "../pages/Dashboard/SalesHistoryPage";
import DemandForecasting from "../pages/Dashboard/DemandForecasting";

const allowedRoles = [
  "OWNER",
  "BRANCH_MANAGER",
  "FRANCHISE_MANAGER",
  "STAFF",
];

function getCurrentUser() {
  try {
    return JSON.parse(
      sessionStorage.getItem("dineops_user") || "null"
    );
  } catch {
    return null;
  }
}

function getRoleHome(role) {
  const roleHome = {
    OWNER: "/dashboard/overview",
    BRANCH_MANAGER: "/dashboard/inventory",
    FRANCHISE_MANAGER: "/dashboard/inventory",
    STAFF: "/dashboard/pos",
  };

  return roleHome[role] || "/login-portal";
}

function ProtectedRoute() {
  const token = sessionStorage.getItem("dineops_token");
  const user = getCurrentUser();

  const isAuthenticated =
    Boolean(token) &&
    Boolean(user) &&
    allowedRoles.includes(user.role);

  if (!isAuthenticated) {
    sessionStorage.removeItem("dineops_token");
    sessionStorage.removeItem("dineops_user");

    return <Navigate to="/login-portal" replace />;
  }

  return <Outlet />;
}

function RoleHomeRedirect() {
  const user = getCurrentUser();

  return (
    <Navigate
      to={getRoleHome(user?.role)}
      replace
    />
  );
}

function RequireRole({ roles, children }) {
  const user = getCurrentUser();

  if (!user || !roles.includes(user.role)) {
    return (
      <Navigate
        to={getRoleHome(user?.role)}
        replace
      />
    );
  }

  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/ai-powered" element={<AIpowered />} />
        <Route path="/get-started" element={<GetStarted />} />
        <Route path="/login-portal" element={<LoginPortal />} />

        {/* Login Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/login/:portal" element={<Login />} />

        {/* Protected Dashboard */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={<DashboardLayout />}
          >
            <Route
              index
              element={<RoleHomeRedirect />}
            />

            {/* Owner Dashboard */}
            <Route
              path="overview"
              element={
                <RequireRole roles={["OWNER"]}>
                  <OwnerDashboard />
                </RequireRole>
              }
            />

            {/* Branches */}
            <Route
              path="branches"
              element={
                <RequireRole roles={["OWNER"]}>
                  <BranchesPage />
                </RequireRole>
              }
            />

            {/* Inventory */}
            <Route
              path="inventory"
              element={
                <RequireRole
                  roles={[
                    "OWNER",
                    "BRANCH_MANAGER",
                    "FRANCHISE_MANAGER",
                  ]}
                >
                  <InventoryPage />
                </RequireRole>
              }
            />

            {/* Forecast */}
            <Route
              path="forecast"
              element={
                <RequireRole roles={["OWNER", "BRANCH_MANAGER"]}>
                  <DemandForecasting />
                </RequireRole>
              }
            />

            {/* Recipes */}
            <Route
              path="recipes"
              element={
                <RequireRole roles={["OWNER", "BRANCH_MANAGER"]}>
                  <RecipesPage />
                </RequireRole>
              }
            />

            {/* Wastage */}
            <Route
              path="wastage"
              element={
                <RequireRole roles={["OWNER", "BRANCH_MANAGER"]}>
                  <WastagePage />
                </RequireRole>
              }
            />

            {/* Sales History */}
            <Route
              path="sales-history"
              element={
                <RequireRole
                  roles={[
                    "OWNER",
                    "BRANCH_MANAGER",
                    "FRANCHISE_MANAGER",
                    "STAFF",
                  ]}
                >
                  <SalesHistoryPage />
                </RequireRole>
              }
            />

            {/* Supply Requests */}
            <Route
              path="requests"
              element={
                <RequireRole
                  roles={[
                    "OWNER",
                    "BRANCH_MANAGER",
                    "FRANCHISE_MANAGER",
                  ]}
                >
                  <SupplyRequestsPage />
                </RequireRole>
              }
            />

            {/* POS */}
            <Route
              path="pos"
              element={
                <RequireRole
                  roles={[
                    "OWNER",
                    "BRANCH_MANAGER",
                    "FRANCHISE_MANAGER",
                    "STAFF",
                  ]}
                >
                  <PosPage />
                </RequireRole>
              }
            />
          </Route>
        </Route>

        {/* Unknown Routes */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}