// Herramientas-node-api/controllers/cliente.controller.js
const { ValidationError, NotFoundError } = require('../utils/errors');
const { validationResult } = require('express-validator');

// Simulamos la tabla de Clientes en memoria
let clientesDB = [
    { id: 1, identificacion: "0102030405", nombre: "Juan", apellido: "Pérez", email: "juan@correo.com", telefono: "0987654321", direccion: "Av. Solano, Cuenca" },
    { id: 2, identificacion: "0107080901", nombre: "María", apellido: "Cárdenas", email: "maria@correo.com", telefono: "0991234567", direccion: "Centro Histórico, Cuenca" },
    { id: 3, identificacion: "0103948576", nombre: "Carlos", apellido: "Mendieta", email: "carlos@correo.com", telefono: "0984445556", direccion: "Monay, Cuenca" }
];

// 1. Obtener todos los clientes (Con paginación y búsqueda integrada)
const obtenerClientes = async (req, res, next) => {
    try {
        const { page, limit, search } = req.query;

        let clientesFiltrados = [...clientesDB];

        // Filtro de búsqueda por múltiples campos (Simulando el Op.or de Sequelize)
        if (search) {
            const query = search.toLowerCase();
            clientesFiltrados = clientesFiltrados.filter(c => 
                c.nombre.toLowerCase().includes(query) ||
                c.apellido.toLowerCase().includes(query) ||
                c.email.toLowerCase().includes(query) ||
                c.identificacion.includes(query)
            );
        }

        // Lógica de Paginación en memoria
        const p = parseInt(page) || 1;
        const l = parseInt(limit) || 10;
        const offset = (p - 1) * l;

        const count = clientesFiltrados.length;
        const rows = clientesFiltrados.slice(offset, offset + l);

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

// 2. Obtener cliente por ID
const obtenerClientePorId = async (req, res, next) => {
    try {
        const cliente = clientesDB.find(c => c.id === parseInt(req.params.id));
        if (!cliente) {
            throw new NotFoundError('Cliente not found');
        }
        res.json(cliente);
    } catch (error) {
        next(error);
    }
};

// 3. Crear Cliente
const crearCliente = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ValidationError('Validation failed', errors.array());
        }

        const { identificacion, nombre, apellido, email, telefono, direccion } = req.body;

        const nuevoCliente = {
            id: clientesDB.length > 0 ? clientesDB[clientesDB.length - 1].id + 1 : 1,
            identificacion,
            nombre,
            apellido,
            email,
            telefono,
            direccion
        };

        clientesDB.push(nuevoCliente);
        res.status(201).json(nuevoCliente);
    } catch (error) {
        next(error);
    }
};

// 4. Actualizar Cliente
const actualizarCliente = async (req, res, next) => {
    try {
        const clienteIndex = clientesDB.findIndex(c => c.id === parseInt(req.params.id));
        if (clienteIndex === -1) {
            throw new NotFoundError('Cliente not found');
        }

        // Modificamos sus campos manteniendo el ID intacto
        clientesDB[clienteIndex] = {
            ...clientesDB[clienteIndex],
            ...req.body,
            id: clientesDB[clienteIndex].id
        };

        res.json(clientesDB[clienteIndex]);
    } catch (error) {
        next(error);
    }
};

// 5. Eliminar Cliente
const eliminarCliente = async (req, res, next) => {
    try {
        const clienteIndex = clientesDB.findIndex(c => c.id === parseInt(req.params.id));
        if (clienteIndex === -1) {
            throw new NotFoundError('Cliente not found');
        }

        clientesDB.splice(clienteIndex, 1);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    obtenerClientes,
    obtenerClientePorId,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    clientesDB
};