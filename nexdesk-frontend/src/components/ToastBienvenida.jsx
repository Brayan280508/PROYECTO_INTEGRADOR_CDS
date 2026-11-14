import { useEffect, useState } from "react";
import { IconCheck } from "./Iconos";

export default function ToastBienvenida({ nombre, onCerrar }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const inicio = setTimeout(() => setVisible(true), 50);
    const cierre = setTimeout(() => setVisible(false), 3800);
    const finalizar = setTimeout(() => onCerrar(), 4300);

    return () => {
      clearTimeout(inicio);
      clearTimeout(cierre);
      clearTimeout(finalizar);
    };
  }, [onCerrar]);

  return (
    <div
      className={`solvix-toast nexdesk-toast ${visible ? "visible" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="d-flex align-items-start gap-3">
        <div className="solvix-toast-icon nexdesk-toast-icon">
          <IconCheck size={20} />
        </div>

        <div className="flex-grow-1">
          <div className="fw-bold fs-6">
            ¡Bienvenido/a, {nombre}!
          </div>
          <div className="text-secondary small mt-1">
            Has iniciado sesión correctamente en <strong>SOLVIX</strong>.
          </div>
        </div>

        <button
          type="button"
          className="btn-close btn-sm"
          aria-label="Cerrar notificación"
          onClick={onCerrar}
        />
      </div>

      <div className="solvix-toast-progress nexdesk-toast-progress" />
    </div>
  );
}
