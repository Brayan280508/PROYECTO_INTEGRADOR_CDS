import { IconAlert, IconCheck } from "./Iconos";

export default function ModalEstadoUsuario({
  usuario,
  guardando,
  error,
  onConfirmar,
  onCerrar,
}) {
  const desactivar = usuario.activo === true;

  const nombre = [usuario.nombre, usuario.apellido]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div
        className="modal d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-estado-usuario"
        style={{ zIndex: 1060 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
            <div
              style={{
                height: 4,
                background: desactivar
                  ? "linear-gradient(90deg, #EF4444 0%, #F59E0B 100%)"
                  : "linear-gradient(90deg, #10B981 0%, #06B6D4 100%)",
              }}
            />

            <div className="modal-body p-4 p-md-5">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span
                  className={`badge rounded-circle p-2 ${
                    desactivar ? "bg-danger-subtle text-danger" : "bg-success-subtle text-success"
                  }`}
                >
                  {desactivar ? <IconAlert size={22} /> : <IconCheck size={22} />}
                </span>
                <span className="small fw-semibold text-uppercase tracking-wider text-secondary">
                  Confirmación de Estado
                </span>
              </div>

              <h2 id="titulo-estado-usuario" className="h5 fw-bold mb-1">
                {desactivar
                  ? "¿Desactivar esta cuenta de usuario?"
                  : "¿Reactivar esta cuenta de usuario?"}
              </h2>

              <p className="text-secondary small mb-3">
                {desactivar
                  ? "El usuario perderá el acceso al portal hasta que la cuenta sea reactivada."
                  : "El usuario podrá ingresar nuevamente con sus credenciales activas."}
              </p>

              <div className="p-3 rounded-3 border bg-body-tertiary mb-3">
                <strong className="d-block">{nombre}</strong>
                <div className="small text-secondary">{usuario.email}</div>
                <div className="small text-secondary mt-1">
                  Rol: <span className="badge solvix-badge solvix-badge-abierto">{usuario.rol}</span>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger border-0 shadow-sm rounded-3 small py-2 mb-3" role="alert">
                  {error}
                </div>
              )}

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onCerrar}
                  disabled={guardando}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className={`btn ${desactivar ? "btn-danger" : "btn-success"} d-inline-flex align-items-center gap-2`}
                  onClick={() => onConfirmar(usuario.id, !desactivar)}
                  disabled={guardando}
                >
                  {guardando ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" />
                      <span>Procesando...</span>
                    </>
                  ) : desactivar ? (
                    <span>Confirmar desactivación</span>
                  ) : (
                    <span>Confirmar reactivación</span>
                  )}
                </button>
              </div>
            </div>
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
