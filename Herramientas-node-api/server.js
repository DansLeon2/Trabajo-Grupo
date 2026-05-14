const express = require('express');
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');

const sequelize = require('./config/db');
const { errorHandler } = require('./middleware/error-handler');
const { swaggerSpec } = require('./config/swagger');
const authRoutes = require('./routes/auth.routes');
const categoriaRoutes = require('./routes/categoria.routes');
const productoRoutes = require('./routes/producto.routes');
const clienteRoutes = require('./routes/cliente.routes');
const ventaRoutes = require('./routes/venta.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// ====================================================================
// 🚀 BYPASS DE LOGIN TEMPORAL (Para probar el frontend sin Base de Datos / Docker)
// ====================================================================
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'walter' && password === '123') {
    return res.status(200).json({
      message: "¡Login exitoso!",
      token: "jwt_token_falso_de_prueba",
      user: { username: "walter", rol: "admin" }
    });
  } else {
    return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
  }
});
// ====================================================================

app.use('/api/auth', authRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/ventas', ventaRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

app.get("/api/hello", (req, res) => {
    res.status(200).json({ message: "Hello, World!" });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully');
    return sequelize.sync();
  })
  .catch((err) => {
    console.error('⚠️ [Aviso] No hay base de datos conectada o falta Docker, pero el servidor seguirá funcionando.');
  });
app.listen(PORT, () => {
  console.log(`\n=====================================================`);
  console.log(`🚀 Servidor ejecutándose exitosamente en el puerto ${PORT}`);
  console.log(`📂 Swagger disponible en http://localhost:${PORT}/api-docs`);
  console.log(`=====================================================\n`);
});