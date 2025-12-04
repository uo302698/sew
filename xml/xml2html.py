# -*- coding: utf-8 -*-
"""
xml2html.py


Autor: Richard Roque / Universidad de Oviedo
Asignatura: Software y Estándares para la Web

"""

import xml.etree.ElementTree as ET


class Html:
    """Clase que genera un documento HTML enlazado a un CSS externo."""

    def __init__(self, titulo, css):
        # Estructura básica del HTML
        self.html = ET.Element("html", attrib={"lang": "es"})
        self.head = ET.SubElement(self.html, "head")
        ET.SubElement(self.head, "meta", charset="UTF-8")
        ET.SubElement(self.head, "title").text = titulo
        ET.SubElement(self.head, "link", rel="stylesheet", href=css)
        self.body = ET.SubElement(self.html, "body")

    def addHeading(self, texto, nivel=1):
        ET.SubElement(self.body, f"h{nivel}").text = texto

    def addParagraph(self, texto):
        ET.SubElement(self.body, "p").text = texto

    def addList(self, titulo, items):
        """Crea una lista con título y varios elementos."""
        section = ET.SubElement(self.body, "section")
        ET.SubElement(section, "h2").text = titulo
        ul = ET.SubElement(section, "ul")
        for t in items:
            ET.SubElement(ul, "li").text = t

    def escribir(self, nombreArchivo):
        """Guarda el HTML con indentación y cabecera DOCTYPE."""
        ET.indent(self.html, space="  ")
        with open(nombreArchivo, "w", encoding="utf-8") as f:
            f.write("<!DOCTYPE html>\n")
            f.write(ET.tostring(self.html, encoding="unicode"))


def leerDatosCircuito(xml_file):
    """
    Lee datos generales del circuito (sin puntoOrigen ni tramos)
    usando expresiones XPath.
    """
    tree = ET.parse(xml_file)
    root = tree.getroot()
    ns = {'ns': 'http://www.uniovi.es'}

    # Función auxiliar
    def get_text(path):
        el = root.find(path, ns)
        return el.text.strip() if el is not None and el.text else "—"

    datos = {
        "Nombre del circuito": get_text("ns:nombreCircuito"),
        "Longitud": f"{get_text('ns:longitudCircuito')} m",
        "Anchura media": f"{get_text('ns:anchuraMedia')} m",
        "Fecha de carrera": get_text("ns:fechaCarrera"),
        "Hora (España)": get_text("ns:horaEsp"),
        "Número de vueltas": get_text("ns:numeroVueltas"),
        "Localidad próxima": get_text("ns:localidadProxima"),
        "País": get_text("ns:paisDelCircuito"),
        "Patrocinador principal": get_text("ns:nombrePatrocinadorP"),
    }

    # Referencias (puede haber varias)
    refs = []
    for ref in root.findall("ns:referencias/ns:referencia", ns):
        url = ref.attrib.get("url", "#")
        texto = ref.text.strip() if ref.text else url
        refs.append(f"{texto} ({url})")

    return datos, refs


def main():
    print("Generando InfoCircuito.html ...")
    xml_file = input("Introduzca el archivo XML = ")

    datos, refs = leerDatosCircuito(xml_file)

    html = Html("Información del circuito", "../estilo/estilo.css")

    html.addHeading("Información del circuito", 1)

    for k, v in datos.items():
        html.addParagraph(f"{k}: {v}")

    if refs:
        html.addList("Referencias", refs)

    html.escribir("InfoCircuito.html")
    print("Archivo 'InfoCircuito.html' creado correctamente.")


if __name__ == "__main__":
    main()
