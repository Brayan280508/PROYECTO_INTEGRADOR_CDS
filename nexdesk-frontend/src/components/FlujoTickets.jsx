import { useState } from "react";
import { useTheme } from "../hooks/useTheme";

const etapas = [
  {
    id: 1,
    titulo: "Registrar",
    actor: "Usuario",
    actorCorto: "Usuario",
    descripcion:
      "El usuario registra una solicitud de soporte describiendo el incidente o requerimiento.",
    resultado: "Se crea un ticket con estado abierto.",
    color: "#2563eb",
  },
  {
    id: 2,
    titulo: "Clasificar",
    actor: "Sistema / gestión de soporte",
    actorCorto: "Sistema / Soporte",
    descripcion:
      "La solicitud se organiza mediante su categoría y prioridad para facilitar la atención.",
    resultado: "El ticket queda identificado para su gestión.",
    color: "#64748b",
  },
  {
    id: 3,
    titulo: "Asignar",
    actor: "Administrador",
    actorCorto: "Administrador",
    descripcion:
      "Un responsable autorizado asigna el ticket a un técnico disponible.",
    resultado: "El ticket queda asociado a un técnico.",
    color: "#7c3aed",
  },
  {
    id: 4,
    titulo: "Atender",
    actor: "Técnico",
    actorCorto: "Técnico",
    descripcion:
      "El técnico analiza la solicitud y realiza las acciones necesarias para resolverla.",
    resultado: "El ticket puede pasar a en_progreso.",
    color: "#0891b2",
  },
  {
    id: 5,
    titulo: "Seguimiento",
    actor: "Técnico / responsables autorizados",
    actorCorto: "Técnico / Soporte",
    descripcion:
      "Se registran observaciones, actividades y avances para mantener la trazabilidad.",
    resultado: "Se conserva el historial de atención.",
    color: "#d97706",
  },
  {
    id: 6,
    titulo: "Cerrar",
    actor: "Responsable autorizado",
    actorCorto: "Responsable",
    descripcion:
      "Cuando se completa la atención, se actualiza el estado del ticket conforme a las reglas del sistema.",
    resultado: "El ticket pasa al estado cerrado.",
    color: "#10b981",
  },
];

const posiciones = [
  { x: 20, y: 20 },
  { x: 200, y: 20 },
  { x: 380, y: 20 },
  { x: 380, y: 140 },
  { x: 200, y: 140 },
  { x: 20, y: 140 },
];

