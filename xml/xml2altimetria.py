
"""
xml2altimetria.py
-----------------
Genera el archivo altimetria.svg a partir de circuitoEsquema.xml
Usando xml.etree.ElementTree y expresiones XPath (obligatorio).
Representa la altimetría del circuito mediante una polilínea SVG.

Autor: Richard Roque
Asignatura: Software y Estándares para la Web
Universidad de Oviedo 
"""

import xml.etree.ElementTree as ET


class Svg:
    """Clase que genera archivos SVG con polilíneas y textos."""

    def __init__(self, ancho, alto):
        self.svg = ET.Element('svg', xmlns="http://www.w3.org/2000/svg",
                              version="1.1", width=str(ancho), height=str(alto))
        self.ancho = ancho
        self.alto = alto

    def addPolyline(self, puntos, color, grosor, relleno=None):
        """Añade una polilínea con lista de puntos (string 'x1,y1 x2,y2 ...')."""
        atributos = {
            'points': puntos,
            'stroke': color,
            'stroke-width': str(grosor),
            'fill': relleno if relleno else 'none'
        }
        ET.SubElement(self.svg, 'polyline', atributos)

    def addText(self, x, y, texto, tam=12):
        """Añade texto en la posición indicada."""
        ET.SubElement(self.svg, 'text', x=str(x), y=str(y),
                      fill="black", **{'font-size': str(tam)}).text = texto

    def escribir(self, nombreArchivo):
        """Guarda el SVG en disco con codificación UTF-8."""
        arbol = ET.ElementTree(self.svg)
        arbol.write(nombreArchivo, encoding='utf-8', xml_declaration=True)


def leerDatosAltimetria(xml_file):
    """
    Lee <distanciaTramoEnMetros> y <altitudTramo> mediante XPath.
    Devuelve listas de distancias acumuladas y altitudes.
    """
    tree = ET.parse(xml_file)
    root = tree.getroot()
    ns = {'ns': 'http://www.uniovi.es'}

    distancias = []
    altitudes = []
    distancia_acum = 0.0

    for tramo in root.findall('ns:tramos/ns:tramo', ns):
        d = float(tramo.find('ns:distanciaTramoEnMetros', ns).text.strip())
        a = float(tramo.find('ns:coordenadaFinalTramo/ns:altitudTramo', ns).text.strip())

        distancia_acum += d
        distancias.append(distancia_acum)
        altitudes.append(a)

    return distancias, altitudes


def main():
    print("Generando perfil altimétrico del circuito...")

    archivo_xml = input("Introduzca el archivo XML = ")
    distancias, altitudes = leerDatosAltimetria(archivo_xml)

    # --- Escala y dimensiones ---
    ancho = 1000
    alto = 400
    max_alt = max(altitudes) if max(altitudes) > 0 else 1

    # Escalado simple (horizontal = distancia proporcional, vertical = altitud invertida)
    escala_x = ancho / max(distancias)
    escala_y = (alto - 50) / max_alt

    # --- Construcción de puntos ---
    puntos = []
    for d, a in zip(distancias, altitudes):
        x = d * escala_x
        y = alto - (a * escala_y) - 20  # invertido, margen inferior
        puntos.append(f"{x:.2f},{y:.2f}")

    # Cerrar polilínea para hacer “efecto suelo”
    puntos.append(f"{ancho:.2f},{alto}")
    puntos.append(f"0,{alto}")
    puntos_str = " ".join(puntos)

    # --- Generar SVG ---
    svg = Svg(ancho, alto)
    svg.addPolyline(puntos_str, color="blue", grosor=2, relleno="lightblue")
    svg.addText(10, 20, "Altimetría del circuito", 16)
    svg.addText(10, alto - 5, "Distancia (m)", 12)
    svg.addText(ancho - 100, 30, "Altitud (m)", 12)

    svg.escribir("altimetria.svg")
    print("Archivo 'altimetria.svg' creado correctamente.")


if __name__ == "__main__":
    main()
