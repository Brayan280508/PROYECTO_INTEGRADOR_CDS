import { Link } from "react-router-dom";
import { IconChevronRight } from "../components/Iconos";

export default function ModuloPendiente({ titulo }) {
  return (
    <div className="container-fluid px-0">
      <div className="text-secondary small mb-2 fw-medium">
        Inicio / {titulo}
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div
          style={{
            height: 4,
            background: "linear-gradient(90deg, #2563EB 0%, #06B6D4 100%)",
          }}
        />
        <div className="card-body p-4 p-md-5">
          <span className="badge solvix-badge solvix-badge-abierto mb-3">
            Módulo en Expansión
          </span>

          <h1 className="h4 fw-bold mb-2">
            Módulo de {titulo}
          </h1>

          <p className="text-secondary mb-4 small" style={{ maxWidth: 540 }}>
            La interfaz y arquitectura de navegación para este componente están preparadas y sincronizadas con la plataforma central de <strong>SOLVIX</strong>.
          </p>

          <Link to="/dashboard" className="btn btn-outline-primary d-inline-flex align-items-center gap-2">
            <span>Volver al panel principal</span>
            <IconChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
