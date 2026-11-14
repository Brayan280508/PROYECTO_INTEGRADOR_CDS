import { useEffect, useState } from "react";
import { consultarEstadoBackend } from "../services/estado.service";
import { IconRefresh, IconCheck, IconAlert } from "./Iconos";

export default function EstadoBackend() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  async function verificarConexion() {
    setCargando(true);
    setError("");
    try {
      setDatos(await consultarEstadoBackend());
    } catch (err) {
      setDatos(null);
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    let activo = true;
    consultarEstadoBackend()
      .then((resultado) => {
        if (activo) setDatos(resultado);
      })
      .catch((err) => {
        if (activo) setError(err.message);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  return (
    <section
      className="mt-4 pt-3 border-top"
      aria-label="Diagnóstico del backend"
    >
      <div className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-body-tertiary border">
        <div className="d-flex align-items-center gap-2">
          {error ? (
            <span className="badge rounded-circle p-1 bg-danger-subtle text-danger">
              <IconAlert size={14} />
            </span>
          ) : cargando ? (
            <div
              className="spinner-border spinner-border-sm text-secondary"
              role="status"
            >
              <span className="visually-hidden">Verificando...</span>
            </div>
          ) : (
            <span className="badge rounded-circle p-1 bg-success-subtle text-success">
              <IconCheck size={14} />
            </span>
          )}

          <div>
            <span className="small fw-semibold d-block" style={{ fontSize: "0.8rem" }}>
              API de Servicio
            </span>
            <span className="text-secondary" style={{ fontSize: "0.72rem" }}>
              {error ? "Sin conexión" : cargando ? "Verificando enlace..." : "En línea y sincronizado"}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-sm btn-outline-secondary p-1 px-2 d-flex align-items-center gap-1"
          style={{ fontSize: "0.74rem" }}
          onClick={verificarConexion}
          disabled={cargando}
          title="Verificar estado de la conexión"
        >
          <IconRefresh size={12} className={cargando ? "spin" : ""} />
          <span>Comprobar</span>
        </button>
      </div>

      {error && (
        <p className="small text-danger mt-2 mb-0" style={{ fontSize: "0.75rem" }} role="alert">
          {error}
        </p>
      )}
      {datos && !error && (
        <p className="small text-secondary mt-1 mb-0 text-center" style={{ fontSize: "0.72rem" }}>
          Servidor accesible y respondiendo solicitudes.
        </p>
      )}
    </section>
  );
}
