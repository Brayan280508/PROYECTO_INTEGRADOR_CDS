import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import CampanaNotificaciones from "./CampanaNotificaciones";
import {
  IconMenu,
  IconSun,
  IconMoon,
  IconChevronDown,
  IconLogout,
  IconLock,
} from "./Iconos";

export default function NavbarPrincipal({ abrirMenu }) {
  const { usuario, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // ==========================================
  // 1. INFORMACIÓN DEL USUARIO
  // ==========================================

  const nombreCompleto = [
    usuario?.nombre,
    usuario?.apellido,
  ]
    .filter(Boolean)
    .join(" ");

  const inicial =
    usuario?.nombre?.charAt(0)?.toUpperCase() || "U";

  // ==========================================
  // 2. CERRAR SESIÓN
  // ==========================================

  function cerrarSesion() {
    sessionStorage.removeItem(
      "nexdesk_mostrar_bienvenida"
    );

    logout();

    navigate("/login", { replace: true });
  }

  // ==========================================
  // 3. BARRA DE NAVEGACIÓN
  // ==========================================

  return (
    <header className="solvix-topbar nexdesk-topbar">
      {/* SECCIÓN IZQUIERDA: TOGGLE MENÚ Y TITULAR */}
      <div className="d-flex align-items-center gap-3">
        <button
          type="button"
          className="btn btn-outline-secondary solvix-menu-toggle nexdesk-menu-toggle p-2"
          onClick={abrirMenu}
          aria-label="Abrir menú de navegación"
        >
          <IconMenu size={20} />
        </button>

        <div>
          <div className="d-flex align-items-center gap-2">
            <strong className="h6 mb-0 fw-bold">
              SOLVIX Console
            </strong>
            <span className="badge solvix-badge solvix-badge-abierto d-none d-sm-inline-flex">
              Help Desk
            </span>
          </div>
          <small className="text-secondary" style={{ fontSize: "0.78rem" }}>
            Soluciones rápidas y eficientes
          </small>
        </div>
      </div>

      {/* SECCIÓN DERECHA: TEMA, NOTIFICACIONES Y PERFIL */}
      <div className="d-flex align-items-center gap-2 gap-sm-3">
        {/* INTERRUPTOR MODO CLARO / OSCURO */}
        <button
          type="button"
          className="solvix-theme-toggle"
          onClick={toggleTheme}
          aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          title={isDark ? "Activar Modo Claro" : "Activar Modo Oscuro"}
        >
          {isDark ? <IconSun size={19} className="text-warning" /> : <IconMoon size={19} />}
        </button>

        {/* CAMPANA DE NOTIFICACIONES */}
        <CampanaNotificaciones />

        {/* DIVIDER SUTIL */}
        <div className="vr my-2 opacity-25 d-none d-sm-block" />

        {/* MENÚ DEL USUARIO */}
        <div className="dropdown">
          <button
            className="btn btn-link p-1 text-decoration-none d-flex align-items-center gap-2 text-reset"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <span className="solvix-avatar nexdesk-avatar shadow-sm">
              {inicial}
            </span>

            <span className="text-start d-none d-md-block nexdesk-user-info">
              <strong className="d-block small text-truncate" style={{ maxWidth: 150 }}>
                {nombreCompleto || "Usuario"}
              </strong>
              <span className="badge bg-secondary-subtle text-secondary-emphasis text-capitalize px-1 py-0" style={{ fontSize: "0.7rem" }}>
                {usuario?.rol}
              </span>
            </span>

            <IconChevronDown size={14} className="text-secondary ms-1" />
          </button>

          {/* OPCIONES DEL USUARIO */}
          <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 py-2">
            <li className="px-3 py-2 border-bottom mb-1">
              <div className="fw-semibold small text-truncate">
                {nombreCompleto || "Usuario"}
              </div>
              <div className="text-secondary text-truncate" style={{ fontSize: "0.75rem" }}>
                {usuario?.email}
              </div>
            </li>

            <li>
              <Link
                className="dropdown-item d-flex align-items-center gap-2 py-2"
                to="/cambiar-password"
              >
                <IconLock size={16} className="text-secondary" />
                <span>Cambiar contraseña</span>
              </Link>
            </li>

            <li>
              <hr className="dropdown-divider my-1" />
            </li>

            <li>
              <button
                type="button"
                className="dropdown-item text-danger d-flex align-items-center gap-2 py-2"
                onClick={cerrarSesion}
              >
                <IconLogout size={16} />
                <span>Cerrar sesión</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
