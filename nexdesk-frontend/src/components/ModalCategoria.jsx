import { useState } from "react";
import { IconCategorias, IconAlert } from "./Iconos";

export default function ModalCategoria({
  categoria,
  guardando,
  error,
  onGuardar,
  onCerrar,
}) {
  const editando = Boolean(categoria);

  const [formulario, setFormulario] = useState(() => ({
    nombre: categoria?.nombre || "",
    descripcion: categoria?.descripcion || "",
  }));

  function cambiar(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function enviar(evento) {
    evento.preventDefault();

    onGuardar({
      nombre: formulario.nombre.trim(),
      descripcion: formulario.descripcion.trim(),
    });
  }

  return (
    <>
      <div
        className="modal d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-categoria"
        style={{ zIndex: 1060 }}
      >
        <div className="modal-dialog modal-dialog-centered">
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
                  id="titulo-modal-categoria"
                  className="modal-title h5 fw-bold mb-1 d-flex align-items-center gap-2"
                >
                  <IconCategorias size={20} className="text-primary" />
                  <span>
                    {editando ? "Editar Categoría" : "Nueva Categoría de Servicio"}
                  </span>
                </h2>

                <p className="small text-secondary mb-0">
                  Clasificación de solicitudes de soporte técnico en SOLVIX
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
                  <div className="alert alert-danger border-0 shadow-sm rounded-3 d-flex align-items-center gap-2 small mb-3" role="alert">
                    <IconAlert size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="mb-3">
                  <label
                    htmlFor="categoria-nombre"
                    className="form-label small fw-semibold text-secondary mb-1"
                  >
                    Nombre de la Categoría *
                  </label>

                  <input
                    id="categoria-nombre"
                    name="nombre"
                    className="form-control"
                    value={formulario.nombre}
                    onChange={cambiar}
                    maxLength={100}
                    placeholder="Ej. Conectividad y Redes"
                    required
                    disabled={guardando}
                  />
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="categoria-descripcion"
                    className="form-label small fw-semibold text-secondary mb-1"
                  >
                    Descripción del Alcance
                  </label>

                  <textarea
                    id="categoria-descripcion"
                    name="descripcion"
                    className="form-control"
                    rows={3}
                    maxLength={250}
                    value={formulario.descripcion}
                    onChange={cambiar}
                    placeholder="Describe los incidentes contemplados dentro de este grupo..."
                    disabled={guardando}
                  />

                  <div className="form-text small opacity-75 text-end">
                    {formulario.descripcion.length}/250 caracteres
                  </div>
                </div>

                {!editando && (
                  <div className="p-3 rounded-3 border bg-body-tertiary small">
                    <strong className="d-block mb-1 text-primary">Información:</strong>
                    La categoría se habilitará automáticamente para que los usuarios puedan seleccionarla al crear nuevos tickets.
                  </div>
                )}
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
                  disabled={guardando || !formulario.nombre.trim()}
                >
                  {guardando ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" />
                      <span>Guardando...</span>
                    </>
                  ) : editando ? (
                    <span>Guardar Cambios</span>
                  ) : (
                    <span>Registrar Categoría</span>
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
