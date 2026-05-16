// Herramientas-node-api/controllers/categoria.controller.js
const { ValidationError } = require('../utils/errors');
const { validationResult } = require('express-validator');

// Simulamos la tabla de Categorías en memoria
let categoriasDB = [
    { id: 1, nombre: "Herramientas Manuales", descripcion: "Martillos, destornilladores, pinzas" },
    { id: 2, nombre: "Material Eléctrico", descripcion: "Cables, tomacorrientes, interruptores" },
    { id: 3, nombre: "Pinturas y Acabados", descripcion: "Brochas, pinturas, solventes" }
];

// 1. Obtener todas las categorías
const obtenerCategorias = async (req, res, next) => {
    try {
        res.status(200).json(categoriasDB);
    } catch (error) {
        next(error);
    }
};

// 2. Crear una nueva categoría
const crearCategoria = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ValidationError('Validation failed', errors.array());
        }

        const { nombre, descripcion } = req.body;

        const nuevaCategoria = {
            id: categoriasDB.length > 0 ? categoriasDB[categoriasDB.length - 1].id + 1 : 1,
            nombre,
            descripcion: descripcion || ""
        };

        categoriasDB.push(nuevaCategoria);
        res.status(201).json({ message: "Categoría creada con éxito", categoria: nuevaCategoria });
    } catch (error) {
        next(error);
    }
};

// 3. Eliminar una categoría
const eliminarCategoria = async (req, res, next) => {
    try {
        const { id } = req.params;
        const categoriaExiste = categoriasDB.some(c => c.id === parseInt(id));

        if (!categoriaExiste) {
            return res.status(404).json({ message: "Categoría no encontrada" });
        }

        categoriasDB = categoriasDB.filter(c => c.id !== parseInt(id));
        res.status(200).json({ message: "Categoría eliminada correctamente" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    obtenerCategorias,
    crearCategoria,
    eliminarCategoria
};