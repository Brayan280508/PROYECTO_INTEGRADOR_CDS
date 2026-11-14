import { useState } from "react";
import { IconCheck, IconEye } from "./Iconos";

export default function CredencialTemporal({
  resultado,
  onCerrar,
}) {
  const [mostrar, setMostrar] = useState(false);

  if (!resultado) return null;

  const { usuario, credencialTemporal } = resultado;

  return (
    <>
      <div
        className="modal d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-credencial"
        style={{ zIndex: 1070 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
            <div
              style={{
                height: 4,
                background: "linear-gradient(90deg, #10B981 0%, #06B6D4 100%)",
              }}
            />

            <div className="modal-body p-4 p-md-5">
              <div className="d-flex align-items-center gap-2 mb-2 text-success">
                <span className="badge rounded-circle p-1 bg-success-subtle text-success">
                  <IconCheck size={20} />
                </span>
                <span className="small fw-semibold text-uppercase tracking-wider">
                  Acceso Autorizado
                </span>
              </div>

              <h2 id="titulo-credencial" className="h5 fw-bold mb-1">
                {resultado?.mensaje ||
                  "Credencial temporal generada correctamente"}
              </h2>

              <p className="text-secondary small mb-4">
                Conserva esta clave y compártela únicamente con el titular a través de un medio seguro.
              </p>

              <div className="p-3 rounded-3 border bg-body-tertiary mb-3">
                <div className="small text-secondary fw-semibold">USUARIO</div>
                <strong className="d-block mb-3">
                  {usuario?.nombre} {usuario?.apellido}
                </strong>

                <div className="small text-secondary fw-semibold">
                  CORREO ELECTRÓNICO
                </div>
                <strong className="d-block mb-3 text-break">{usuario?.email}</strong>

                <div className="small text-secondary fw-semibold">
                  CONTRASEÑA TEMPORAL
                </div>

                <div className="d-flex gap-2 align-items-center mt-1">
                  <code
                    className="flex-grow-1 p-2 rounded border bg-body font-monospace text-primary fw-bold text-break"
                    style={{ fontSize: "0.95rem" }}
                  >
                    {mostrar ? credencialTemporal : "••••••••••••••••"}
                  </code>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                    onClick={() => setMostrar((valor) => !valor)}
                  >
                    <IconEye size={14} />
                    <span>{mostrar ? "Ocultar" : "Mostrar"}</span>
                  </button>
                </div>
              </div>

              <div className="alert alert-warning border-0 shadow-sm small py-2 rounded-3 mb-4">
                <strong>Aviso de seguridad:</strong> Esta credencial solo se mostrará una vez. El usuario deberá renovarla en su primer inicio de sesión.
              </div>

              <button
                type="button"
                className="btn btn-primary w-100 py-2 fw-semibold"
                onClick={onCerrar}
              >
                Entendido, cerrar ventana
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-backdrop show" style={{ zIndex: 1065 }} />
    </>
  );
}
