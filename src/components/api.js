export const API = "https://dacomstore.com/api";

export async function apiFetch(path, apiKey, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "x-api-key": apiKey,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Error en el servidor");
  }
  return res.json();
}
