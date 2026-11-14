import { useCallback, useEffect, useMemo, useState } from "react";

import ModalNuevoUsuario from "../components/ModalNuevoUsuario";
import CredencialTemporal from "../components/CredencialTemporal";
import ModalEditarUsuario from "../components/ModalEditarUsuario";
import ModalEstadoUsuario from "../components/ModalEstadoUsuario";
import ModalRestablecerPassword from "../components/ModalRestablecerPassword";
import {
  IconUsuarios,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconEdit,
  IconLock,
  IconCheck,
} from "../components/Iconos";

import { useAuth } from "../hooks/useAuth";

import {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  cambiarEstadoUsuario,
  restablecerPasswordUsuario,
} from "../services/usuarios.service";

// =====================================================
// 1. FUNCIONES AUXILIARES
// =====================================================

function extraerUsuarios(datos) {
  if (Array.isArray(datos)) return datos;
  if (Array.isArray(datos?.usuarios)) return datos.usuarios;
  if (Array.isArray(datos?.data)) return datos.data;

  if (Array.isArray(datos?.data?.usuarios)) {
    return datos.data.usuarios;
  }

  throw new Error(
    "El formato de respuesta de /api/usuarios no coincide con los formatos admitidos."
  );
}

function obtenerNombre(usuario) {
  return (
    [usuario.nombre, usuario.apellido].filter(Boolean).join(" ") ||
    usuario.nombre_completo ||
    "Sin nombre"
  );
}

function obtenerRol(usuario) {
  return usuario.rol?.nombre || usuario.rol || "Sin rol";
}

function obtenerEstado(usuario) {
  if (usuario.activo === true) return "activo";
  if (usuario.activo === false) return "inactivo";
  return "desconocido";
}

// =====================================================
// 2. COMPONENTE PRINCIPAL
// =====================================================

