import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "../hooks/useAuth";
import ModalCategoria from "../components/ModalCategoria";
import {
  IconCategorias,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconEdit,
  IconCheck,
} from "../components/Iconos";

import {
  listarCategorias,
  crearCategoria,
  actualizarCategoria,
  cambiarEstadoCategoria,
} from "../services/categorias.service";

export default function Categorias() {
  const { token } = useAuth();

  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todas");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaEditar, setCategoriaEditar] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState("");

  const [procesandoId, setProcesandoId] = useState(null);
  const [recarga, setRecarga] = useState(0);

  const actualizar = useCallback(() => {
    setRecarga((anterior) => anterior + 1);
  }, []);

  // ============================================
  // 1. CONSULTAR CATEGORÍAS
  // ============================================

  useEffect(() => {
    const controlador = new AbortController();

    async function cargar() {
      try {
        const datos = await listarCategorias(
          token,
          controlador.signal
        );

        if (controlador.signal.aborted) return;

        if (!Array.isArray(datos)) {
          throw new Error("El servidor devolvió un formato inesperado.");
        }

        setCategorias(datos);
        setError("");
      } catch (err) {
        if (!controlador.signal.aborted) {
          setError(
            err.message || "No se pudieron consultar las categorías."
          );
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      }
    }

    if (token) {
      cargar();
    }

    return () => controlador.abort();
  }, [token, recarga]);

  // ============================================
  // 2. OCULTAR NOTIFICACIONES DE ÉXITO
  // ============================================

  useEffect(() => {
    if (!mensaje) return;

    const temporizador = setTimeout(() => {
      setMensaje("");
    }, 4000);

    return () => clearTimeout(temporizador);
  }, [mensaje]);

  // ============================================
  // 3. FILTRAR CATEGORÍAS
  // ============================================

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return categorias.filter((categoria) => {
      const contenido = [categoria.nombre, categoria.descripcion]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const coincideEstado =
        filtro === "todas" ||
        (filtro === "activas" && categoria.activa) ||
        (filtro === "inactivas" && !categoria.activa);

      return contenido.includes(texto) && coincideEstado;
    });
  }, [categorias, busqueda, filtro]);

  const activas = categorias.filter((categoria) => categoria.activa).length;
  const inactivas = categorias.length - activas;

  // ============================================
  // 4. ABRIR FORMULARIOS
  // ============================================

  function abrirNuevo() {
    setCategoriaEditar(null);
    setErrorModal("");
    setMensaje("");
    setModalAbierto(true);
  }

  function abrirEdicion(categoria) {
    setCategoriaEditar(categoria);
    setErrorModal("");
    setMensaje("");
    setModalAbierto(true);
  }

  // ============================================
  // 5. REGISTRAR O EDITAR
  // ============================================

  async function guardar(datos) {
    if (guardando) return;

    setGuardando(true);
    setErrorModal("");

    try {
      if (categoriaEditar) {
        await actualizarCategoria(token, categoriaEditar.id, datos);
        setMensaje("Categoría actualizada correctamente.");
      } else {
        await crearCategoria(token, datos);
        setMensaje("Categoría registrada correctamente.");
      }

      setModalAbierto(false);
      setCategoriaEditar(null);
      setCargando(true);
      actualizar();
    } catch (err) {
      setErrorModal(
        err.message || "No fue posible guardar la categoría."
      );
    } finally {
      setGuardando(false);
    }
  }

  // ============================================
  // 6. ACTIVAR O DESACTIVAR
  // ============================================

  async function alternarEstado(categoria) {
    if (procesandoId !== null) return;

    const nuevoEstado = !categoria.activa;

    const confirmado = window.confirm(
      `¿Deseas ${nuevoEstado ? "activar" : "desactivar"} la categoría "${categoria.nombre}"?`
    );

    if (!confirmado) return;

    setProcesandoId(categoria.id);
    setError("");
    setMensaje("");

    try {
      await cambiarEstadoCategoria(token, categoria.id, nuevoEstado);

      setMensaje(
        nuevoEstado
          ? "Categoría activada correctamente."
          : "Categoría desactivada correctamente."
      );

      setCargando(true);
      actualizar();
    } catch (err) {
      setError(
        err.message || "No fue posible actualizar el estado."
      );
    } finally {
      setProcesandoId(null);
    }
  }

  // ============================================
  // 7. INTERFAZ
  // ============================================

  return (
    <div className="container-fluid px-0">
      {/* ENCABEZADO */}
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <div className="small text-secondary mb-1 fw-medium">
            Inicio / Configuración / Categorías de Servicio
          </div>

          <h1 className="h3 fw-bold mb-1 d-flex align-items-center gap-2">
            <IconCategorias size={26} className="text-primary" />
            <span>Clasificación de Incidencias</span>
          </h1>

          <p className="text-secondary mb-0 small">
            Estructura las áreas de atención técnica para optimizar la asignación y los tiempos de resolución.
          </p>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
            onClick={() => {
              setCargando(true);
              actualizar();
            }}
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
            <span>Nueva categoría</span>
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
            titulo: "Categorías Registradas",
            valor: categorias.length,
            color: "#2563eb",
          },
          {
            titulo: "Categorías Activas",
            valor: activas,
            color: "#10b981",
          },
          {
            titulo: "Categorías Inactivas",
            valor: inactivas,
            color: "#64748b",
          },
        ].map((item) => (
          <div className="col-12 col-md-4" key={item.titulo}>
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

      {/* DIRECTORIO */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-4">
          <div className="row g-3 mb-3">
            <div className="col-md-8">
              <label htmlFor="buscar-categoria" className="form-label small fw-semibold text-secondary mb-1">
                Búsqueda Rápida
              </label>

              <div className="position-relative">
                <input
                  id="buscar-categoria"
                  className="form-control ps-4"
                  placeholder="Buscar por nombre o descripción..."
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
              <label htmlFor="filtro-categoria" className="form-label small fw-semibold text-secondary mb-1">
                Filtro de Estado
              </label>

              <select
                id="filtro-categoria"
                className="form-select"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              >
                <option value="todas">Todas las categorías</option>
                <option value="activas">Solo activas</option>
                <option value="inactivas">Solo inactivas</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>ID</th>
                  <th>Categoría</th>
                  <th>Descripción del Alcance</th>
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {cargando && (
                  <tr>
                    <td colSpan={5} className="text-center py-5">
                      <div className="spinner-border spinner-border-sm text-primary mb-2" role="status" />
                      <div className="small text-secondary">Consultando categorías en SOLVIX...</div>
                    </td>
                  </tr>
                )}

                {!cargando &&
                  filtradas.map((categoria) => (
                    <tr key={categoria.id}>
                      <td>
                        <span className="badge bg-body-secondary text-body font-monospace fw-semibold">
                          #{categoria.id}
                        </span>
                      </td>

                      <td className="fw-semibold">
                        {categoria.nombre}
                      </td>

                      <td className="text-secondary small" style={{ fontSize: "0.85rem" }}>
                        {categoria.descripcion || "Sin descripción detallada"}
                      </td>

                      <td>
                        <span
                          className={
                            categoria.activa
                              ? "solvix-badge solvix-badge-resuelto"
                              : "solvix-badge solvix-badge-cerrado"
                          }
                        >
                          {categoria.activa ? "Activa" : "Inactiva"}
                        </span>
                      </td>

                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-1 flex-wrap">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                            onClick={() => abrirEdicion(categoria)}
                          >
                            <IconEdit size={13} />
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            className={`btn btn-sm ${
                              categoria.activa
                                ? "btn-outline-danger"
                                : "btn-outline-success"
                            }`}
                            onClick={() => alternarEstado(categoria)}
                            disabled={procesandoId !== null}
                          >
                            {procesandoId === categoria.id
                              ? "Procesando..."
                              : categoria.activa
                              ? "Desactivar"
                              : "Activar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                {!cargando && filtradas.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-secondary py-5 small">
                      No se encontraron categorías con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="small text-secondary mt-3">
            Mostrando <strong>{filtradas.length}</strong> de <strong>{categorias.length}</strong> categorías configuradas.
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modalAbierto && (
        <ModalCategoria
          key={categoriaEditar?.id || "nueva"}
          categoria={categoriaEditar}
          guardando={guardando}
          error={errorModal}
          onGuardar={guardar}
          onCerrar={() => {
            if (!guardando) {
              setModalAbierto(false);
              setCategoriaEditar(null);
            }
          }}
        />
      )}
    </div>
  );
}
