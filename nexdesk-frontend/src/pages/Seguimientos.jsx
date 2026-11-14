import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "../hooks/useAuth";

import { listarTickets } from "../services/tickets.service";

import {
  listarSeguimientos,
  crearSeguimiento,
} from "../services/seguimientos.service";

import HistorialSeguimientos from "../components/HistorialSeguimientos";
import {
  IconSeguimientos,
  IconRefresh,
  IconSearch,
  IconLock,
  IconCheck,
} from "../components/Iconos";

function formatearEstado(estado) {
  const nombres = {
    abierto: "Abierto",
    asignado: "Asignado",
    en_proceso: "En proceso",
    resuelto: "Resuelto",
    cerrado: "Cerrado",
    reabierto: "Reabierto",
  };

  return nombres[estado] || estado;
}

function claseEstado(estado) {
  const clases = {
    abierto: "solvix-badge solvix-badge-abierto",
    asignado: "solvix-badge solvix-badge-asignado",
    en_proceso: "solvix-badge solvix-badge-en_proceso",
    resuelto: "solvix-badge solvix-badge-resuelto",
    cerrado: "solvix-badge solvix-badge-cerrado",
    reabierto: "solvix-badge solvix-badge-reabierto",
  };

  return clases[estado] || "solvix-badge solvix-badge-cerrado";
}

