import { useState } from "react";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Products } from "./pages/Products";
import { Offers } from "./pages/Offers";
import { Contact } from "./pages/Contact";
import { Sidebar } from "./components/Sidebar";
import "./App.css";

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem("admin_key") || "");
  const [authed, setAuthed] = useState(!!localStorage.getItem("admin_key"));
  const [page, setPage] = useState("dashboard");

  const handleLogin = (key) => {
    localStorage.setItem("admin_key", key);
    setApiKey(key);
    setAuthed(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_key");
    setApiKey("");
    setAuthed(false);
  };

  if (!authed) return <Login onLogin={handleLogin} />;

  const pages = { dashboard: Dashboard, products: Products, offers: Offers, contact: Contact };
  const PageComponent = pages[page] || Dashboard;

  return (
    <div className="admin-layout">
      <Sidebar page={page} setPage={setPage} onLogout={handleLogout} />
      <main className="admin-main">
        <PageComponent apiKey={apiKey} />
      </main>
    </div>
  );
}
