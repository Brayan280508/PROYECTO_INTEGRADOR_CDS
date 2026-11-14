import { useEffect } from "react";
import FormularioUsuario from "./FormularioUsuario";
import { IconUsuarios } from "./Iconos";

export default function ModalNuevoUsuario({
  abierto,
  rolActual,
  guardando,
  error,
  onGuardar,
  onCerrar,
}) {
  useEffect(() => {
    if (!abierto) return;

    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = anterior;
    };
  }, [abierto]);

  if (!abierto) return null;

  return (
    <>
      <div
        className="modal d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-nuevo-usuario"
        style={{ zIndex: 1060 }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
          <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
            <div
              style={{
                height: 4,
                background: "linear-gradient(90deg, #2563EB 0%, #06B6D4 100%)",
              }}
            />

            <div className="modal-header px-4 pt-4 pb-2 border-bottom-0">
              <div>
                <h2
                  id="titulo-nuevo-usuario"
                  className="modal-title h5 fw-bold d-flex align-items-center gap-2 mb-1"
                >
                  <IconUsuarios size={20} className="text-primary" />
                  <span>Registrar Nuevo Usuario</span>
                </h2>
                <p className="text-secondary small mb-0">
                  Crea una nueva cuenta de acceso institucional en <strong>SOLVIX</strong>.
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

            <div className="modal-body p-4 pt-2">
              {error && (
                <div className="alert alert-danger border-0 shadow-sm rounded-3 small mb-3" role="alert">
                  {error}
                </div>
              )}

              <FormularioUsuario
                rolActual={rolActual}
                guardando={guardando}
                onGuardar={onGuardar}
                onCancelar={onCerrar}
              />
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
