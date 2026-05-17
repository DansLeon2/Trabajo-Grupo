import React, { useState, useEffect } from "react";

interface Cliente {
  id: number;
  cedula: string;
  nombre: string;
  telefono: string;
  email: string;
}

interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  precio: number;
  stock: number;
}

interface ItemCarrito {
  productoId: number;
  codigo: string;
  nombre: string;
  precio: number;
  cantidad: number;
  stockDisponible: number;
}

export const Ventas: React.FC = () => {
  // Datos cargados del backend
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selección actuales
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>("");
  const [productoSeleccionado, setProductoSeleccionado] = useState<string>("");
  const [cantidadInput, setCantidadInput] = useState<string>("1");

  // El Carrito de compras/facturación
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Estados para los totales unificados con el Backend
  const [subtotalBase, setSubtotalBase] = useState<number>(0);
  const [ivaCalculado, setIvaCalculado] = useState<number>(0);
  const [totalGeneral, setTotalGeneral] = useState<number>(0);

  const token = localStorage.getItem("token");

  // 1. Cargar Clientes y Productos en paralelo
  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [resClientes, resProductos] = await Promise.all([
        fetch("http://localhost:3000/api/clientes", { method: "GET", headers }),
        fetch("http://localhost:3000/api/productos", { method: "GET", headers }),
      ]);

      if (!resClientes.ok || !resProductos.ok) {
        throw new Error("Error al sincronizar los catálogos del servidor local");
      }

      const dataClientes = await resClientes.json();
      const dataProductos = await resProductos.json();

      setClientes(Array.isArray(dataClientes) ? dataClientes : dataClientes.data || []);
      setProductos(Array.isArray(dataProductos) ? dataProductos : dataProductos.data || []);
    } catch (err: any) {
      setError(err.message || "No se pudo conectar con el backend local");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      cargarDatosIniciales();
    }
  }, [token]);

  // 🔥 EFECTO MÁGICO: Recalcula los totales en tiempo real cada vez que el carrito cambia
  useEffect(() => {
    const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    const iva = subtotal * 0.15; // 15% de IVA sobre la base, cuadrado con el backend
    const total = subtotal + iva;

    setSubtotalBase(subtotal);
    setIvaCalculado(iva);
    setTotalGeneral(total);
  }, [carrito]);

  // 2. Agregar ítem al Carrito de la Factura
  const agregarAlCarrito = () => {
    if (!productoSeleccionado) return;

    const prodInfo = productos.find((p) => p.id === parseInt(productoSeleccionado));
    if (!prodInfo) return;

    const cantidad = parseInt(cantidadInput);
    if (isNaN(cantidad) || cantidad <= 0) {
      alert("Por favor, ingresa una cantidad válida mayor a 0");
      return;
    }

    const itemExistente = carrito.find((item) => item.productoId === prodInfo.id);
    const cantidadTotal = itemExistente ? itemExistente.cantidad + cantidad : cantidad;

    if (prodInfo.stock < cantidadTotal) {
      alert(`¡Stock insuficiente! Solo quedan ${prodInfo.stock} unidades de ${prodInfo.nombre}.`);
      return;
    }

    if (itemExistente) {
      setCarrito(
        carrito.map((item) =>
          item.productoId === prodInfo.id ? { ...item, cantidad: cantidadTotal } : item
        )
      );
    } else {
      setCarrito([
        ...carrito,
        {
          productoId: prodInfo.id,
          codigo: prodInfo.codigo,
          nombre: prodInfo.nombre,
          precio: prodInfo.precio,
          cantidad: cantidad,
          stockDisponible: prodInfo.stock,
        },
      ]);
    }

    setProductoSeleccionado("");
    setCantidadInput("1");
  };

  // 3. Quitar ítem del carrito
  const eliminarDelCarrito = (id: number) => {
    setCarrito(carrito.filter((item) => item.productoId !== id));
  };

  const infoClienteActual = clientes.find((c) => c.id === parseInt(clienteSeleccionado));

  // 5. Enviar la Factura al Backend local
  const procesarFacturacion = async () => {
    if (!clienteSeleccionado) {
      alert("Debes seleccionar un cliente para emitir la factura");
      return;
    }
    if (carrito.length === 0) {
      alert("El carrito está vacío. Agrega productos a la factura.");
      return;
    }

    const tokenFresco = localStorage.getItem("token");

    setSubmitting(true);
    try {
      const response = await fetch("http://localhost:3000/api/ventas", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${tokenFresco}`, 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clienteId: parseInt(clienteSeleccionado),
          productos: carrito.map((item) => ({
            productoId: item.productoId,
            cantidad: item.cantidad,
          })),
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Error al emitir la factura");
      }

      alert("¡Factura guardada con éxito y stock modificado en el servidor!");
      
      setCarrito([]);
      setClienteSeleccionado("");
      
      await cargarDatosIniciales(); // Recarga catálogos para refrescar los stocks visuales
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p style={{ color: "#00f2fe", padding: "20px" }}>Sincronizando sistemas de facturación...</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🧾 Módulo de Facturación e Impuestos</h2>

      {error && <div style={styles.errorAlert}>{error}</div>}

      <div style={styles.layoutGrid}>
        
        {/* COLUMNA IZQUIERDA: SELECTORES Y CARRITO */}
        <div style={styles.colLeft}>
          
          {/* SELECCIÓN DE CLIENTE */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>👤 Datos del Cliente</h3>
            <select
              value={clienteSeleccionado}
              onChange={(e) => setClienteSeleccionado(e.target.value)}
              style={styles.select}
            >
              <option value="">-- Selecciona un Cliente Registrado --</option>
              {clientes.map((c) => (
                <option key={`cliente-opt-${c.id}`} value={c.id}>
                  {c.nombre} ({c.cedula})
                </option>
              ))}
            </select>
          </div>

          {/* AGREGAR PRODUCTOS */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🔨 Añadir Artículos al Detalle</h3>
            <div style={styles.formRow}>
              <select
                value={productoSeleccionado}
                onChange={(e) => setProductoSeleccionado(e.target.value)}
                style={{ ...styles.select, flex: 2 }}
              >
                <option value="">-- Buscar Producto / Stock --</option>
                {productos.map((p) => (
                  <option key={`prod-opt-${p.id}`} value={p.id} disabled={p.stock <= 0}>
                    {p.nombre} - ${p.precio.toFixed(2)} {p.stock <= 0 ? "[AGOTADO]" : `(Stock: ${p.stock})`}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                value={cantidadInput}
                onChange={(e) => setCantidadInput(e.target.value)}
                placeholder="Cant"
                style={styles.inputCant}
              />

              <button onClick={agregarAlCarrito} style={styles.btnAgregar}>
                ➕ Añadir
              </button>
            </div>
          </div>

          {/* TABLA PREVIA DEL CARRITO */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🛒 Ítems agregados temporalmente</h3>
            {carrito.length === 0 ? (
              <p style={{ color: "#888", fontSize: "14px" }}>Ningún producto añadido todavía.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Descripción</th>
                    <th style={styles.th}>Cant.</th>
                    <th style={styles.th}>P. Unit.</th>
                    <th style={styles.th}>Total</th>
                    <th style={styles.th}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.map((item) => (
                    <tr key={`cart-row-${item.productoId}`} style={styles.tr}>
                      <td style={styles.td}>{item.nombre}</td>
                      <td style={styles.td}>{item.cantidad} u</td>
                      <td style={styles.td}>${item.precio.toFixed(2)}</td>
                      <td style={styles.td}>${(item.precio * item.cantidad).toFixed(2)}</td>
                      <td style={styles.td}>
                        <button onClick={() => eliminarDelCarrito(item.productoId)} style={styles.btnQuitar}>
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: VISTA PREVIA DE LA FACTURA TIPO RECIBO */}
        <div style={styles.colRight}>
          <div style={styles.facturaPapel}>
            <div style={styles.facturaHeader}>
              <h4>FERRETERÍA ESTÁNDAR S.A.</h4>
              <p>RUC: 0102030405001</p>
              <p style={{ fontSize: "12px", color: "#888" }}>Cuenca - Ecuador</p>
              <div style={styles.lineaDiscontinua} />
              <h5 style={styles.facturaTitulo}>PREVISTA DE FACTURA</h5>
            </div>

            <div style={styles.facturaCuerpo}>
              <p>
                <strong>Fecha:</strong> <span>{new Date().toLocaleDateString()}</span>
              </p>
              <p>
                <strong>Cliente:</strong>{" "}
                <span>{infoClienteActual ? infoClienteActual.nombre : "Consumidor Final"}</span>
              </p>
              <p>
                <strong>Cédula/RUC:</strong>{" "}
                <span>{infoClienteActual ? infoClienteActual.cedula : "9999999999999"}</span>
              </p>
              <p>
                <strong>Email:</strong>{" "}
                <span>{infoClienteActual ? infoClienteActual.email : "S/N"}</span>
              </p>

              <div style={styles.lineaDiscontinua} />

              {/* DETALLE REDUCIDO TIPO TICKET */}
              {carrito.map((item) => (
                <div key={`ticket-item-${item.productoId}`} style={styles.ticketRow}>
                  <span>{item.nombre} (x{item.cantidad})</span>
                  <span>${(item.precio * item.cantidad).toFixed(2)}</span>
                </div>
              ))}

              <div style={styles.lineaDiscontinua} />

              {/* DESGLOSE DE IMPUESTOS AJUSTADO A PRECIOS NETOS */}
              <div style={styles.totalesRow}>
                <span>Subtotal Neto:</span>
                <span>${subtotalBase.toFixed(2)}</span>
              </div>
              <div style={styles.totalesRow}>
                <span>IVA (15%):</span>
                <span>${ivaCalculado.toFixed(2)}</span>
              </div>
              <div style={{ ...styles.totalesRow, fontSize: "18px", fontWeight: "bold", color: "#00f2fe" }}>
                <span>TOTAL A PAGAR:</span>
                <span>${totalGeneral.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={procesarFacturacion}
              disabled={submitting || carrito.length === 0}
              style={{
                ...styles.btnFacturar,
                opacity: carrito.length === 0 || submitting ? 0.4 : 1,
              }}
            >
              {submitting ? "Procesando Cobro..." : "🖨️ Emitir y Guardar Factura"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: { width: "100%", maxWidth: "1200px", margin: "0 auto", fontFamily: "'Segoe UI', sans-serif", color: "#fff" },
  title: { color: "#00f2fe", fontSize: "28px", marginBottom: "25px", borderBottom: "2px solid #1a4294", paddingBottom: "10px" },
  layoutGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "30px" },
  colLeft: { display: "flex", flexDirection: "column", gap: "20px" },
  colRight: { display: "flex", justifyContent: "center", alignItems: "flex-start" },
  card: { background: "rgba(30, 41, 59, 0.6)", padding: "20px", borderRadius: "14px", border: "1px solid rgba(255, 255, 255, 0.08)" },
  cardTitle: { color: "#ffffff", fontSize: "16px", marginBottom: "15px", fontWeight: "600" },
  select: { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #2c3a4e", backgroundColor: "#0f172a", color: "#fff", fontSize: "14px", outline: "none" },
  formRow: { display: "flex", gap: "10px" },
  inputCant: { width: "70px", padding: "12px", borderRadius: "8px", border: "1px solid #2c3a4e", backgroundColor: "#0f172a", color: "#fff", fontSize: "14px", textAlign: "center" },
  btnAgregar: { padding: "12px 20px", background: "#0052d4", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse", color: "#e2e8f0", fontSize: "14px", marginTop: "10px" },
  th: { padding: "10px", borderBottom: "2px solid #2c3a4e", color: "#00f2fe", textAlign: "left" },
  td: { padding: "10px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" },
  tr: { backgroundColor: "rgba(30, 41, 59, 0.2)" },
  btnQuitar: { background: "none", border: "none", cursor: "pointer", fontSize: "16px" },
  facturaPapel: { background: "#111827", width: "100%", maxWidth: "380px", padding: "25px", borderRadius: "16px", border: "2px dashed #1a4294", boxShadow: "0px 10px 30px rgba(0, 242, 254, 0.05)" },
  facturaHeader: { textAlign: "center", marginBottom: "15px" },
  facturaTitulo: { letterSpacing: "2px", color: "#00f2fe", margin: "10px 0", fontSize: "14px", fontWeight: "bold" },
  lineaDiscontinua: { borderBottom: "1px dashed rgba(255, 255, 255, 0.2)", margin: "15px 0" },
  facturaCuerpo: { fontSize: "14px", lineHeight: "1.8", color: "#cbd5e1" },
  ticketRow: { display: "flex", justifyContent: "space-between", fontSize: "13px", margin: "4px 0" },
  totalesRow: { display: "flex", justifyContent: "space-between", margin: "6px 0" },
  btnFacturar: { width: "100%", marginTop: "25px", padding: "15px", background: "linear-gradient(90deg, #00f2fe 0%, #4facfe 100%)", color: "#000", border: "none", borderRadius: "10px", fontWeight: "bold", fontSize: "16px", cursor: "pointer", boxShadow: "0px 4px 15px rgba(0, 242, 254, 0.3)" },
  errorAlert: { backgroundColor: "#fde8e8", color: "#9b1c1c", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontWeight: "bold", textAlign: "center" }
};