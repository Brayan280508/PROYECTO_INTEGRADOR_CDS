import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import {
  SolvixLogo,
  IconSun,
  IconMoon,
  IconLogout,
  IconAlert,
} from "../components/Iconos";

export default function CambiarPassword() {
  const { usuario, cambiarPassword, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    setError("");

    if (nueva.length < 12 || nueva.length > 128) {
      setError("La contraseña debe tener entre 12 y 128 caracteres.");
      return;
    }
    if (nueva !== confirmacion) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    if (actual === nueva) {
      setError("La contraseña nueva debe ser diferente a la actual.");
      return;
    }

    setCargando(true);
    try {
      await cambiarPassword(actual, nueva);
      // Por seguridad solicitamos iniciar sesión de nuevo con la nueva clave.
      logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message || "No fue posible cambiar la contraseña");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-vh-100 bg-body-tertiary py-5 px-3 d-flex align-items-center justify-content-center position-relative">
      {/* Botón de tema flotante */}
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

      <main className="container" style={{ maxWidth: 520 }}>
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
          <div
            style={{
              height: 4,
              background: "linear-gradient(90deg, #2563EB 0%, #06B6D4 100%)",
            }}
          />

          <div className="card-body p-4 p-md-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <SolvixLogo size={32} showText={true} showSlogan={false} />

              {!(
                usuario?.debeCambiarPassword ||
                usuario?.debe_cambiar_password
              ) && (
                <Link
                  to="/dashboard"
                  className="btn btn-outline-secondary btn-sm"
                  aria-label="Volver al panel de control"
                >
                  Volver al panel
                </Link>
              )}
            </div>

            <h1 className="h4 fw-bold mb-1">Actualizar Contraseña</h1>
            <p className="text-secondary small mb-3">
              Cuenta: <strong>{usuario?.email}</strong>
            </p>

            {(usuario?.debeCambiarPassword || usuario?.debe_cambiar_password) && (
              <div className="alert alert-warning border-0 shadow-sm small py-2 rounded-3 mb-3" role="alert">
                Por motivos de seguridad, debes actualizar tu contraseña antes de continuar utilizando <strong>SOLVIX</strong>.
              </div>
            )}

            {error && (
              <div
                className="alert alert-danger border-0 shadow-sm small py-2 rounded-3 d-flex align-items-center gap-2 mb-3"
                role="alert"
              >
                <IconAlert size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={enviar}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary mb-1" htmlFor="actual">
                  Contraseña actual *
                </label>
                <input
                  className="form-control"
                  id="actual"
                  type="password"
                  autoComplete="current-password"
                  value={actual}
                  onChange={(e) => setActual(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary mb-1" htmlFor="nueva">
                  Nueva contraseña (12 a 128 caracteres) *
                </label>
                <input
                  className="form-control"
                  id="nueva"
                  type="password"
                  minLength={12}
                  maxLength={128}
                  autoComplete="new-password"
                  value={nueva}
                  onChange={(e) => setNueva(e.target.value)}
                  placeholder="Mínimo 12 caracteres"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary mb-1" htmlFor="confirmacion">
                  Confirmar nueva contraseña *
                </label>
                <input
                  className="form-control"
                  id="confirmacion"
                  type="password"
                  autoComplete="new-password"
                  value={confirmacion}
                  onChange={(e) => setConfirmacion(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  required
                />
              </div>

              <button
                className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                type="submit"
                disabled={cargando}
              >
                {cargando ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" />
                    <span>Actualizando credenciales...</span>
                  </>
                ) : (
                  <span>Guardar nueva contraseña</span>
                )}
              </button>
            </form>

            <div className="mt-4 pt-3 border-top text-center">
              <button
                className="btn btn-link btn-sm text-secondary text-decoration-none d-inline-flex align-items-center gap-1"
                type="button"
                onClick={() => {
                  logout();
                  navigate("/login", { replace: true });
                }}
              >
                <IconLogout size={14} />
                <span>Cerrar sesión y salir</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
