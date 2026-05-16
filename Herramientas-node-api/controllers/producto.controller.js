// Herramientas-node-api/controllers/producto.controller.js
const { ValidationError, NotFoundError } = require('../utils/errors');
const { validationResult } = require('express-validator');

// Simulamos la tabla de Productos en memoria
let productosDB = [
    { id: 1, nombre: "Martillo 16oz", descripcion: "Martillo de acero", precio: 12.50, stock: 25, categoriaId: 1 },
    { id: 2, nombre: "Cable Eléctrico No. 12 AWG", descripcion: "Cable de cobre por metros", precio: 1.20, stock: 150, categoriaId: 2 },
    { id: 3, nombre: "Pintura Látex Suprema 1G", descripcion: "Pintura lavable color blanco para interiores", precio: 22.00, stock: 10, categoriaId: 3 },
    { id: 4, nombre: "Destornillador Phillips", descripcion: "Destornillador punta de estrella", precio: 4.50, stock: 40, categoriaId: 1 }
];

// 1. Obtener todos los productos (Con filtros, búsquedas y paginación)
const obtenerProductos = async (req, res, next) => {
    try {
        const { page, limit, search, categoriaId, minPrice, maxPrice } = req.query;
        
        let productosFiltrados = [...productosDB];

        // Filtro por búsqueda (nombre o descripción)
        if (search) {
            const query = search.toLowerCase();
            productosFiltrados = productosFiltrados.filter(p => 
                p.nombre.toLowerCase().includes(query) || 
                p.descripcion.toLowerCase().includes(query)
            );
        }

        // Filtro por Categoría
        if (categoriaId) {
            productosFiltrados = productosFiltrados.filter(p => p.categoriaId === parseInt(categoriaId));
        }

        // Filtro por Precios
        if (minPrice) {
            productosFiltrados = productosFiltrados.filter(p => p.precio >= parseFloat(minPrice));
        }
        if (maxPrice) {
            productosFiltrados = productosFiltrados.filter(p => p.precio <= parseFloat(maxPrice));
        }

        // Lógica de Paginación simulada
        const p = parseInt(page) || 1;
        const l = parseInt(limit) || 10;
        const offset = (p - 1) * l;
        
        const count = productosFiltrados.length;
        const rows = productosFiltrados.slice(offset, offset + l);

        res.json({
            data: rows,
            pagination: {
                total: count,
                page: p,
                limit: l,
                totalPages: Math.ceil(count / l)
            }
        });
    } catch (error) {
        next(error);
    }
};

// 2. Obtener producto por ID
const obtenerProductoPorId = async (req, res, next) => {
    try {
        const producto = productosDB.find(p => p.id === parseInt(req.params.id));
        if (!producto) {
            throw new NotFoundError('Producto not found');
        }
        res.json(producto);
    } catch (error) {
        next(error);
    }
};

// 3. Crear Producto
const crearProducto = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ValidationError('Validation failed', errors.array());
        }

        const { nombre, descripcion, precio, stock, categoriaId } = req.body;

        const nuevoProducto = {
            id: productosDB.length > 0 ? productosDB[productosDB.length - 1].id + 1 : 1,
            nombre,
            descripcion: descripcion || "",
            precio: parseFloat(precio),
            stock: parseInt(stock) || 0,
            categoriaId: parseInt(categoriaId)
        };

        productosDB.push(nuevoProducto);
        res.status(201).json(nuevoProducto);
    } catch (error) {
        next(error);
    }
};

// 4. Actualizar Producto
const actualizarProducto = async (req, res, next) => {
    try {
        const productoIndex = productosDB.findIndex(p => p.id === parseInt(req.params.id));
        if (productoIndex === -1) {
            throw new NotFoundError('Producto not found');
        }

        // Actualizamos los campos recibidos
        productosDB[productoIndex] = {
            ...productosDB[productoIndex],
            ...req.body,
            id: productosDB[productoIndex].id // Aseguramos que no cambie el ID
        };

        res.json(productosDB[productoIndex]);
    } catch (error) {
        next(error);
    }
};

// 5. Eliminar Producto
const eliminarProducto = async (req, res, next) => {
    try {
        const productoIndex = productosDB.findIndex(p => p.id === parseInt(req.params.id));
        if (productoIndex === -1) {
            throw new NotFoundError('Producto not found');
        }

        productosDB.splice(productoIndex, 1);
        res.status(204).send(); // Estado 204 No Content (Exitoso)
    } catch (error) {
        next(error);
    }
};

// Exportamos también la base de datos simulada para que el módulo de ventas pueda restar stock luego
module.exports = {
    obtenerProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    productosDB
};