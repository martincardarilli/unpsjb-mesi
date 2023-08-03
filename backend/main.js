const express = require('./node_modules/express');
const http = require('http');
const { Server } = require('socket.io');

const { Cache } = require('./CACHE_memory');
const { CPU, Nucleo } = require('./CPU');
const { BUS } = require('./BUS');
const { RAM } = require('./RAM_memory');

// ---------------
// PARAMETRIZABLES
// ---------------

const sizeRAM = 512; // 2048 bytes, 2 KB , 21 bits para direccion
const QTYdatosrandom = sizeRAM; // Cantidad de datos random generados en Cache

// Cache 256 bytes (16 renglones de 16 bytes)
const sizeCache = 16; // Cache de 16 renglones
const tamañoBloque = 16; // 4 words = 16 bytes           (?) >   1 word = 4 bytes = FF FF FF FF(16) = 1111 1111 1111 1111(2)

/*
La "word" es la unidad básica de datos que el procesador puede leer o escribir en la memoria principal o en la caché.

La arquitectura del procesador define el tamaño de la "word", que puede variar de una arquitectura a otra. 
Por ejemplo, en una arquitectura de 32 bits (x86), una "word" generalmente tiene 32 bits (4 bytes). 
En una arquitectura de 64 bits (x64), una "word" suele tener 64 bits (8 bytes).
*/

const QTYnucleos = 2; // Cantidad de nucleos

//EDITABLE EN ARCHIVO NUCLEO.js
const CICLO_RELOJ = 1000; //ms 
//EDITABLE EN ARCHIVO NUCLEO.js

const tiempoRespuestaCache = 200; //ms 
const tiempoRespuestaRAM = 3000; //ms 

// -----------------------------------
// INSTANCIAS DE CLASE, HILO PRINCIPAL
// -----------------------------------

let bus = new BUS(tiempoRespuestaCache,tiempoRespuestaRAM);
let ram = new RAM(sizeRAM, QTYdatosrandom, bus);
//ram.testBloque();
bus.conectarRAM(ram);
let cpu = new CPU(QTYnucleos, sizeCache, bus, tamañoBloque, CICLO_RELOJ);
bus.conectarCPU(cpu);

// --------------------
// WEB SOCKET, FRONTEND
// --------------------

// Preparo variables extra

let nucleos = [];  //historial

let caches = [];

for (let i = 0; i < cpu.nucleos.length; i++) {
  let x = cpu.nucleos[i].cache.slots;
  let z = cpu.nucleos[i].historial;
  caches.push(x);
  nucleos.push(z);
}

// Inicializar Web Socket

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

setInterval(() => {
  socket.emit('componentes', { ram: ram.data, ocupado: bus.ocupado, esperando: bus.esperando, atendido: bus.atendido, historialAnimacion: bus.historialAnimacion, renglonAnimacion: bus.renglonAnimacion, cache: caches, columnasCache: tamañoBloque, nucleos: nucleos });
}, 50); // Cambiar el tiempo (en milisegundos) según tus necesidades

// Evento para recibir mensajes emitidos desde el Frontend
socket.on('mensajeSala', (data) => {
  console.log('Mensaje recibido en sala:', data);
  io.to('sala').emit('mensajeRecibidoSala', data); // Emitir el mensaje a todos los clientes en sala
});

  // Resto del código de conexión y eventos...
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Servidor de Socket.IO escuchando en el puerto ${PORT}`);
});





