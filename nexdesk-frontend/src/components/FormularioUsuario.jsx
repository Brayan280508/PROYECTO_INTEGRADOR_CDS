import { useState } from "react";

const TIPOS_DOCUMENTO = ["CC", "TI", "CE", "PA", "PPT", "OTRO"];

const VALORES_INICIALES = {
  tipo_documento: "CC",
  numero_documento: "",
  nombre: "",
  apellido: "",
  email: "",
  rol: "usuario",
};

export default function FormularioUsuario({
  rolActual,
  guardando,
  onGuardar,
  onCancelar,
}) {
  const [formulario, setFormulario] = useState({
    ...VALORES_INICIALES,
  });

  const rolesPermitidos =
    rolActual === "superadmin"
      ? ["usuario", "tecnico", "admin", "superadmin"]
      : ["usuario", "tecnico"];

  function cambiar(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function enviar(evento) {
    evento.preventDefault();

    onGuardar({
      tipo_documento: formulario.tipo_documento,
      numero_documento:
        formulario.numero_documento.trim().toUpperCase(),
      nombre: formulario.nombre.trim(),
      apellido: formulario.apellido.trim(),
      email: formulario.email.trim().toLowerCase(),
      rol: formulario.rol,
    });
  }

  return (
    <form onSubmit={enviar}>
      <div className="row g-3">
        <div className="col-md-6">
          <label htmlFor="nuevo-nombre" className="form-label small fw-semibold text-secondary mb-1">
            Nombre *
          </label>
          <input
            id="nuevo-nombre"
            name="nombre"
            className="form-control"
            value={formulario.nombre}
            onChange={cambiar}
            minLength={1}
            maxLength={100}
            required
            disabled={guardando}
            placeholder="Ej. Carlos"
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="nuevo-apellido" className="form-label small fw-semibold text-secondary mb-1">
            Apellido *
          </label>
          <input
            id="nuevo-apellido"
            name="apellido"
            className="form-control"
            value={formulario.apellido}
            onChange={cambiar}
            minLength={1}
            maxLength={100}
            required
            disabled={guardando}
            placeholder="Ej. Mendoza"
          />
        </div>

        <div className="col-md-5">
          <label htmlFor="nuevo-tipo" className="form-label small fw-semibold text-secondary mb-1">
            Tipo de Documento *
          </label>
          <select
            id="nuevo-tipo"
            name="tipo_documento"
            className="form-select"
            value={formulario.tipo_documento}
            onChange={cambiar}
            required
            disabled={guardando}
          >
            {TIPOS_DOCUMENTO.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-7">
          <label htmlFor="nuevo-documento" className="form-label small fw-semibold text-secondary mb-1">
            Número de Documento *
          </label>
          <input
            id="nuevo-documento"
            name="numero_documento"
            className="form-control"
            value={formulario.numero_documento}
            onChange={cambiar}
            pattern="[A-Za-z0-9-]{4,30}"
            minLength={4}
            maxLength={30}
            title="Entre 4 y 30 caracteres: letras, números o guiones"
            required
            disabled={guardando}
            placeholder="123456789"
          />
          <div className="form-text small opacity-75">
            De 4 a 30 caracteres alfanuméricos o guiones.
          </div>
        </div>

        <div className="col-12">
          <label htmlFor="nuevo-email" className="form-label small fw-semibold text-secondary mb-1">
            Correo Electrónico Institucional *
          </label>
          <input
            id="nuevo-email"
            type="email"
            name="email"
            className="form-control"
            value={formulario.email}
            onChange={cambiar}
            autoComplete="off"
            required
            disabled={guardando}
            placeholder="carlos.mendoza@empresa.com"
          />
        </div>

        <div className="col-12">
          <label htmlFor="nuevo-rol" className="form-label small fw-semibold text-secondary mb-1">
            Rol Asignado *
          </label>
          <select
            id="nuevo-rol"
            name="rol"
            className="form-select"
            value={formulario.rol}
            onChange={cambiar}
            required
            disabled={guardando}
          >
            {rolesPermitidos.map((rol) => (
              <option key={rol} value={rol}>
                {rol.toUpperCase()}
              </option>
            ))}
          </select>

          <div className="form-text small opacity-75">
            Los roles disponibles dependen del nivel de autorización de tu cuenta.
          </div>
        </div>
      </div>

      <div className="p-3 rounded-3 border bg-body-tertiary mt-4 mb-0 small">
        <strong className="d-block mb-1 text-primary">Seguridad SOLVIX:</strong>
        El sistema generará una contraseña temporal de un solo uso. El nuevo usuario deberá actualizarla en su primer acceso.
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onCancelar}
          disabled={guardando}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="btn btn-primary d-inline-flex align-items-center gap-2"
          disabled={guardando}
        >
          {guardando ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" />
              <span>Registrando...</span>
            </>
          ) : (
            <span>Registrar Usuario</span>
          )}
        </button>
      </div>
    </form>
  );
}
