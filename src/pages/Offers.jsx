import { useEffect, useState } from "react";
import { apiFetch } from "../components/api";

export function Offers({ apiKey }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg, type = "success") => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const load = () => {
    apiFetch("/admin/offers", apiKey)
      .then(setOffers)
      .catch(() => showToast("Error cargando ofertas", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [apiKey]);

  const handleToggle = async (id, active) => {
    try {
      await apiFetch(`/admin/offers/${id}`, apiKey, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      showToast(active ? "Oferta desactivada" : "Oferta activada");
      load();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta oferta?")) return;
    try {
      await apiFetch(`/admin/offers/${id}`, apiKey, { method: "DELETE" });
      showToast("Oferta eliminada");
      load();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Ofertas</h2>
        <p>Crea y gestiona promociones para tu tienda</p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Nueva oferta
        </button>
      </div>

      {loading ? (
        <p style={{ color: "var(--gray-400)" }}>Cargando...</p>
      ) : offers.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p>No hay ofertas creadas. ¡Crea la primera!</p>
          </div>
        </div>
      ) : (
        <div className="offer-grid">
          {offers.map((o) => (
            <div key={o.id} className="offer-card" style={{ borderLeftColor: o.active ? "var(--red)" : "var(--gray-300)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h4>{o.title}</h4>
                <span className={`badge ${o.active ? "badge-green" : "badge-gray"}`}>
                  {o.active ? "Activa" : "Inactiva"}
                </span>
              </div>

              {o.description && <p>{o.description}</p>}

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {o.product_name && (
                  <span className="badge badge-blue">📦 {o.product_name.slice(0, 30)}</span>
                )}
                {o.discount_percent && (
                  <span className="badge badge-red">🏷️ -{o.discount_percent}%</span>
                )}
                {o.expires_at && (
                  <span className="badge badge-yellow">
                    ⏱ Vence: {new Date(o.expires_at).toLocaleDateString("es-PE")}
                  </span>
                )}
              </div>

              <p style={{ fontSize: 11, color: "var(--gray-300)" }}>
                Creada: {new Date(o.created_at).toLocaleDateString("es-PE")}
              </p>

              <div className="offer-actions">
                <button
                  className={`btn btn-sm ${o.active ? "btn-secondary" : "btn-primary"}`}
                  onClick={() => handleToggle(o.id, o.active)}
                >
                  {o.active ? "Desactivar" : "Activar"}
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o.id)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CreateOfferModal
          apiKey={apiKey}
          onClose={() => setShowModal(false)}
          onSuccess={() => { showToast("Oferta creada"); load(); setShowModal(false); }}
          onError={(msg) => showToast(msg, "error")}
        />
      )}

      {toastMsg && (
        <div className="toast-wrap">
          <div className={`toast toast-${toastMsg.type}`}>
            {toastMsg.type === "success" ? "✓" : "✕"} {toastMsg.msg}
          </div>
        </div>
      )}
    </div>
  );
}

function CreateOfferModal({ apiKey, onClose, onSuccess, onError }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    product_name: "",
    discount_percent: "",
    expires_at: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) { onError("El título es obligatorio"); return; }
    setLoading(true);
    try {
      await apiFetch("/admin/offers", apiKey, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          product_name: form.product_name || null,
          discount_percent: form.discount_percent ? Number(form.discount_percent) : null,
          expires_at: form.expires_at || null,
        }),
      });
      onSuccess();
    } catch (e) {
      onError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Nueva oferta</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Título *</label>
            <input placeholder="Ej: 2x1 en galletas" value={form.title} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea placeholder="Detalles de la oferta..." value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Producto específico (opcional)</label>
            <input placeholder="Nombre exacto del producto" value={form.product_name} onChange={(e) => set("product_name", e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label>Descuento %</label>
              <input type="number" min="0" max="100" placeholder="20" value={form.discount_percent} onChange={(e) => set("discount_percent", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Fecha de vencimiento</label>
              <input type="date" value={form.expires_at} onChange={(e) => set("expires_at", e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Crear oferta"}
          </button>
        </div>
      </div>
    </div>
  );
}
