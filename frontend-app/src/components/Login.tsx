import React, { useState } from "react";
// 1. Importamos el hook de navegación de react-router-dom
import { useNavigate } from "react-router-dom";

export const Login: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // 2. Inicializamos el navegador
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al iniciar sesión");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // 3. Redireccionamos al usuario a la vista principal en lugar de dejarlo estancado
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.dataWave1}></div>
      <div style={styles.dataWave2}></div>
      <div style={styles.cocoaGlow}></div>

      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={styles.cardHeaderDecoration}></div>

        <h2 style={styles.title}>Iniciar Sesión</h2>
        
        {error && <div style={styles.errorAlert}>{error}</div>}

        <div style={styles.inputGroup}>
          <label style={styles.label}>Usuario</label>
          <div style={styles.inputWrapper}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              style={styles.input}
              required
            />
          </div>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Contraseña</label>
          <div style={styles.inputWrapper}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              style={styles.input}
              required
            />
            <span style={styles.lockIcon}>🔒</span>
          </div>
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Cargando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
};

// Mantén tu objeto de 'const styles' exactamente igual debajo...
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh", 
    width: "100vw",
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    backgroundColor: "#06131d",
    backgroundImage: `
      linear-gradient(rgba(10, 34, 52, 0.6) 1px, transparent 1px),
      linear-gradient(90deg, rgba(10, 34, 52, 0.6) 1px, transparent 1px)
    `,
    backgroundSize: "40px 40px",
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  dataWave1: {
    position: "absolute",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(0, 242, 254, 0.15) 0%, transparent 70%)",
    bottom: "-100px",
    left: "-100px",
    zIndex: 1,
    filter: "blur(40px)",
  },
  dataWave2: {
    position: "absolute",
    width: "700px",
    height: "700px",
    background: "radial-gradient(circle, rgba(26, 66, 148, 0.25) 0%, transparent 70%)",
    top: "-200px",
    right: "-100px",
    zIndex: 1,
    filter: "blur(50px)",
  },
  cocoaGlow: {
    position: "absolute",
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, rgba(212, 175, 55, 0.05) 0%, transparent 70%)",
    bottom: "10%",
    right: "15%",
    zIndex: 1,
    filter: "blur(30px)",
  },
  card: {
    background: "linear-gradient(135deg, rgba(220, 225, 235, 0.9) 0%, rgba(180, 190, 205, 0.95) 100%)",
    padding: "45px 40px",
    borderRadius: "24px", 
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.8)", 
    width: "100%",
    maxWidth: "400px",
    boxSizing: "border-box",
    zIndex: 10,
    border: "1px solid rgba(255, 255, 255, 0.4)",
    position: "relative",
  },
  cardHeaderDecoration: {
    position: "absolute",
    top: "0",
    left: "0",
    right: "0",
    height: "6px",
    background: "linear-gradient(90deg, #1a4294 0%, #00f2fe 50%, #1a4294 100%)",
    borderTopLeftRadius: "24px",
    borderTopRightRadius: "24px",
  },
  title: {
    marginBottom: "32px",
    textAlign: "center",
    color: "#0f1c2e", 
    fontSize: "28px",
    fontWeight: "700",
    letterSpacing: "-0.5px",
    textShadow: "0 1px 1px rgba(255, 255, 255, 0.5)",
  },
  inputGroup: {
    marginBottom: "24px",
    textAlign: "left",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    color: "#3a4a60", 
    fontSize: "14px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px", 
    border: "2px solid #2c3a4e", 
    backgroundColor: "#1e293b", 
    color: "#00f2fe", 
    fontSize: "16px",
    boxSizing: "border-box",
    outline: "none",
    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
    fontWeight: "500",
    letterSpacing: "0.5px",
  },
  lockIcon: {
    position: "absolute",
    right: "16px",
    opacity: 0.6,
    fontSize: "16px",
    userSelect: "none",
  },
  button: {
    width: "100%",
    padding: "16px",
    background: "linear-gradient(180deg, #0052d4 0%, #1a4294 50%, #0a255c 100%)",
    color: "#ffffff", 
    border: "1px solid #002244",
    borderRadius: "12px", 
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "16px",
    boxShadow: "0 6px 20px rgba(26, 66, 148, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)", 
    textShadow: "0 -1px 1px rgba(0,0,0,0.4)",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  errorAlert: {
    backgroundColor: "#fde8e8",
    color: "#9b1c1c",
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "24px",
    fontSize: "14px",
    textAlign: "center",
    fontWeight: "600",
    border: "1px solid #f8b4b4",
  },
};