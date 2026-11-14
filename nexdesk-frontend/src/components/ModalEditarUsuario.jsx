import { useState } from "react";
import { IconEdit, IconAlert } from "./Iconos";

const TIPOS_DOCUMENTO = ["CC", "TI", "CE", "PA", "PPT", "OTRO"];

export default function ModalEditarUsuario({
  usuario,
  guardando,
  error,
  onGuardar,
  onCerrar,
}) {
  const [formulario, setFormulario] = useState(() => ({
    tipo_documento: usuario.tipo_documento || "CC",
    numero_documento: usuario.numero_documento || "",
    nombre: usuario.nombre || "",
    apellido: usuario.apellido || "",
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
      tipo_documento: formulario.tipo_documento,
      numero_documento:
        formulario.numero_documento.trim().toUpperCase(),
      nombre: formulario.nombre.trim(),
      apellido: formulario.apellido.trim(),
    });
  }

  return (
    <>
      <div
        className="modal d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-editar-usuario"
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

            <div className="modal-header px-4 pt-4 pb-2 border-bottom-0 d-flex justify-content-between align-items-center">
              <div>
                <h2
                  id="titulo-editar-usuario"
                  className="modal-title h5 fw-bold d-flex align-items-center gap-2 mb-1"
                >
                  <IconEdit size={20} className="text-primary" />
                  <span>Editar Usuario</span>
                </h2>
                <p className="small text-secondary mb-0">
                  ID #{usuario.id} · <span className="fw-medium">{usuario.email}</span>
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
              <div className="modal-body p-4 pt-2">
                {error && (
                  <div className="alert alert-danger border-0 shadow-sm rounded-3 d-flex align-items-center gap-2 small mb-3" role="alert">
                    <IconAlert size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="editar-nombre" className="form-label small fw-semibold text-secondary mb-1">
                      Nombre *
                    </label>
                    <input
                      id="editar-nombre"
                      name="nombre"
                      className="form-control"
                      value={formulario.nombre}
                      onChange={cambiar}
                      maxLength={100}
                      required
                      disabled={guardando}
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="editar-apellido" className="form-label small fw-semibold text-secondary mb-1">
                      Apellido *
                    </label>
                    <input
                      id="editar-apellido"
                      name="apellido"
                      className="form-control"
                      value={formulario.apellido}
                      onChange={cambiar}
                      maxLength={100}
                      required
                      disabled={guardando}
                    />
                  </div>

                  <div className="col-md-5">
                    <label htmlFor="editar-tipo" className="form-label small fw-semibold text-secondary mb-1">
                      Tipo de Documento *
                    </label>
                    <select
                      id="editar-tipo"
                      name="tipo_documento"
                      className="form-select"
                      value={formulario.tipo_documento}
                      onChange={cambiar}
                      disabled={guardando}
                      required
                    >
                      {TIPOS_DOCUMENTO.map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-7">
                    <label htmlFor="editar-documento" className="form-label small fw-semibold text-secondary mb-1">
                      Número de Documento *
                    </label>
                    <input
                      id="editar-documento"
                      name="numero_documento"
                      className="form-control"
                      value={formulario.numero_documento}
                      onChange={cambiar}
                      pattern="[A-Za-z0-9-]{4,30}"
                      maxLength={30}
                      required
                      disabled={guardando}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-3 border bg-body-tertiary mt-4 mb-0 small">
                  El correo institucional, el rol y la contraseña se gestionan mediante sus módulos específicos por políticas de auditoría.
                </div>
              </div>

              <div className="modal-footer px-4 bg-body-tertiary">
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
                  disabled={guardando}
                >
                  {guardando ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar Cambios</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div
        className="modal-backdrop show"
        style={{ zIndex: 1055 }}
      />
    </>
  );
}
