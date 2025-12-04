"use strict";

/*
  Autor: Richard Roque Del Río – UO302698
  Asignatura: Tecnologías y Paradigmas de Programación
  Proyecto: MotoGP Desktop – Ejercicio 3 (Meteorología con Open-Meteo)
*/

class Ciudad {
    #nombre;
    #pais;
    #gentilicio;
    #poblacion;
    #coordenadas;

    constructor(nombre, pais, gentilicio) {
        this.#nombre = nombre;
        this.#pais = pais;
        this.#gentilicio = gentilicio;
        this.#poblacion = 0;
        this.#coordenadas = { latitud: 0.0, longitud: 0.0 };
    }

    // ------------------------------------------------------------
    // Métodos básicos de información
    // ------------------------------------------------------------
    rellenarDatos(poblacion, latitud, longitud) {
        this.#poblacion = poblacion;
        this.#coordenadas.latitud = latitud;
        this.#coordenadas.longitud = longitud;
    }

    obtenerNombre() { return this.#nombre; }
    obtenerPais() { return this.#pais; }

    obtenerInformacionSecundaria() {
        const ul = $("<ul>");
        ul.append($("<li>").text(`Gentilicio: ${this.#gentilicio}`));
        ul.append($("<li>").text(`Población: ${this.#poblacion.toLocaleString("es-ES")} habitantes`));
        return ul;
    }

    obtenerParrafoCoordenadas() {
        return $("<p>").text(
            `Coordenadas centrales: Latitud ${this.#coordenadas.latitud}°, Longitud ${this.#coordenadas.longitud}°`
        );
    }

    // ============================================================
    //  Tarea 3: Obtener meteorología del día de la carrera
    // ============================================================
    getMeteorologiaCarrera() {
        const { latitud, longitud } = this.#coordenadas;
        const fecha = "2024-10-06"; // Día de la carrera (ajustable según calendario)

        $.ajax({
            url: "https://archive-api.open-meteo.com/v1/archive",
            data: {
                latitude: latitud,
                longitude: longitud,
                start_date: fecha,
                end_date: fecha,
                hourly: "temperature_2m,apparent_temperature,precipitation,relative_humidity_2m,windspeed_10m,winddirection_10m",
                daily: "sunrise,sunset",
                timezone: "auto"
            },
            dataType: "json",
            success: datos => this.procesarJSONCarrera(datos),
            error: () => console.error("Error al obtener datos meteorológicos del día de la carrera.")
        });
    }

    // ============================================================
    //  Tarea 4: Procesar el JSON del día de la carrera
    // ============================================================
    procesarJSONCarrera(datos) {
        const seccion = $("main > section").eq(1); // Segunda sección de <main>
        const article = $("<article>");
        article.append($("<h3>").text("Meteorología del día de la carrera"));

        // Datos horarios (fracciones horarias)
        const i = 12; // Mediodía aproximado
        const temperatura = datos.hourly.temperature_2m[i];
        const sensacion = datos.hourly.apparent_temperature[i];
        const humedad = datos.hourly.relative_humidity_2m[i];
        const lluvia = datos.hourly.precipitation[i];
        const vientoVel = datos.hourly.windspeed_10m[i];
        const vientoDir = datos.hourly.winddirection_10m[i];

        // Datos diarios (día completo)
        const salidaSol = datos.daily.sunrise[0].split("T")[1];
        const puestaSol = datos.daily.sunset[0].split("T")[1];

        // Crear lista de valores procesados
        const ul = $("<ul>");
        ul.append($("<li>").text(`Temperatura: ${temperatura} °C`));
        ul.append($("<li>").text(`Sensación térmica: ${sensacion} °C`));
        ul.append($("<li>").text(`Humedad relativa: ${humedad} %`));
        ul.append($("<li>").text(`Lluvia: ${lluvia} mm`));
        ul.append($("<li>").text(`Viento: ${vientoVel} km/h (dirección ${vientoDir}°)`));
        ul.append($("<li>").text(`Salida del sol: ${salidaSol}`));
        ul.append($("<li>").text(`Puesta del sol: ${puestaSol}`));

        article.append(ul);
        seccion.append(article);
    }

    // ============================================================
    //  Tarea 6: Obtener meteorología de los entrenamientos
    // ============================================================
    getMeteorologiaEntrenos() {
        const { latitud, longitud } = this.#coordenadas;
        const fechaInicio = "2024-10-03"; // 3 días antes
        const fechaFin = "2024-10-05";    // Víspera de la carrera

        $.ajax({
            url: "https://archive-api.open-meteo.com/v1/archive",
            data: {
                latitude: latitud,
                longitude: longitud,
                start_date: fechaInicio,
                end_date: fechaFin,
                hourly: "temperature_2m,precipitation,windspeed_10m,relative_humidity_2m",
                timezone: "auto"
            },
            dataType: "json",
            success: datos => this.procesarJSONEntrenos(datos),
            error: () => console.error("Error al obtener datos meteorológicos de entrenamientos.")
        });
    }

    // ============================================================
    //  Tareas 7–8: Procesar JSON y mostrar medias (3 días previos)
    // ============================================================
    procesarJSONEntrenos(datos) {
        const seccion = $("main > section").eq(1);
        const article = $("<article>");
        article.append($("<h3>").text("Media meteorológica de los entrenamientos (3 días previos)"));

        const temp = datos.hourly.temperature_2m;
        const lluvia = datos.hourly.precipitation;
        const viento = datos.hourly.windspeed_10m;
        const humedad = datos.hourly.relative_humidity_2m;

        const medias = [];
        for (let d = 0; d < 3; d++) {
            const inicio = d * 24;
            const fin = inicio + 24;
            medias.push({
                temperatura: this.#media(temp.slice(inicio, fin)),
                lluvia: this.#media(lluvia.slice(inicio, fin)),
                viento: this.#media(viento.slice(inicio, fin)),
                humedad: this.#media(humedad.slice(inicio, fin))
            });
        }

        const ul = $("<ul>");
        medias.forEach((dia, i) => {
            ul.append($("<li>").text(
                `Día ${i + 1} → Temp: ${dia.temperatura}°C | Lluvia: ${dia.lluvia} mm | ` +
                `Viento: ${dia.viento} km/h | Humedad: ${dia.humedad}%`
            ));
        });

        article.append(ul);
        seccion.append(article);
    }

    // ------------------------------------------------------------
    // Método privado auxiliar: media aritmética a 2 decimales
    // ------------------------------------------------------------
    #media(array) {
        const total = array.reduce((a, b) => a + b, 0);
        return (total / array.length).toFixed(2);
    }
}
