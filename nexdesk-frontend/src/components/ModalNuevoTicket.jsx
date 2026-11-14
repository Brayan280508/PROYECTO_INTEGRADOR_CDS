import { useState } from "react";
import { IconPlus, IconAlert } from "./Iconos";

export default function ModalNuevoTicket({
  categorias = [],
  guardando,
  error,
  onGuardar,
  onCerrar,
}) {
  const [formulario, setFormulario] = useState({
    titulo: "",
    descripcion: "",
    prioridad: "media",
    categoria_id: "",
  });

  function cambiar(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function enviar(evento) {
    evento.preventDefault();

    if (guardando) return;

    onGuardar({
      titulo: formulario.titulo.trim(),
      descripcion: formulario.descripcion.trim(),
      prioridad: formulario.prioridad,
      categoria_id: Number(formulario.categoria_id),
    });
  }

  return (
    <>
      <div
        className="modal d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-nuevo-ticket"
        style={{ zIndex: 1060 }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
            <div
              style={{
                height: 4,
                background: "linear-gradient(90deg, #2563EB 0%, #06B6D4 100%)",
              }}
            />

            <div className="modal-header d-flex align-items-center justify-content-between p-4">
              <div>
                <h2
                  id="titulo-nuevo-ticket"
                  className="modal-title h5 fw-bold mb-1 d-flex align-items-center gap-2"
                >
                  <IconPlus size={20} className="text-primary" />
                  <span>Registrar Solicitud de Soporte</span>
                </h2>
                <p className="small text-secondary mb-0">
                  SOLVIX Help Desk — Describe tu problema o requerimiento con claridad.
                </p>
              </div>

              <button
                type="button"
                className="btn-close"
                aria-label="Cerrar modal"
                onClick={onCerrar}
                disabled={guardando}
              />
            </div>

            <form onSubmit={enviar}>
              <div className="modal-body p-4">
                {error && (
                  <div
                    className="alert alert-danger border-0 shadow-sm rounded-3 d-flex align-items-center gap-2 small mb-4"
                    role="alert"
                  >
                    <IconAlert size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="mb-3">
                  <label
                    htmlFor="ticket-titulo"
                    className="form-label small fw-semibold text-secondary mb-1"
                  >
                    Título del Incidente / Solicitud *
                  </label>

                  <input
                    id="ticket-titulo"
                    name="titulo"
                    className="form-control"
                    value={formulario.titulo}
                    onChange={cambiar}
                    maxLength={200}
                    required
                    disabled={guardando}
                    placeholder="Ej. Error al conectar impresora de contabilidad"
                  />
                  <div className="form-text small opacity-75">
                    Sé breve y conciso para agilizar la asignación.
                  </div>
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="ticket-descripcion"
                    className="form-label small fw-semibold text-secondary mb-1"
                  >
                    Descripción Detallada *
                  </label>

                  <textarea
                    id="ticket-descripcion"
                    name="descripcion"
                    className="form-control"
                    rows={4}
                    value={formulario.descripcion}
                    onChange={cambiar}
                    required
                    disabled={guardando}
                    placeholder="Detalla qué ocurre, el mensaje de error exacto y los pasos para reproducirlo."
                  />
                </div>

                <div className="row g-3">
                  <div className="col-md-7">
                    <label
                      htmlFor="ticket-categoria"
                      className="form-label small fw-semibold text-secondary mb-1"
                    >
                      Categoría del Servicio *
                    </label>

                    <select
                      id="ticket-categoria"
                      name="categoria_id"
                      className="form-select"
                      value={formulario.categoria_id}
                      onChange={cambiar}
                      required
                      disabled={guardando}
                    >
                      <option value="">
                        Selecciona el área o tipo de incidente
                      </option>

                      {categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-5">
                    <label
                      htmlFor="ticket-prioridad"
                      className="form-label small fw-semibold text-secondary mb-1"
                    >
                      Nivel de Prioridad *
                    </label>

                    <select
                      id="ticket-prioridad"
                      name="prioridad"
                      className="form-select"
                      value={formulario.prioridad}
                      onChange={cambiar}
                      disabled={guardando}
                    >
                      <option value="baja">Baja — No bloquea mis actividades</option>
                      <option value="media">Media — Afecta parcialmente</option>
                      <option value="alta">Alta — Bloqueo crítico del trabajo</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-3 border bg-body-tertiary small mt-4">
                  <strong className="d-block mb-1 text-primary">Información del Flujo:</strong>
                  La solicitud se registrará inmediatamente en estado <strong>Abierto</strong>. El personal técnico recibirá una notificación y se le asignará el caso.
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
                    categorias.length === 0 ||
                    !formulario.titulo.trim() ||
                    !formulario.descripcion.trim() ||
                    !formulario.categoria_id
                  }
                >
                  {guardando ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" />
                      <span>Registrando...</span>
                    </>
                  ) : (
                    <span>Registrar Ticket</span>
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
