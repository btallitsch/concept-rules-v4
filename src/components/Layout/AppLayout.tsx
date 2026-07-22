import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../Sidebar/Sidebar";

export const AppLayout: React.FC = () => (
  <div className="flex min-h-screen bg-slate-100 font-sans">
    <Sidebar />
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <Outlet />
    </div>
  </div>
);
