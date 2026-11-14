import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "../hooks/useAuth";
import ModalTecnico from "../components/ModalTecnico";
import {
  IconTecnicos,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconEdit,
  IconCheck,
} from "../components/Iconos";

import { listarUsuarios } from "../services/usuarios.service";

import {
  listarTecnicos,
  crearTecnico,
  actualizarTecnico,
  cambiarDisponibilidadTecnico,
} from "../services/tecnicos.service";

// ============================================
// 1. FUNCIONES AUXILIARES
// ============================================

function extraerLista(datos, clave) {
  if (Array.isArray(datos)) return datos;
  if (Array.isArray(datos?.[clave])) return datos[clave];
  if (Array.isArray(datos?.data)) return datos.data;

  throw new Error(`Formato inesperado de ${clave}`);
}

function obtenerRol(usuario) {
  return usuario.rol?.nombre || usuario.rol || "";
}

// ============================================
// 2. COMPONENTE PRINCIPAL
// ============================================

export default function Tecnicos() {
  const { token } = useAuth();

  const [tecnicos, setTecnicos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [tecnicoEditar, setTecnicoEditar] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState("");
  const [procesandoId, setProcesandoId] = useState(null);

  const [recarga, setRecarga] = useState(0);

  const actualizar = useCallback(() => {
    setRecarga((anterior) => anterior + 1);
  }, []);

  // ============================================
  // 3. CONSULTAR TÉCNICOS Y USUARIOS
  // ============================================

  useEffect(() => {
    const controlador = new AbortController();

    async function cargar() {
      setCargando(true);

      try {
        const [datosTecnicos, datosUsuarios] = await Promise.all([
          listarTecnicos(token, controlador.signal),
          listarUsuarios(token, controlador.signal),
        ]);

        if (controlador.signal.aborted) return;

        setTecnicos(extraerLista(datosTecnicos, "tecnicos"));
        setUsuarios(extraerLista(datosUsuarios, "usuarios"));
        setError("");
      } catch (err) {
        if (!controlador.signal.aborted) {
          setError(err.message || "Error consultando técnicos");
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      }
    }

    if (token) cargar();

    return () => controlador.abort();
  }, [token, recarga]);

  // ============================================
  // 4. NOTIFICACIONES AUTOMÁTICAS
  // ============================================

  useEffect(() => {
    if (!mensaje) return;

    const temporizador = setTimeout(() => {
      setMensaje("");
    }, 4000);

    return () => clearTimeout(temporizador);
  }, [mensaje]);

  // ============================================
  // 5. USUARIOS ELEGIBLES
  // ============================================

  const usuariosDisponibles = useMemo(() => {
    const vinculados = new Set(
      tecnicos.map((tecnico) => Number(tecnico.usuario_id))
    );

    return usuarios.filter(
      (usuario) =>
        obtenerRol(usuario) === "tecnico" &&
        usuario.activo === true &&
        !vinculados.has(Number(usuario.id))
    );
  }, [usuarios, tecnicos]);

  // ============================================
  // 6. BÚSQUEDA Y FILTROS
  // ============================================

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return tecnicos.filter((tecnico) => {
      const contenido = [
        tecnico.nombre,
        tecnico.apellido,
        tecnico.email,
        tecnico.especialidad,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const coincideEstado =
        filtro === "todos" ||
        (filtro === "disponibles" && tecnico.disponible) ||
        (filtro === "no-disponibles" && !tecnico.disponible);

      return contenido.includes(texto) && coincideEstado;
    });
  }, [tecnicos, busqueda, filtro]);

  const disponibles = tecnicos.filter(
    (tecnico) => tecnico.disponible && tecnico.activo
  ).length;

  // ============================================
  // 7. FORMULARIOS
  // ============================================

  function abrirNuevo() {
    setErrorModal("");
    setTecnicoEditar(null);
    setModalAbierto(true);
  }

  function abrirEdicion(tecnico) {
    setErrorModal("");
    setTecnicoEditar(tecnico);
    setModalAbierto(true);
  }

  async function guardar(datos) {
    if (guardando) return;

    setGuardando(true);
    setErrorModal("");

    try {
      if (tecnicoEditar) {
        await actualizarTecnico(token, tecnicoEditar.id, datos);
        setMensaje("Perfil del técnico actualizado correctamente.");
      } else {
        await crearTecnico(token, datos);
        setMensaje("Perfil técnico registrado correctamente.");
      }

      setModalAbierto(false);
      setTecnicoEditar(null);
      actualizar();
    } catch (err) {
      setErrorModal(
        err.message || "No fue posible registrar la información."
      );
    } finally {
      setGuardando(false);
    }
  }

  // ============================================
  // 8. DISPONIBILIDAD
  // ============================================

  async function alternarDisponibilidad(tecnico) {
    if (procesandoId !== null) return;

    setProcesandoId(tecnico.id);

    try {
      await cambiarDisponibilidadTecnico(
        token,
        tecnico.id,
        !tecnico.disponible
      );

      setMensaje(
        `Disponibilidad de ${tecnico.nombre} actualizada.`
      );

      actualizar();
    } catch (err) {
      setError(
        err.message || "No fue posible actualizar disponibilidad"
      );
    } finally {
      setProcesandoId(null);
    }
  }

  // ============================================
  // 9. INTERFAZ
  // ============================================

  return (
    <div className="container-fluid px-0">
      {/* ENCABEZADO */}
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <div className="small text-secondary mb-1 fw-medium">
            Inicio / Administración / Personal Técnico
          </div>

          <h1 className="h3 fw-bold mb-1 d-flex align-items-center gap-2">
            <IconTecnicos size={26} className="text-primary" />
            <span>Especialistas de Soporte</span>
          </h1>

          <p className="text-secondary mb-0 small">
            Gestiona los perfiles de técnicos, asignaciones y estado de disponibilidad en tiempo real.
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

          <button
            type="button"
            className="btn btn-primary d-inline-flex align-items-center gap-2"
            onClick={abrirNuevo}
            disabled={cargando}
          >
            <IconPlus size={16} />
            <span>Nuevo técnico</span>
          </button>
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

      {/* INDICADORES */}
      <div className="row g-3 mb-4">
        {[
          {
            titulo: "Perfiles Registrados",
            valor: tecnicos.length,
            color: "#2563eb",
          },
          {
            titulo: "Disponibles y Activos",
            valor: disponibles,
            color: "#10b981",
          },
          {
            titulo: "No Disponibles",
            valor: tecnicos.filter((t) => !t.disponible).length,
            color: "#f59e0b",
          },
          {
            titulo: "Usuarios Elegibles",
            valor: usuariosDisponibles.length,
            color: "#06b6d4",
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

      {/* DIRECTORIO DE TÉCNICOS */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-4">
          <div className="row g-3 mb-3">
            <div className="col-md-8">
              <label className="form-label small fw-semibold text-secondary mb-1" htmlFor="buscar-tecnico">
                Búsqueda Rápida
              </label>

              <div className="position-relative">
                <input
                  id="buscar-tecnico"
                  className="form-control ps-4"
                  placeholder="Nombre, correo o especialidad..."
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
            </div>

            <div className="col-md-4">
              <label className="form-label small fw-semibold text-secondary mb-1" htmlFor="filtro-tecnico">
                Filtro de Disponibilidad
              </label>

              <select
                id="filtro-tecnico"
                className="form-select"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              >
                <option value="todos">Todos los técnicos</option>
                <option value="disponibles">Disponibles</option>
                <option value="no-disponibles">No disponibles</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>ID</th>
                  <th>Especialista</th>
                  <th>Especialidad</th>
                  <th>Cuenta de Acceso</th>
                  <th>Disponibilidad</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {!cargando &&
                  filtrados.map((tecnico) => (
                    <tr key={tecnico.id}>
                      <td>
                        <span className="badge bg-body-secondary text-body font-monospace fw-semibold">
                          #{tecnico.id}
                        </span>
                      </td>

                      <td>
                        <div className="fw-semibold">
                          {tecnico.nombre} {tecnico.apellido}
                        </div>
                        <div className="small text-secondary" style={{ fontSize: "0.8rem" }}>
                          {tecnico.email}
                        </div>
                      </td>

                      <td>
                        <span className="badge bg-body-tertiary text-body border small">
                          {tecnico.especialidad}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            tecnico.activo
                              ? "solvix-badge solvix-badge-resuelto"
                              : "solvix-badge solvix-badge-cerrado"
                          }
                        >
                          {tecnico.activo ? "Activa" : "Inactiva"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            tecnico.disponible
                              ? "solvix-badge solvix-badge-abierto"
                              : "solvix-badge solvix-badge-cerrado"
                          }
                        >
                          {tecnico.disponible ? "Disponible" : "Ocupado / No disp."}
                        </span>
                      </td>

                      <td className="text-end">
                        <div className="d-flex justify-content-end flex-wrap gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                            onClick={() => abrirEdicion(tecnico)}
                          >
                            <IconEdit size={13} />
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            className={`btn btn-sm ${
                              tecnico.disponible
                                ? "btn-outline-warning"
                                : "btn-outline-success"
                            }`}
                            onClick={() => alternarDisponibilidad(tecnico)}
                            disabled={procesandoId !== null}
                          >
                            {procesandoId === tecnico.id
                              ? "Procesando..."
                              : tecnico.disponible
                              ? "Poner no disponible"
                              : "Habilitar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                {!cargando && filtrados.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-secondary py-5 small">
                      No se encontraron perfiles técnicos coincidentes.
                    </td>
                  </tr>
                )}

                {cargando && (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <div className="spinner-border spinner-border-sm text-primary mb-2" role="status" />
                      <div className="small text-secondary">Consultando personal técnico...</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="small text-secondary mt-3">
            Mostrando <strong>{filtrados.length}</strong> de <strong>{tecnicos.length}</strong> perfiles especializados.
          </div>
        </div>
      </div>

      {/* MODAL ASOCIADO */}
      {modalAbierto && (
        <ModalTecnico
          key={tecnicoEditar?.id || "nuevo"}
          tecnico={tecnicoEditar}
          usuariosDisponibles={usuariosDisponibles}
          guardando={guardando}
          error={errorModal}
          onGuardar={guardar}
          onCerrar={() => {
            if (!guardando) {
              setModalAbierto(false);
              setTecnicoEditar(null);
            }
          }}
        />
      )}
    </div>
  );
}