export default function Seguimientos() {
  const { token } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [ticketId, setTicketId] = useState("");

  const [seguimientos, setSeguimientos] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [observacion, setObservacion] = useState("");

  const [cargandoTickets, setCargandoTickets] = useState(true);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [errorTickets, setErrorTickets] = useState("");
  const [errorHistorial, setErrorHistorial] = useState("");
  const [errorRegistro, setErrorRegistro] = useState("");

  const [mensaje, setMensaje] = useState("");

  const [recargaTickets, setRecargaTickets] = useState(0);
  const [recargaHistorial, setRecargaHistorial] = useState(0);

  const actualizarTickets = useCallback(() => {
    setCargandoTickets(true);
    setRecargaTickets((valor) => valor + 1);
  }, []);

  const actualizarHistorial = useCallback(() => {
    setRecargaHistorial((valor) => valor + 1);
  }, []);

  // ==========================================
  // 1. CARGAR TICKETS VISIBLES
  // ==========================================

  useEffect(() => {
    if (!token) return;

    const controlador = new AbortController();

    async function cargar() {
      try {
        const datos = await listarTickets(
          token,
          "todos",
          controlador.signal
        );

        if (!Array.isArray(datos)) {
          throw new Error("Formato inesperado en el listado de tickets.");
        }

        if (!controlador.signal.aborted) {
          setTickets(datos);
          setErrorTickets("");
        }
      } catch (err) {
        if (!controlador.signal.aborted) {
          setErrorTickets(
            err.message || "No fue posible consultar tickets."
          );
          setTickets([]);
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargandoTickets(false);
        }
      }
    }

    cargar();

    return () => controlador.abort();
  }, [token, recargaTickets]);

  // ==========================================
  // 2. CONSULTAR HISTORIAL
  // ==========================================

  useEffect(() => {
    if (!token || !ticketId) return;

    const controlador = new AbortController();

    async function cargar() {
      try {
        const datos = await listarSeguimientos(
          token,
          ticketId,
          controlador.signal
        );

        if (!Array.isArray(datos)) {
          throw new Error("Formato inesperado en el historial.");
        }

        if (!controlador.signal.aborted) {
          setSeguimientos(datos);
          setErrorHistorial("");
        }
      } catch (err) {
        if (!controlador.signal.aborted) {
          setErrorHistorial(
            err.message || "No fue posible consultar los seguimientos."
          );
          setSeguimientos([]);
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargandoHistorial(false);
        }
      }
    }

    cargar();

    return () => controlador.abort();
  }, [token, ticketId, recargaHistorial]);

  // ==========================================
  // 3. LIMPIAR NOTIFICACIÓN TEMPORAL
  // ==========================================

  useEffect(() => {
    if (!mensaje) return;

    const temporizador = setTimeout(() => {
      setMensaje("");
    }, 4000);

    return () => clearTimeout(temporizador);
  }, [mensaje]);

  // ==========================================
  // 4. FILTRAR TICKETS
  // ==========================================

  const ticketsFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const contenido = [
        ticket.id,
        ticket.titulo,
        ticket.descripcion,
        ticket.estado,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return contenido.includes(texto);
    });
  }, [tickets, busqueda]);

  const ticketSeleccionado = tickets.find(
    (ticket) => String(ticket.id) === ticketId
  );

  const ticketCerrado =
    ticketSeleccionado?.estado?.toLowerCase() === "cerrado";

  // ==========================================
  // 5. SELECCIONAR TICKET
  // ==========================================

  function seleccionarTicket(id) {
    setTicketId(String(id));
    setSeguimientos([]);
    setObservacion("");
    setMensaje("");
    setErrorHistorial("");
    setErrorRegistro("");
    setCargandoHistorial(true);
  }

  // ==========================================
  // 6. REGISTRAR SEGUIMIENTO
  // ==========================================

  async function registrarSeguimiento(evento) {
    evento.preventDefault();

    if (
      !ticketId ||
      ticketCerrado ||
      guardando ||
      !observacion.trim()
    ) {
      return;
    }

    setGuardando(true);
    setErrorRegistro("");

    try {
      await crearSeguimiento(token, ticketId, observacion);

      setObservacion("");
      setMensaje("Seguimiento registrado correctamente.");
      setCargandoHistorial(true);
      actualizarHistorial();
    } catch (err) {
      setErrorRegistro(
        err.message || "No fue posible registrar el seguimiento."
      );
    } finally {
      setGuardando(false);
    }
  }

  // ==========================================
  // 7. INTERFAZ
  // ==========================================

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <div className="small text-secondary mb-1 fw-medium">
            Inicio / Mesa de Ayuda / Seguimientos
          </div>

          <h1 className="h3 fw-bold mb-1 d-flex align-items-center gap-2">
            <IconSeguimientos size={26} className="text-primary" />
            <span>Trazabilidad & Seguimientos</span>
          </h1>

          <p className="text-secondary mb-0 small">
            Historial cronológico de intervenciones, diagnósticos y avances de soporte.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
          onClick={actualizarTickets}
          disabled={cargandoTickets}
        >
          <IconRefresh size={16} className={cargandoTickets ? "spin" : ""} />
          <span>Actualizar tickets</span>
        </button>
      </div>

      {mensaje && (
        <div
          className="alert alert-success alert-dismissible fade show border-0 shadow-sm rounded-3 d-flex align-items-center justify-content-between"
          role="status"
        >
          <div className="d-flex align-items-center gap-2">
            <IconCheck size={18} />
            <span>{mensaje}</span>
          </div>

          <button
            type="button"
            className="btn-close"
            aria-label="Cerrar"
            onClick={() => setMensaje("")}
          />
        </div>
      )}

      {errorTickets && (
        <div className="alert alert-danger border-0 shadow-sm rounded-3" role="alert">
          {errorTickets}
        </div>
      )}

      <div className="row g-4">
        {/* PANEL IZQUIERDO: LISTA DE TICKETS */}
        <div className="col-lg-5 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
            <div className="card-body p-3 p-md-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h2 className="h6 fw-bold mb-0">
                  Seleccionar Ticket
                </h2>
                <span className="small text-secondary">
                  {ticketsFiltrados.length} listados
                </span>
              </div>

              <div className="position-relative mb-3">
                <input
                  type="search"
                  className="form-control ps-4"
                  placeholder="Buscar por ID o asunto..."
                  aria-label="Buscar tickets"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                <div
                  className="position-absolute top-50 start-0 translate-middle-y ps-2 text-secondary opacity-50"
                  style={{ pointerEvents: "none" }}
                >
                  <IconSearch size={14} />
                </div>
              </div>

              {cargandoTickets ? (
                <div className="text-secondary py-5 text-center small">
                  <div className="spinner-border spinner-border-sm text-primary mb-2" role="status" />
                  <div>Consultando solicitudes...</div>
                </div>
              ) : (
                <div
                  className="list-group list-group-flush gap-1"
                  style={{
                    maxHeight: 560,
                    overflowY: "auto",
                  }}
                >
                  {ticketsFiltrados.map((ticket) => {
                    const seleccionado = String(ticket.id) === ticketId;

                    return (
                      <button
                        key={ticket.id}
                        type="button"
                        className={`list-group-item list-group-item-action border rounded-3 p-3 text-start transition-all ${
                          seleccionado
                            ? "border-primary bg-primary-subtle shadow-sm"
                            : "bg-body"
                        }`}
                        onClick={() => seleccionarTicket(ticket.id)}
                      >
                        <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                          <strong className="small text-truncate" style={{ maxWidth: 180 }}>
                            #{ticket.id} {ticket.titulo}
                          </strong>

                          <span className={claseEstado(ticket.estado)}>
                            {formatearEstado(ticket.estado)}
                          </span>
                        </div>

                        <div
                          className="small text-secondary text-truncate"
                          style={{ fontSize: "0.78rem" }}
                        >
                          {ticket.descripcion}
                        </div>
                      </button>
                    );
                  })}

                  {ticketsFiltrados.length === 0 && (
                    <div className="text-secondary text-center py-5 small">
                      No se encontraron tickets con ese criterio.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: DETALLE DEL TICKET & HISTORIAL */}
        <div className="col-lg-7 col-xl-8">
          {!ticketSeleccionado ? (
            <div className="card border-0 shadow-sm rounded-4 h-100 d-flex align-items-center justify-content-center py-5">
              <div className="card-body text-center py-5">
                <div className="mb-3 text-primary opacity-50">
                  <IconSeguimientos size={48} />
                </div>

                <h2 className="h5 fw-bold mb-1">
                  Selecciona una solicitud
                </h2>

                <p className="text-secondary small mb-0">
                  Haz clic en un ticket de la lista para ver la trazabilidad de atención y añadir observaciones.
                </p>
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column gap-4">
              {/* ENCABEZADO RESUMEN DEL TICKET SELECCIONADO */}
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div
                  style={{
                    height: 3,
                    background: "linear-gradient(90deg, #2563EB 0%, #06B6D4 100%)",
                  }}
                />
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-2">
                    <div>
                      <span className="badge bg-body-secondary text-body font-monospace fw-bold mb-2">
                        Ticket #{ticketSeleccionado.id}
                      </span>

                      <h2 className="h5 fw-bold mb-1">
                        {ticketSeleccionado.titulo}
                      </h2>
                    </div>

                    <span className={claseEstado(ticketSeleccionado.estado)}>
                      {formatearEstado(ticketSeleccionado.estado)}
                    </span>
                  </div>

                  <p
                    className="text-secondary small mb-0 text-break"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {ticketSeleccionado.descripcion}
                  </p>
                </div>
              </div>

              {/* REGISTRAR OBSERVACIÓN / SOLO CONSULTA */}
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                  {ticketCerrado ? (
                    <div className="p-3 rounded-3 border bg-body-tertiary">
                      <div className="d-flex align-items-center gap-2 mb-2 text-warning-emphasis">
                        <IconLock size={20} />
                        <h2 className="h6 fw-bold mb-0">
                          Incidente Cerrado — Modo Solo Consulta
                        </h2>
                      </div>
                      <p className="small text-secondary mb-0">
                        Este ticket ha sido finalizado. Su historial de atención permanece disponible para auditoría, pero no es posible registrar nuevas actividades a menos que sea reabierto.
                      </p>
                    </div>
                  ) : (
                    <>
                      <h2 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
                        <span>Añadir Nota de Seguimiento</span>
                      </h2>

                      {errorRegistro && (
                        <div className="alert alert-danger border-0 shadow-sm small py-2 rounded-3 mb-3">
                          {errorRegistro}
                        </div>
                      )}

                      <form onSubmit={registrarSeguimiento}>
                        <div className="mb-3">
                          <label
                            htmlFor="observacion-seguimiento"
                            className="form-label small fw-semibold text-secondary mb-1"
                          >
                            Descripción de la Actividad o Diagnóstico *
                          </label>

                          <textarea
                            id="observacion-seguimiento"
                            className="form-control"
                            rows={3}
                            maxLength={2000}
                            value={observacion}
                            onChange={(e) => setObservacion(e.target.value)}
                            disabled={guardando}
                            required
                            placeholder="Describe las acciones ejecutadas, pruebas realizadas o avances técnicos..."
                          />
                        </div>

                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                          <span className="small text-secondary" style={{ fontSize: "0.75rem" }}>
                            {observacion.length}/2000 caracteres
                          </span>

                          <button
                            type="submit"
                            className="btn btn-primary d-inline-flex align-items-center gap-2"
                            disabled={guardando || !observacion.trim()}
                          >
                            {guardando ? (
                              <>
                                <span className="spinner-border spinner-border-sm" role="status" />
                                <span>Registrando...</span>
                              </>
                            ) : (
                              <span>Registrar Nota</span>
                            )}
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              </div>

              {/* TIMELINE DE HISTORIAL */}
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
                    <h2 className="h6 fw-bold mb-0">
                      Trazabilidad del Servicio ({seguimientos.length})
                    </h2>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                      onClick={() => {
                        setCargandoHistorial(true);
                        actualizarHistorial();
                      }}
                      disabled={cargandoHistorial}
                    >
                      <IconRefresh size={13} className={cargandoHistorial ? "spin" : ""} />
                      <span>Actualizar</span>
                    </button>
                  </div>

                  {errorHistorial && (
                    <div className="alert alert-danger border-0 shadow-sm small rounded-3">
                      {errorHistorial}
                    </div>
                  )}

                  {cargandoHistorial ? (
                    <div className="text-center py-4 text-secondary small">
                      <div className="spinner-border spinner-border-sm text-primary mb-2" role="status" />
                      <div>Sincronizando notas...</div>
                    </div>
                  ) : (
                    !errorHistorial && (
                      <HistorialSeguimientos seguimientos={seguimientos} />
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
