import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './App.css';

function App() {
  const [componentes, setComponentes] = useState(null);
  const [socket, setSocket] = useState(null);

  const [highlightedRow, setHighlightedRow] = useState(null);
  const [highlightedPosition, setHighlightedPosition] = useState(null);

  const [selectedRAMRows, setSelectedRAMRows] = useState([]);
  const [selectedCacheRows, setSelectedCacheRows] = useState([]);

  const handleCheckboxChange = (id, type) => {
    if (type === "RAM") {
      // Clone the selectedRAMRows array and check if the current row is already selected
      const newSelectedRAMRows = [...selectedRAMRows];
      const index = newSelectedRAMRows.indexOf(id);
      if (index === -1) {
        newSelectedRAMRows.push(id);
      } else {
        newSelectedRAMRows.splice(index, 1);
      }
      setSelectedRAMRows(newSelectedRAMRows);
    } else if (type === "Cache") {
      // Clone the selectedCacheRows array and check if the current row is already selected
      const newSelectedCacheRows = [...selectedCacheRows];
      const index = newSelectedCacheRows.indexOf(id);
      if (index === -1) {
        newSelectedCacheRows.push(id);
      } else {
        newSelectedCacheRows.splice(index, 1);
      }
      setSelectedCacheRows(newSelectedCacheRows);
    }
  };

  useEffect(() => {
    const socket = io('http://localhost:4000');

    // Escuchar el evento 'componentes' para recibir la información de los componentes en tiempo real
    socket.on('componentes', (data) => {
      console.log('Datos de los componentes recibidos:', data);
      setComponentes(data);

      /* for (let i = 0; i < data.nucleos[0].length; i++) {
      if(data.nucleos[i].historial[0].includes("Load correcto")){
        runAnimation(data.nucleos[i].historial[0].split);
      }
      }*/ 

        // Verificar si 'data.renglonAnimacion' existe antes de intentar acceder a sus propiedades.
    if (data.historialAnimacion && data.historialAnimacion.renglon) {
      setHighlightedRow(data.historialAnimacion.renglon);
      setHighlightedPosition(data.historialAnimacion.posicion);

    }

    });

     // Guarda el objeto socket en el estado para poder enviar datos al servidor más adelante
     setSocket(socket);

    return () => {
      socket.disconnect(); // Cerrar la conexión al desmontar el componente
    };
  }, []);


   // Función para enviar mensajes a la sala 
   const leerRAM = () => {
    socket.emit('mensajeSala', 'Mensaje desde Boton');
  };

  // Renderizar el contenido una vez que se hayan recibido los datos de los componentes
  if (!componentes) {
    return <p>Cargando datos de los componentes...</p>;
  }

  // Formato de columnas de posicion en Cache
  const valores = [];
  for (let i = componentes.columnasCache-1; i >= 0; i--) {
    let valor = i.toString(16);
    let size = componentes.columnasCache-1;

    let faltanteHEX = size.toString(16).length - valor.length;

    for (let n = 0; n < faltanteHEX; n++) {
      valor= "0" + valor;
    }

    valores.push(valor.toUpperCase());
  }
  



  // Aquí puedes usar la información de los componentes para mostrarlos en la interfaz
  // Por ejemplo:
  return (
    <div class="todo">




      

    <div class="leftCol">

      {/* <p>CPU: {JSON.stringify(componentes.cpu)}</p> */}
     


      <h2>RAM: </h2>

      <div class="headerSlot">
      <span class="header"> ID  </span>
      <span class="header dos">Binario </span>  
      <span class="header">Hexa </span> 
      <span class="header">Dato</span> 
      </div>
 
      {componentes.ram.map((RAMitem, idRAM) => (
                <div key={idRAM} class="cacheSlot">


                 

                    <span>
                    {RAMitem.ID === null ? 'null' : RAMitem.ID}
                   </span>

                   <span class="direccionRAM">
                    {RAMitem.direccionBIN === null ? 'null' : RAMitem.direccionBIN}
                   </span>

                   <span>
                    {RAMitem.direccionHEX === null ? 'null' : '0x'+RAMitem.direccionHEX}
                   </span>

                   <span>
                    {RAMitem.dato === null ? 'null' : RAMitem.dato}
                   </span>

                   <input
              type="checkbox"
              id={`ramCheckbox_${idRAM}`}
              checked={selectedRAMRows.includes(idRAM)}
              onChange={() => handleCheckboxChange(idRAM, "RAM")}
            />
                   
                  
                               
                 
                </div>
              ))}
                    
      
    </div>



    <div>
   

      <h2>BUS:</h2>
        <div class="busExterno">
          {componentes.ocupado && (
            <p>ADDRESS BUS OCUPADO - Atendiendo a Nucleo nº [{JSON.stringify(componentes.atendido)}]</p>
          )}



          {!componentes.ocupado && (
            <p> ADDRESS BUS LIBRE</p>
          )}           
        </div>

            <p class="busMsg">ATENDIENDO A [ {JSON.stringify(componentes.atendido)} ] MIENTRAS {JSON.stringify(componentes.esperando)} ESPERAN</p>

            {/* {JSON.stringify(componentes.renglonAnimacion)} */}

           {/* {JSON.stringify(componentes.historialAnimacion)} */}
            
     
            
        <div class="busExterno">
          {componentes.ocupado && (
           <p>ADDRESS BUS OCUPADO - Atendiendo a Nucleo nº [{JSON.stringify(componentes.atendido)}]</p>
          )}

          {!componentes.ocupado && (
            <p>DATA BUS LIBRE</p>
          )}           
        </div>



        <h2>PROCESADOR:</h2>

<div class="procesador">

      <h2>NUCLEOS:</h2>



      <div class="busInterno">
      {componentes.ocupado && (
            <p>SHARE BUS OCUPADO</p>
          )}

          {!componentes.ocupado && (
            <p>SHARE BUS LIBRE</p>
          )}   
      </div>

      

     <div class="cacheGroup">
        {componentes.cache.map((cacheItem, index) => (
          <div key={index} class="nucleo">
            
            <div class="CPU">

            {componentes.nucleos[index].map((item, i) => (
        <span key={i}>{item}</span>
      ))}
          
            {/* LEER BLOQUE DE RAM 
            DESDE 0xFF0<input type="number"/><button onClick={leerRAM}>Enviar Mensaje</button> */}


            </div>


         

            <div class="cache">

            <span class="cachetitle">Cache {index + 1}</span> 

            <div>
              
            <div class="headerSlot">

                
                {/* <span class="header">ID </span> 
                <span class="header">Binario </span> */}
                <span class="header">Renglon </span> 
                <span class="header">MESI</span>  
                <span class="header"> Etiqueta  </span>
   

                {valores.map((valor) => (
                <span class="header datoEnCache" key={valor}>
                {valor}
                </span>
                  ))}
 

                
              </div>

            {cacheItem.map((item, idx) => (
  <div
    key={idx}
    className={`cacheSlot ${highlightedRow === item.ID ? "highlighted" : ""} ${item.bandera}`}
  >
        
                  
                  <span class="renglon">
                {item.direccionHEX === null ? 'null' : '0x'+item.direccionHEX}
               </span>

               <span className={`${item.bandera}`}>
                    {item.bandera === null ? 'null' : item.bandera}
                   </span>


                    <span>
                    {item.etiqueta === null ? 'null' : item.etiqueta}
                   </span>

                    {/* <span>
                    {item.ID === null ? 'null' : item.ID}
                   </span>

                   <span>
                    {item.direccionBIN === null ? 'null' : item.direccionBIN} 
                   </span> */}

                   

                   

                   {Array.isArray(item.dato) ? (
                   item.dato.map((dato, index) => (
                       <span key={index} class="datoEnCache">
                       {dato === null ? 'null' : dato}
                    </span>
                     ))
                     ) : (
                     <span class="datoEnCache">
                      {item.dato === null ? 'null' : item.dato}
                       </span>
                    )}

<input
                  type="checkbox"
                  id={`cacheCheckbox_${idx}`}
                  checked={selectedCacheRows.includes(idx)}
                  onChange={() => handleCheckboxChange(idx, "Cache")}
                />
                   
                  
                               
                 
                </div>
              ))}
            
            </div>
            
            
            </div>
           {/* <span>{JSON.stringify(cacheItem)}</span> */}

          </div>
        ))}
      </div>

      
      </div>
      


      {/*<p>BUS: {JSON.stringify(componentes.bus)}</p>*/}
    </div>
    </div>
  );
}

export default App;
