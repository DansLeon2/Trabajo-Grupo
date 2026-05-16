// Herramientas-node-api/controllers/venta.controller.js
const { ValidationError, NotFoundError } = require('../utils/errors');
const { validationResult } = require('express-validator');

// Importamos las bases de datos simuladas de productos y clientes para cruzarlas y restar stock
const { productosDB } = require('./producto.controller');
const { clientesDB } = require('./cliente.controller');

// Simulamos las tablas de Ventas y DetalleVentas en memoria
let ventasDB = [];
let detallesVentaDB = [];

// 1. Obtener todas las ventas (Con paginación y filtros por cliente o fecha)
const obtenerVentas = async (req, res, next) => {
    try {
        const { page, limit, clienteId, startDate, endDate } = req.query;
        let ventasFiltradas = [...ventasDB];

        // Filtro por Cliente
        if (clienteId) {
            ventasFiltradas = ventasFiltradas.filter(v => v.clienteId === parseInt(clienteId));
        }

        // Filtro por Fechas
        if (startDate) {
            const start = new Date(startDate);
            ventasFiltradas = ventasFiltradas.filter(v => new Date(v.fecha) >= start);
        }
        if (endDate) {
            const end = new Date(endDate);
            ventasFiltradas = ventasFiltradas.filter(v => new Date(v.fecha) <= end);
        }

        // Estructurar la respuesta incluyendo el Cliente y sus Detalles (Simulando el "include" de Sequelize)
        const ventasCompletas = ventasFiltradas.map(venta => {
            const cliente = clientesDB.find(c => c.id === venta.clienteId) || null;
            const detalles = detallesVentaDB
                .filter(d => d.ventaId === venta.id)
                .map(detalle => {
                    const producto = productosDB.find(p => p.id === detalle.productoId) || null;
                    return { ...detalle, producto };
                });

            return { ...venta, cliente, detalles };
        });

        // Paginación
        const p = parseInt(page) || 1;
        const l = parseInt(limit) || 10;
        const offset = (p - 1) * l;

        const count = ventasCompletas.length;
        const rows = ventasCompletas.slice(offset, offset + l);

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

// 2. Crear una nueva Venta (Lógica del Carrito con reducción de stock)
const crearVenta = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ValidationError('Validation failed', errors.array());
        }

        const { clienteId, productos } = req.body;

        // Validar si existe el cliente
        const cliente = clientesDB.find(c => c.id === parseInt(clienteId));
        if (!cliente) {
            throw new NotFoundError('Cliente not found');
        }

        let total = 0;
        const detallesTemporales = [];

        // Validar stock de cada producto y calcular precios
        for (const item of productos) {
            const productoIndex = productosDB.findIndex(p => p.id === parseInt(item.productoId));
            
            if (productoIndex === -1) {
                throw new NotFoundError(`Producto ${item.productoId} not found`);
            }

            const producto = productosDB[productoIndex];

            if (producto.stock < item.cantidad) {
                throw new ValidationError(`Insufficient stock for producto ${producto.nombre}`);
            }

            const subtotal = parseFloat(producto.precio) * parseInt(item.cantidad);
            total += subtotal;

            // Restar stock directamente de la base de datos simulada en memoria
            productosDB[productoIndex].stock -= parseInt(item.cantidad);

            detallesTemporales.push({
                id: detallesVentaDB.length + detallesTemporales.length + 1,
                cantidad: parseInt(item.cantidad),
                precioUnitario: producto.precio,
                subtotal: subtotal,
                productoId: item.productoId
            });
        }

        // Crear la cabecera de la venta
        const nuevaVenta = {
            id: ventasDB.length > 0 ? ventasDB[ventasDB.length - 1].id + 1 : 1,
            fecha: new Date(),
            total: total,
            clienteId: parseInt(clienteId)
        };
        ventasDB.push(nuevaVenta);

        // Guardar los detalles asignándoles el ID de la venta creada
        const detallesGuardados = detallesTemporales.map(detalle => {
            const detCompleto = { ...detalle, ventaId: nuevaVenta.id };
            detallesVentaDB.push(detCompleto);
            
            // Adjuntamos la información extendida del producto para la respuesta final
            const prodInfo = productosDB.find(p => p.id === detalle.productoId);
            return { ...detCompleto, producto: prodInfo };
        });

        // Responder con la venta armada idéntica a como lo haría Sequelize
        res.status(201).json({
            ...nuevaVenta,
            cliente,
            detalles: detallesGuardados
        });
    } catch (error) {
        next(error);
    }
};

// 3. Obtener venta por ID con todos sus detalles armados
const obtenerVentaPorId = async (req, res, next) => {
    try {
        const venta = ventasDB.find(v => v.id === parseInt(req.params.id));
        if (!venta) {
            throw new NotFoundError('Venta not found');
        }

        const cliente = clientesDB.find(c => c.id === venta.clienteId) || null;
        const detalles = detallesVentaDB
            .filter(d => d.ventaId === venta.id)
            .map(detalle => {
                const producto = productosDB.find(p => p.id === detalle.productoId) || null;
                return { ...detalle, producto };
            });

        res.json({ ...venta, cliente, detalles });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    obtenerVentas,
    crearVenta,
    obtenerVentaPorId
};