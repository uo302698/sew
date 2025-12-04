"use strict";

/*
  Clase Memoria
  Proyecto MotoGP Desktop - Sesión 2
*/

class Memoria {
    #tableroBloqueado;
    #primeraCarta;
    #segundaCarta;
    #cronometro;

    constructor() {
        this.#tableroBloqueado = false;
        this.#primeraCarta = null;
        this.#segundaCarta = null;
        this.#cronometro = new Cronometro();

        this.barajarCartas();     // Mezcla las cartas al iniciar
        this.#addListeners();     // Asocia los eventos
        this.#cronometro.arrancar(); // Inicia el cronómetro al cargar
    }

    // --------------------------------------------------
    // Baraja las cartas usando Fisher–Yates (en memoria)
    // --------------------------------------------------
    barajarCartas() {
        const section = document.querySelector("main > section");
        const cartas = Array.from(section.children);

        // Barajado en memoria (no directamente sobre el DOM)
        for (let i = cartas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cartas[i], cartas[j]] = [cartas[j], cartas[i]];
        }

        // Limpia el tablero y vuelve a insertar las cartas barajadas
        section.innerHTML = "";
        cartas.forEach(carta => section.appendChild(carta));
    }

    // --------------------------------------------------
    reiniciarAtributos() {
        this.#primeraCarta = null;
        this.#segundaCarta = null;
        this.#tableroBloqueado = false;
    }

    // --------------------------------------------------
    deshabilitarCartas() {
        this.#primeraCarta.setAttribute("data-estado", "revelada");
        this.#segundaCarta.setAttribute("data-estado", "revelada");
        this.reiniciarAtributos();
    }

    // --------------------------------------------------
    cubrirCartas() {
        this.#tableroBloqueado = true;
        setTimeout(() => {
            this.#primeraCarta.removeAttribute("data-estado");
            this.#segundaCarta.removeAttribute("data-estado");
            this.reiniciarAtributos();
        }, 1200); // 1.2s = tiempo visual equilibrado
    }

    // --------------------------------------------------
    comprobarPareja() {
        const iguales =
            this.#primeraCarta.getAttribute("data-element") ===
            this.#segundaCarta.getAttribute("data-element");

        if (iguales) {
            this.deshabilitarCartas();
        } else {
            this.cubrirCartas();
        }

        this.comprobarJuego();
    }

    // --------------------------------------------------
    voltearCarta(carta) {
        if (this.#tableroBloqueado) return;
        if (carta.getAttribute("data-estado") === "revelada") return;
        if (carta === this.#primeraCarta) return;

        carta.setAttribute("data-estado", "volteada");

        if (!this.#primeraCarta) {
            this.#primeraCarta = carta;
        } else {
            this.#segundaCarta = carta;
            this.comprobarPareja();
        }
    }

    // --------------------------------------------------
    comprobarJuego() {
        const cartas = document.querySelectorAll("main section article");
        const reveladas = Array.from(cartas).filter(
            c => c.getAttribute("data-estado") === "revelada"
        ).length;

        if (reveladas === cartas.length) {
            this.#cronometro.parar();
            console.log("✅ Juego completado. Cronómetro detenido.");
        }
    }

    // --------------------------------------------------
    #addListeners() {
        const cartas = document.querySelectorAll("main section article");
        cartas.forEach(carta =>
            carta.addEventListener("click", () => this.voltearCarta(carta))
        );
    }
}

document.addEventListener("DOMContentLoaded", () => new Memoria());
