/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Get all productos
 *     tags: [Productos]
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
 *       - in: query
 *         name: categoriaId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of productos
 *   post:
 *     summary: Create producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - precio
 *               - categoriaId
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               precio:
 *                 type: number
 *               stock:
 *                 type: integer
 *               categoriaId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Producto created
 *
 * /api/productos/{id}:
 *   get:
 *     summary: Get producto by ID
 *     tags: [Productos]
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
 *         description: Producto found
 *   put:
 *     summary: Update producto
 *     tags: [Productos]
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
 *         description: Producto updated
 *   delete:
 *     summary: Delete producto
 *     tags: [Productos]
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
 *         description: Producto deleted
 */

const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const productoController = require('../controllers/producto.controller');

const router = express.Router();

// Todas las rutas de productos requieren autenticación
router.use(authenticate);

// GET: Listar con filtros
router.get('/', productoController.obtenerProductos);

// POST: Crear producto (Solo admin y vendedor)
router.post(
  '/',
  authorize('admin', 'vendedor'),
  [
    body('nombre').notEmpty().withMessage('Nombre is required'),
    body('precio').isFloat({ min: 0 }).withMessage('Precio must be a positive number'),
    body('categoriaId').isInt().withMessage('Categoria ID is required')
  ],
  productoController.crearProducto
);

// GET BY ID: Obtener uno solo
router.get('/:id', productoController.obtenerProductoPorId);

// PUT: Modificar producto (Solo admin y vendedor)
router.put('/:id', authorize('admin', 'vendedor'), productoController.actualizarProducto);

// DELETE: Eliminar producto (Solo admin)
router.delete('/:id', authorize('admin'), productoController.eliminarProducto);

module.exports = router;