export default function FlujoTickets() {
  const [seleccionada, setSeleccionada] = useState(1);
  const { isDark } = useTheme();

  const etapa = etapas.find((item) => item.id === seleccionada);

  function siguiente() {
    setSeleccionada((actual) => (actual === etapas.length ? 1 : actual + 1));
  }

  const inactiveCardFill = isDark ? "#1E293B" : "#FFFFFF";
  const inactiveCardStroke = isDark ? "#334155" : "#E2E8F0";
  const inactiveTextColor = isDark ? "#F8FAFC" : "#0F172A";
  const inactiveMutedColor = isDark ? "#94A3B8" : "#64748B";

  return (
    <section className="mt-2">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
        <div>
          <span className="badge solvix-badge solvix-badge-abierto mb-2">
            Modelo de Operación SOLVIX
          </span>

          <h2 className="h5 fw-bold mb-1">
            ¿Cómo funciona el ciclo de atención?
          </h2>

          <p className="text-secondary small mb-0">
            Explora el ciclo de vida de una solicitud de soporte técnico. Selecciona una etapa para conocer su responsable y resultado.
          </p>
        </div>

        <span className="badge solvix-badge solvix-badge-en_proceso">
          Flujo Eficiente
        </span>
      </div>

      {/* Diagrama SVG interactivo con soporte Dark / Light */}
      <div className="nexdesk-flujo-scroll">
        <svg
          viewBox="0 0 560 245"
          className="nexdesk-flujo-svg"
          role="group"
          aria-label="Flujo interactivo de gestión de tickets"
        >
          <defs>
            <marker
              id="flecha-solvix"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto"
            >
              <path d="M0 0 L10 5 L0 10 Z" fill={isDark ? "#64748B" : "#94A3B8"} />
            </marker>
          </defs>

          {/* Conectores del flujo */}
          <g
            fill="none"
            stroke={isDark ? "#475569" : "#94a3b8"}
            strokeWidth="2"
            strokeLinecap="round"
            markerEnd="url(#flecha-solvix)"
          >
            <path d="M175 56 H194" />
            <path d="M355 56 H374" />
            <path d="M457 92 V134" />
            <path d="M380 176 H361" />
            <path d="M200 176 H181" />
          </g>

          {/* Etapas seleccionables */}
          {etapas.map((item, indice) => {
            const posicion = posiciones[indice];
            const activa = seleccionada === item.id;

            return (
              <g
                key={item.id}
                role="button"
                tabIndex={0}
                aria-label={`Etapa ${item.id}: ${item.titulo}`}
                aria-pressed={activa}
                onClick={() => setSeleccionada(item.id)}
                onKeyDown={(evento) => {
                  if (evento.key === "Enter" || evento.key === " ") {
                    evento.preventDefault();
                    setSeleccionada(item.id);
                  }
                }}
                className="nexdesk-flujo-nodo"
              >
                {/* Tarjeta */}
                <rect
                  x={posicion.x}
                  y={posicion.y}
                  width="155"
                  height="72"
                  rx="10"
                  fill={activa ? item.color : inactiveCardFill}
                  stroke={activa ? item.color : inactiveCardStroke}
                  strokeWidth={activa ? 2.5 : 1.5}
                />

                {/* Número */}
                <circle
                  cx={posicion.x + 20}
                  cy={posicion.y + 22}
                  r="13"
                  fill={activa ? "#ffffff" : item.color}
                  fillOpacity={activa ? 1 : 0.15}
                />

                <text
                  x={posicion.x + 20}
                  y={posicion.y + 26}
                  fontSize="11"
                  fontWeight="700"
                  textAnchor="middle"
                  fill={activa ? item.color : inactiveTextColor}
                >
                  {item.id}
                </text>

                {/* Nombre de la etapa */}
                <text
                  x={posicion.x + 40}
                  y={posicion.y + 26}
                  fontSize="12"
                  fontWeight="700"
                  fill={activa ? "#ffffff" : inactiveTextColor}
                >
                  {item.titulo}
                </text>

                {/* Responsable */}
                <text
                  x={posicion.x + 12}
                  y={posicion.y + 51}
                  fontSize="10"
                  fill={activa ? "#ffffff" : inactiveMutedColor}
                >
                  {item.actorCorto}
                </text>
              </g>
            );
          })}

          <text
            x="280"
            y="237"
            textAnchor="middle"
            fontSize="10"
            fill={inactiveMutedColor}
          >
            Selecciona una etapa para explorar el proceso de atención
          </text>
        </svg>
      </div>

      {/* Panel de información de la etapa */}
      <div
        className="nexdesk-flujo-detalle mt-3"
        style={{ borderLeftColor: etapa.color }}
        aria-live="polite"
      >
        <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
          <div>
            <span className="text-secondary small fw-semibold">
              ETAPA {etapa.id} DE {etapas.length}
            </span>

            <h3 className="h5 fw-bold mt-1 mb-2">
              {etapa.titulo}
            </h3>

            <p className="mb-2 text-secondary small">
              {etapa.descripcion}
            </p>

            <div className="d-flex flex-wrap gap-3 small">
              <div>
                <strong>Responsable:</strong> {etapa.actor}
              </div>
              <div>
                <strong>Resultado:</strong> {etapa.resultado}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={siguiente}
          >
            {seleccionada === etapas.length
              ? "Reiniciar recorrido"
              : "Siguiente etapa →"}
          </button>
        </div>
      </div>
    </section>
  );
}
