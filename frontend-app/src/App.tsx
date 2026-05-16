import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Login } from './components/Login';
import './App.css';

// Componente temporal para el Dashboard que crearemos más adelante
const DashboardTemporal = () => {
  const navigate = useNavigate();
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : { username: "Usuario" };

  const handleLogout = () => {
    localStorage.clear(); // Limpia el token y sesión
    navigate("/"); // Te regresa al login
  };

  return (
    <div style={{ padding: "40px", color: "#ffffff", fontFamily: "sans-serif", textAlign: "center" }}>
      <h1 style={{ color: "#00f2fe" }}>🛠️ Panel de Control (Dashboard)</h1>
      <p style={{ fontSize: "18px", margin: "20px 0" }}>
        ¡Hola, <strong>{user.username}</strong>! Has ingresado correctamente usando los datos en memoria.
      </p>
      
      <div style={{ marginTop: "30px", border: "1px dashed #1a4294", padding: "20px", borderRadius: "12px", backgroundColor: "rgba(10, 34, 52, 0.4)" }}>
        <p>Próximamente aquí añadiremos:</p>
        <ul style={{ listStyleType: "none", padding: 0, lineHeight: "2" }}>
          <li>📦 Catálogo de Productos (Ferretería)</li>
          <li>👥 Gestión de Clientes</li>
          <li>🛒 Carrito de Compras y Ventas</li>
        </ul>
      </div>

      <button 
        onClick={handleLogout}
        style={{
          marginTop: "40px",
          padding: "12px 24px",
          backgroundColor: "#9b1c1c",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        Cerrar Sesión
      </button>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta de entrada principal: muestra tu Login cyberpunk */}
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

        {/* Ruta del Panel de Administración al que redirige tras el login */}
        <Route path="/dashboard" element={<DashboardTemporal />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;