const { Worker, parentPort } = require('worker_threads');

const { Cache } = require('./CACHE_memory');


class Nucleo {
    constructor(ID, size, bus, tamañoBloque) {
      this.ID = ID;
      this.cache = new Cache(size, bus, tamañoBloque); 
      this.bus = bus;  
      this.historial = [];
    }

}
  
class CPU {
    constructor(numNucleos, cacheSize, bus, tamañoBloque, velocidad) {
      this.nucleos = [];
      this.numNucleos = numNucleos;
      this.bus = bus;
      this.iniciarCores(cacheSize, this.bus, tamañoBloque);
      this.velocidad = velocidad;
    }
  
    iniciarCores(cacheSize, bus, tamañoBloque) {
      for (let i = 0; i < this.numNucleos; i++) {
        
        const nucleo = new Nucleo(i,cacheSize, bus, tamañoBloque); // Crear instancia de Nucleo con el tamaño de la caché especificado

        this.nucleos.push(nucleo);
        //console.log('NUCLEO '+JSON.stringify(nucleo));

        const hilo = new Worker('./NUCLEO.js', { workerData: {nucleo: nucleo, sizeRAM: bus.ram.size, velocidad: this.velocidad}}); // WARNING: parametro por valor, no referencia. Problema real de coherencia de datos.
        hilo.on('message', async (message) => {
         // console.log('\x1b[33m', `[${nucleo.ID}] *---- Hilo [${nucleo.ID}] - Mensaje recibido desde el hilo:`, message);
         
    




          // ------------------
          // READ / WRITE
          // ------------------
          if (message === 'read' || message === 'write'){
            const valorAleatorio = Math.floor(Math.random() * this.bus.ram.size);
            //console.log('\x1b[33m', `[${nucleo.ID}] *---- Hilo [${nucleo.ID}] - Quiere LEER direccion 0x${valorAleatorio.toString(16)}`);

            let renglon = parseInt((valorAleatorio / nucleo.cache.tamañoBloque) % nucleo.cache.size);
            let etiqueta = parseInt(valorAleatorio / (nucleo.cache.size * nucleo.cache.tamañoBloque));
            let posicion = valorAleatorio % nucleo.cache.tamañoBloque;

            nucleo.historial.unshift(`[${nucleo.ID}] - ${message.toUpperCase()} direccion 0x${valorAleatorio.toString(16).toUpperCase()}`);


             // REVISA SU PROPIA CACHE SINO
            let respuesta = nucleo.cache.validarBloque(valorAleatorio);

            // PIDE A BUS

            // BUS RECORRE OTRAS CACHES (Interrumpción) APLICAR ESTADO AUTOMATA - REMOTE READ <> /?/ POSIBLE ESCRITURA EN RAM

            // SINO BUS LEE RAM (Exclusive)
            if (respuesta.validez){

              nucleo.historial.unshift(`[${nucleo.ID}] - Hit (Acierto) de Cache, DATO = ${respuesta.dato}`);

              hilo.postMessage({ type: 'loop' });

            }else{

              // try catch bus
              nucleo.historial.unshift(`[${nucleo.ID}] - Miss de Cache, consulta BUS`);

              try {
                const data = await bus.leer(nucleo.ID,valorAleatorio);

                console.log('Datos leídos HILO PRINCIPAL:', data.datos);

                
              
              
                // SAVE
                // SAVE
                // SAVE
                if (data.validez){
                  nucleo.cache.slots[renglon].bandera = 'S';
                  }else{
                    nucleo.cache.slots[renglon].bandera = 'E';
                  }

                nucleo.cache.slots[renglon].etiqueta = etiqueta;
                

                // PREGUNTAR SI EL SLOT ESTA VACIO PARA NO DEJAR SHAREDS INCOHERENTES?
                nucleo.historial.unshift(`[${nucleo.ID}] - Load correcto`);
     
                

                nucleo.cache.slots[renglon].dato = data.datos.reverse();

                // ------------------
                // WRITE
                // ------------------
                if (message === 'write'){  

// Guardamos el array 'dato' de la caché en una variable temporal y lo invertimos
const tempArray = nucleo.cache.slots[renglon].dato.reverse();





// Incrementamos el valor del número aleatorio en el array invertido
tempArray[posicion] = tempArray[posicion] + 1;

// Invertimos nuevamente el array 'dato' y lo actualizamos en la caché
nucleo.cache.slots[renglon].dato = tempArray.reverse();


                  
                  // VALIDAR BLOQUE LOCAL WRITE + REMOTE WRITE

                  for (let i = 0; i < this.nucleos.length; i++) { // INICIO BUSQUEDA EN TODOS LOS CACHES MENOS EL PROPIO
                    console.log('VUELTA');

                    // LOCAL WRITE
                    if (i === nucleo.ID){ 

                    // SHARED > EXCLUSIVE
                     if (nucleo.cache.slots[renglon].bandera === 'S'){
                      nucleo.cache.slots[renglon].bandera = 'M';
                    }

                    // EXCLUSIVE > MODIFIED
                    if (nucleo.cache.slots[renglon].bandera === 'E'){
                      nucleo.cache.slots[renglon].bandera = 'M';
                    }

                    }else{ // REMOTE WRITE
                      this.nucleos[i].cache.validarBloqueRemoteWrite(valorAleatorio);//recorrer cache

                    }

                
                    
                    } // FIN BUSQUEDA DE CACHE
                  
                }


                // SAVE
                // SAVE
                // SAVE
                                  
             
                hilo.postMessage({ type: 'loop' });
               
              } catch (error) { // fin try start catch
                console.error('Error al leer RAM:', error);
  
                
                       hilo.postMessage({ type: 'loop' });
                      
              }// fin catch

            }// fin else

           

        
          } 
           // ------------------
           // FIN READ / WRITE
           // ------------------

          // ------------------
          // LOOP
          // ------------------
          if (message === 'loop'){
            if (nucleo.historial.length > 0 && nucleo.historial[0].startsWith(' . ')) {
              nucleo.historial[0] += ' . '; // Agregamos un espacio adicional al principio del valor
            } else {
              nucleo.historial.unshift(' . '); // Si el primer valor no empieza con un espacio, agregamos " . " al inicio del array
            }
          }


        });
  
        hilo.on('error', (error) => {
          console.error('\x1b[33m', `<< Hilo ${this.ID} - Error en el worker:`, error);
        });
    
        hilo.on('exit', (code) => {
          console.log('\x1b[33m', `<< Hilo ${this.ID} - Worker finalizado con código de salida ${code}`);
        });


        
      }
    }
  
    // Mas métodos de CPU
}
  

module.exports = {
    CPU,
    Nucleo
  };
  