// frontend-app/src/App.tsx
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Login } from './components/Login';
import { Clientes } from './components/Clientes'; // Importamos el nuevo componente
import './App.css';

const DashboardReal = () => {
  const navigate = useNavigate();
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : { username: "Usuario" };

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
            <button style={{ padding: "14px", textAlign: "left", borderRadius: "8px", border: "none", backgroundColor: "#1a4294", color: "#fff", fontWeight: "bold", cursor: "pointer", width: "100%" }}>
              👥 Clientes
            </button>
            <button style={{ padding: "14px", textAlign: "left", borderRadius: "8px", border: "none", backgroundColor: "transparent", color: "#aaa", fontWeight: "600", cursor: "not-allowed", width: "100%" }}>
              📦 Productos (Próximamente)
            </button>
            <button style={{ padding: "14px", textAlign: "left", borderRadius: "8px", border: "none", backgroundColor: "transparent", color: "#aaa", fontWeight: "600", cursor: "not-allowed", width: "100%" }}>
              🛒 Crear Venta (Próximamente)
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
        {/* Renderizamos directamente el módulo de Clientes */}
        <Clientes />
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