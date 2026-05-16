/**
 * @swagger
 * /api/clientes:
 *   get:
 *     summary: Get all clientes
 *     tags: [Clientes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of clientes
 *   post:
 *     summary: Create cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identificacion
 *               - nombre
 *               - apellido
 *               - email
 *               - telefono
 *               - direccion
 *             properties:
 *               identificacion:
 *                 type: string
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               email:
 *                 type: string
 *               telefono:
 *                 type: string
 *               direccion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente created
 *
 * /api/clientes/{id}:
 *   get:
 *     summary: Get cliente by ID
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cliente found
 *   put:
 *     summary: Update cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cliente updated
 *   delete:
 *     summary: Delete cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Cliente deleted
 */

// Conserva tus comentarios @swagger aquí arriba...

const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const clienteController = require('../controllers/cliente.controller');

const router = express.Router();

// Todas las rutas de clientes requieren token válido
router.use(authenticate);

// GET: Listar clientes con filtros (vendedores y admins)
router.get('/', authorize('admin', 'vendedor'), clienteController.obtenerClientes);

// POST: Crear cliente
router.post(
  '/',
  authorize('admin', 'vendedor'),
  [
    body('identificacion').notEmpty().withMessage('Identificacion is required'),
    body('nombre').notEmpty().withMessage('Nombre is required'),
    body('apellido').notEmpty().withMessage('Apellido is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('telefono').notEmpty().withMessage('Telefono is required'),
    body('direccion').notEmpty().withMessage('Direccion is required')
  ],
  clienteController.crearCliente
);

// GET BY ID: Buscar uno
router.get('/:id', clienteController.obtenerClientePorId);

// PUT: Editar cliente
router.put('/:id', authorize('admin', 'vendedor'), clienteController.actualizarCliente);

// DELETE: Borrar cliente (Solo administrador)
router.delete('/:id', authorize('admin'), clienteController.eliminarCliente);

module.exports = router;