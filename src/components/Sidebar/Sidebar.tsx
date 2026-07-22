import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

interface NavItem {
  to: string;
  icon: string;
  label: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/",              icon: "⬡",  label: "Dashboard" },
  { to: "/concept-rules", icon: "⚙",  label: "Concept Rules" },
  { to: "/value-sets",    icon: "📋", label: "Value Sets", badge: "11" },
  { to: "/records",       icon: "💊", label: "Records" },
];

const BOTTOM_ITEMS: NavItem[] = [
  { to: "/settings", icon: "⚙", label: "Settings" },
];

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={`flex flex-col bg-slate-900 text-slate-300 transition-all duration-200 shrink-0
        ${collapsed ? "w-14" : "w-56"}`}
      style={{ minHeight: "100vh" }}
    >
      {/* Logo / brand */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-slate-700">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-blue-400 text-lg font-bold leading-none">⬡</span>
            <span className="text-white font-bold text-sm tracking-wide truncate">
              INTEGRATE
            </span>
          </div>
        )}
        {collapsed && <span className="text-blue-400 text-lg font-bold mx-auto">⬡</span>}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="text-slate-500 hover:text-white transition-colors ml-auto shrink-0"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 py-3 space-y-0.5 px-2">
        {!collapsed && (
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest px-2 pb-1">
            Navigation
          </p>
        )}
        {NAV_ITEMS.map((item) => (
          <SidebarLink key={item.to} item={item} collapsed={collapsed} currentPath={location.pathname} />
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="border-t border-slate-700 py-3 px-2 space-y-0.5">
        {BOTTOM_ITEMS.map((item) => (
          <SidebarLink key={item.to} item={item} collapsed={collapsed} currentPath={location.pathname} />
        ))}
        {/* User chip */}
        <div className={`flex items-center gap-2.5 mt-2 px-2 py-2 rounded-lg
          ${collapsed ? "justify-center" : ""}`}>
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center
                          text-white text-xs font-bold shrink-0">
            JS
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">J. Smith</p>
              <p className="text-xs text-slate-500 truncate">jsmith150</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

interface SidebarLinkProps {
  item: NavItem;
  collapsed: boolean;
  currentPath: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ item, collapsed }) => {
  const isExact = item.to === "/";

  return (
    <NavLink
      to={item.to}
      end={isExact}
      className={({ isActive }) =>
        `flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-colors group
         ${isActive
           ? "bg-blue-700 text-white"
           : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"}`
      }
      title={collapsed ? item.label : undefined}
    >
      <span className="text-base leading-none shrink-0">{item.icon}</span>
      {!collapsed && (
        <>
          <span className="truncate">{item.label}</span>
          {item.badge && (
            <span className="ml-auto bg-slate-700 text-slate-300 text-xs px-1.5 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
};
