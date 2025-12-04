"use strict";

class Cronometro {
  #tiempo;
  #inicio;
  #corriendo;

  constructor() {
    this.#tiempo = 0;
    this.#inicio = null;
    this.#corriendo = null;
  }

  arrancar() {
    if (this.#corriendo !== null) clearInterval(this.#corriendo);
    this.#tiempo = 0;

    try {
      if (typeof Temporal !== "undefined") {
        this.#inicio = Temporal.Now.instant();
      } else {
        throw new Error();
      }
    } catch {
      this.#inicio = new Date();
    }

    this.#corriendo = setInterval(this.#actualizar.bind(this), 100);
  }

  #actualizar() {
    let ahora;
    try {
      if (typeof Temporal !== "undefined") {
        ahora = Temporal.Now.instant();
        const duracion = ahora.since(this.#inicio);
        this.#tiempo = Math.floor(duracion.total({ unit: "milliseconds" }));
      } else throw new Error();
    } catch {
      ahora = new Date();
      this.#tiempo = Math.floor(ahora - this.#inicio);
    }
    this.#mostrar();
  }

  #mostrar(textoExtra = "") {
    const ps = document.querySelectorAll("main > p");
    const marcador = ps[1]; 
    if (marcador) marcador.textContent = `${this.getTiempo()} ${textoExtra}`;
  }

  parar() {
    
      clearInterval(this.#corriendo);
      this.#corriendo = null;
      
    
  }

  reiniciar() {
    clearInterval(this.#corriendo);
    this.#corriendo = null;
    this.#tiempo = 0;
    this.#mostrar();
  }

  getTiempo() {
    const minutos = Math.floor(this.#tiempo / 60000);
    const segundos = Math.floor((this.#tiempo % 60000) / 1000);
    const decimas = Math.floor((this.#tiempo % 1000) / 100);
    return `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}.${decimas}`;
  }
}
