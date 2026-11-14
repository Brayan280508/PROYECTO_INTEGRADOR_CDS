import { useMemo } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { IconDownload, IconRefresh } from "./Iconos";

// ==========================================
// 1. ESTADOS Y COLORES
// ==========================================

const ESTADOS = [
  ["abierto", "Abiertos", "#3b82f6"],
  ["asignado", "Asignados", "#06b6d4"],
  ["en_proceso", "En proceso", "#f59e0b"],
  ["resuelto", "Resueltos", "#10b981"],
  ["cerrado", "Cerrados", "#64748b"],
  ["reabierto", "Reabiertos", "#a855f7"],
];

// ==========================================
// 2. UTILIDADES PARA EXPORTACIÓN CSV
// ==========================================

function escaparCSV(valor) {
  if (valor === null || valor === undefined) {
    return "";
  }

  let texto = String(valor);

  if (/^\s*[=+@-]/.test(texto)) {
    texto = `'${texto}`;
  }

  return `"${texto.replace(/"/g, '""')}"`;
}

function formatearFecha(fecha) {
  if (!fecha) return "";

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return String(fecha);
  }

  return valor.toLocaleString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function descargarCSV(nombreArchivo, filas) {
  const contenido = filas
    .map((fila) => fila.map(escaparCSV).join(";"))
    .join("\r\n");

  const blob = new Blob(["\uFEFF", contenido], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;

  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();

  URL.revokeObjectURL(url);
}

// ==========================================
// 3. COMPONENTE DE ANALÍTICA
// ==========================================

export default function AnaliticaTickets({
  tickets = [],
  cargando = false,
  error = "",
  onActualizar,
}) {
  // ========================================
  // 4. CALCULAR INDICADORES
  // ========================================

  const resumen = useMemo(() => {
    const total = tickets.length;

    const estados = ESTADOS.map(([clave, nombre, color]) => ({
      clave,
      nombre,
      color,
      cantidad: tickets.filter((ticket) => ticket.estado === clave).length,
    }));

    const prioridades = [
      {
        nombre: "Alta",
        color: "#ef4444",
        cantidad: tickets.filter((ticket) => ticket.prioridad === "alta").length,
      },
      {
        nombre: "Media",
        color: "#f59e0b",
        cantidad: tickets.filter((ticket) => ticket.prioridad === "media").length,
      },
      {
        nombre: "Baja",
        color: "#10b981",
        cantidad: tickets.filter((ticket) => ticket.prioridad === "baja").length,
      },
    ];

    const activos = tickets.filter(
      (ticket) => !["cerrado", "resuelto"].includes(ticket.estado)
    ).length;

    return {
      total,
      estados,
      prioridades,
      activos,
    };
  }, [tickets]);

  const maxEstado = Math.max(1, ...resumen.estados.map((e) => e.cantidad));

  // ========================================
  // 5. EXPORTAR REPORTE CSV
  // ========================================

  function exportarReporteCSV() {
    if (cargando || error || tickets.length === 0) {
      return;
    }

    const encabezados = [
      "ID",
      "Título",
      "Descripción",
      "Prioridad",
      "Estado",
      "Usuario ID",
      "Técnico ID",
      "Categoría ID",
      "Solución",
      "Fecha de creación",
      "Fecha de actualización",
      "Fecha de cierre",
    ];

    const registros = tickets.map((ticket) => [
      ticket.id,
      ticket.titulo,
      ticket.descripcion,
      ticket.prioridad,
      ticket.estado,
      ticket.usuario_id,
      ticket.tecnico_id,
      ticket.categoria_id,
      ticket.solucion,
      formatearFecha(ticket.fecha_creacion),
      formatearFecha(ticket.fecha_actualizacion),
      formatearFecha(ticket.fecha_cierre),
    ]);

    const filas = [encabezados, ...registros];
    const fecha = new Date().toLocaleDateString("sv-SE");
    const nombreArchivo = `SOLVIX_reporte_tickets_${fecha}.csv`;

    descargarCSV(nombreArchivo, filas);
  }

  // ========================================
  // 5B. EXPORTAR REPORTE PDF
  // ========================================

  function exportarReportePDF() {
    if (cargando || error || tickets.length === 0) return;

    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const ancho = pdf.internal.pageSize.getWidth();
    const fechaGeneracion = formatearFecha(new Date());
    const azul = [37, 99, 235];
    const gris = [100, 116, 139];
    const margen = 14;

    pdf.setFillColor(...azul);
    pdf.rect(0, 0, ancho, 28, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text("SOLVIX", margen, 13);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text("Soluciones rapidas y eficientes - Gestion de Soporte", margen, 20);
    pdf.text("REPORTE OPERATIVO DE TICKETS", ancho - margen, 15, { align: "right" });

    pdf.setTextColor(...gris);
    pdf.setFontSize(9);
    pdf.text(`Fecha de emision: ${fechaGeneracion}`, margen, 35);
    pdf.text("Alcance: tickets visibles para el usuario autenticado", margen, 41);

    const resueltos = resumen.estados.find((e) => e.clave === "resuelto")?.cantidad ?? 0;
    const cerrados = resumen.estados.find((e) => e.clave === "cerrado")?.cantidad ?? 0;
    const metricas = [
      ["Total visibles", resumen.total],
      ["En gestion activa", resumen.activos],
      ["Resueltos", resueltos],
      ["Cerrados", cerrados],
    ];

    autoTable(pdf, {
      head: [["Indicador", "Cantidad"]],
      body: metricas,
      startY: 46,
      margin: { left: margen },
      tableWidth: 100,
      theme: "grid",
      styles: { font: "helvetica", fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: azul, textColor: [255, 255, 255], fontStyle: "bold" },
    });

    const columnas = [
      "ID",
      "Titulo",
      "Prioridad",
      "Estado",
      "Tecnico",
      "Categoria",
      "Creacion",
      "Actualizacion",
      "Cierre",
    ];

    const filas = tickets.map((t) => [
      `#${t.id}`,
      t.titulo || "Sin titulo",
      t.prioridad || "-",
      t.estado || "-",
      t.tecnico_id ? `ID #${t.tecnico_id}` : "Sin asignar",
      t.categoria_id ? `ID #${t.categoria_id}` : "-",
      formatearFecha(t.fecha_creacion) || "-",
      formatearFecha(t.fecha_actualizacion) || "-",
      formatearFecha(t.fecha_cierre) || "No aplica",
    ]);

    autoTable(pdf, {
      head: [columnas],
      body: filas,
      startY: 85,
      margin: { left: margen, right: margen, bottom: 16 },
      theme: "striped",
      styles: { font: "helvetica", fontSize: 7, cellPadding: 2.3, overflow: "linebreak" },
      headStyles: { fillColor: azul, textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: { 1: { cellWidth: 58 }, 7: { cellWidth: 31 }, 8: { cellWidth: 31 } },
    });

    const paginas = pdf.getNumberOfPages();
    for (let pagina = 1; pagina <= paginas; pagina += 1) {
      pdf.setPage(pagina);
      const alto = pdf.internal.pageSize.getHeight();
      pdf.setDrawColor(226, 232, 240);
      pdf.line(margen, alto - 12, ancho - margen, alto - 12);
      pdf.setTextColor(...gris);
      pdf.setFontSize(8);
      pdf.text("SOLVIX | Soluciones rapidas y eficientes", margen, alto - 7);
      pdf.text(`Pagina ${pagina} de ${paginas}`, ancho - margen, alto - 7, { align: "right" });
    }

    const fechaArchivo = new Date().toLocaleDateString("sv-SE");
    pdf.save(`SOLVIX_reporte_tickets_${fechaArchivo}.pdf`);
  }

  // ========================================
  // 6. INTERFAZ
  // ========================================

  return (
    <section className="mb-4" aria-label="Analítica de tickets">
      {/* ENCABEZADO Y ACCIONES */}
      <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap mb-3">
        <div>
          <h2 className="h5 fw-bold mb-1">
            Analítica Operativa
          </h2>
          <p className="text-secondary small mb-0">
            Métricas de atención en tiempo real según tus permisos
          </p>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1"
            onClick={exportarReporteCSV}
            disabled={cargando || Boolean(error) || tickets.length === 0}
            title="Descargar reporte en hoja de cálculo CSV"
          >
            <IconDownload size={14} />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
            onClick={exportarReportePDF}
            disabled={cargando || Boolean(error) || tickets.length === 0}
            title="Descargar reporte formal en PDF"
          >
            <IconDownload size={14} />
            <span>Exportar PDF</span>
          </button>

          <button
            type="button"
            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
            onClick={onActualizar}
            disabled={cargando || !onActualizar}
          >
            <IconRefresh size={14} className={cargando ? "spin" : ""} />
            <span>{cargando ? "Actualizando..." : "Actualizar"}</span>
          </button>
        </div>
      </div>

      {/* MENSAJE DE ERROR */}
      {error && (
        <div className="alert alert-warning border-0 shadow-sm rounded-3" role="alert">
          No se pudieron sincronizar las métricas: {error}
        </div>
      )}

      {/* TARJETAS DE INDICADORES (KPIs) */}
      <div className="row g-3 mb-4">
        {[
          {
            nombre: "Tickets Visibles",
            valor: resumen.total,
            color: "#2563eb",
            subtexto: "Total general",
          },
          {
            nombre: "En Gestión Activa",
            valor: resumen.activos,
            color: "#f59e0b",
            subtexto: "Abiertos / En proceso",
          },
          {
            nombre: "Resueltos",
            valor:
              resumen.estados.find((estado) => estado.clave === "resuelto")
                ?.cantidad || 0,
            color: "#10b981",
            subtexto: "Solución aplicada",
          },
          {
            nombre: "Cerrados",
            valor:
              resumen.estados.find((estado) => estado.clave === "cerrado")
                ?.cantidad || 0,
            color: "#64748b",
            subtexto: "Ciclo finalizado",
          },
        ].map((item) => (
          <div className="col-6 col-xl-3" key={item.nombre}>
            <div
              className="card solvix-card solvix-kpi-card border-0 shadow-sm h-100"
              style={{ "--kpi-color": item.color }}
            >
              <div className="card-body p-3">
                <span className="small text-secondary fw-medium">
                  {item.nombre}
                </span>

                <div className="fs-2 fw-bold mt-1 mb-1">
                  {cargando && !tickets.length ? "…" : item.valor}
                </div>

                <span className="small text-secondary" style={{ fontSize: "0.75rem" }}>
                  {item.subtexto}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* TICKETS POR ESTADO Y POR PRIORIDAD */}
      <div className="row g-3">
        {/* POR ESTADO */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h3 className="h6 fw-bold mb-0">
                  Progreso por Estado
                </h3>
                <span className="small text-secondary">
                  {resumen.total} solicitudes
                </span>
              </div>

              {resumen.estados.map((estado) => (
                <div key={estado.clave} className="mb-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="text-secondary fw-medium">
                      {estado.nombre}
                    </span>
                    <strong>{estado.cantidad}</strong>
                  </div>

                  <div
                    className="progress bg-body-tertiary"
                    style={{ height: 8, borderRadius: 6 }}
                    role="progressbar"
                    aria-label={estado.nombre}
                    aria-valuenow={estado.cantidad}
                    aria-valuemin={0}
                    aria-valuemax={maxEstado}
                  >
                    <div
                      className="progress-bar"
                      style={{
                        width: `${(estado.cantidad / maxEstado) * 100}%`,
                        backgroundColor: estado.color,
                        borderRadius: 6,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* POR PRIORIDAD */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h3 className="h6 fw-bold mb-0">
                  Nivel de Criticidad
                </h3>
                <span className="small text-secondary">Prioridad</span>
              </div>

              <div className="d-flex flex-column gap-3">
                {resumen.prioridades.map((prioridad) => (
                  <div
                    key={prioridad.nombre}
                    className="p-3 rounded-3 border bg-body-tertiary"
                  >
                    <div className="d-flex justify-content-between small mb-2">
                      <span className="fw-semibold">
                        Prioridad {prioridad.nombre}
                      </span>
                      <strong>
                        {prioridad.cantidad}{" "}
                        <span className="text-secondary fw-normal">
                          (
                          {resumen.total
                            ? Math.round(
                                (prioridad.cantidad / resumen.total) * 100
                              )
                            : 0}
                          %)
                        </span>
                      </strong>
                    </div>

                    <div
                      className="progress bg-body"
                      style={{ height: 8, borderRadius: 6 }}
                      role="progressbar"
                      aria-label={`Prioridad ${prioridad.nombre}`}
                      aria-valuenow={prioridad.cantidad}
                      aria-valuemin={0}
                      aria-valuemax={Math.max(1, resumen.total)}
                    >
                      <div
                        className="progress-bar"
                        style={{
                          backgroundColor: prioridad.color,
                          borderRadius: 6,
                          width: `${
                            resumen.total
                              ? (prioridad.cantidad / resumen.total) * 100
                              : 0
                          }%`,
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
