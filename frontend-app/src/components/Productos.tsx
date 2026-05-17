import React, { useState, useEffect } from "react";

interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  precio: number;
  stock: number;
}

export const Productos: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados del formulario de productos
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  // 1. Cargar los productos desde el arreglo local del Backend
  const cargarProductos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://localhost:3000/api/productos", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al cargar productos");
      }

      // Validamos si el backend devuelve el arreglo directo o envuelto en un objeto .data
      if (Array.isArray(data)) {
        setProductos(data);
      } else if (data.data && Array.isArray(data.data)) {
        setProductos(data.data);
      } else {
        setProductos([]);
      }
    } catch (err: any) {
      setError(err.message || "No se pudo conectar con el servidor local");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      cargarProductos();
    }
  }, [token]);

  // 2. Enviar el nuevo producto a la memoria del Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Validación básica en el frontend para asegurar números correctos
    if (parseFloat(precio) <= 0 || parseInt(stock) < 0) {
      setError("El precio debe ser mayor a 0 y el stock no puede ser negativo");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/productos", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigo,
          nombre,
          precio: parseFloat(precio), // Nos aseguramos de enviarlo como número
          stock: parseInt(stock),     // Nos aseguramos de enviarlo como entero
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al registrar producto");
      }

      // Limpiar formulario tras el éxito
      setCodigo("");
      setNombre("");
      setPrecio("");
      setStock("");

      alert("¡Producto guardado exitosamente!");
      await cargarProductos(); // Recarga la tabla al instante
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al guardar el producto");
    } finally {
      setSubmitting(false); // Descongela el botón pase lo que pase
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📦 Gestión de Inventario</h2>

      {error && <div style={styles.errorAlert}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.formCard}>
        <h3 style={styles.subTitle}>Registrar Nuevo Producto</h3>
        <div style={styles.grid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Código de Barra / Único *</label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej: PROD001"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nombre del Producto *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Martillo de uña 16oz"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Precio de Venta ($) *</label>
            <input
              type="number"
              step="0.01"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              placeholder="Ej: 12.50"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Stock Inicial *</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Ej: 50"
              style={styles.input}
              required
            />
          </div>
        </div>
        <button type="submit" disabled={submitting} style={styles.button}>
          {submitting ? "Guardando producto..." : "💾 Registrar Producto"}
        </button>
      </form>

      <div style={styles.tableCard}>
        <h3 style={styles.subTitle}>Inventario Actual</h3>
        {loading ? (
          <p style={{ color: "#00f2fe" }}>Cargando inventario...</p>
        ) : productos.length === 0 ? (
          <p style={{ color: "#aaa" }}>No hay productos registrados en el sistema local.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Código</th>
                  <th style={styles.th}>Descripción / Nombre</th>
                  <th style={styles.th}>Precio Unitario</th>
                  <th style={styles.th}>Stock Disponible</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto) => (
                  <tr key={producto.id} style={styles.tr}>
                    <td style={styles.td}>{producto.codigo}</td>
                    <td style={styles.td}>{producto.nombre}</td>
                    <td style={styles.td}>${producto.precio.toFixed(2)}</td>
                    <td style={{
                      ...styles.td, 
                      color: producto.stock < 5 ? "#ff4d4d" : "#e2e8f0",
                      fontWeight: producto.stock < 5 ? "bold" : "normal"
                    }}>
                      {producto.stock} uds {producto.stock < 5 && "(Stock Bajo)"}
                    </td>
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
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "20px" },
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