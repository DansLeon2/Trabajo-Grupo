/**
 * @swagger
 * /api/ventas:
 *   get:
 *     summary: Get all ventas
 *     tags: [Ventas]
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
 *         name: clienteId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of ventas
 *   post:
 *     summary: Create venta
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clienteId
 *               - productos
 *             properties:
 *               clienteId:
 *                 type: integer
 *               productos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productoId:
 *                       type: integer
 *                     cantidad:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Venta created
 *
 * /api/ventas/{id}:
 *   get:
 *     summary: Get venta by ID
 *     tags: [Ventas]
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
 *         description: Venta found
 */

// Conserva tus comentarios @swagger aquí arriba...

const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const ventaController = require('../controllers/venta.controller');

const router = express.Router();

// Todas las rutas de ventas requieren autenticación
router.use(authenticate);

// GET: Historial de ventas filtrado (Admins y Vendedores)
router.get('/', authorize('admin', 'vendedor'), ventaController.obtenerVentas);

// POST: Procesar venta del carrito (Solo Vendedores, según tu middleware original)
router.post(
  '/',
  authorize('vendedor'),
  [
    body('clienteId').isInt().withMessage('Cliente ID is required'),
    body('productos').isArray({ min: 1 }).withMessage('Productos array is required')
  ],
  ventaController.crearVenta
);

// GET BY ID: Consultar factura/venta específica
router.get('/:id', authorize('admin', 'vendedor'), ventaController.obtenerVentaPorId);

module.exports = router;