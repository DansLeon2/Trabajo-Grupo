/**
 * @swagger
 * /api/auth/register:
 * post:
 * summary: Register a new user
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/RegisterRequest'
 * responses:
 * 201:
 * description: User registered successfully
 * 400:
 * description: Validation error
 * 409:
 * description: Username already exists
 */

/**
 * @swagger
 * /api/auth/login:
 * post:
 * summary: Login user
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/LoginRequest'
 * responses:
 * 200:
 * description: Login successful
 * 401:
 * description: Invalid credentials
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { ValidationError, UnauthorizedError, ConflictError } = require('../utils/errors');

const router = express.Router();

// SIMULACIÓN DE BASE DE DATOS EN MEMORIA (ARRAYS LOCALES)
// Ponemos un usuario por defecto para que puedan probar el login de inmediato
const usuariosDB = [
  {
    id: 1,
    username: "admin",
    password: "123", // En texto plano ya que no usaremos bcrypt con DB dinámica
    rol: "admin",
    clienteId: 1
  }
];

const clientesDB = [
  {
    id: 1,
    identificacion: "9999999999",
    nombre: "Admin",
    apellido: "General",
    email: "admin@tienda.com",
    telefono: "0999999999",
    direccion: "Cuenca"
  }
];

// RUTA DE REGISTRO
router.post(
  '/register',
  [
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('nombre').notEmpty().withMessage('Nombre is required'),
    body('apellido').notEmpty().withMessage('Apellido is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ValidationError('Validation failed', errors.array());
      }

      const { username, password, email, nombre, apellido, telefono, direccion, rol } = req.body;

      // Buscar si ya existe el usuario en nuestro array
      const existingUser = usuariosDB.find(u => u.username === username);
      if (existingUser) {
        throw new ConflictError('Username already exists');
      }

      // Crear Cliente en memoria
      const nuevoCliente = {
        id: clientesDB.length + 1,
        identificacion: Date.now().toString(),
        nombre,
        apellido,
        email,
        telefono: telefono || '',
        direccion: direccion || ''
      };
      clientesDB.push(nuevoCliente);

      // Crear Usuario en memoria
      const nuevoUsuario = {
        id: usuariosDB.length + 1,
        username,
        password, // Guardamos directo en texto plano para simplificar las pruebas locales
        rol: rol || 'user',
        clienteId: nuevoCliente.id
      };
      usuariosDB.push(nuevoUsuario);

      // Token falso simulado para cumplir con el frontend
      const token = "token-falso-simulado-xyz123";

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: nuevoUsuario.id,
          username: nuevoUsuario.username,
          rol: nuevoUsuario.rol,
          clienteId: nuevoCliente.id
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// MÓDULO DE USUARIO: LOGIN Y AUTENTICACIÓN 
// Desarrollado por: Walter Pachard
// ==========================================
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ValidationError('Validation failed', errors.array());
      }

      const { username, password } = req.body;

      // Buscar el usuario en nuestro array simulado
      const usuario = usuariosDB.find(u => u.username === username);
      if (!usuario) {
        throw new UnauthorizedError('Invalid credentials');
      }

      // Validar contraseña directa (texto plano)
      if (password !== usuario.password) {
        throw new UnauthorizedError('Invalid credentials');
      }

      // Token falso simulado
      const token = "token-falso-simulado-xyz123";

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: usuario.id,
          username: usuario.username,
          rol: usuario.rol
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;