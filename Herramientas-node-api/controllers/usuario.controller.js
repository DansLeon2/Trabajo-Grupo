// Herramientas-node-api/controllers/usuarioController.js

// Simulamos la "tabla" de usuarios en memoria (Array)
const usuariosDB = [
    {
        id: 1,
        username: "admin",
        password: "123", // Contraseña simple para pruebas
        nombreCompleto: "Administrador de Tienda",
        rol: "Administrador"
    },
    {
        id: 2,
        username: "vendedor1",
        password: "456",
        nombreCompleto: "Danny Vendedor",
        rol: "Vendedor"
    }
];

// Controlador para procesar el Login
export const loginUsuario = (req, res) => {
    const { username, password } = req.body;

    // 1. Validar que los campos no estén vacíos
    if (!username || !password) {
        return res.status(400).json({ message: "Usuario y contraseña requeridos." });
    }

    // 2. Buscar si las credenciales coinciden con algún elemento del array
    const usuarioEncontrado = usuariosDB.find(
        (u) => u.username === username && u.password === password
    );

    // 3. Si no se encuentra, responder con error (el frontend atrapará este mensaje)
    if (!usuarioEncontrado) {
        return res.status(401).json({ message: "Usuario o contraseña incorrectos." });
    }

    // 4. Si es correcto, respondemos exactamente con la estructura que el frontend lee:
    res.status(200).json({
        message: "¡Login exitoso!",
        token: "token-falso-simulado-xyz123", // Como no hay base de datos ni JWT real, mandamos un string cualquiera
        user: {
            id: usuarioEncontrado.id,
            username: usuarioEncontrado.username,
            nombre: usuarioEncontrado.nombreCompleto,
            rol: usuarioEncontrado.rol
        }
    });
};