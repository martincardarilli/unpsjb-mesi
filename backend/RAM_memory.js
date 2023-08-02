class RAM {
    constructor(size, qtyRandom, bus) {
      this.size = size; 
      this.bus = bus;      
      this.data = new Array(size).fill(null).map(() => ({
        ID: null,
        direccionBIN: null,
        direccionHEX: null, 
        dato: null,  
      }));
      this.inicializarMemoria();
      this.generateRandomData(qtyRandom); // Inicializar la RAM con datos aleatorios
    }
    
    // SOLO PARA DESARROLLO
    testBloque() {
      let direccion = 0;
      let bloque = [];
    
      const tamañoBloque = this.bus.cpu.nucleos[0].cache.tamañoBloque;
    
      for (let i = 0; i < this.data.length; i += tamañoBloque) {
        bloque = [];
        for (let j = 0; j < tamañoBloque; j++) {
          bloque.push({
            direccionBIN: this.data[direccion].direccionBIN,
            direccionHEX: this.data[direccion].direccionHEX,
            value: this.data[direccion].dato,
          });
          direccion++;
        }
        console.log('BLOQUE INICIA');
        console.log(bloque);
        console.log('BLOQUE FINALIZA');
      }
    
      console.log('RAM');
    }
    // SOLO PARA DESARROLLO

    inicializarMemoria(){
      for (let i = 0; i < this.data.length; i++) {
        this.data[i].ID = i;
        this.data[i].direccionBIN = i.toString(2); // Convertir 'i' a binario
        this.data[i].direccionHEX = i.toString(16); // Convertir 'i' a hexadecimal

        let size0 = this.size - 1;

        let faltanteBIN = size0.toString(2).length - this.data[i].direccionBIN.length;
        let faltanteHEX = size0.toString(16).length - this.data[i].direccionHEX.length;

        for (let n = 0; n < faltanteBIN; n++) {
          this.data[i].direccionBIN = "0" + this.data[i].direccionBIN;
        }

        for (let n = 0; n < faltanteHEX; n++) {
          this.data[i].direccionHEX = "0" + this.data[i].direccionHEX;
        }

        this.data[i].direccionHEX = this.data[i].direccionHEX.toUpperCase(); 

        
      }
    }

    generateRandomData(qtyRandom) {
      
      for (let i = 0; i < qtyRandom; i++) {

        
        const randomValue = Math.floor(Math.random() * 100)// despues lo vamos a poner random denuevo

        // Convertir el número aleatorio a su representación en base hexadecimal
        const hexValue = randomValue.toString(16);
        
      //  this.data[i].ID = i;
      //  this.data[i].direccionRAM = i.toString(16); // Convertir 'i' a hexadecimal
     // this.data[i].direccionRAM = i traducido a hexa; <<< SLOT EN RAM
    //  this.data[i].dato = randomValue;
         this.data[i].dato = randomValue;
        
      }
  

    }

leer(direccionAlta, direccionMedia) {
  const bloqueSize = this.bus.cpu.nucleos[0].cache.tamañoBloque;
  const direccionCompleta = direccionAlta * this.bus.cpu.nucleos[0].cache.size + direccionMedia;
  console.log('DIRECCION COMPLETA hexa>>> ' + direccionCompleta.toString(16));

  let data = [];

  for (let i = 0; i < bloqueSize; i++) {
    const direccion = direccionCompleta * bloqueSize + i;
    data.push(this.data[direccion].dato);
  }

  console.log('DATOS >>> ' + data);
  return data;
}





    escribir(direccion, dato){
      this.data[direccion] = dato;
    }

}
  


module.exports = {
  RAM
};
