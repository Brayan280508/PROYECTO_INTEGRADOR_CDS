import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EstadoBackend from "../components/EstadoBackend";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import {
  SolvixLogo,
  IconSun,
  IconMoon,
  IconMail,
  IconLock,
  IconShield,
} from "../components/Iconos";

export default function Login() {
  // 1. Navegación y autenticación
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // 2. Estados del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  // 3. Procesar inicio de sesión
  async function manejarLogin(evento) {
    evento.preventDefault();

    setError("");
    setCargando(true);

    // Evitar conservar una bienvenida anterior
    sessionStorage.removeItem("nexdesk_mostrar_bienvenida");

    try {
      // Autenticación mediante la API REST
      const perfil = await login(email, password);

      // Verificar cambio obligatorio de contraseña
      if (
        perfil.debeCambiarPassword ||
        perfil.debe_cambiar_password
      ) {
        navigate("/cambiar-password", {
          replace: true,
        });
      } else {
        // Activar notificación de bienvenida
        sessionStorage.setItem("nexdesk_mostrar_bienvenida", "1");

        // Acceder al dashboard
        navigate("/dashboard", {
          replace: true,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible iniciar sesión."
      );
    } finally {
      setCargando(false);
    }
  }

  // 4. Interfaz de inicio de sesión
  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3 position-relative"
      style={{
        background: isDark
          ? "radial-gradient(ellipse at top, #1e293b 0%, #0f172a 100%)"
          : "radial-gradient(ellipse at top, #f1f5f9 0%, #e2e8f0 100%)",
      }}
    >
      {/* Botón flotante para alternar tema */}
      <div className="position-absolute top-0 end-0 p-3 p-md-4">
        <button
          type="button"
          className="solvix-theme-toggle"
          onClick={toggleTheme}
          aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          title={isDark ? "Activar Modo Claro" : "Activar Modo Oscuro"}
        >
          {isDark ? (
            <IconSun size={19} className="text-warning" />
          ) : (
            <IconMoon size={19} />
          )}
        </button>
      </div>

      <div className="container" style={{ maxWidth: 440 }}>
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Barra superior de acento tecnoloógico */}
          <div
            style={{
              height: 5,
              background: "linear-gradient(90deg, #2563EB 0%, #06B6D4 100%)",
            }}
          />

          <div className="card-body p-4 p-md-5">
            {/* Identidad visual SOLVIX */}
            <div className="text-center mb-4">
              <div className="d-flex justify-content-center mb-3">
                <SolvixLogo size={52} showText={false} />
              </div>

              <h1 className="h3 fw-bold mb-1 letter-spacing-tight">
                SOLV<span className="text-primary">IX</span>
              </h1>

              <p className="text-secondary small mb-0 fw-medium">
                Soluciones rápidas y eficientes
              </p>

              <div className="mt-2">
                <span className="badge solvix-badge solvix-badge-abierto">
                  <IconShield size={12} />
                  <span>Portal de Gestión & Help Desk</span>
                </span>
              </div>
            </div>

            {/* Mensajes de error */}
            {error && (
              <div
                className="alert alert-danger border-danger-subtle d-flex align-items-center gap-2 small py-2 rounded-3"
                role="alert"
              >
                <span>{error}</span>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={manejarLogin}>
              <div className="mb-3">
                <label
                  htmlFor="email"
                  className="form-label small fw-semibold text-secondary mb-1"
                >
                  Correo electrónico
                </label>

                <div className="position-relative">
                  <input
                    id="email"
                    type="email"
                    className="form-control ps-4"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    placeholder="ejemplo@empresa.com"
                    required
                  />
                  <div
                    className="position-absolute top-50 start-0 translate-middle-y ps-2 text-secondary opacity-50"
                    style={{ pointerEvents: "none" }}
                  >
                    <IconMail size={16} />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="form-label small fw-semibold text-secondary mb-1"
                >
                  Contraseña
                </label>

                <div className="position-relative">
                  <input
                    id="password"
                    type="password"
                    className="form-control ps-4"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    required
                  />
                  <div
                    className="position-absolute top-50 start-0 translate-middle-y ps-2 text-secondary opacity-50"
                    style={{ pointerEvents: "none" }}
                  >
                    <IconLock size={16} />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                disabled={cargando}
              >
                {cargando ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      aria-hidden="true"
                    />
                    <span>Verificando credenciales...</span>
                  </>
                ) : (
                  <span>Iniciar sesión</span>
                )}
              </button>
            </form>

            {/* Verificación del backend */}
            <EstadoBackend />

            <div className="text-center text-secondary small mt-4 mb-0 opacity-75" style={{ fontSize: "0.75rem" }}>
              Plataforma protegida • SOLVIX Help Desk
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
