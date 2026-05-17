import React, { useState, useEffect } from "react";

interface Cliente {
  id: number;
  identificacion: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
}

export const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados del formulario
  const [identificacion, setIdentificacion] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  // 1. Obtener los clientes del arreglo local del Backend
  const cargarClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://localhost:3000/api/clientes", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al cargar clientes");
      }

      // Como tu backend modificado devuelve el array de memoria directo, lo asignamos
      if (Array.isArray(data)) {
        setClientes(data);
      } else if (data.data && Array.isArray(data.data)) {
        setClientes(data.data);
      } else {
        setClientes([]);
      }
    } catch (err: any) {
      setError(err.message || "No se pudo conectar con el servidor local");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      cargarClientes();
    }
  }, [token]);

  // 2. Enviar el cliente al almacenamiento en memoria del Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3000/api/clientes", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identificacion,
          nombre,
          apellido,
          email,
          telefono,
          direccion,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al registrar cliente");
      }

      // Limpiar formulario si todo sale correcto
      setIdentificacion("");
      setNombre("");
      setApellido("");
      setEmail("");
      setTelefono("");
      setDireccion("");

      alert("¡Cliente guardado exitosamente en la memoria del sistema!");
      await cargarClientes(); // Recarga la lista en vivo
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado al guardar localmente");
    } finally {
      setSubmitting(false); // Libera el botón siempre para evitar que se quede congelado
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>👥 Gestión de Clientes (Almacenamiento Local)</h2>

      {error && <div style={styles.errorAlert}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.formCard}>
        <h3 style={styles.subTitle}>Registrar Nuevo Cliente</h3>
        <div style={styles.grid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Cédula / RUC *</label>
            <input
              type="text"
              value={identificacion}
              onChange={(e) => setIdentificacion(e.target.value)}
              placeholder="Ej: 0102030405"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nombre *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Juan"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Apellido *</label>
            <input
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              placeholder="Ej: Pérez"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan@correo.com"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Teléfono *</label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej: 0987654321"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Dirección *</label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Ej: Av. Solano"
              style={styles.input}
              required
            />
          </div>
        </div>
        <button type="submit" disabled={submitting} style={styles.button}>
          {submitting ? "Guardando datos locales..." : "💾 Registrar Cliente"}
        </button>
      </form>

      <div style={styles.tableCard}>
        <h3 style={styles.subTitle}>Listado de Clientes Registrados</h3>
        {loading ? (
          <p style={{ color: "#00f2fe" }}>Cargando datos locales en memoria...</p>
        ) : clientes.length === 0 ? (
          <p style={{ color: "#aaa" }}>No hay clientes registrados en el sistema local.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Identificación</th>
                  <th style={styles.th}>Nombre Completo</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Teléfono</th>
                  <th style={styles.th}>Dirección</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => (
                  <tr key={cliente.id} style={styles.tr}>
                    <td style={styles.td}>{cliente.identificacion}</td>
                    <td style={styles.td}>{`${cliente.nombre} ${cliente.apellido}`}</td>
                    <td style={styles.td}>{cliente.email}</td>
                    <td style={styles.td}>{cliente.telefono}</td>
                    <td style={styles.td}>{cliente.direccion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: { width: "100%", maxWidth: "1100px", margin: "0 auto", fontFamily: "'Segoe UI', sans-serif" },
  title: { color: "#00f2fe", fontSize: "28px", marginBottom: "25px", borderBottom: "2px solid #1a4294", paddingBottom: "10px" },
  subTitle: { color: "#ffffff", fontSize: "18px", marginBottom: "20px", fontWeight: "600" },
  formCard: { background: "rgba(30, 41, 59, 0.7)", padding: "25px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.1)", marginBottom: "30px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", textAlign: "left" },
  label: { color: "#aaa", fontSize: "13px", marginBottom: "6px", fontWeight: "600" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #2c3a4e", backgroundColor: "#0f172a", color: "#fff", fontSize: "14px" },
  button: { padding: "14px 28px", background: "linear-gradient(90deg, #0052d4 0%, #1a4294 100%)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },
  tableCard: { background: "rgba(30, 41, 59, 0.4)", padding: "25px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.05)" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left", color: "#e2e8f0" },
  th: { padding: "14px", borderBottom: "2px solid #2c3a4e", color: "#00f2fe", backgroundColor: "rgba(15, 23, 42, 0.6)" },
  td: { padding: "14px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" },
  tr: { backgroundColor: "rgba(30, 41, 59, 0.2)" },
  errorAlert: { backgroundColor: "#fde8e8", color: "#9b1c1c", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontWeight: "bold", textAlign: "center" },
};