export default function Usuarios() {
  const { token, usuario: usuarioActual } = useAuth();

  // Estados del listado
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Búsqueda y filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  // Recarga
  const [recarga, setRecarga] = useState(0);

  // Registro
  const [modalNuevo, setModalNuevo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorRegistro, setErrorRegistro] = useState("");
  const [credencialCreada, setCredencialCreada] = useState(null);

  // Edición y cambio de estado
  const [usuarioEditar, setUsuarioEditar] = useState(null);
  const [usuarioEstado, setUsuarioEstado] = useState(null);

  const [procesando, setProcesando] = useState(false);
  const [errorOperacion, setErrorOperacion] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  // Restablecimiento de contraseña
  const [usuarioRestablecer, setUsuarioRestablecer] = useState(null);
  const [restableciendo, setRestableciendo] = useState(false);
  const [errorRestablecimiento, setErrorRestablecimiento] = useState("");

  // =====================================================
  // 3. CONSULTAR USUARIOS
  // =====================================================

  useEffect(() => {
    const controlador = new AbortController();

    async function cargar() {
      try {
        const datos = await listarUsuarios(token, controlador.signal);
        const lista = extraerUsuarios(datos);

        if (!controlador.signal.aborted) {
          setUsuarios(lista);
          setError("");
        }
      } catch (err) {
        if (!controlador.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "No fue posible consultar los usuarios."
          );
          setUsuarios([]);
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      }
    }

    cargar();

    return () => controlador.abort();
  }, [token, recarga]);

  // =====================================================
  // 4. NOTIFICACIONES DE ÉXITO
  // =====================================================

  useEffect(() => {
    if (!mensajeExito) return;

    const temporizador = setTimeout(() => {
      setMensajeExito("");
    }, 4000);

    return () => clearTimeout(temporizador);
  }, [mensajeExito]);

  // =====================================================
  // 5. ACTUALIZAR LISTADO
  // =====================================================

  const actualizar = useCallback(() => {
    setCargando(true);
    setRecarga((valor) => valor + 1);
  }, []);

  // =====================================================
  // 6. REGISTRAR USUARIO
  // =====================================================

  async function registrarUsuario(datosFormulario) {
    if (guardando) return;

    setGuardando(true);
    setErrorRegistro("");

    try {
      const resultado = await crearUsuario(token, datosFormulario);

      setModalNuevo(false);
      setCredencialCreada(resultado);
      setMensajeExito("Usuario registrado correctamente en SOLVIX.");
      actualizar();
    } catch (err) {
      setErrorRegistro(
        err instanceof Error
          ? err.message
          : "No fue posible registrar el usuario."
      );
    } finally {
      setGuardando(false);
    }
  }

  // =====================================================
  // 7. EDITAR USUARIO
  // =====================================================

  function abrirEdicion(usuario) {
    setErrorOperacion("");
    setUsuarioEditar(usuario);
  }

  async function guardarEdicion(id, datosFormulario) {
    if (procesando) return;

    setProcesando(true);
    setErrorOperacion("");

    try {
      await actualizarUsuario(token, id, datosFormulario);

      setUsuarioEditar(null);
      setMensajeExito("Usuario actualizado correctamente.");
      actualizar();
    } catch (err) {
      setErrorOperacion(
        err instanceof Error
          ? err.message
          : "No fue posible actualizar el usuario."
      );
    } finally {
      setProcesando(false);
    }
  }

  // =====================================================
  // 8. CAMBIAR ESTADO
  // =====================================================

  function abrirCambioEstado(usuario) {
    setErrorOperacion("");
    setUsuarioEstado(usuario);
  }

  async function confirmarCambioEstado(id, nuevoEstado) {
    if (procesando) return;

    setProcesando(true);
    setErrorOperacion("");

    try {
      await cambiarEstadoUsuario(token, id, nuevoEstado);

      setUsuarioEstado(null);
      setMensajeExito(
        `Usuario ${nuevoEstado ? "reactivado" : "desactivado"} correctamente.`
      );
      actualizar();
    } catch (err) {
      setErrorOperacion(
        err instanceof Error
          ? err.message
          : "No fue posible modificar el estado."
      );
    } finally {
      setProcesando(false);
    }
  }

  // =====================================================
  // 9. RESTABLECER CONTRASEÑA
  // =====================================================

  function abrirRestablecimiento(usuario) {
    setErrorRestablecimiento("");
    setUsuarioRestablecer(usuario);
  }

  async function confirmarRestablecimiento(id) {
    if (restableciendo) return;

    setRestableciendo(true);
    setErrorRestablecimiento("");

    try {
      const respuesta = await restablecerPasswordUsuario(token, id);

      setUsuarioRestablecer(null);
      setCredencialCreada({
        email: respuesta.email || "Usuario",
        passwordTemporal: respuesta.passwordTemporal,
      });
      setMensajeExito("Contraseña restablecida correctamente.");
      actualizar();
    } catch (err) {
      setErrorRestablecimiento(
        err instanceof Error
          ? err.message
          : "No fue posible restablecer la contraseña."
      );
    } finally {
      setRestableciendo(false);
    }
  }

  // =====================================================
  // 10. ROLES Y FILTRADO
  // =====================================================

  const roles = useMemo(() => {
    const conjunto = new Set(
      usuarios.map((usuario) => obtenerRol(usuario)).filter(Boolean)
    );
    return Array.from(conjunto).sort();
  }, [usuarios]);

  const usuariosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return usuarios.filter((usuario) => {
      const contenido = [
        obtenerNombre(usuario),
        usuario.email,
        usuario.tipo_documento,
        usuario.numero_documento,
        obtenerRol(usuario),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        contenido.includes(texto) &&
        (filtroRol === "todos" || obtenerRol(usuario) === filtroRol) &&
        (filtroEstado === "todos" || obtenerEstado(usuario) === filtroEstado)
      );
    });
  }, [usuarios, busqueda, filtroRol, filtroEstado]);

  // =====================================================
  // 11. INTERFAZ
  // =====================================================

  return (
    <div className="container-fluid px-0">
      {/* ENCABEZADO */}
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <div className="text-secondary small mb-1 fw-medium">
            Inicio / Administración / Directorio de Usuarios
          </div>

          <h1 className="h3 fw-bold mb-1 d-flex align-items-center gap-2">
            <IconUsuarios size={26} className="text-primary" />
            <span>Gestión de Cuentas y Accesos</span>
          </h1>

          <p className="text-secondary mb-0 small">
            Consulta, filtra y administra los usuarios y roles en SOLVIX.
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
            onClick={() => {
              setErrorRegistro("");
              setModalNuevo(true);
            }}
          >
            <IconPlus size={16} />
            <span>Nuevo usuario</span>
          </button>
        </div>
      </div>

      {/* NOTIFICACIÓN DE ÉXITO */}
      {mensajeExito && (
        <div
          className="alert alert-success alert-dismissible fade show border-0 shadow-sm rounded-3 d-flex align-items-center justify-content-between"
          role="status"
        >
          <div className="d-flex align-items-center gap-2">
            <IconCheck size={18} />
            <span>{mensajeExito}</span>
          </div>

          <button
            type="button"
            className="btn-close"
            aria-label="Cerrar mensaje"
            onClick={() => setMensajeExito("")}
          />
        </div>
      )}

      {/* INDICADORES RÁPIDOS */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card solvix-card solvix-kpi-card border-0 shadow-sm rounded-4" style={{ "--kpi-color": "#2563eb" }}>
            <div className="card-body p-3">
              <span className="text-secondary small fw-medium">Usuarios Registrados</span>
              <div className="h3 fw-bold mt-1 mb-0">{usuarios.length}</div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card solvix-card solvix-kpi-card border-0 shadow-sm rounded-4" style={{ "--kpi-color": "#06b6d4" }}>
            <div className="card-body p-3">
              <span className="text-secondary small fw-medium">Resultados Filtrados</span>
              <div className="h3 fw-bold mt-1 mb-0">{usuariosFiltrados.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* DIRECTORIO DE USUARIOS */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <h2 className="h5 fw-bold mb-0">Directorio de Usuarios</h2>

            <span className="badge solvix-badge solvix-badge-abierto">
              Sesión actual: {obtenerRol(usuarioActual || {})}
            </span>
          </div>

          {/* BÚSQUEDA Y FILTROS */}
          <div className="row g-2 mb-3">
            <div className="col-lg-6">
              <div className="position-relative">
                <input
                  type="search"
                  className="form-control ps-4"
                  placeholder="Buscar por nombre, correo, documento o rol..."
                  aria-label="Buscar usuarios"
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

            <div className="col-lg-3">
              <select
                className="form-select"
                aria-label="Filtrar por rol"
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value)}
              >
                <option value="todos">Todos los roles</option>
                {roles.map((rol) => (
                  <option key={rol} value={rol}>
                    {rol}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-lg-3">
              <select
                className="form-select"
                aria-label="Filtrar por estado"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
                <option value="desconocido">No especificado</option>
              </select>
            </div>
          </div>

          {/* ERRORES DE CONSULTA */}
          {error && (
            <div className="alert alert-danger border-0 shadow-sm rounded-3 mb-3" role="alert">
              <strong>Error al consultar usuarios:</strong> {error}
            </div>
          )}

          {/* TABLA */}
          {cargando ? (
            <div className="text-center py-5" role="status">
              <div className="spinner-border spinner-border-sm text-primary mb-2" />
              <p className="text-secondary small mb-0">Consultando usuarios en SOLVIX API...</p>
            </div>
          ) : (
            !error && (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: 70 }}>ID</th>
                      <th>Nombre Completo</th>
                      <th>Documento</th>
                      <th>Correo Electrónico</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {usuariosFiltrados.map((usuario) => (
                      <tr key={usuario.id}>
                        <td>
                          <span className="badge bg-body-secondary text-body font-monospace fw-semibold">
                            #{usuario.id}
                          </span>
                        </td>

                        <td className="fw-semibold">
                          {obtenerNombre(usuario)}
                        </td>

                        <td>
                          {usuario.numero_documento ? (
                            <div>
                              <span className="fw-semibold small">
                                {usuario.numero_documento}
                              </span>
                              <div className="text-secondary" style={{ fontSize: "0.72rem" }}>
                                {usuario.tipo_documento || "Doc"}
                              </div>
                            </div>
                          ) : (
                            <span className="text-secondary">—</span>
                          )}
                        </td>

                        <td className="small text-secondary">
                          {usuario.email || "—"}
                        </td>

                        <td>
                          <span className="badge solvix-badge solvix-badge-abierto text-uppercase">
                            {obtenerRol(usuario)}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              obtenerEstado(usuario) === "activo"
                                ? "solvix-badge solvix-badge-resuelto"
                                : "solvix-badge solvix-badge-cerrado"
                            }
                          >
                            {obtenerEstado(usuario)}
                          </span>
                        </td>

                        <td className="text-end">
                          {(() => {
                            const rolActual = obtenerRol(usuarioActual || {});
                            const rolObjetivo = obtenerRol(usuario);

                            const puedeAdministrar =
                              rolActual === "superadmin" ||
                              (rolActual === "admin" &&
                                !["admin", "superadmin"].includes(rolObjetivo));

                            const esCuentaPropia =
                              usuarioActual?.id != null &&
                              String(usuario.id) === String(usuarioActual.id);

                            if (!puedeAdministrar) {
                              return (
                                <span className="text-secondary small fst-italic">
                                  Sin permisos
                                </span>
                              );
                            }

                            return (
                              <div className="d-flex justify-content-end gap-1 flex-wrap">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                                  onClick={() => abrirEdicion(usuario)}
                                  title="Editar usuario"
                                >
                                  <IconEdit size={13} />
                                  <span>Editar</span>
                                </button>

                                <button
                                  type="button"
                                  className={`btn btn-sm ${
                                    usuario.activo
                                      ? "btn-outline-danger"
                                      : "btn-outline-success"
                                  }`}
                                  onClick={() => abrirCambioEstado(usuario)}
                                  disabled={
                                    (esCuentaPropia && usuario.activo) ||
                                    typeof usuario.activo !== "boolean"
                                  }
                                  title={
                                    esCuentaPropia && usuario.activo
                                      ? "No puedes desactivar tu propia cuenta"
                                      : undefined
                                  }
                                >
                                  {usuario.activo ? "Desactivar" : "Reactivar"}
                                </button>

                                {!esCuentaPropia &&
                                  rolObjetivo !== "superadmin" &&
                                  (rolActual === "superadmin" ||
                                    (rolActual === "admin" &&
                                      ["tecnico", "usuario"].includes(
                                        rolObjetivo
                                      ))) && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-warning d-inline-flex align-items-center gap-1"
                                      onClick={() => abrirRestablecimiento(usuario)}
                                      disabled={!usuario.activo}
                                      title="Generar contraseña temporal"
                                    >
                                      <IconLock size={13} />
                                      <span>Restablecer</span>
                                    </button>
                                  )}
                              </div>
                            );
                          })()}
                        </td>
                      </tr>
                    ))}

                    {usuariosFiltrados.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center text-secondary py-5 small">
                          No se encontraron usuarios coincidentes.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>

      {/* MODALES ASOCIADOS */}
      <ModalNuevoUsuario
        abierto={modalNuevo}
        rolActual={obtenerRol(usuarioActual || {})}
        guardando={guardando}
        error={errorRegistro}
        onGuardar={registrarUsuario}
        onCerrar={() => {
          if (!guardando) {
            setModalNuevo(false);
            setErrorRegistro("");
          }
        }}
      />

      <CredencialTemporal
        resultado={credencialCreada}
        onCerrar={() => setCredencialCreada(null)}
      />

      {usuarioEditar && (
        <ModalEditarUsuario
          key={usuarioEditar.id}
          usuario={usuarioEditar}
          guardando={procesando}
          error={errorOperacion}
          onGuardar={guardarEdicion}
          onCerrar={() => {
            if (!procesando) {
              setUsuarioEditar(null);
              setErrorOperacion("");
            }
          }}
        />
      )}

      {usuarioEstado && (
        <ModalEstadoUsuario
          usuario={usuarioEstado}
          guardando={procesando}
          error={errorOperacion}
          onConfirmar={confirmarCambioEstado}
          onCerrar={() => {
            if (!procesando) {
              setUsuarioEstado(null);
              setErrorOperacion("");
            }
          }}
        />
      )}

      {usuarioRestablecer && (
        <ModalRestablecerPassword
          usuario={usuarioRestablecer}
          procesando={restableciendo}
          error={errorRestablecimiento}
          onConfirmar={confirmarRestablecimiento}
          onCerrar={() => {
            if (!restableciendo) {
              setUsuarioRestablecer(null);
              setErrorRestablecimiento("");
            }
          }}
        />
      )}
    </div>
  );
}
