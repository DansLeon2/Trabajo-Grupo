import React, { useState } from "react";

export const Login: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

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
      
      alert("¡Login exitoso! Bienvenido " + data.user.username);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.title}>Iniciar Sesión</h2>
        
        {error && <div style={styles.errorAlert}>{error}</div>}

        <div style={styles.inputGroup}>
          <label style={styles.label}>Usuario</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ingresa tu usuario"
            style={styles.input}
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            style={styles.input}
            required
          />
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Cargando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "80vh", // Ajustado para que encaje perfecto en el centro del layout del grupo
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  card: {
    background: "#ffffff", // Forzamos fondo blanco de la tarjeta
    padding: "40px",
    borderRadius: "16px", // Esquinas más suaves y modernas
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)", // Sombra elegante de alta fidelidad
    width: "100%",
    maxWidth: "380px",
    boxSizing: "border-box",
  },
  title: {
    marginBottom: "28px",
    textAlign: "center",
    color: "#1a1a1a", // Texto oscuro pulido
    fontSize: "26px",
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: "22px",
    textAlign: "left",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    color: "#666666", // Color gris suave para las etiquetas
    fontSize: "14px",
    fontWeight: "500",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px", // Bordes redondeados estéticos para los campos
    border: "1px solid #e0e0e0", // Borde sutil claro
    backgroundColor: "#ffffff", // FORZAMOS fondo blanco interno para destruir el fondo negro anterior
    color: "#1a1a1a", // Texto del input oscuro para que sea 100% legible
    fontSize: "15px",
    boxSizing: "border-box",
    transition: "all 0.2s ease",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#1a4294", // Azul profundo elegante y corporativo
    color: "#ffffff", // Texto blanco brillante obligado
    border: "none",
    borderRadius: "10px", // Esquinas consistentes con los inputs
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "12px",
    boxShadow: "0 4px 12px rgba(26, 66, 148, 0.2)", // Pequeño resplandor azul abajo del botón
    transition: "background-color 0.2s ease",
  },
  errorAlert: {
    backgroundColor: "#fde8e8",
    color: "#9b1c1c",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    textAlign: "center",
    fontWeight: "500",
  },
};