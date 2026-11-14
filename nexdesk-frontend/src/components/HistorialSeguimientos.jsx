import { IconFileText } from "./Iconos";

function formatearFecha(valor) {
  if (!valor) return "Fecha no disponible";

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return "Fecha no disponible";
  }

  return fecha.toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function obtenerNombreAutor(seguimiento) {
  const nombre = [
    seguimiento.autor_nombre,
    seguimiento.autor_apellido,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    nombre ||
    `Usuario #${seguimiento.autor_usuario_id}`
  );
}

function formatearRol(rol) {
  const roles = {
    superadmin: "Superadmin",
    admin: "Administrador",
    tecnico: "Técnico Especialista",
    usuario: "Usuario Solicitante",
  };

  return roles[rol] || rol || "Sin rol";
}

export default function HistorialSeguimientos({
  seguimientos = [],
}) {
  const registrosOrdenados = [...seguimientos].sort(
    (a, b) => {
      const fechaA = new Date(a.fecha_registro).getTime();
      const fechaB = new Date(b.fecha_registro).getTime();

      return fechaA - fechaB || Number(a.id) - Number(b.id);
    }
  );

  if (registrosOrdenados.length === 0) {
    return (
      <div className="text-center py-5 text-secondary">
        <div className="mb-2 opacity-50">
          <IconFileText size={36} />
        </div>

        <p className="fw-semibold mb-1">
          Todavía no hay notas de seguimiento.
        </p>

        <p className="small mb-0 opacity-75">
          Registra la primera observación o avance técnico en este incidente.
        </p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {registrosOrdenados.map((seguimiento, indice) => (
        <div key={seguimiento.id} className="d-flex gap-3">
          {/* Línea vertical de tiempo */}
          <div className="d-flex flex-column align-items-center">
            <div
              className="rounded-circle bg-primary"
              style={{
                width: 12,
                height: 12,
                flexShrink: 0,
                marginTop: 6,
                boxShadow: "0 0 0 4px var(--solvix-primary-subtle)",
              }}
            />

            {indice < registrosOrdenados.length - 1 && (
              <div
                className="bg-body-secondary"
                style={{
                  width: 2,
                  flex: 1,
                  minHeight: 48,
                  marginTop: 6,
                }}
              />
            )}
          </div>

          <div className="card border-0 bg-body-tertiary flex-grow-1 mb-2 rounded-3 shadow-none border">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                <div>
                  <strong className="d-block small">
                    {obtenerNombreAutor(seguimiento)}
                  </strong>

                  <span className="badge solvix-badge solvix-badge-abierto mt-1" style={{ fontSize: "0.7rem" }}>
                    {formatearRol(seguimiento.autor_rol)}
                  </span>
                </div>

                <span className="small text-secondary" style={{ fontSize: "0.75rem" }}>
                  {formatearFecha(seguimiento.fecha_registro)}
                </span>
              </div>

              <p className="mb-0 text-break" style={{ whiteSpace: "pre-wrap", fontSize: "0.88rem" }}>
                {seguimiento.observacion}
              </p>

              <div className="text-secondary mt-2" style={{ fontSize: "0.7rem" }}>
                Seguimiento #{seguimiento.id}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
