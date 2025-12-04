/* ============================================================
   CLASE 1: Circuito (Carga InfoCircuito.html)
   ============================================================ */

class Circuito {

    constructor() {
        this.comprobarApiFile();
        this.prepararEntradaArchivo();
    }

    comprobarApiFile() {
        const main = $("main");
        const mensaje = $("<p></p>");

        if (window.File && window.FileReader && window.FileList && window.Blob) {
            mensaje.text("El navegador soporta el API File de HTML5.");
        } else {
            mensaje.text("El navegador NO soporta el API File de HTML5.");
        }

        main.append(mensaje);
    }

    prepararEntradaArchivo() {
        const input = $("main input[type='file'][accept='.html']");

        input.on("change", (evento) => {
            const fichero = evento.target.files[0];
            this.leerArchivoHTML(fichero);
        });
    }

    leerArchivoHTML(fichero) {
        if (!fichero) return;

        const lector = new FileReader();

        lector.onload = () => {
            const contenido = lector.result;
            this.procesarHTML(contenido);
        };

        lector.readAsText(fichero);
    }

    procesarHTML(texto) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(texto, "text/html");

        this.insertarContenido(doc);
    }

    insertarContenido(doc) {

        const destino = $("main section").eq(1);
        destino.find("*").not("h2").remove();

        const items = doc.querySelectorAll("h1, h2, p, ul");

        items.forEach(el => {

            if (el.tagName === "UL") {
                const nuevaLista = $("<ul></ul>");

                el.querySelectorAll("li").forEach(li => {
                    nuevaLista.append($("<li></li>").text(li.textContent.trim()));
                });

                destino.append(nuevaLista);
            } else {
                destino.append($("<p></p>").text(el.textContent.trim()));
            }
        });
    }
}



/* ============================================================
   CLASE 2: CargadorSVG (Carga altimetría.svg)
   ============================================================ */

class CargadorSVG {

    constructor() {
        this.prepararEntradaSVG();
    }

    prepararEntradaSVG() {
        const inputSVG = $("main input[type='file'][accept='.svg']");

        inputSVG.on("change", (evento) => {
            const archivo = evento.target.files[0];
            this.leerArchivoSVG(archivo);
        });
    }

    leerArchivoSVG(archivo) {
        if (!archivo) return;

        const lector = new FileReader();

        lector.onload = () => {
            const contenidoSVG = lector.result;
            this.insertarSVG(contenidoSVG);
        };

        lector.readAsText(archivo);
    }

    insertarSVG(contenidoSVG) {

        const destino = $("main section").eq(3);
        destino.find("*").not("h2").remove();

        const articulo = $("<article></article>");
        articulo.append(contenidoSVG);

        destino.append(articulo);
    }
}



/* ============================================================
   CLASE 3: CargadorKML (lectura y representación del circuito)
   ============================================================ */

class CargadorKML {

    constructor() {
        this.prepararEntradaKML();
    }

    prepararEntradaKML() {
        const input = $("main input[type='file'][accept='.kml']");

        input.on("change", (evento) => {
            const archivo = evento.target.files[0];
            this.leerArchivoKML(archivo);
        });
    }

    leerArchivoKML(archivo) {
        if (!archivo) return;

        const lector = new FileReader();

        lector.onload = () => {
            const texto = lector.result;

            const parser = new DOMParser();
            const kml = parser.parseFromString(texto, "application/xml");

            if (kml.querySelector("parsererror")) {
                alert("El archivo KML contiene errores y no puede procesarse.");
                return;
            }

            this.procesarKML(kml);
        };

        lector.readAsText(archivo);
    }

    procesarKML(kml) {

        // leer <coordinates> con namespace KML
        const coords = kml.getElementsByTagNameNS("http://www.opengis.net/kml/2.2", "coordinates");

        if (coords.length === 0) {
            console.error("⚠ No se encontraron coordenadas en el archivo KML.");
            return;
        }

        // punto origen (primer punto del primer <coordinates>)
        const origen = this.parsearCoordenadas(coords[0].textContent)[0];

        // tramos (todos los puntos)
        let tramos = [];
        for (let i = 0; i < coords.length; i++) {
            const lista = this.parsearCoordenadas(coords[i].textContent);
            tramos = tramos.concat(lista);
        }

        console.log("Origen:", origen);
        console.log("Total puntos:", tramos.length);

        // insertar en mapa
        mapaCircuito.insertarEnMapa(origen, tramos);
    }

    parsearCoordenadas(texto) {
        return texto
            .trim()
            .split(/\s+/)
            .map(pair => {
                const [lng, lat] = pair.split(",").map(Number);
                return { lat: lat, lng: lng };
            });
    }
}



/* ============================================================
   CLASE 4: MapaCircuito (Google Maps dinámico)
   ============================================================ */

class MapaCircuito {

    constructor() {
        this.mapa = null;
    }

    inicializarMapa() {

        const contenedor = $("main section").eq(5).find("div")[0];

        this.mapa = new google.maps.Map(contenedor, {
            center: { lat: 0, lng: 0 },
            zoom: 3,
            mapTypeId: "terrain"
        });
    }

    insertarEnMapa(origen, tramos) {

        if (!this.mapa) return;

        this.mapa.setCenter(origen);
        this.mapa.setZoom(15);

        new google.maps.Marker({
            map: this.mapa,
            position: origen,
            title: "Punto origen del circuito"
        });

        new google.maps.Polyline({
            map: this.mapa,
            path: tramos,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 4,
            geodesic: true
        });
    }
}



/* ============================================================
   FUNCIÓN GLOBAL NECESARIA PARA GOOGLE MAPS
   ============================================================ */

function inicializarMapa() {
    mapaCircuito.inicializarMapa();
}
