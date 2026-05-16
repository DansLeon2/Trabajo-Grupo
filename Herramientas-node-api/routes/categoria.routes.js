// Herramientas-node-api/routes/categoria.routes.js
const express = require('express');
const { body } = require('express-validator');
const categoriaController = require('../controllers/categoria.controller');

const router = express.Router();

// GET: http://localhost:3000/api/categorias
router.get('/', categoriaController.obtenerCategorias);

// POST: http://localhost:3000/api/categorias
router.post(
    '/',
    [
        body('nombre').notEmpty().withMessage('El nombre de la categoría es requerido')
    ],
    categoriaController.crearCategoria
);

// DELETE: http://localhost:3000/api/categorias/:id
router.delete('/:id', categoriaController.eliminarCategoria);

module.exports = router;