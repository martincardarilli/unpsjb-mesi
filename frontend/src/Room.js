import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

function Room() {
  const [dataSala1, setDataSala1] = useState([]);
  const [dataSala2, setDataSala2] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Conexión con el servidor de WebSocket
    const newSocket = io('http://localhost:4000');

    // Unirse a la sala 1 al cargar la página
    newSocket.emit('unirseSala1');

    // Unirse a la sala 2 al cargar la página
    newSocket.emit('unirseSala2');

    // Evento para recibir mensajes de la sala 1
    newSocket.on('mensajeRecibidoSala1', (data) => {
      console.log('Datos recibidos en sala 1:', data);
      setDataSala1((prevData) => [...prevData, data]);
    });

    // Evento para recibir mensajes de la sala 2
    newSocket.on('mensajeRecibidoSala2', (data) => {
      console.log('Datos recibidos en sala 2:', data);
      setDataSala2((prevData) => [...prevData, data]);
    });

    // Guarda el objeto socket en el estado para poder enviar datos al servidor más adelante
    setSocket(newSocket);

    return () => {
      // Cierra la conexión con el servidor cuando el componente se desmonte
      newSocket.close();
    };
  }, []);

  // Función para enviar mensajes a la sala 1
  const enviarMensajeSala1 = () => {
    socket.emit('mensajeSala1', 'Mensaje desde Sección 1');
  };

  // Función para enviar mensajes a la sala 2
  const enviarMensajeSala2 = () => {
    socket.emit('mensajeSala2', 'Mensaje desde Sección 2');
  };

  return (
    <div>
      <div>
        <h3>Sección 1</h3>
        {dataSala1.map((mensaje, index) => (
          <p key={index}>{mensaje}</p>
        ))}
        <button onClick={enviarMensajeSala1}>Enviar Mensaje</button>
      </div>
      <div>
        <h3>Sección 2</h3>
        {dataSala2.map((mensaje, index) => (
          <p key={index}>{mensaje}</p>
        ))}
        <button onClick={enviarMensajeSala2}>Enviar Mensaje</button>
      </div>
    </div>
  );
}

export default Room;
