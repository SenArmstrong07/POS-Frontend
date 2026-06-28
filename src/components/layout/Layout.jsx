import { useState } from "react";
import { COLORS } from "../../constants/colors";
import { GridIcon, CartIcon, BoxIcon, ReceiptIcon, ReportIcon, UsersIcon } from "../icons/Icons";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ user, onLogout, children, activeTab, setActiveTab }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  const allNavItems = [
    { id: "dashboard", label: "Dashboard", icon: <GridIcon />, adminOnly: false },
    { id: "pos", label: "Point of Sale", icon: <CartIcon />, adminOnly: false },
    { id: "inventory", label: "Inventory", icon: <BoxIcon />, adminOnly: false },
    { id: "sales", label: "Sales History", icon: <ReceiptIcon />, adminOnly: false },
    // Admin only — every Reports endpoint (DashboardReport, SalesSummaryReport,
    // TopProductsReport, InventoryStatusReport, StockInHistoryReport,
    // ProfitEstimateReport, InventoryTurnoverReport, ReorderPointReport) uses
    // permission_classes = [IsAdmin] on the backend. A Cashier could see this
    // tab before but got a 403 the moment they opened it.
    { id: "reports", label: "Reports", icon: <ReportIcon />, adminOnly: true },
    // Admin only — UserViewSet/ActivityLogViewSet both require IsAdmin too.
    { id: "users", label: "User Management", icon: <UsersIcon />, adminOnly: true },
  ];

  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);

  const handleNavigate = (id) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  const currentLabel = navItems.find((n) => n.id === activeTab)?.label;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: COLORS.bg,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <Sidebar
        navItems={navItems}
        activeTab={activeTab}
        onNavigate={handleNavigate}
        user={user}
        onLogout={onLogout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div
        className="main-content"
        style={{ flex: 1, marginLeft: 0, display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Topbar title={currentLabel} user={user} onMenuClick={() => setSidebarOpen(true)} />

        <main style={{ flex: 1, padding: "1.5rem", overflow: "auto" }}>{children}</main>
      </div>

      <style>{`
        @media(min-width:768px){
          .sidebar{left:0!important;}
          .main-content{margin-left:240px!important;}
          .menu-btn{display:none!important;}
        }
        @media(max-width:767px){
          .menu-btn{display:flex!important;}
        }
      `}</style>
    </div>
  );
}