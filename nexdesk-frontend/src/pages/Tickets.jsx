import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "../hooks/useAuth";

import ModalNuevoTicket from "../components/ModalNuevoTicket";
import ModalAsignarTecnico from "../components/ModalAsignarTecnico";
import ModalEstadoTicket from "../components/ModalEstadoTicket";
import {
  IconPlus,
  IconRefresh,
  IconSearch,
  IconEye,
  IconTecnicos,
  IconCheck,
  IconTickets,
} from "../components/Iconos";

import {
  listarTickets,
  crearTicket,
  asignarTecnicoTicket,
  cambiarEstadoTicket,
} from "../services/tickets.service";

import { listarTecnicos } from "../services/tecnicos.service";

import { listarCategorias } from "../services/categorias.service";

const ESTADOS = [
  ["todos", "Todos los estados"],
  ["abierto", "Abierto"],
  ["asignado", "Asignado"],
  ["en_proceso", "En proceso"],
  ["resuelto", "Resuelto"],
  ["cerrado", "Cerrado"],
  ["reabierto", "Reabierto"],
];

const TRANSICIONES_TICKETS = {
  abierto: [],
  asignado: ["en_proceso"],
  en_proceso: ["resuelto"],
  resuelto: ["cerrado", "reabierto"],
  cerrado: ["reabierto"],
  reabierto: ["en_proceso"],
};

