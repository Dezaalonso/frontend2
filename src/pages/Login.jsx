import { useState } from "react";
import { API } from "../components/api";

export function Login({ onLogin }) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!key.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/admin/status`, {
        headers: { "x-api-key": key },
      });
      if (res.ok) {
        onLogin(key);
      } else {
        setError("Clave incorrecta. Inténtalo de nuevo.");
      }
    } catch {
      setError("No se pudo conectar al servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Panel Admin</h1>
        <p>Ingresa tu clave de acceso para continuar</p>

        <div className="form-group">
          <label>Clave de acceso</label>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="••••••••••"
            autoFocus
          />
        </div>

        {error && (
          <p style={{ color: "#b91c1c", fontSize: 13, marginBottom: 12 }}>
            {error}
          </p>
        )}

        <button
          className="btn btn-primary"
          style={{ width: "100%", justifyContent: "center", padding: "11px" }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Verificando..." : "Ingresar"}
        </button>
      </div>
    </div>
  );
}
