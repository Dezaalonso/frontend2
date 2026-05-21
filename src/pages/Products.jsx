import { useEffect, useState, useRef } from "react";
import { apiFetch, API } from "../components/api";

const ALL_GROUPS = [
  "Drinks", "Snacks", "Chocolates", "Galletas", "Golosinas",
  "Alcohol", "Limpieza", "Pilas", "Salsas", "Conservas", "Colageno",
  "Nuevos", "Destacados", "Ofertas", "Other"
];

export function Products({ apiKey }) {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("all");
  const [filterImg, setFilterImg] = useState("all");

  const [uploadModal, setUploadModal] = useState(null); // product name
  const [groupModal, setGroupModal] = useState(null);   // product
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg, type = "success") => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const load = () => {
    setLoading(true);
    apiFetch("/admin/products", apiKey)
      .then((data) => { setProducts(data); setFiltered(data); })
      .catch(() => showToast("Error cargando productos", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [apiKey]);

  useEffect(() => {
    let list = [...products];
    if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (filterGroup !== "all") list = list.filter((p) => (p.custom_group || p.category) === filterGroup);
    if (filterImg === "missing") list = list.filter((p) => !p.image || p.is_placeholder);
    if (filterImg === "manual") list = list.filter((p) => p.is_manual);
    if (filterImg === "auto") list = list.filter((p) => p.image && !p.is_placeholder && !p.is_manual);
    setFiltered(list);
  }, [search, filterGroup, filterImg, products]);

  const handleResetGroup = async (name) => {
    try {
      await apiFetch(`/admin/products/${encodeURIComponent(name)}/group`, apiKey, { method: "DELETE" });
      showToast("Grupo reseteado");
      load();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const groups = [...new Set(products.map((p) => p.custom_group || p.category))].sort();

  return (
    <div>
      <div className="page-header">
        <h2>Productos</h2>
        <p>Gestiona imágenes y grupos de cada producto</p>
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}>
            <option value="all">Todos los grupos</option>
            {groups.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>

          <select value={filterImg} onChange={(e) => setFilterImg(e.target.value)}>
            <option value="all">Todas las imágenes</option>
            <option value="missing">Sin imagen</option>
            <option value="manual">Manuales</option>
            <option value="auto">Automáticas</option>
          </select>

          <span style={{ color: "var(--gray-400)", fontSize: 12, whiteSpace: "nowrap" }}>
            {filtered.length} productos
          </span>
        </div>

        {loading ? (
          <p style={{ color: "var(--gray-400)", padding: 24 }}>Cargando...</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Grupo</th>
                  <th>Estado img.</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.name}>
                    <td>
                      <img
                        className="product-thumb"
                        src={p.image || "https://placehold.co/44"}
                        alt=""
                        onError={(e) => { e.target.src = "https://placehold.co/44"; }}
                      />
                    </td>
                    <td>
                      <span className="truncate" title={p.name}>{p.name}</span>
                    </td>
                    <td>S/ {Number(p.price).toFixed(2)}</td>
                    <td>{p.stock}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span className="badge badge-gray">{p.custom_group || p.category}</span>
                        {p.custom_group && (
                          <button
                            className="btn btn-ghost btn-sm"
                            title="Resetear grupo"
                            onClick={() => handleResetGroup(p.name)}
                            style={{ padding: "2px 6px", fontSize: 11 }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      {p.is_manual ? (
                        <span className="badge badge-blue">Manual</span>
                      ) : p.is_placeholder || !p.image ? (
                        <span className="badge badge-red">Sin imagen</span>
                      ) : (
                        <span className="badge badge-green">Auto</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setUploadModal(p.name)}
                        >
                          📷 Imagen
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setGroupModal(p)}
                        >
                          📁 Grupo
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="empty-state">
                <p>No se encontraron productos</p>
              </div>
            )}
          </div>
        )}
      </div>

      {uploadModal && (
        <UploadImageModal
          productName={uploadModal}
          apiKey={apiKey}
          onClose={() => setUploadModal(null)}
          onSuccess={() => { showToast("Imagen guardada"); load(); setUploadModal(null); }}
          onError={(msg) => showToast(msg, "error")}
        />
      )}

      {groupModal && (
        <SetGroupModal
          product={groupModal}
          apiKey={apiKey}
          groups={ALL_GROUPS}
          onClose={() => setGroupModal(null)}
          onSuccess={() => { showToast("Grupo actualizado"); load(); setGroupModal(null); }}
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

// ── Upload Image Modal ──────────────────────────────────────────

function UploadImageModal({ productName, apiKey, onClose, onSuccess, onError }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(
  `${API}/admin/upload-image?name=${encodeURIComponent(productName)}`,
  { method: "POST", headers: { "x-api-key": apiKey }, body: formData }
);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Error al subir");
      }
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
          <h3>Cambiar imagen</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 12, color: "var(--gray-500)", marginBottom: 14 }}>
            <strong style={{ color: "var(--gray-700)" }}>{productName}</strong>
          </p>

          {preview ? (
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <img
                src={preview}
                alt="preview"
                style={{ maxHeight: 180, maxWidth: "100%", borderRadius: 8, objectFit: "contain", border: "1px solid var(--gray-200)" }}
              />
              <br />
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => { setFile(null); setPreview(null); }}>
                Cambiar archivo
              </button>
            </div>
          ) : (
            <div
              className={`upload-zone ${dragging ? "drag-over" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <div style={{ fontSize: 32 }}>🖼️</div>
              <p><strong>Haz clic</strong> o arrastra una imagen aquí</p>
              <p style={{ fontSize: 11, marginTop: 4 }}>JPG, PNG, WEBP — máx. 2MB</p>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleUpload} disabled={!file || loading}>
            {loading ? "Subiendo..." : "Guardar imagen"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Set Group Modal ─────────────────────────────────────────────

function SetGroupModal({ product, apiKey, groups, onClose, onSuccess, onError }) {
  const [group, setGroup] = useState(product.custom_group || product.category);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);

  const finalGroup = custom.trim() || group;

  const handleSave = async () => {
    if (!finalGroup) return;
    setLoading(true);
    try {
      await apiFetch(
        `/admin/products/${encodeURIComponent(product.name)}/group`,
        apiKey,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ group: finalGroup }) }
      );
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
          <h3>Mover a grupo</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 12, color: "var(--gray-500)", marginBottom: 14 }}>
            <strong style={{ color: "var(--gray-700)" }}>{product.name}</strong>
          </p>

          <div className="form-group">
            <label>Grupo existente</label>
            <select value={group} onChange={(e) => setGroup(e.target.value)}>
              {groups.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div style={{ textAlign: "center", color: "var(--gray-300)", margin: "8px 0", fontSize: 12 }}>— o crea uno nuevo —</div>

          <div className="form-group">
            <label>Nombre del nuevo grupo</label>
            <input
              placeholder="Ej: Nuevos, Importados, Temporada..."
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
            />
          </div>

          {finalGroup && (
            <p style={{ fontSize: 12, color: "var(--gray-500)" }}>
              Se moverá a: <strong style={{ color: "var(--red)" }}>{finalGroup}</strong>
            </p>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar grupo"}
          </button>
        </div>
      </div>
    </div>
  );
}
