"use strict";

/*
    Autor: Richard Roque Del Rio – UO302698
    Asignatura: Tecnologías y Paradigmas de Programación
    Práctica 8 – Sesión 3 (Ejercicio 2)
    Servicio Web de Flickr – Carrusel de imágenes dinámico con jQuery
*/

class Carrusel {
    #busqueda;
    #fotos = [];
    #actual = 0;
    #maximo = 5;
    #contenedor;

    constructor(busqueda = "Chang International Circuit") {
        this.#busqueda = busqueda;

        // Busca la primera sección dentro del main (sin depender de un id)
        this.#contenedor = $("main section").first();

        if (this.#contenedor.length === 0) {
            console.error("No se encontró ninguna sección dentro del <main> para insertar el carrusel.");
            return;
        }

        this.#getFotografias();
    }

    // ----------------------------------------------------------
    // Obtiene las imágenes desde el servicio público de Flickr
    // ----------------------------------------------------------
    #getFotografias() {
        $.ajax({
            url: `https://api.flickr.com/services/feeds/photos_public.gne?tags=${this.#busqueda}&format=json`,
            dataType: "jsonp",
            jsonpCallback: "jsonFlickrFeed",
            success: datos => this.#procesarJSONFotografias(datos),
            error: () => console.error("No se pudieron cargar las imágenes del carrusel.")
        });
    }

    // ----------------------------------------------------------
    // Procesa la respuesta de Flickr
    // ----------------------------------------------------------
    #procesarJSONFotografias(datos) {
        this.#fotos = datos.items.slice(0, this.#maximo).map(i =>
            i.media.m.replace("_m.jpg", "_z.jpg")  // tamaño 640 px
        );
        if (this.#fotos.length > 0) {
            this.#actual = 0;
            this.#mostrarFotografia();
            this.#cambiarFotografia();
        } else {
            console.warn("Flickr no devolvió imágenes.");
        }
    }

    // ----------------------------------------------------------
    // Muestra la imagen actual en la sección del carrusel
    // ----------------------------------------------------------
    #mostrarFotografia() {
        this.#contenedor.empty(); // limpia el contenido previo

        const article = $("<article>");
        const h2 = $("<h2>").text(`Imágenes del circuito de ${this.#busqueda}`);
        const img = $("<img>")
            .attr("src", this.#fotos[this.#actual])
            .attr("alt", `Imagen ${this.#actual + 1} del circuito ${this.#busqueda}`)
            .attr("width", "640");

        article.append(h2, img);
        this.#contenedor.append(article);
    }

    // ----------------------------------------------------------
    // Cambia la imagen automáticamente cada 3 segundos
    // ----------------------------------------------------------
    #cambiarFotografia() {
        setInterval(() => {
            this.#actual = (this.#actual + 1) % this.#fotos.length;
            this.#mostrarFotografia();
        }, 3000);
    }
}

// Inicializa el carrusel cuando el documento está listo
$(document).ready(() => new Carrusel());
