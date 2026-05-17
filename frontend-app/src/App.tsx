import { useState } from 'react'; 
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Login } from './components/Login';
import { Clientes } from './components/Clientes'; 
import { Productos } from './components/Productos'; 
import { Ventas } from "./components/Ventas"; // ✨ Apuntamos a la carpeta components si lo guardaste ahí
import './App.css';

const DashboardReal = () => {
  const navigate = useNavigate();
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : { username: "Usuario" };

  // 💡 EXPANDIMOS EL ESTADO PARA QUE ACEPTA TAMBIÉN LA PESTAÑA 'ventas'
  const [vistaActual, setVistaActual] = useState<'clientes' | 'productos' | 'ventas'>('clientes');

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#06131d", color: "#fff" }}>
      
      {/* BARRA LATERAL (SIDEBAR) */}
      <div style={{ width: "260px", backgroundColor: "#0f172a", borderRight: "1px solid rgba(255,255,255,0.1)", padding: "30px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ color: "#00f2fe", fontSize: "20px", marginBottom: "30px", letterSpacing: "1px" }}>⚒️ FERRETERÍA</h2>
          <p style={{ fontSize: "14px", color: "#aaa", marginBottom: "40px" }}>Sesión: <strong style={{ color: "#fff" }}>{user.username}</strong></p>
          
          <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            
            {/* BOTÓN CLIENTES */}
            <button 
              onClick={() => setVistaActual('clientes')} 
              style={{ 
                padding: "14px", 
                textAlign: "left", 
                borderRadius: "8px", 
                border: "none", 
                backgroundColor: vistaActual === 'clientes' ? "#1a4294" : "transparent", 
                color: vistaActual === 'clientes' ? "#fff" : "#aaa", 
                fontWeight: "bold", 
                cursor: "pointer", 
                width: "100%",
                transition: "all 0.2s ease"
              }}
            >
              👥 Clientes
            </button>

            {/* BOTÓN PRODUCTOS */}
            <button 
              onClick={() => setVistaActual('productos')} 
              style={{ 
                padding: "14px", 
                textAlign: "left", 
                borderRadius: "8px", 
                border: "none", 
                backgroundColor: vistaActual === 'productos' ? "#1a4294" : "transparent", 
                color: vistaActual === 'productos' ? "#fff" : "#aaa", 
                fontWeight: "bold", 
                cursor: "pointer", 
                width: "100%",
                transition: "all 0.2s ease"
              }}
            >
              📦 Productos
            </button>

            {/* ✨ BOTÓN VENTAS ACTIVADO (¡NUEVO!) */}
            <button 
              onClick={() => setVistaActual('ventas')} 
              style={{ 
                padding: "14px", 
                textAlign: "left", 
                borderRadius: "8px", 
                border: "none", 
                backgroundColor: vistaActual === 'ventas' ? "#1a4294" : "transparent", 
                color: vistaActual === 'ventas' ? "#fff" : "#aaa", 
                fontWeight: "bold", 
                cursor: "pointer", 
                width: "100%",
                transition: "all 0.2s ease"
              }}
            >
              🛒 Crear Venta
            </button>
          </nav>
        </div>

        <button 
          onClick={handleLogout}
          style={{ padding: "12px", backgroundColor: "#9b1c1c", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", width: "100%" }}
        >
          Cerrar Sesión
        </button>
      </div>

      {/* CONTENIDO PRINCIPAL DINÁMICO */}
      <div style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        {/* 💡 EVALUAMOS LAS TRES OPCIONES USANDO UN SWITCH O UN CONDICIONAL TRIPLE */}
        {vistaActual === 'clientes' && <Clientes />}
        {vistaActual === 'productos' && <Productos />}
        {vistaActual === 'ventas' && <Ventas />}
      </div>

    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <>
              <section id="center">
                <Login />
              </section>
              <div className="ticks"></div>
              <section id="spacer"></section>
            </>
          } 
        />
        <Route path="/dashboard" element={<DashboardReal />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;