function nombreEstado(estado) {
  return (
    ESTADOS.find(([valor]) => valor === estado)?.[1] ||
    estado
  );
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

function clasePrioridad(prioridad) {
  const clases = {
    alta: "solvix-priority-alta",
    media: "solvix-priority-media",
    baja: "solvix-priority-baja",
  };

  return clases[prioridad] || "badge bg-secondary";
}

export default function Tickets() {
  const { token, usuario } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const [modalNuevo, setModalNuevo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState("");

  const [ticketDetalle, setTicketDetalle] = useState(null);
  const [recarga, setRecarga] = useState(0);

  const [ticketAsignar, setTicketAsignar] = useState(null);
  const [asignando, setAsignando] = useState(false);
  const [errorAsignacion, setErrorAsignacion] = useState("");

  const [ticketCambiarEstado, setTicketCambiarEstado] = useState(null);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [errorCambioEstado, setErrorCambioEstado] = useState("");

  const rolActual = usuario?.rol?.nombre || usuario?.rol;
  const esAdministrador = ["superadmin", "admin"].includes(rolActual);

  const puedeCrear = ["superadmin", "admin", "usuario"].includes(rolActual);

  const actualizar = useCallback(() => {
    setCargando(true);
    setRecarga((valor) => valor + 1);
  }, []);

  // ==========================================
  // 1. CONSULTAR TICKETS Y CATEGORÍAS
  // ==========================================

  useEffect(() => {
    if (!token) return;

    const controlador = new AbortController();

    async function cargar() {
      try {
        const [
          respuestaTickets,
          respuestaCategorias,
          respuestaTecnicos,
        ] = await Promise.all([
          listarTickets(token, "todos", controlador.signal),
          listarCategorias(token, controlador.signal),
          esAdministrador
            ? listarTecnicos(token, controlador.signal)
            : Promise.resolve([]),
        ]);

        if (controlador.signal.aborted) return;

        if (!Array.isArray(respuestaTickets)) {
          throw new Error(
            "El backend devolvió un formato de tickets inesperado."
          );
        }

        if (!Array.isArray(respuestaCategorias)) {
          throw new Error(
            "El backend devolvió un formato de categorías inesperado."
          );
        }

        if (!Array.isArray(respuestaTecnicos)) {
          throw new Error(
            "El backend devolvió un formato de técnicos inesperado."
          );
        }

        setTickets(respuestaTickets);
        setCategorias(respuestaCategorias);
        setTecnicos(respuestaTecnicos);
        setError("");
      } catch (err) {
        if (!controlador.signal.aborted) {
          setError(
            err.message || "No fue posible cargar los tickets."
          );
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      }
    }

    cargar();

    return () => controlador.abort();
  }, [token, recarga, esAdministrador]);

  // ==========================================
  // 2. NOTIFICACIÓN DE ÉXITO
  // ==========================================

  useEffect(() => {
    if (!mensaje) return;

    const temporizador = setTimeout(() => {
      setMensaje("");
    }, 4000);

    return () => clearTimeout(temporizador);
  }, [mensaje]);

  // ==========================================
  // 3. FILTROS
  // ==========================================

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const contenido = [
        ticket.id,
        ticket.titulo,
        ticket.descripcion,
        ticket.prioridad,
        ticket.estado,
      ]
        .filter((valor) => valor !== null && valor !== undefined)
        .join(" ")
        .toLowerCase();

      const coincideEstado =
        filtroEstado === "todos" || ticket.estado === filtroEstado;

      return contenido.includes(texto) && coincideEstado;
    });
  }, [tickets, busqueda, filtroEstado]);

  const categoriasActivas = categorias.filter(
    (categoria) => categoria.activa === true
  );

  function nombreCategoria(id) {
    return (
      categorias.find(
        (categoria) => Number(categoria.id) === Number(id)
      )?.nombre || `Categoría #${id}`
    );
  }

  // ==========================================
  // 4. REGISTRAR TICKET
  // ==========================================

  async function registrarTicket(datos) {
    if (guardando) return;

    setGuardando(true);
    setErrorModal("");

    try {
      await crearTicket(token, datos);

      setModalNuevo(false);
      setMensaje("Ticket registrado correctamente.");
      actualizar();
    } catch (err) {
      setErrorModal(
        err.message || "No fue posible registrar el ticket."
      );
    } finally {
      setGuardando(false);
    }
  }

  // ==========================================
  // 5. ASIGNAR O REASIGNAR TÉCNICO
  // ==========================================

  async function confirmarAsignacion(tecnicoId) {
    if (!ticketAsignar || asignando) return;

    setAsignando(true);
    setErrorAsignacion("");

    try {
      await asignarTecnicoTicket(token, ticketAsignar.id, tecnicoId);
      setTicketAsignar(null);
      setMensaje("Técnico asignado correctamente.");
      actualizar();
    } catch (err) {
      setErrorAsignacion(
        err instanceof Error
          ? err.message
          : "No fue posible asignar el técnico."
      );
    } finally {
      setAsignando(false);
    }
  }

  // ==========================================
  // 5.1. OBTENER TÉCNICO ASIGNADO
  // ==========================================

  function obtenerTecnicoAsignado(tecnicoId) {
    if (!tecnicoId) return null;

    return (
      tecnicos.find(
        (tecnico) => Number(tecnico.id) === Number(tecnicoId)
      ) || null
    );
  }

  // ==========================================
  // 5.2. TRANSICIONES PERMITIDAS
  // ==========================================

  function obtenerTransicionesPermitidas(ticket) {
    if (!ticket) return [];

    const opciones = TRANSICIONES_TICKETS[ticket.estado] || [];

    if (esAdministrador) {
      return opciones;
    }

    if (rolActual === "tecnico") {
      return opciones.filter((estado) =>
        ["en_proceso", "resuelto"].includes(estado)
      );
    }

    return [];
  }

  // ==========================================
  // 5.3. CAMBIAR ESTADO DEL TICKET
  // ==========================================

  async function confirmarCambioEstado(datos) {
    if (!ticketCambiarEstado || cambiandoEstado) return;

    setCambiandoEstado(true);
    setErrorCambioEstado("");

    try {
      await cambiarEstadoTicket(
        token,
        ticketCambiarEstado.id,
        datos.estado,
        datos.solucion
      );

      setTicketCambiarEstado(null);
      setMensaje("Estado del ticket actualizado correctamente.");
      actualizar();
    } catch (err) {
      setErrorCambioEstado(
        err instanceof Error
          ? err.message
          : "No fue posible actualizar el estado."
      );
    } finally {
      setCambiandoEstado(false);
    }
  }

  // ==========================================
  // 6. INTERFAZ
  // ==========================================

  return (
    <div className="container-fluid px-0">
      {/* ENCABEZADO DE PÁGINA */}
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <div className="small text-secondary mb-1 fw-medium">
            Inicio / Mesa de Ayuda / Gestión de Tickets
          </div>

          <h1 className="h3 fw-bold mb-1 d-flex align-items-center gap-2">
            <IconTickets size={26} className="text-primary" />
            <span>Gestión de Tickets</span>
          </h1>

          <p className="text-secondary mb-0 small">
            Registra, clasifica, asigna y da seguimiento ágil a incidentes de soporte técnico.
          </p>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
            onClick={actualizar}
            disabled={cargando}
          >
            <IconRefresh size={16} className={cargando ? "spin" : ""} />
            <span>Actualizar</span>
          </button>

          {puedeCrear && (
            <button
              type="button"
              className="btn btn-primary d-inline-flex align-items-center gap-2"
              onClick={() => {
                setErrorModal("");
                setModalNuevo(true);
              }}
              disabled={cargando}
            >
              <IconPlus size={16} />
              <span>Nuevo ticket</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger border-0 shadow-sm rounded-3" role="alert">
          {error}
        </div>
      )}

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
            aria-label="Cerrar mensaje"
            onClick={() => setMensaje("")}
          />
        </div>
      )}

      {/* INDICADORES CLAVE (KPIs RÁPIDOS) */}
      <div className="row g-3 mb-4">
        {[
          {
            titulo: "Total Visibles",
            valor: tickets.length,
            color: "#2563eb",
          },
          {
            titulo: "Abiertos",
            valor: tickets.filter((t) => t.estado === "abierto").length,
            color: "#3b82f6",
          },
          {
            titulo: "En Proceso",
            valor: tickets.filter((t) => t.estado === "en_proceso").length,
            color: "#f59e0b",
          },
          {
            titulo: "Resueltos",
            valor: tickets.filter((t) => t.estado === "resuelto").length,
            color: "#10b981",
          },
        ].map((item) => (
          <div className="col-6 col-xl-3" key={item.titulo}>
            <div
              className="card solvix-card solvix-kpi-card border-0 shadow-sm h-100"
              style={{ "--kpi-color": item.color }}
            >
              <div className="card-body p-3">
                <span className="small text-secondary fw-medium">
                  {item.titulo}
                </span>

                <div className="h3 fw-bold mb-0 mt-1">
                  {item.valor}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* TABLA PRINCIPAL Y FILTROS */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-4">
          <div className="row g-3 mb-3">
            <div className="col-md-8">
              <label
                htmlFor="buscar-ticket"
                className="form-label small fw-semibold text-secondary mb-1"
              >
                Búsqueda Rápida
              </label>

              <div className="position-relative">
                <input
                  id="buscar-ticket"
                  className="form-control ps-4"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Filtrar por ID, título, descripción, prioridad..."
                />
                <div
                  className="position-absolute top-50 start-0 translate-middle-y ps-2 text-secondary opacity-50"
                  style={{ pointerEvents: "none" }}
                >
                  <IconSearch size={15} />
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <label
                htmlFor="filtro-ticket"
                className="form-label small fw-semibold text-secondary mb-1"
              >
                Filtrar por Estado
              </label>

              <select
                id="filtro-ticket"
                className="form-select"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                {ESTADOS.map(([valor, etiqueta]) => (
                  <option key={valor} value={valor}>
                    {etiqueta}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: 80 }}>ID</th>
                  <th>Solicitud & Resumen</th>
                  <th>Categoría</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th>Especialista</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {cargando && (
                  <tr>
                    <td colSpan={7} className="text-center py-5">
                      <div className="d-flex flex-column align-items-center gap-2">
                        <div
                          className="spinner-border spinner-border-sm text-primary"
                          role="status"
                        />
                        <span className="small text-secondary">
                          Cargando tickets de la plataforma...
                        </span>
                      </div>
                    </td>
                  </tr>
                )}

                {!cargando &&
                  filtrados.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>
                        <span className="badge bg-body-secondary text-secondary-emphasis font-monospace fw-semibold">
                          #{ticket.id}
                        </span>
                      </td>

                      <td>
                        <div className="fw-semibold text-truncate" style={{ maxWidth: 320 }}>
                          {ticket.titulo}
                        </div>
                        <div
                          className="small text-secondary text-truncate"
                          style={{ maxWidth: 320, fontSize: "0.8rem" }}
                        >
                          {ticket.descripcion}
                        </div>
                      </td>

                      <td>
                        <span className="badge bg-body-tertiary text-body border small">
                          {nombreCategoria(ticket.categoria_id)}
                        </span>
                      </td>

                      <td>
                        <span className={`badge ${clasePrioridad(ticket.prioridad)} text-capitalize`}>
                          {ticket.prioridad}
                        </span>
                      </td>

                      <td>
                        <span className={claseEstado(ticket.estado)}>
                          {nombreEstado(ticket.estado)}
                        </span>
                      </td>

                      <td>
                        {ticket.tecnico_id ? (
                          (() => {
                            const tecnico = obtenerTecnicoAsignado(
                              ticket.tecnico_id
                            );

                            if (!tecnico) {
                              return (
                                <span className="text-secondary small">
                                  Técnico #{ticket.tecnico_id}
                                </span>
                              );
                            }

                            return (
                              <div>
                                <div className="fw-semibold small">
                                  {tecnico.nombre} {tecnico.apellido}
                                </div>
                                <div className="text-secondary" style={{ fontSize: "0.75rem" }}>
                                  {tecnico.especialidad || "General"}
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          <span className="text-secondary small fst-italic">
                            Sin asignar
                          </span>
                        )}
                      </td>

                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-1 flex-wrap">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                            onClick={() => setTicketDetalle(ticket)}
                            title="Ver detalle completo"
                          >
                            <IconEye size={13} />
                            <span>Detalle</span>
                          </button>

                          {esAdministrador &&
                            ["abierto", "asignado", "reabierto"].includes(
                              ticket.estado
                            ) && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1"
                                onClick={() => {
                                  setErrorAsignacion("");
                                  setTicketAsignar(ticket);
                                }}
                                title="Asignar especialista técnico"
                              >
                                <IconTecnicos size={13} />
                                <span>{ticket.tecnico_id ? "Reasignar" : "Asignar"}</span>
                              </button>
                            )}

                          {obtenerTransicionesPermitidas(ticket).length > 0 && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                              onClick={() => {
                                setErrorCambioEstado("");
                                setTicketCambiarEstado(ticket);
                              }}
                              title="Gestionar estado del ticket"
                            >
                              <span>Estado</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                {!cargando && filtrados.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-secondary py-5">
                      <div className="d-flex flex-column align-items-center gap-2">
                        <IconSearch size={28} className="opacity-25" />
                        <span className="fw-medium">No se encontraron tickets</span>
                        <small className="opacity-75">
                          Prueba ajustando los términos de búsqueda o el filtro de estado.
                        </small>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="small text-secondary mt-3 d-flex justify-content-between align-items-center">
            <span>
              Mostrando <strong>{filtrados.length}</strong> de <strong>{tickets.length}</strong> solicitudes.
            </span>
            <span className="badge solvix-badge solvix-badge-abierto">
              SOLVIX Ticket Desk
            </span>
          </div>
        </div>
      </div>

      {/* MODAL REGISTRO DE TICKET */}
      {modalNuevo && (
        <ModalNuevoTicket
          categorias={categoriasActivas}
          guardando={guardando}
          error={errorModal}
          onGuardar={registrarTicket}
          onCerrar={() => {
            if (!guardando) {
              setModalNuevo(false);
              setErrorModal("");
            }
          }}
        />
      )}

      {/* MODAL ASIGNACIÓN DE TÉCNICO */}
      {ticketAsignar && (
        <ModalAsignarTecnico
          key={ticketAsignar.id}
          ticket={ticketAsignar}
          tecnicos={tecnicos}
          guardando={asignando}
          error={errorAsignacion}
          onGuardar={confirmarAsignacion}
          onCerrar={() => {
            if (!asignando) {
              setTicketAsignar(null);
              setErrorAsignacion("");
            }
          }}
        />
      )}

      {/* MODAL CAMBIO DE ESTADO */}
      {ticketCambiarEstado && (
        <ModalEstadoTicket
          key={ticketCambiarEstado.id}
          ticket={ticketCambiarEstado}
          transiciones={obtenerTransicionesPermitidas(ticketCambiarEstado)}
          guardando={cambiandoEstado}
          error={errorCambioEstado}
          onGuardar={confirmarCambioEstado}
          onCerrar={() => {
            if (!cambiandoEstado) {
              setTicketCambiarEstado(null);
              setErrorCambioEstado("");
            }
          }}
        />
      )}

      {/* MODAL DETALLE DE TICKET */}
      {ticketDetalle && (
        <>
          <div
            className="modal d-block"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-detalle-ticket"
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
                <div className="modal-header d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-body-secondary text-body font-monospace fw-bold fs-6">
                      #{ticketDetalle.id}
                    </span>
                    <h2 id="titulo-detalle-ticket" className="modal-title h5 fw-bold mb-0">
                      Detalle del Incidente
                    </h2>
                  </div>

                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar modal"
                    onClick={() => setTicketDetalle(null)}
                  />
                </div>

                <div className="modal-body p-4">
                  <div className="mb-4">
                    <h3 className="h5 fw-bold mb-2">
                      {ticketDetalle.titulo}
                    </h3>

                    <div className="p-3 rounded-3 bg-body-tertiary border">
                      <span className="small text-secondary fw-semibold d-block mb-1">
                        DESCRIPCIÓN DEL REQUERIMIENTO
                      </span>
                      <p className="mb-0 text-break" style={{ whiteSpace: "pre-wrap" }}>
                        {ticketDetalle.descripcion}
                      </p>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="p-3 rounded-3 border bg-body-tertiary">
                        <span className="small text-secondary d-block mb-1">
                          Nivel de Prioridad
                        </span>
                        <span className={`badge ${clasePrioridad(ticketDetalle.prioridad)} text-capitalize`}>
                          {ticketDetalle.prioridad}
                        </span>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="p-3 rounded-3 border bg-body-tertiary">
                        <span className="small text-secondary d-block mb-1">
                          Estado Actual
                        </span>
                        <span className={claseEstado(ticketDetalle.estado)}>
                          {nombreEstado(ticketDetalle.estado)}
                        </span>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="p-3 rounded-3 border bg-body-tertiary">
                        <span className="small text-secondary d-block mb-1">
                          Categoría Asignada
                        </span>
                        <span className="fw-semibold">
                          {nombreCategoria(ticketDetalle.categoria_id)}
                        </span>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="p-3 rounded-3 border bg-body-tertiary">
                        <span className="small text-secondary d-block mb-1">
                          Especialista Técnico
                        </span>
                        {ticketDetalle.tecnico_id ? (
                          (() => {
                            const tecnico = obtenerTecnicoAsignado(
                              ticketDetalle.tecnico_id
                            );

                            return tecnico ? (
                              <div>
                                <div className="fw-semibold">
                                  {tecnico.nombre} {tecnico.apellido}
                                </div>
                                <div className="small text-secondary">
                                  {tecnico.especialidad || "Soporte general"}
                                </div>
                              </div>
                            ) : (
                              <span className="text-secondary">
                                Técnico #{ticketDetalle.tecnico_id}
                              </span>
                            );
                          })()
                        ) : (
                          <span className="text-secondary fst-italic">
                            Sin asignar
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {ticketDetalle.solucion && (
                    <div className="alert alert-success border-0 shadow-sm mt-4 mb-0 rounded-3">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <IconCheck size={18} />
                        <strong>Solución Oficial Aplicada</strong>
                      </div>
                      <p
                        className="mb-0 mt-2 text-break"
                        style={{ whiteSpace: "pre-wrap" }}
                      >
                        {ticketDetalle.solucion}
                      </p>
                    </div>
                  )}
                </div>

                <div className="modal-footer bg-body-tertiary">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setTicketDetalle(null)}
                  >
                    Cerrar Detalle
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-backdrop show" style={{ zIndex: 1055 }} />
        </>
      )}
    </div>
  );
}
