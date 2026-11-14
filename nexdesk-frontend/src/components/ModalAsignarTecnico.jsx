import { useState } from "react";
import { IconTecnicos, IconAlert } from "./Iconos";

export default function ModalAsignarTecnico({
  ticket,
  tecnicos = [],
  guardando,
  error,
  onGuardar,
  onCerrar,
}) {
  const [tecnicoId, setTecnicoId] = useState(
    ticket.tecnico_id ? String(ticket.tecnico_id) : ""
  );

  const elegibles = tecnicos.filter(
    (tecnico) =>
      tecnico.disponible === true &&
      tecnico.activo === true
  );

  function enviar(evento) {
    evento.preventDefault();

    if (!tecnicoId || guardando) return;

    onGuardar(Number(tecnicoId));
  }

  return (
    <>
      <div
        className="modal d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-asignar-tecnico"
        style={{ zIndex: 1060 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
            <div
              style={{
                height: 4,
                background: "linear-gradient(90deg, #10B981 0%, #06B6D4 100%)",
              }}
            />

            <div className="modal-header d-flex align-items-center justify-content-between p-4">
              <div>
                <h2
                  id="titulo-asignar-tecnico"
                  className="modal-title h5 fw-bold mb-1 d-flex align-items-center gap-2"
                >
                  <IconTecnicos size={20} className="text-success" />
                  <span>Asignar Técnico Especialista</span>
                </h2>

                <p className="small text-secondary mb-0">
                  Incidente <span className="font-monospace fw-bold">#{ticket.id}</span>
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
                  <strong className="d-block">{ticket.titulo}</strong>
                  <div className="small text-secondary mt-1">
                    Estado actual: <span className="badge solvix-badge solvix-badge-abierto">{ticket.estado}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="tecnico-asignado"
                    className="form-label small fw-semibold text-secondary mb-1"
                  >
                    Técnico Responsable *
                  </label>

                  <select
                    id="tecnico-asignado"
                    className="form-select"
                    value={tecnicoId}
                    onChange={(e) => setTecnicoId(e.target.value)}
                    disabled={guardando}
                    required
                  >
                    <option value="">
                      Selecciona un técnico activo y disponible
                    </option>

                    {elegibles.map((tecnico) => (
                      <option key={tecnico.id} value={tecnico.id}>
                        {tecnico.nombre} {tecnico.apellido} ({tecnico.especialidad || "General"})
                      </option>
                    ))}
                  </select>
                </div>

                {elegibles.length === 0 && (
                  <div className="alert alert-warning border-0 shadow-sm rounded-3 small mb-3">
                    No existen técnicos activos y disponibles en este momento.
                  </div>
                )}

                <div className="p-3 rounded-3 border bg-body-tertiary small">
                  <strong className="d-block mb-1 text-primary">Información:</strong>
                  Al confirmar, el ticket pasará automáticamente al estado <strong>Asignado</strong>.
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
                    !tecnicoId ||
                    !elegibles.some(
                      (tecnico) => String(tecnico.id) === tecnicoId
                    )
                  }
                >
                  {guardando ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" />
                      <span>Asignando...</span>
                    </>
                  ) : (
                    <span>Confirmar Asignación</span>
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
