const { workerData, parentPort } = require('worker_threads');

// ---------------
// PARAMETRIZABLES
// ---------------

// Ejemplo de Variable desde hilo principal
const CICLO_RELOJ = workerData.velocidad; 
// const nucleo = workerData.nucleo;  WARNING: parametro por valor, no referencia. Problema real de coherencia de datos.
// const sizeRAM = workerData.sizeRAM;  WARNING: parametro por valor, no referencia. Problema real de coherencia de datos.

/*
Representa la cantidad de ciclos de reloj que un núcleo del procesador puede completar en un segundo. 
Se mide en Hertz (Hz) o en múltiplos de Hertz, como Megahertz (MHz) o Gigahertz (GHz).
*/

let loop = true; // Permite que ciclo() se detenga o continue

function esperar() {
  if (loop){
    ciclo();
  }else{
   // console.log('\x1b[32m', `[${nucleo.ID}] -----* esperando..`)
    setTimeout(esperar, CICLO_RELOJ);
  }
}

// Escuchar mensajes enviados desde el hilo principal
parentPort.on('message', (message) => {

  if (message.type === 'loop') {
    loop = true; // DELAY OUT
  }

});

// Tarea que se debe repetir cada 1 ciclo de reloj

function ciclo() {

  const probabilidadCambio = 10;

  // Generar un número aleatorio entre 0 y 1
  const random = Math.random();

  // Comprobar si el número cambia o no en función de la probabilidad

  if (random < (probabilidadCambio / 100)) { 
  
    // Random entre Read o Write

    if (Math.random() < 0.5) {
      parentPort.postMessage('read');
    } else {
      parentPort.postMessage('write');
    }

    loop = false; // DELAY IN
    setTimeout(esperar, CICLO_RELOJ); // CONGELAR HASTA RECIBIR SEÑAL DESDE HILO PRINCIPAL CON parentPort.on('message', (message) => {
  }else{
    setTimeout(ciclo, CICLO_RELOJ); // NEXT LOOP
    parentPort.postMessage('loop');
  }

}

// Primera iteración de ciclo()
ciclo();


