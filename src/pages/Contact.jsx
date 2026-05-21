import { useEffect, useState } from "react";
import { apiFetch } from "../components/api";

const FIELDS = [
  { key: "phone", label: "Teléfono", placeholder: "+51 999 999 999", icon: "📞" },
  { key: "whatsapp", label: "WhatsApp", placeholder: "+51 999 999 999", icon: "💬" },
  { key: "email", label: "Email", placeholder: "contacto@dacom.com", icon: "✉️" },
  { key: "address", label: "Dirección", placeholder: "Av. ejemplo 123, Lima", icon: "📍" },
  { key: "instagram", label: "Instagram", placeholder: "@dacom", icon: "📸" },
  { key: "facebook", label: "Facebook", placeholder: "facebook.com/dacom", icon: "👍" },
  { key: "hours", label: "Horario de atención", placeholder: "Lun-Vie 9am-6pm", icon: "🕐" },
];

export function Contact({ apiKey }) {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg, type = "success") => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    apiFetch("/admin/contact", apiKey)
      .then(setForm)
      .catch(() => showToast("Error cargando contacto", "error"))
      .finally(() => setLoading(false));
  }, [apiKey]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiFetch("/admin/contact", apiKey, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      showToast("Información de contacto guardada");
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Información de contacto</h2>
        <p>Esta información aparece en la página de Contacto y el chat flotante</p>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        {loading ? (
          <p style={{ color: "var(--gray-400)" }}>Cargando...</p>
        ) : (
          <>
            <div className="contact-grid">
              {FIELDS.map((f) => (
                <div className="form-group" key={f.key} style={f.key === "address" || f.key === "hours" ? { gridColumn: "1 / -1" } : {}}>
                  <label>{f.icon} {f.label}</label>
                  <input
                    placeholder={f.placeholder}
                    value={form[f.key] || ""}
                    onChange={(e) => set(f.key, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="divider" />

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Guardando..." : "💾 Guardar cambios"}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="card" style={{ maxWidth: 640, marginTop: 20 }}>
        <h3 style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
          Vista previa
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FIELDS.filter((f) => form[f.key]).map((f) => (
            <div key={f.key} style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 18 }}>{f.icon}</span>
              <div>
                <div style={{ fontSize: 11, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{f.label}</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{form[f.key]}</div>
              </div>
            </div>
          ))}
          {Object.keys(form).filter((k) => form[k]).length === 0 && (
            <p style={{ color: "var(--gray-400)", fontSize: 13 }}>Completa los campos para ver la vista previa</p>
          )}
        </div>
      </div>

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
