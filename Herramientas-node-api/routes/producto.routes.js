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

// 💡 Comentamos los middlewares que piden tokens para que no bloqueen tu frontend
// const { authenticate, authorize } = require('../middleware/auth');
// const productoController = require('../controllers/producto.controller');

const router = express.Router();

// 📦 BASE DE DATOS LOCAL SIMULADA EN MEMORIA (PRODUCTOS)
const productosDB = [
  {
    id: 1,
    codigo: "PROD001",
    nombre: "Martillo",
    precio: 12.50,
    stock: 45,
    categoriaId: 1,
    descripcion: "Martillo de acero de alta resistencia"
  }
];

// Todas las rutas de productos requieren autenticación (COMENTADO)
// router.use(authenticate);

// 1. GET: Listar todos los productos locales
router.get('/', (req, res) => {
  try {
    return res.status(200).json(productosDB);
  } catch (error) {
    return res.status(500).json({ message: "Error al leer inventario local" });
  }
});

// 2. POST: Crear producto localmente en memoria (Sin filtros de roles)
router.post(
  '/',
  [
    body('nombre').notEmpty().withMessage('Nombre is required'),
    body('precio').isFloat({ min: 0 }).withMessage('Precio must be a positive number')
  ],
  (req, res) => {
    try {
      const { codigo, nombre, precio, stock, categoriaId, descripcion } = req.body;

      const nuevoProducto = {
        id: productosDB.length + 1,
        codigo: codigo || `PROD00${productosDB.length + 1}`, // Código por defecto por si acaso
        nombre,
        precio: parseFloat(precio),
        stock: parseInt(stock) || 0,
        categoriaId: parseInt(categoriaId) || 1,
        descripcion: descripcion || ""
      };

      productosDB.push(nuevoProducto);

      return res.status(201).json({
        status: 'success',
        message: 'Producto registrado localmente con éxito',
        data: nuevoProducto
      });
    } catch (error) {
      return res.status(500).json({ message: "Error al guardar el producto local" });
    }
  }
);

// 3. GET BY ID: Obtener un solo producto local
router.get('/:id', (req, res) => {
  const producto = productosDB.find(p => p.id === parseInt(req.params.id));
  if (!producto) return res.status(404).json({ message: "Producto no encontrado" });
  return res.status(200).json(producto);
});

// 4. PUT: Modificar producto local (Sin filtros de roles)
router.put('/:id', (req, res) => {
  const producto = productosDB.find(p => p.id === parseInt(req.params.id));
  if (!producto) return res.status(404).json({ message: "Producto no encontrado" });

  const { codigo, nombre, precio, stock, categoriaId, descripcion } = req.body;
  
  if(codigo) producto.codigo = codigo;
  if(nombre) producto.nombre = nombre;
  if(precio) producto.precio = parseFloat(precio);
  if(stock) producto.stock = parseInt(stock);
  if(categoriaId) producto.categoriaId = parseInt(categoriaId);
  if(descripcion) producto.descripcion = descripcion;

  return res.status(200).json({ status: 'success', data: producto });
});

// 5. DELETE: Eliminar producto local (Sin filtros de roles)
router.delete('/:id', (req, res) => {
  const index = productosDB.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Producto no encontrado" });

  productosDB.splice(index, 1);
  return res.status(204).send();
});

module.exports = router;