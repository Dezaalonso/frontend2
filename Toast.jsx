import { useState, useCallback } from "react";

let _addToast = null;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  _addToast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  return (
    <>
      {children}
      <div className="toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === "success" ? "✓" : "✕"} {t.msg}
          </div>
        ))}
      </div>
    </>
  );
}

export function toast(msg, type = "success") {
  if (_addToast) _addToast(msg, type);
}
