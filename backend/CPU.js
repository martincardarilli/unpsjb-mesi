const { Worker, workerData, parentPort } = require('worker_threads');

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

        const hilo = new Worker('./NUCLEO.js', { velocidad: this.velocidad });
        // WARNING: parametro por valor, no referencia. Problema real de coherencia de datos.
        hilo.on('message', async (message) => {
         // console.log('\x1b[33m', `[${nucleo.ID}] *---- Hilo [${nucleo.ID}] - Mensaje recibido desde el hilo:`, message);
         
    




          // ------------------
          // READ / WRITE
          // ------------------
          if (message === 'read' || message === 'write'){
            const valorAleatorio = Math.floor(Math.random() * this.bus.ram.size);
            //console.log('\x1b[33m', `[${nucleo.ID}] *---- Hilo [${nucleo.ID}] - Quiere LEER direccion 0x${valorAleatorio.toString(16)}`);

            
            let etiqueta = parseInt(valorAleatorio / (nucleo.cache.size * nucleo.cache.tamañoBloque));
            let renglon = parseInt((valorAleatorio / nucleo.cache.tamañoBloque) % nucleo.cache.size);
            let posicion = valorAleatorio % nucleo.cache.tamañoBloque;



           
            nucleo.historial.unshift(`[${nucleo.ID}] - ${message.toUpperCase()} direccion 0x${etiqueta.toString(16).toUpperCase()}${renglon.toString(16).toUpperCase()}${posicion.toString(16).toUpperCase()}`);
            nucleo.historial.unshift(`ETIQUETA = ${etiqueta}(10) ${etiqueta.toString(16).toUpperCase()}(h) / RENGLON = ${renglon} ${renglon.toString(16).toUpperCase()}(h) / POSICION = ${posicion} ${posicion.toString(16).toUpperCase()}(h)`);

             // REVISA SU PROPIA CACHE SINO
            let data = nucleo.cache.validarBloque(etiqueta,renglon,posicion);

            // PIDE A BUS

            // BUS RECORRE OTRAS CACHES (Interrumpción) APLICAR ESTADO AUTOMATA - REMOTE READ <> /?/ POSIBLE ESCRITURA EN RAM

            // SINO BUS LEE RAM (Exclusive)
            if (data.validez){

              nucleo.historial.unshift(`[${nucleo.ID}] - Hit (Acierto) de Cache, DATO = ${data.datos}`);

              

            }else{

              // try catch bus
              nucleo.historial.unshift(`[${nucleo.ID}] - Miss de Cache, consulta BUS`);

              try {
                data = await bus.leer(nucleo.ID,etiqueta,renglon,posicion);

                //console.log('Datos leídos HILO PRINCIPAL:', data.datos);

              } catch (error) { // fin try start catch
                console.error('Error al leer RAM:', error);
  
                
                       hilo.postMessage({ type: 'loop' });
                      
              }// fin catch

              }// fin else

                // SAVE
                

                  if (Array.isArray(data.datos)) { 

                  if(data.encontro === "otraCache"){
                    nucleo.cache.slots[renglon].bandera = 'S';
                    //nucleo.historial.unshift(`[${nucleo.ID}] - Renglon: ${renglon} - Shared`);
                  }

                  if(data.encontro === "RAM"){
                    nucleo.cache.slots[renglon].bandera = 'E';
                    //nucleo.historial.unshift(`[${nucleo.ID}] - Renglon: ${renglon} - Exclusive`);
                  }

                }

                // SAVE
                if (Array.isArray(data.datos)) { 
                nucleo.cache.slots[renglon].etiqueta = etiqueta;
                }


                if(Array.isArray(data.datos)){ // PROMISE REJECT ???
                nucleo.historial.unshift(`[${nucleo.ID}] - Load correcto`);
                 }else{  
                    nucleo.historial.unshift(`[${nucleo.ID}] - ERROR EN LOAD`);
                        }


                // SI NUNCA PUDO ACCEDER AL DATO

                     // SAVE
                  if (Array.isArray(data.datos)) { 
                  let save = [...data.datos].reverse(); // ROMPE PROPAGACIÓN DE REFERENCIA DE MEMORIA
                nucleo.cache.slots[renglon].dato = save; // ROMPE PROPAGACIÓN DE REFERENCIA DE MEMORIA
                  }

                // RIESGO DE QUE LAS CACHES TENGAN COHERENCIA ENTRE SI "MAGICAMENTE"


                nucleo.historial.unshift(JSON.stringify(nucleo.cache.slots[renglon].dato));


               
                // ------------------
                // WRITE
                // ------------------
                if (message === 'write' && Array.isArray(data.datos)){  

                 

          

                  let temporal = nucleo.cache.slots[renglon].dato.reverse();



                    nucleo.historial.unshift(`[${temporal[posicion]}] > [${temporal[posicion]+1}]`);

 
                  temporal[posicion] = parseInt(temporal[posicion]) + 1; //ADDi

                  temporal = temporal.reverse();

                  nucleo.cache.slots[renglon].dato = temporal;


                    nucleo.historial.unshift(JSON.stringify(nucleo.cache.slots[renglon].dato));




                  
                  // VALIDAR BLOQUE LOCAL WRITE + REMOTE WRITE

                  for (let i = 0; i < this.nucleos.length; i++) { // INICIO BUSQUEDA EN TODOS LOS CACHES MENOS EL PROPIO
                    console.log(`REMOTE WRITE - VALIDACIÓN NUCLEO [${i}]`);

                    // LOCAL WRITE
                    if (i === nucleo.ID){ // DESPUES DE ESCRIBIR, SI ES EL PROPIO NUCLEO 

                      if (Array.isArray(data.datos)) { 
                      nucleo.cache.slots[renglon].bandera = 'M';
                      //nucleo.historial.unshift(`[${nucleo.ID}] - Renglon: ${renglon} - Modified`);
                      }

                    }else{ // REMOTE WRITE
                      console.log(`inicia validacion REMOTE WRITE de nucleo ${i}`);
                      this.nucleos[i].cache.validarBloqueRemoteWrite(etiqueta,renglon,posicion);//recorrer cache

                    }

                
                    
                    } // FIN BUSQUEDA DE CACHE
                  
                }
/*
                let spread;
              if (nucleo.cache.slots[renglon].bandera === 'E'){
                spread = false;
              }

              if (nucleo.cache.slots[renglon].bandera === 'S'){
                spread = true;
              }

              if (nucleo.cache.slots[renglon].bandera === 'M'){
                spread = true;
              }
              */                    
                this.bus.historialAnimacion = {renglon: renglon, posicion: posicion, instruccion: message};
                hilo.postMessage({ type: 'loop' });
               
              

            

           

        
          } 
           // ------------------
           // FIN READ / WRITE
           // ------------------

          // ------------------
          // LOOP
          // ------------------
          if (message === 'loop'){
            if (nucleo.historial.length > 0 && nucleo.historial[0].toString().startsWith(' . ')) {
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
  