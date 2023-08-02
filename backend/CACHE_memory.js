

class Cache {

// ----------------------------------
// MODO DE DIRECCIONAMIENTO INMEDIATO
// ----------------------------------

    constructor(size, bus, tamañoBloque) {
      this.size = size;
      this.tamañoBloque = tamañoBloque;
      this.slots = new Array(size).fill(null).map(() => ({
        etiqueta: null, // << Parte alta de direccion de RAM >>
        ID: null,      
        direccionBIN: null, 
        direccionHEX: null, // Renglon << Parte media de direccion de RAM >>
        bandera: null,  
        dato: new Array(tamañoBloque), // Posición << Parte baja de direccion de RAM >>
      }));
      this.bus = bus;
      this.inicializarMemoria();
    }

 

    inicializarMemoria(){
      for (let i = 0; i < this.slots.length; i++) {
        this.slots[i].ID = i;

        this.slots[i].direccionBIN = i.toString(2); // Convertir 'i' a binario

        this.slots[i].direccionHEX = i.toString(16); // Convertir 'i' a hexadecimal

        let size0 = this.size - 1;

        let faltanteBIN = size0.toString(2).length - this.slots[i].direccionBIN.length;
        let faltanteHEX = size0.toString(16).length - this.slots[i].direccionHEX.length;

        for (let n = 0; n < faltanteBIN; n++) {
          this.slots[i].direccionBIN = "0" + this.slots[i].direccionBIN;
        }

        for (let n = 0; n < faltanteHEX; n++) {
          this.slots[i].direccionHEX = "0" + this.slots[i].direccionHEX;
        }

        this.slots[i].direccionHEX = this.slots[i].direccionHEX.toUpperCase();

        
      }
    }
  


    validarBloqueRemoteWrite(direccion){

    //  let validez = false;
     // let dato = null;
      //let dirBloque = parseInt(direccion / this.tamañoBloque);

      let etiqueta = parseInt(direccion / (this.size * this.tamañoBloque));
      let renglon = parseInt((direccion / this.tamañoBloque) % this.size);
      let posicion = direccion % this.tamañoBloque;
    
      console.log(`Etiqueta: ${etiqueta.toString(16)}, Renglon: ${renglon.toString(16)}, Posición: ${posicion.toString(16)}`);

      if((this.slots[renglon].etiqueta === etiqueta)) {
        // if bandera es valido
        this.slots[renglon].bandera = "I";
        //validez = true;
        //dato = this.slots[renglon].dato;
      }else{
       // validez = false;
      }
      // FALTA DEVOLVER EL DATO EN SU CON SU POSICION

      //let respuesta = {validez: validez, datos: dato};


 
      // return respuesta; 

    }  

    validarBloqueRemoteRead(direccion){

      let validez = false;
      let dato = null;
      //let dirBloque = parseInt(direccion / this.tamañoBloque);

      let etiqueta = parseInt(direccion / (this.size * this.tamañoBloque));
      let renglon = parseInt((direccion / this.tamañoBloque) % this.size);
      let posicion = direccion % this.tamañoBloque;
    
      console.log(`Etiqueta: ${etiqueta.toString(16)}, Renglon: ${renglon.toString(16)}, Posición: ${posicion.toString(16)}`);

      if((this.slots[renglon].etiqueta === etiqueta)&&(this.slots[renglon].bandera !== 'I')) {
        // if bandera es valido
        this.slots[renglon].bandera = "S";
        validez = true;
        dato = this.slots[renglon].dato;
      }else{
        validez = false;
      }
      // FALTA DEVOLVER EL DATO EN SU CON SU POSICION

      let respuesta = {validez: validez, datos: dato};

      // ANTES DE UN RETURN HAY QUE ESCRIBIR EN RAMMMMMMMMMMMMMMMMMMMM<<<<<<<<

      // Ya que una Cache le compartio a Otra

      // Comparte a RAM en el momento que comparte a otro Cache

      // Porque el bus comparte a los dos en simultaneo

/*
                          let dirBloque = etiqueta + renglon;

                          for (let i = 0; i < this.tamañoBloque; i++) {
                    
                          this.bus.ram.data[dirBloque+i].dato = dato[i];

                          }

          */                
 
       return respuesta; 

    }  

