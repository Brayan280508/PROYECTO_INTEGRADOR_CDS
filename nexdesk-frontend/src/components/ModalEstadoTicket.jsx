import { useState } from "react";
import { IconRefresh, IconAlert } from "./Iconos";

const ETIQUETAS = {
  abierto: "Abierto",
  asignado: "Asignado",
  en_proceso: "En proceso",
  resuelto: "Resuelto",
  cerrado: "Cerrado",
  reabierto: "Reabierto",
};

export default function ModalEstadoTicket({
  ticket,
  transiciones = [],
  guardando,
  error,
  onGuardar,
  onCerrar,
}) {
  const [estado, setEstado] = useState("");
  const [solucion, setSolucion] = useState(ticket.solucion || "");

  const requiereSolucion = ["resuelto", "cerrado"].includes(estado);

  function enviar(evento) {
    evento.preventDefault();

    if (
      guardando ||
      !transiciones.includes(estado) ||
      (requiereSolucion && !solucion.trim())
    ) {
      return;
    }

    onGuardar({
      estado,
      ...(solucion.trim() ? { solucion: solucion.trim() } : {}),
    });
  }

  return (
    <>
      <div
        className="modal d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-estado-ticket"
        style={{ zIndex: 1060 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
            <div
              style={{
                height: 4,
                background: "linear-gradient(90deg, #2563EB 0%, #10B981 100%)",
              }}
            />

            <div className="modal-header d-flex align-items-center justify-content-between p-4">
              <div>
                <h2
                  id="titulo-estado-ticket"
                  className="modal-title h5 fw-bold mb-1 d-flex align-items-center gap-2"
                >
                  <IconRefresh size={18} className="text-primary" />
                  <span>Gestionar Estado del Incidente</span>
                </h2>

                <p className="small text-secondary mb-0">
                  Ticket <span className="font-monospace fw-bold">#{ticket.id}</span>
                </p>
              </div>

              <button
                type="button"
                className="btn-close"
                onClick={onCerrar}
                disabled={guardando}
                aria-label="Cerrar modal"
              />
            </div>

            <form onSubmit={enviar}>
              <div className="modal-body p-4">
                {error && (
                  <div
                    className="alert alert-danger border-0 shadow-sm rounded-3 d-flex align-items-center gap-2 small mb-3"
                    role="alert"
                  >
                    <IconAlert size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="p-3 rounded-3 border bg-body-tertiary mb-3">
                  <span className="small text-secondary fw-semibold d-block mb-1">
                    SOLICITUD
                  </span>
                  <div className="fw-semibold">{ticket.titulo}</div>

                  <div className="small text-secondary mt-1">
                    Estado actual:{" "}
                    <span className="badge solvix-badge solvix-badge-abierto">
                      {ETIQUETAS[ticket.estado] || ticket.estado}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="nuevo-estado-ticket"
                    className="form-label small fw-semibold text-secondary mb-1"
                  >
                    Nuevo Estado *
                  </label>

                  <select
                    id="nuevo-estado-ticket"
                    className="form-select"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    required
                    disabled={guardando}
                  >
                    <option value="">
                      Selecciona la siguiente fase del flujo
                    </option>

                    {transiciones.map((valor) => (
                      <option key={valor} value={valor}>
                        {ETIQUETAS[valor] || valor}
                      </option>
                    ))}
                  </select>
                </div>

                {(estado === "resuelto" ||
                  estado === "cerrado" ||
                  Boolean(ticket.solucion)) && (
                  <div className="mb-3">
                    <label
                      htmlFor="solucion-ticket"
                      className="form-label small fw-semibold text-secondary mb-1"
                    >
                      Diagnóstico y Solución Aplicada
                      {requiereSolucion ? " *" : ""}
                    </label>

                    <textarea
                      id="solucion-ticket"
                      className="form-control"
                      rows={4}
                      maxLength={5000}
                      value={solucion}
                      onChange={(e) => setSolucion(e.target.value)}
                      required={requiereSolucion}
                      disabled={guardando}
                      placeholder="Explica qué acciones correctivas se ejecutaron para solucionar la falla."
                    />

                    <div className="form-text small opacity-75">
                      {solucion.length}/5000 caracteres
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-3 border bg-body-tertiary small">
                  <strong className="d-block mb-1 text-primary">Regla de Negocio:</strong>
                  Las transiciones permitidas corresponden estrictamente a la matriz de ciclo de vida del ticket en SOLVIX.
                </div>
              </div>

              <div className="modal-footer bg-body-tertiary">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onCerrar}
                  disabled={guardando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn btn-primary d-inline-flex align-items-center gap-2"
                  disabled={
                    guardando ||
                    !estado ||
                    (requiereSolucion && !solucion.trim())
                  }
                >
                  {guardando ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" />
                      <span>Actualizando...</span>
                    </>
                  ) : (
                    <span>Confirmar Cambio</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="modal-backdrop show" style={{ zIndex: 1055 }} />
    </>
  );
}
