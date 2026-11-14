import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import {
  listarNotificaciones,
  contarPendientes,
  marcarNotificacionLeida,
} from "../services/notificaciones.service";
import { IconBell, IconRefresh } from "./Iconos";

export default function CampanaNotificaciones() {
  const { token, usuario } = useAuth();
  const navigate = useNavigate();

  const [abierto, setAbierto] = useState(false);
  const [avisos, setAvisos] = useState([]);
  const [pendientes, setPendientes] = useState(0);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const actualizar = useCallback(
    async (signal) => {
      if (!token) return;

      try {
        const [lista, cuenta] = await Promise.all([
          listarNotificaciones(token, signal),
          contarPendientes(token, signal),
        ]);

        if (signal?.aborted) return;

        setAvisos(lista);
        setPendientes(cuenta.pendientes);
        setError("");
      } catch (e) {
        if (!signal?.aborted) {
          setError(e.message);
        }
      }
    },
    [token]
  );

  // Consultar cada 30 segundos
  useEffect(() => {
    if (
      !token ||
      usuario?.debe_cambiar_password ||
      usuario?.debeCambiarPassword
    ) {
      return;
    }

    const controller = new AbortController();

    Promise.resolve().then(() =>
      actualizar(controller.signal)
    );

    const intervalo = setInterval(() => {
      actualizar(controller.signal);
    }, 30000);

    return () => {
      controller.abort();
      clearInterval(intervalo);
    };
  }, [token, usuario, actualizar]);

  async function leer(aviso) {
    if (!aviso || aviso.leida || cargando) {
      setAbierto(false);
      navigate("/tickets");
      return;
    }

    setCargando(true);

    try {
      await marcarNotificacionLeida(token, aviso.id);
      setAvisos((anteriores) =>
        anteriores.map((item) =>
          item.id === aviso.id
            ? { ...item, leida: true }
            : item
        )
      );
      setPendientes((anterior) => Math.max(0, anterior - 1));
      setAbierto(false);
      navigate("/tickets");
    } catch {
      setAbierto(false);
      navigate("/tickets");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="position-relative">
      <button
        type="button"
        className="solvix-theme-toggle position-relative"
        aria-label={`Notificaciones: ${pendientes} sin leer`}
        aria-expanded={abierto}
        onClick={() => {
          setAbierto(!abierto);

          if (!abierto) {
            void actualizar();
          }
        }}
      >
        <IconBell size={18} />

        {pendientes > 0 && (
          <span
            className={
              "position-absolute top-0 start-100 " +
              "translate-middle badge rounded-pill bg-danger border border-light"
            }
            style={{ fontSize: "0.65rem", padding: "0.25em 0.5em" }}
          >
            {pendientes > 99 ? "99+" : pendientes}
          </span>
        )}
      </button>

      {abierto && (
        <div
          className="card border-0 shadow-lg position-absolute end-0 mt-2 overflow-hidden"
          style={{
            width: "min(360px, 92vw)",
            zIndex: 1100,
            borderRadius: 14,
          }}
        >
          <div
            style={{
              height: 3,
              background: "linear-gradient(90deg, #2563EB 0%, #06B6D4 100%)",
            }}
          />

          <div className="card-header bg-body-tertiary d-flex justify-content-between align-items-center p-3 border-bottom">
            <div className="d-flex align-items-center gap-2">
              <strong className="small">Notificaciones</strong>
              {pendientes > 0 && (
                <span className="badge solvix-badge solvix-badge-abierto">
                  {pendientes} nuevas
                </span>
              )}
            </div>

            <button
              type="button"
              className="btn-close btn-sm"
              aria-label="Cerrar panel"
              onClick={() => setAbierto(false)}
            />
          </div>

          {error && (
            <div className="alert alert-warning m-2 small py-1" role="alert">
              {error}
            </div>
          )}

          <div
            className="list-group list-group-flush overflow-auto"
            style={{ maxHeight: 340 }}
          >
            {avisos.length === 0 && (
              <div className="p-4 text-center text-secondary small">
                No tienes notificaciones pendientes.
              </div>
            )}

            {avisos.map((aviso) => (
              <button
                key={aviso.id}
                type="button"
                disabled={cargando}
                onClick={() => leer(aviso)}
                className={`list-group-item list-group-item-action text-start p-3 border-bottom ${
                  !aviso.leida ? "bg-body-secondary fw-semibold" : ""
                }`}
              >
                <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                  <span className="small text-truncate" style={{ maxWidth: 220 }}>
                    {aviso.titulo}
                  </span>

                  {!aviso.leida && (
                    <span className="badge bg-primary text-white" style={{ fontSize: "0.68rem" }}>
                      Nueva
                    </span>
                  )}
                </div>

                <div className="small text-secondary mb-1" style={{ fontSize: "0.8rem" }}>
                  {aviso.mensaje}
                </div>

                <div className="text-secondary" style={{ fontSize: "0.72rem" }}>
                  {new Date(aviso.fecha_creacion).toLocaleString("es-CO")}
                </div>
              </button>
            ))}
          </div>

          <div className="card-footer bg-body-tertiary p-2 text-end border-top">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
              style={{ fontSize: "0.76rem" }}
              onClick={() => void actualizar()}
            >
              <IconRefresh size={12} />
              <span>Sincronizar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