    validarBloque(direccion){ // ESTE ES EL METODO BASE, NO CAMBIA BANDERA, LOCAL READ

      let validez = false;
      let dato = null;
      //let dirBloque = parseInt(direccion / this.tamañoBloque);

      let etiqueta = parseInt(direccion / (this.size * this.tamañoBloque));
      let renglon = parseInt((direccion / this.tamañoBloque) % this.size);
      let posicion = direccion % this.tamañoBloque;
    
      console.log(`Etiqueta: ${etiqueta.toString(16)}, Renglon: ${renglon.toString(16)}, Posición: ${posicion.toString(16)}`);

      if((this.slots[renglon].etiqueta === etiqueta)&&(this.slots[renglon].bandera !== 'I')) {
        // if bandera es valido
        validez = true;
        dato = this.slots[renglon].dato;
      }else{
        validez = false;
      }
      // FALTA DEVOLVER EL DATO EN SU CON SU POSICION

      let respuesta = {validez: validez, dato: dato};
 
       return respuesta; 

    }  

    // no se usa?
    leer(direccion){
      return this.slots[direccion].dato;
     
    }
 
    // este metodo lo estamos usando 1 sola vez, y es cuando leemos de RAM la primera vez / start / ready

    // despues deberiamos ver si se acomoda bien a las necesidades cuando la cache va a modificar un dato
     escribir(dato){
      // console.log('\x1b[33m', '[C] Escritura de datos en Cache');

      const slotLibre = this.slots.find((slot) => slot.dato === null);

      if (slotLibre) {
        const direccion = this.slots.indexOf(slotLibre);
        

        let encontro = false;

        /*

        if (!encontro){    //esta solo

          // console.log('\x1b[33m', `[C] Bandera EXCLUSIVE asignada`);

          this.slots[direccion].bandera = 'Exclusive'

        } else {
          // console.log('\x1b[33m', `[C] Bandera SHARED asignada`);
          //else (si esta en otro cache)
          this.slots[direccion].bandera = 'Shared';

          // Darle "Shared" a los demás caches que tengan el mismo dato
          for (let i = 0; i < this.slots.length; i++) {
              if (
                  this.slots[i].dato !== null &&
                  this.slots[i].dato.direccionRAM === dato.direccionRAM
              ) {
                  this.slots[i].bandera = 'Shared';
              }

        // 2 darle shared a los demas por ejemplo si uno tiene exclusive
        }
        }

       //  console.log('\x1b[33m', `[C] Dato ${dato} escrito en slot ${direccion}`);
         // Verificar si el dato ha sido modificado comparándolo con el valor anterior
       //  console.log('\x1b[33m', `[C] Dato en slot ${direccion} modificado`);
        if (
          this.slots[direccion].bandera === 'Exclusive' &&
          this.slots[direccion].dato !== null &&
          this.slots[direccion].dato.valor !== dato.valorAnterior // Comparar el valor actual con el valor anterior
        ) {
          this.slots[direccion].bandera = 'Modified';
        }
        */


        // falta traduccion a direccion cache
        this.slots[direccion].ID = dato.ID; // GUARDAR DATO - PARAMETRO DE ENTRADA DE FUNCION - EN SLOT DE CACHE
        this.slots[direccion].dato = dato.dato; // GUARDAR DATO - PARAMETRO DE ENTRADA DE FUNCION - EN SLOT DE CACHE

      } else {
       // console.log('\x1b[33m', '[C] No hay slots libres en la Cache');
        // SIGUIENTE VERSION: ELIMINAR EL DATO ULTIMA VEZ USADO

       
     }
}
}



module.exports = {
    Cache
};
  