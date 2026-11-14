import { useState } from "react";
import { IconTecnicos, IconAlert } from "./Iconos";

export default function ModalTecnico({
  tecnico,
  usuariosDisponibles = [],
  guardando,
  error,
  onGuardar,
  onCerrar,
}) {
  const editando = Boolean(tecnico);

  const [formulario, setFormulario] = useState(() => ({
    usuario_id: tecnico?.usuario_id
      ? String(tecnico.usuario_id)
      : "",
    especialidad: tecnico?.especialidad || "",
    disponible: tecnico?.disponible ?? true,
  }));

  function cambiar(evento) {
    const { name, value, type, checked } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function enviar(evento) {
    evento.preventDefault();

    const datos = {
      especialidad: formulario.especialidad.trim(),
      disponible: formulario.disponible,
    };

    if (!editando) {
      datos.usuario_id = Number(formulario.usuario_id);
    }

    onGuardar(datos);
  }

  return (
    <>
      <div
        className="modal d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-tecnico"
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
              <h2
                id="titulo-modal-tecnico"
                className="modal-title h5 fw-bold mb-0 d-flex align-items-center gap-2"
              >
                <IconTecnicos size={20} className="text-primary" />
                <span>
                  {editando ? "Editar Perfil Técnico" : "Registrar Especialista"}
                </span>
              </h2>

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
                  <label className="form-label small fw-semibold text-secondary mb-1" htmlFor="tecnico-usuario">
                    Usuario Vinculado *
                  </label>

                  {editando ? (
                    <input
                      id="tecnico-usuario"
                      className="form-control"
                      value={`${tecnico.nombre} ${tecnico.apellido}`}
                      disabled
                      readOnly
                    />
                  ) : (
                    <select
                      id="tecnico-usuario"
                      name="usuario_id"
                      className="form-select"
                      value={formulario.usuario_id}
                      onChange={cambiar}
                      disabled={guardando}
                      required
                    >
                      <option value="">
                        Selecciona un usuario con rol técnico
                      </option>

                      {usuariosDisponibles.map((usuario) => (
                        <option key={usuario.id} value={usuario.id}>
                          {usuario.nombre} {usuario.apellido} — {usuario.email}
                        </option>
                      ))}
                    </select>
                  )}

                  {!editando && usuariosDisponibles.length === 0 && (
                    <div className="form-text text-warning small mt-1">
                      No hay usuarios con rol técnico activos sin perfil asignado.
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary mb-1" htmlFor="tecnico-especialidad">
                    Especialidad Técnica *
                  </label>

                  <input
                    id="tecnico-especialidad"
                    name="especialidad"
                    className="form-control"
                    value={formulario.especialidad}
                    onChange={cambiar}
                    placeholder="Ej. Redes, Telefonía IP, Servidores Linux"
                    minLength={2}
                    maxLength={100}
                    required
                    disabled={guardando}
                  />

                  <div className="form-text small opacity-75">
                    Campo clave para la asignación inteligente de tickets.
                  </div>
                </div>

                <div className="p-3 rounded-3 border bg-body-tertiary mb-3">
                  <div className="form-check form-switch mb-0">
                    <input
                      id="tecnico-disponible"
                      name="disponible"
                      type="checkbox"
                      className="form-check-input"
                      checked={formulario.disponible}
                      onChange={cambiar}
                      disabled={guardando}
                    />

                    <label className="form-check-label small fw-semibold" htmlFor="tecnico-disponible">
                      Habilitado para recibir nuevas asignaciones
                    </label>
                  </div>
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
                    (!editando && usuariosDisponibles.length === 0)
                  }
                >
                  {guardando ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" />
                      <span>Guardando...</span>
                    </>
                  ) : editando ? (
                    <span>Guardar Cambios</span>
                  ) : (
                    <span>Registrar Técnico</span>
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
