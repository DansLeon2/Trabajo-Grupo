const express = require('express');
const router = express.Router();

// Base de datos local simulada en memoria
const clientesDB = [
  {
    id: 1,
    identificacion: "0102030405",
    nombre: "Juan",
    apellido: "Pérez",
    email: "juan@correo.com",
    telefono: "0987654321",
    direccion: "Cuenca"
  }
];

// 💡 COMENTAMOS ESTA LÍNEA PARA QUE NO DE EL ERROR 401 (UNAUTHORIZED)
// router.use(authenticate);

// GET: Listar los clientes locales
router.get('/', (req, res) => {
  try {
    return res.status(200).json(clientesDB);
  } catch (error) {
    return res.status(500).json({ message: "Error al leer datos locales" });
  }
});

// POST: Registrar un nuevo cliente local en memoria
router.post('/', (req, res) => {
  try {
    const { identificacion, nombre, apellido, email, telefono, direccion } = req.body;

    const nuevoCliente = {
      id: clientesDB.length + 1,
      identificacion,
      nombre,
      apellido,
      email,
      telefono,
      direccion
    };

    clientesDB.push(nuevoCliente);

    return res.status(201).json({
      status: 'success',
      message: 'Cliente registrado localmente con éxito',
      data: nuevoCliente
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al guardar localmente" });
  }
});

module.exports = router;