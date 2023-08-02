const express = require('./node_modules/express');
const cors = require('cors');

const app = express();
const PORT = 4000;

// Middleware para habilitar CORS
app.use(cors({
  origin: 'http://localhost:3000', // URL del frontend
  credentials: true // Habilita el envío de cookies de autenticación (si las usas)
}));

// Ruta de ejemplo para obtener datos del backend
app.get('/api/data', (req, res) => {
  const data = { message: 'Hola desde el backend !!' };
  res.json(data);
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor de backend escuchando en el puerto ${PORT}`);
});
