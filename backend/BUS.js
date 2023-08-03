


class BUS {

    constructor(tiempoRespuestaCache, tiempoRespuestaRAM) {
      this.ram = null; 
      this.cpu = null; 

      this.tiempoRespuestaCache = tiempoRespuestaCache;
      this.tiempoRespuestaRAM = tiempoRespuestaRAM;

      this.ocupado = false; // Para gestionar el tráfico del bus
      this.atendido = null; // Para saber a que nucleo se esta atendiendo
      this.esperando = []; // Nucleos esperando (NO ESTA IMPLEMENTADO COMO PILA, ES ALEATORIO CON RESPECTO AL HILO/MULTIPROCESAMIENTO)

      this.historialAnimacion = []; // Para hacer animaciones en el Frontend
    }

    conectarRAM(ram){
      this.ram = ram;
    }

    conectarCPU(cpu){
      this.cpu = cpu;
    }






  
    escribirRAM(direccionRAM, dato) {
    // Método para escribir un dato en la RAM

    //console.log(`/ ! / escribirRAM comenzo`)
    this.ram.escribir(direccionRAM, dato);
     // console.log(this.ram);
     // console.log(`/ ! / escribirRAM finalizo`)
    }






    
      //Lee en otras caches (Interrumpción teórica) y/o RAM para buscar dato valido
    async leer(ID,etiqueta,renglon,posicion){
      return new Promise((resolve, reject) => {
        const waitAndRead = async () => {
          if (this.ocupado) {
            //console.log(`[${ID}] Esperando por el BUS...`);
            const index = this.esperando.indexOf(ID);
            if (index === -1) { // SI NO ENCONTRO
              this.esperando.push(ID);
            }
            setTimeout(waitAndRead, 500);
          } else {
            this.ocupado = true;
            this.atendido = ID;
            const index = this.esperando.indexOf(ID);
            if (index !== -1) { // SI ENCONTRO
              this.esperando.splice(index, 1);
            }
           
            //let etiqueta = parseInt(direccion / (this.cpu.nucleos[ID].cache.size * this.cpu.nucleos[ID].cache.tamañoBloque));
            //let renglon = parseInt((direccion / this.cpu.nucleos[ID].cache.tamañoBloque) % this.cpu.nucleos[ID].cache.size);
            //let posicion = direccion % this.cpu.nucleos[ID].cache.tamañoBloque;

            // PREGUNTAR EN OTRAS CACHES
            let respuestaCACHE = {};


            for (let i = 0; i < this.cpu.nucleos.length; i++) { // INICIO BUSQUEDA EN TODOS LOS CACHES MENOS EL PROPIO
              console.log(`REMOTE READ - VALIDACIÓN NUCLEO [${i}]`);
              if (i === ID) continue; // Saltar si es la propia caché
              respuestaCACHE = this.cpu.nucleos[i].cache.validarBloqueRemoteRead(etiqueta,renglon,posicion);//recorrer cache
        
              if (respuestaCACHE.validez){
                //console.log(`[${ID}] Encontro dato en Cache [${i}]`);
                this.cpu.nucleos[ID].historial.unshift(`[${ID}] Cache [${i}] interrumpe y provee el bloque de datos`);
                setTimeout(() => {
                  this.ocupado = false;
                  console.log(`[${ID}] Libera el BUS...`);

                 // this.historialAnimacion = {renglon: renglon, posicion: posicion};

                  resolve(respuestaCACHE); // SACAR EL .dato
                }, this.tiempoRespuestaCache);

              }else{
                //console.log(`[${ID}] No encontro dato en Cache [${i}]`);
                //this.cpu.nucleos[ID].historial.unshift(`[${ID}] Cache [${i}] no tiene el dato, no interrumpe`);
                
              }
              
              } // FIN BUSQUEDA DE CACHE

              // INICIO BUSQUEDA EN RAM

              if(!respuestaCACHE.validez){
               
                
    
            
                console.log('\x1b[33m', '[BUS] Lectura de RAM de Bloque entero: ',(etiqueta+renglon).toString(16));
    
      
                  const lectura = this.ram.leer(etiqueta, renglon); // nos estaba devolviendo un objeto entero osea un parametro por referencia
    
           
                  let respuestaRAM = {validez: true, datos: lectura, encontro: "RAM"};
        
                  setTimeout(() => {
                  console.log(`LECTURA  ${lectura}`);
                  this.ocupado = false;
                  console.log(`[${ID}] Libera el BUS...`);

                  //this.historialAnimacion = {renglon: renglon, posicion: posicion};

                  resolve(respuestaRAM);
                }, this.tiempoRespuestaRAM);
                         

              }// FIN BUSQUEDA EN RAM




            /*setTimeout(() => {
              this.ocupado = false;
              console.log(`[${ID}] Libera el BUS...`);
              resolve('No encontro');
            }, 3000);*/
          }
        };
    
        waitAndRead();
      });
    }
}


module.exports = {
    BUS
};
  