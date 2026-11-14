import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { menuPorRol } from "../config/menu";
import {
  SolvixLogo,
  IconDashboard,
  IconUsuarios,
  IconTecnicos,
  IconCategorias,
  IconTickets,
  IconSeguimientos,
  IconChevronRight,
} from "./Iconos";

function obtenerIconoRuta(ruta, iconoOriginal) {
  switch (ruta) {
    case "/dashboard":
      return <IconDashboard size={19} />;
    case "/usuarios":
      return <IconUsuarios size={19} />;
    case "/tecnicos":
      return <IconTecnicos size={19} />;
    case "/categorias":
      return <IconCategorias size={19} />;
    case "/tickets":
      return <IconTickets size={19} />;
    case "/seguimientos":
      return <IconSeguimientos size={19} />;
    default:
      return <span>{iconoOriginal}</span>;
  }
}

export default function Sidebar({ abierto, cerrar }) {
  const { usuario } = useAuth();
  const opciones = menuPorRol(usuario?.rol);

  return (
    <>
      {abierto && (
        <button
          type="button"
          className="solvix-overlay nexdesk-overlay"
          onClick={cerrar}
          aria-label="Cerrar menú de navegación"
        />
      )}

      <aside
        className={`solvix-sidebar nexdesk-sidebar ${abierto ? "abierto" : ""}`}
        aria-label="Navegación principal"
      >
        {/* BRANDING SOLVIX */}
        <div className="solvix-sidebar-brand nexdesk-sidebar-brand">
          <SolvixLogo size={36} showText={true} showSlogan={true} />
        </div>

        {/* ETIQUETA SECCIÓN */}
        <div className="solvix-sidebar-label nexdesk-sidebar-label">
          <span>PLATAFORMA</span>
        </div>

        {/* LISTADO DE NAVEGACIÓN */}
        <nav className="solvix-sidebar-nav nexdesk-sidebar-nav">
          {opciones.map((opcion) => (
            <NavLink
              key={opcion.ruta}
              to={opcion.ruta}
              onClick={cerrar}
              className={({ isActive }) =>
                `solvix-nav-link nexdesk-nav-link ${isActive ? "activo" : ""}`
              }
            >
              <span className="solvix-nav-icon nexdesk-nav-icon">
                {obtenerIconoRuta(opcion.ruta, opcion.icono)}
              </span>
              <span className="flex-grow-1">{opcion.titulo}</span>
              <IconChevronRight size={14} className="opacity-50" />
            </NavLink>
          ))}
        </nav>

        {/* PIE DE SIDEBAR CON INDICADOR ACTIVO */}
        <div className="solvix-sidebar-footer nexdesk-sidebar-footer">
          <div className="d-flex align-items-center mb-1">
            <span className="solvix-online-dot nexdesk-online-dot" />
            <span className="fw-semibold text-light small">Sistema Activo</span>
          </div>
          <div className="text-secondary small" style={{ fontSize: "0.75rem" }}>
            Soporte y eficiencia técnica continua
          </div>
        </div>
      </aside>
    </>
  );
}
