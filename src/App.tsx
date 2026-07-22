import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/Layout/AppLayout";
import { DashboardPage } from "./pages/DashboardPage/DashboardPage";
import { ConceptRulesPage } from "./pages/ConceptRulesPage/ConceptRulesPage";
import { ValueSetsPage } from "./pages/ValueSetsPage/ValueSetsPage";
import { RecordsPage } from "./pages/RecordsPage/RecordsPage";
import { RecordDetailPage } from "./pages/RecordDetailPage/RecordDetailPage";
import "./index.css";

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/"              element={<DashboardPage />} />
        <Route path="/concept-rules" element={<ConceptRulesPage />} />
        <Route path="/value-sets"    element={<ValueSetsPage />} />
        <Route path="/records"       element={<RecordsPage />} />
        <Route path="/records/:id"   element={<RecordDetailPage />} />
        <Route path="/settings"      element={<SettingsPlaceholder />} />
        <Route path="*"              element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

const SettingsPlaceholder: React.FC = () => (
  <div className="flex flex-col min-h-screen">
    <header className="bg-blue-800 text-white px-6 py-4 shadow-md">
      <p className="text-xs text-blue-300 uppercase tracking-widest font-semibold">Conceptual UI</p>
      <h1 className="text-lg font-bold mt-0.5">Settings</h1>
    </header>
    <main className="flex-1 flex items-center justify-center text-slate-400 text-sm">
      Settings page — coming soon
    </main>
  </div>
);

export default App;
