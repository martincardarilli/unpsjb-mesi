

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
  


    validarBloqueRemoteWrite(etiqueta,renglon,posicion){

    //  let validez = false;
     // let dato = null;
      //let dirBloque = parseInt(direccion / this.tamañoBloque);

      //let etiqueta = parseInt(direccion / (this.size * this.tamañoBloque));
     // let renglon = parseInt((direccion / this.tamañoBloque) % this.size);
     // let posicion = direccion % this.tamañoBloque;
    
      console.log(`Etiqueta: ${etiqueta.toString(16)}, Renglon: ${renglon.toString(16)}, Posición: ${posicion.toString(16)}`);

      if((this.slots[renglon].etiqueta === etiqueta)) {
        // if bandera es valido
        console.log(`DATO ANTES DE INVALIDAR BANDERA ${this.slots[renglon].dato}`)
        this.slots[renglon].bandera = "I";
       // this.slots[renglon].dato = this.slots[renglon].dato.reverse(); // ESTA LINEA NO TIENE SENTIDO
        console.log(`DATO ANTES DE INVALIDAR BANDERA ${this.slots[renglon].dato}`)
        //validez = true;
        //dato = this.slots[renglon].dato;
      }else{
       // validez = false;
      }
      // FALTA DEVOLVER EL DATO EN SU CON SU POSICION

      //let respuesta = {validez: validez, datos: datos};


 
      // return respuesta; 

    }  

    validarBloqueRemoteRead(etiqueta,renglon,posicion){

      let validez = false;
      let dato = null;
      let encontro = null;
      //let dirBloque = parseInt(direccion / this.tamañoBloque);

      //let etiqueta = parseInt(direccion / (this.size * this.tamañoBloque));
      //let renglon = parseInt((direccion / this.tamañoBloque) % this.size);
      //let posicion = direccion % this.tamañoBloque;
    
      console.log(`Etiqueta: ${etiqueta.toString(16)}, Renglon: ${renglon.toString(16)}, Posición: ${posicion.toString(16)}`);

      if((this.slots[renglon].etiqueta === etiqueta)&&(this.slots[renglon].bandera !== 'I')) {

        this.slots[renglon].bandera = "S";
        validez = true;
        encontro = "otraCache";
       // this.slots[renglon].dato = this.slots[renglon].dato.reverse(); // ESTA LINEA NO TIENE SENTIDO
       
       dato = this.slots[renglon].dato.slice().reverse(); // Crear una copia con slice() y luego revertir
      }else{
       
      }


      let respuesta = {validez: validez, datos: dato, encontro: encontro};

      // ANTES DE UN RETURN HAY QUE ESCRIBIR EN RAM

      // Ya que una Cache le compartio a Otra

      // Comparte a RAM en el momento que comparte a otro Cache

      // Porque el bus comparte a los dos en simultaneo

      if (respuesta.validez){
       this.bus.ram.escribir(etiqueta,renglon,respuesta.datos.reverse());
      }

 
       return respuesta; 

    }  

    validarBloque(etiqueta,renglon,posicion){ // ESTE ES EL METODO BASE, NO CAMBIA BANDERA, LOCAL READ

      let validez = false;
      let dato = null;
      let encontro = false;
      //let dirBloque = parseInt(direccion / this.tamañoBloque);

      //let etiqueta = parseInt(direccion / (this.size * this.tamañoBloque));
      //let renglon = parseInt((direccion / this.tamañoBloque) % this.size);
      //let posicion = direccion % this.tamañoBloque;
    
      console.log(`Etiqueta: ${etiqueta.toString(16)}, Renglon: ${renglon.toString(16)}, Posición: ${posicion.toString(16)}`);

      if((this.slots[renglon].etiqueta === etiqueta)&&(this.slots[renglon].bandera !== 'I')) {
        // if bandera es valido
        validez = true;
        dato = this.slots[renglon].dato.slice().reverse(); // Crear una copia con slice() y luego revertir
        encontro = "self";
      }

      let respuesta = {validez: validez, datos: dato, encontro: encontro};
 
       return respuesta; 

    }  


}



module.exports = {
    Cache
};
  