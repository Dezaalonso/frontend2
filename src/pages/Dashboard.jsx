import { useEffect, useState } from "react";
import { apiFetch } from "../components/api";

export function Dashboard({ apiKey }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/admin/status", apiKey)
      .then(setStatus)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [apiKey]);

  const handleRefresh = async () => {
    await apiFetch("/admin/refresh", apiKey, { method: "POST" });
    alert("Cache refresh iniciado");
  };

  const handleResetPlaceholders = async () => {
    if (!confirm("¿Resetear todos los placeholders? El worker los re-buscará.")) return;
    await apiFetch("/admin/reset-placeholders", apiKey, { method: "POST" });
    alert("Placeholders reseteados");
  };

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Resumen del sistema en tiempo real</p>
      </div>

      {loading ? (
        <p style={{ color: "var(--gray-400)" }}>Cargando...</p>
      ) : status ? (
        <>
          <div className="stat-grid">
            <StatCard label="Total productos" value={status.total_products} sub="en el catálogo" />
            <StatCard label="Sin imagen" value={status.missing_images} sub="pendientes" color={status.missing_images > 0 ? "#b91c1c" : "#166534"} />
            <StatCard label="Imágenes manuales" value={status.manual_images} sub="cargadas por admin" />
            <StatCard label="Imágenes auto" value={status.auto_images} sub="buscadas automáticamente" />
            <StatCard label="Ofertas activas" value={status.active_offers} sub="publicadas" />
            <StatCard label="Búsquedas hoy" value={`${status.fetches_today}/${status.daily_fetch_limit}`} sub="límite diario" />
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: 16, fontSize: 15 }}>
              Acciones del sistema
            </h3>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn btn-primary" onClick={handleRefresh}>
                🔄 Refrescar cache
              </button>
              <button className="btn btn-secondary" onClick={handleResetPlaceholders}>
                🔁 Resetear placeholders
              </button>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: 12, fontSize: 15 }}>
              Estado del sistema
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <StatusRow label="Cache cargado" value={status.cache_loaded ? "Sí" : "No"} ok={status.cache_loaded} />
              <StatusRow label="Cargando ahora" value={status.is_loading ? "Sí" : "No"} ok={!status.is_loading} />
              <StatusRow
                label="Edad del cache"
                value={`${Math.round(status.cache_age_seconds / 60)} minutos`}
                ok={status.cache_age_seconds < 3600}
              />
            </div>
          </div>
        </>
      ) : (
        <p style={{ color: "var(--gray-400)" }}>No se pudo cargar el estado</p>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="stat-card" style={color ? { borderLeftColor: color } : {}}>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={color ? { color } : {}}>{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}

function StatusRow({ label, value, ok }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--gray-100)" }}>
      <span style={{ color: "var(--gray-500)", fontSize: 13 }}>{label}</span>
      <span className={`badge ${ok ? "badge-green" : "badge-red"}`}>{value}</span>
    </div>
  );
}
