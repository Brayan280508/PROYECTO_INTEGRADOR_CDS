import { IconLock, IconAlert } from "./Iconos";

export default function ModalRestablecerPassword({
  usuario,
  procesando,
  error,
  onConfirmar,
  onCerrar,
}) {
  if (!usuario) return null;

  return (
    <>
      <div
        className="modal d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-restablecer"
        style={{ zIndex: 1060 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
            <div
              style={{
                height: 4,
                background: "linear-gradient(90deg, #F59E0B 0%, #EF4444 100%)",
              }}
            />

            <div className="modal-header p-4 d-flex align-items-center justify-content-between">
              <h2
                id="titulo-restablecer"
                className="modal-title h5 fw-bold mb-0 d-flex align-items-center gap-2"
              >
                <IconLock size={20} className="text-warning" />
                <span>Restablecer Contraseña</span>
              </h2>

              <button
                type="button"
                className="btn-close"
                onClick={onCerrar}
                disabled={procesando}
                aria-label="Cerrar modal"
              />
            </div>

            <div className="modal-body p-4 pt-2">
              <p className="text-secondary small mb-3">
                Se generará una nueva contraseña temporal de acceso para la siguiente cuenta:
              </p>

              <div className="p-3 rounded-3 border bg-body-tertiary mb-3">
                <strong className="d-block">
                  {usuario.nombre} {usuario.apellido}
                </strong>

                <div className="small text-secondary">
                  {usuario.email}
                </div>

                <div className="small text-secondary mt-1">
                  Rol: <span className="badge solvix-badge solvix-badge-abierto">{usuario.rol}</span>
                </div>
              </div>

              <div className="alert alert-warning border-0 shadow-sm small py-2 rounded-3 mb-0">
                <strong>Advertencia de seguridad:</strong> La contraseña anterior dejará de ser válida inmediatamente. El usuario deberá actualizar la contraseña temporal al iniciar sesión.
              </div>

              {error && (
                <div className="alert alert-danger border-0 shadow-sm small py-2 rounded-3 mt-3 mb-0" role="alert">
                  <IconAlert size={14} className="me-1" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div className="modal-footer bg-body-tertiary">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onCerrar}
                disabled={procesando}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="btn btn-warning d-inline-flex align-items-center gap-2"
                onClick={() => onConfirmar(usuario.id)}
                disabled={procesando}
              >
                {procesando ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" />
                    <span>Restableciendo...</span>
                  </>
                ) : (
                  <span>Confirmar Restablecimiento</span>
                )}
              </button>
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
