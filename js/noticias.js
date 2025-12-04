// Clase Noticias – consumo del servicio web TheNewsApi

class Noticias {

    constructor(busqueda) {
        this.busqueda = busqueda;
        this.url = "https://api.thenewsapi.com/v1/news/all";
        this.apiKey = "opy8AZtmWDVR0ETYugUSaQZUVVPfzeoLIwiO8Zy9";
    }

    buscar() {
        const urlCompleta =
            `${this.url}?api_token=${this.apiKey}&search=${this.busqueda}&language=es`;

        return fetch(urlCompleta)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error en la llamada a TheNewsApi");
                }
                return response.json();
            })
            .catch(error => console.error("Error en fetch:", error));
    }

    procesarInformacion(json) {
        const noticias = [];

        if (!json || !json.data) {
            return noticias;
        }

        json.data.forEach(item => {
            noticias.push({
                titulo: item.title,
                entradilla: item.description,
                enlace: item.url,
                fuente: item.source,
                imagen: item.image_url
            });
        });

        return noticias;
    }
}

// =========================================
//       Ejecución automática con jQuery
// =========================================

$(document).ready(() => {

    const buscador = new Noticias("MotoGP");

    buscador.buscar().then(json => {

        const lista = buscador.procesarInformacion(json);

        // Seleccionar la 2ª sección dentro de <main> (la de noticias)
        const seccionNoticias = $("main > section").eq(1);

        lista.forEach(noticia => {

            const articulo = $("<article></article>");

            articulo.append(
                $("<h3></h3>").text(noticia.titulo)
            );

            if (noticia.entradilla) {
                articulo.append(
                    $("<p></p>").text(noticia.entradilla)
                );
            }

            articulo.append(
                $("<small></small>").text("Fuente: " + noticia.fuente)
            );

            articulo.append(
                $("<a></a>")
                    .attr("href", noticia.enlace)
                    .attr("target", "_blank")
                    .text("Leer más")
            );

            seccionNoticias.append(articulo);
        });
    });
});
