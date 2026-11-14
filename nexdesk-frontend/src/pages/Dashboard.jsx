import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { menuPorRol } from "../config/menu";
import ToastBienvenida from "../components/ToastBienvenida";

import FlujoTickets from "../components/FlujoTickets";
import AnaliticaTickets from "../components/AnaliticaTickets";
import { listarTickets } from "../services/tickets.service";
import {
  IconUsuarios,
  IconTecnicos,
  IconCategorias,
  IconTickets,
  IconSeguimientos,
  IconLock,
  IconChevronRight,
  IconShield,
} from "../components/Iconos";

function obtenerIconoModulo(ruta, iconoOriginal) {
  switch (ruta) {
    case "/usuarios":
      return <IconUsuarios size={24} />;
    case "/tecnicos":
      return <IconTecnicos size={24} />;
    case "/categorias":
      return <IconCategorias size={24} />;
    case "/tickets":
      return <IconTickets size={24} />;
    case "/seguimientos":
      return <IconSeguimientos size={24} />;
    default:
      return <span>{iconoOriginal}</span>;
  }
}

export default function Dashboard() {
  const { usuario, token } = useAuth();
  const [ticketsAnalitica, setTicketsAnalitica] = useState([]);
  const [cargandoAnalitica, setCargandoAnalitica] = useState(true);
  const [errorAnalitica, setErrorAnalitica] = useState("");
  const [recargaAnalitica, setRecargaAnalitica] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }
    const controlador = new AbortController();
    async function cargarAnalitica() {
      setCargandoAnalitica(true);
      try {
        const datos = await listarTickets(
          token,
          "todos",
          controlador.signal
        );
        if (!Array.isArray(datos))
          throw new Error("El servidor no devolvió una lista de tickets.");
        if (!controlador.signal.aborted) {
          setTicketsAnalitica(datos);
          setErrorAnalitica("");
        }
      } catch (err) {
        if (!controlador.signal.aborted)
          setErrorAnalitica(
            err instanceof Error ? err.message : "Error de consulta"
          );
      } finally {
        if (!controlador.signal.aborted) setCargandoAnalitica(false);
      }
    }
    cargarAnalitica();
    return () => controlador.abort();
  }, [token, recargaAnalitica]);

  const [mostrarBienvenida, setMostrarBienvenida] = useState(
    () => sessionStorage.getItem("nexdesk_mostrar_bienvenida") === "1"
  );

  const cerrarBienvenida = useCallback(() => {
    sessionStorage.removeItem("nexdesk_mostrar_bienvenida");
    setMostrarBienvenida(false);
  }, []);

  const nombre = usuario?.nombre?.split(" ")[0] || "usuario";
  const opciones = menuPorRol(usuario?.rol);
  const modulos = opciones.filter((opcion) => opcion.ruta !== "/dashboard");

  const descripciones = {
    "/usuarios": "Administración centralizada de cuentas y permisos.",
    "/tecnicos": "Gestión de especialistas y disponibilidad.",
    "/categorias": "Clasificación inteligente de incidencias.",
    "/tickets": "Registro, escalamiento y resolución de tickets.",
    "/seguimientos": "Trazabilidad completa de las intervenciones.",
  };

  return (
    <div className="container-fluid px-0">
      {/* HEADER DE BIENVENIDA */}
      <div className="mb-4">
        <div className="text-secondary small mb-1 fw-medium">
          Inicio / Panel de Control
        </div>

        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div>
            <h1 className="h3 fw-bold mb-1">
              ¡Hola, {nombre}! 👋
            </h1>
            <p className="text-secondary mb-0">
              Bienvenido al centro de operaciones de <strong>SOLVIX</strong>. Soluciones rápidas y eficientes.
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge solvix-badge solvix-badge-resuelto">
              <span className="solvix-online-dot m-0" />
              <span>Sistema Operativo 100%</span>
            </span>
          </div>
        </div>
      </div>

      {/* TARJETA DE USUARIO AUTENTICADO */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
        <div
          style={{
            height: 4,
            background: "linear-gradient(90deg, #2563EB 0%, #06B6D4 100%)",
          }}
        />
        <div className="card-body p-4">
          <div className="row align-items-center g-3">
            <div className="col-md-8">
              <div className="d-flex align-items-center gap-2 text-secondary small mb-2 fw-semibold">
                <IconShield size={14} className="text-primary" />
                <span>CUENTA AUTENTICADA</span>
              </div>

              <h2 className="h4 fw-bold mb-1">
                {[usuario?.nombre, usuario?.apellido].filter(Boolean).join(" ")}
              </h2>

              <p className="text-secondary mb-2 small">
                {usuario?.email}
              </p>

              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span className="badge solvix-badge solvix-badge-abierto text-uppercase">
                  {usuario?.rol}
                </span>
                <span className="text-secondary small" style={{ fontSize: "0.78rem" }}>
                  Sesión activa y verificada
                </span>
              </div>
            </div>

            <div className="col-md-4 text-md-end">
              <Link
                to="/cambiar-password"
                className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
              >
                <IconLock size={16} />
                <span>Seguridad de mi cuenta</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ANALÍTICA Y REPORTES */}
      <AnaliticaTickets
        tickets={ticketsAnalitica}
        cargando={cargandoAnalitica}
        error={errorAnalitica}
        onActualizar={() => setRecargaAnalitica((n) => n + 1)}
      />

      {/* MÓDULOS DEL SISTEMA */}
      <div className="d-flex align-items-center justify-content-between mb-3 mt-4">
        <div>
          <h2 className="h5 fw-bold mb-0">
            Módulos del Sistema
          </h2>
          <small className="text-secondary">Accesos directos según tu nivel de autorización</small>
        </div>
      </div>

      <div className="row g-3">
        {modulos.map((modulo) => (
          <div className="col-12 col-md-6 col-xl-4" key={modulo.ruta}>
            <Link to={modulo.ruta} className="text-decoration-none text-reset">
              <div className="card solvix-card solvix-card-interactive nexdesk-module-card h-100 border-0 shadow-sm rounded-4">
                <div className="card-body p-4 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="solvix-avatar nexdesk-module-icon">
                        {obtenerIconoModulo(modulo.ruta, modulo.icono)}
                      </div>
                      <IconChevronRight size={18} className="text-secondary opacity-50" />
                    </div>

                    <h3 className="h6 fw-bold mb-2">
                      {modulo.titulo}
                    </h3>

                    <p className="text-secondary small mb-3">
                      {descripciones[modulo.ruta]}
                    </p>
                  </div>

                  <span className="small fw-semibold text-primary d-inline-flex align-items-center gap-1">
                    <span>Acceder al módulo</span>
                    <span>→</span>
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* FLUJO DE TRABAJO */}
      <div className="card border-0 shadow-sm rounded-4 mt-4 p-3 p-md-4">
        <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
          <div>
            <h3 className="h6 fw-bold mb-1">
              Flujo Operativo de Incidentes
            </h3>
            <p className="text-secondary small mb-0">
              Ciclo de vida estándar de atención de tickets en SOLVIX
            </p>
          </div>
          <span className="badge solvix-badge solvix-badge-abierto">
            Metodología Ágil
          </span>
        </div>
        <FlujoTickets />
      </div>

      {mostrarBienvenida && (
        <ToastBienvenida nombre={nombre} onCerrar={cerrarBienvenida} />
      )}
    </div>
  );
}
