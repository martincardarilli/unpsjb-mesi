const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Configuración de CORS para Socket.IO v3
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // URL del frontend
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header'],
    credentials: true
  }
});

// Escucha eventos de conexión
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  // Evento para recibir mensajes de la sala 1
  socket.on('mensajeSala1', (data) => {
    console.log('Mensaje recibido en sala 1:', data);
    io.to('sala1').emit('mensajeRecibidoSala1', data); // Emitir el mensaje a todos los clientes en sala 1
  });

  // Evento para recibir mensajes de la sala 2
  socket.on('mensajeSala2', (data) => {
    console.log('Mensaje recibido en sala 2:', data);
    io.to('sala2').emit('mensajeRecibidoSala2', data); // Emitir el mensaje a todos los clientes en sala 2
  });

  // Evento para unirse a la sala 1
  socket.on('unirseSala1', () => {
    socket.join('sala1');
    console.log('Cliente se unió a sala 1');
  });

  // Evento para unirse a la sala 2
  socket.on('unirseSala2', () => {
    socket.join('sala2');
    console.log('Cliente se unió a sala 2');
  });

  // Evento para desconexión del cliente
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

const PORT = 4000; // Puedes utilizar el puerto que desees
server.listen(PORT, () => {
  console.log(`Servidor de Socket.IO escuchando en el puerto ${PORT}`);
});
