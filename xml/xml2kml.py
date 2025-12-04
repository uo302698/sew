"""
Autor: Richard Roque
Asignatura: Software y Estándares para la Web
Universidad de Oviedo 
"""
 
import xml.etree.ElementTree as ET 

class Kml(object): 
    """
        Genera archivo KML con puntos y líneas 

    """
    def __init__(self):
        self.raiz = ET.Element('kml', xmlns="http://www.opengis.net/kml/2.2") 
        self.doc = ET.SubElement(self.raiz, 'Document') 

    """
        Añade un elemento <Placemark> con puntos <Point> 

    """
    def addPlacemark(self, nombre, descripcion, long, lat, alt, modoAltitud):
        pm = ET.SubElement(self.doc, 'Placemark')
        ET.SubElement(pm, 'name').text = '\n' + nombre + '\n'
        ET.SubElement(pm, 'description').text = '\n' + descripcion + '\n'
        punto = ET.SubElement(pm, 'Point') 
        ET.SubElement(punto, 'coordinates').text = '\n{},{},{}\n'.format(long, lat, alt)
        ET.SubElement(punto, 'altitudeMode').text = '\n' + modoAltitud + '\n'

    """
        Añade un elemento <Placemark> con líneas <LineString>

    """
    def addLineString(self, nombre, extrude, tesela, listaCoordenadas, modoAltitud, color, ancho):
        # Nombre del documento 
        ET.SubElement(self.doc, 'name').text = '\n' + nombre + '\n'

        pm = ET.SubElement(self.doc, 'Placemark')

        # Geometría 
        ls = ET.SubElement(pm, 'LineString')
        ET.SubElement(ls, 'extrude').text = '\n' + extrude + '\n'
        # En KML la etiqueta correcta es <tessellate>
        ET.SubElement(ls, 'tessellate').text = '\n' + tesela + '\n'
        ET.SubElement(ls, 'coordinates').text = '\n' + listaCoordenadas + '\n'
        ET.SubElement(ls, 'altitudeMode').text = '\n' + modoAltitud + '\n'
        # Estilo de línea 
        estilo = ET.SubElement(pm, 'Style')
        linea = ET.SubElement(estilo, 'LineStyle')
        # KML usa ABGR sin '#' 
        ET.SubElement(linea, 'color').text = '\n' + color.lstrip('#') + '\n'
        ET.SubElement(linea, 'width').text = '\n' + ancho + '\n'

    """
        Escribe el archivo KML con declaración y codificación
    """
    def escribir(self, nombreArchivoKML):
        arbol = ET.ElementTree(self.raiz)
        arbol.write(nombreArchivoKML, encoding='utf-8', xml_declaration=True)
# --------------------------------------------------------------------
# Lectura de coordenadas con XPath (obligatorio)
# --------------------------------------------------------------------
def _to_float_text(el):
    """Limpia espacios y devuelve texto formateado como float (string)."""
    if el is None or el.text is None:
        raise ValueError("Falta un valor esperado en el XML.")
    return str(float(el.text.strip()))
def leerCoordenadasTramos(xml_file, cerrar_bucle=True):
    """
    Lee <puntoOrigen> y cada <tramo>/<coordenadaFinalTramo> y devuelve
    un string con líneas 'lon,lat,alt' (formato KML).
    """
    tree = ET.parse(xml_file)
    root = tree.getroot()

    ns = {'ns': 'http://www.uniovi.es'}
    coords = []
    # 1) puntoOrigen
    po = root.find('ns:puntoOrigen', ns)
    if po is None:
        raise ValueError("No se encontró <puntoOrigen> en el XML.")
    lat0 = _to_float_text(po.find('ns:latitud', ns))
    lon0 = _to_float_text(po.find('ns:longitud', ns))
    alt0 = _to_float_text(po.find('ns:altitud', ns))
    coords.append(f'{lon0},{lat0},{alt0}')
    # 2) tramos -> coordenadaFinalTramo (¡ojo a la ruta!)
    for tramo in root.findall('ns:tramos/ns:tramo', ns):
        fin = tramo.find('ns:coordenadaFinalTramo', ns)
        if fin is None:
            raise ValueError("Un <tramo> no tiene <coordenadaFinalTramo>.")
        lat = _to_float_text(fin.find('ns:latitudTramo', ns))
        lon = _to_float_text(fin.find('ns:longitudTramo', ns))  # ← corregido (no 'longitudTramos')
        alt = _to_float_text(fin.find('ns:altitudTramo', ns))
        coords.append(f'{lon},{lat},{alt}')
    # 3) opcional: cerrar el lazo (vuelve al punto de origen)
    if cerrar_bucle:
        coords.append(coords[0])

    return '\n'.join(coords)


# --------------------------------------------------------------------
# Programa principal (ejecución como pedís: xml2kml.py en CMD)
# --------------------------------------------------------------------

def main():
    print(Kml.__doc__)

    nombreKML = "circuito.kml"
    nuevoKML = Kml()
    ruta_xml = input('Introduzca un archivo XML = ')
    coords_kml = leerCoordenadasTramos(ruta_xml)

    # Línea principal (puedes cambiar el nombre visible si quieres)
    nuevoKML.addLineString("Trazado del circuito", "1", "1",
                           coords_kml, 'clampToGround',
                           '#ff0000ff', "5")

    nuevoKML.escribir(nombreKML)
    print("Creado el archivo:", nombreKML)


if __name__ == "__main__":
    main()
