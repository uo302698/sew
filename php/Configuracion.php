<?php
/* -------------------------------------------------------------
   Clase Configuracion
   Gestiona la base de datos del Test de Usabilidad
   (reiniciar tablas, eliminar BD, exportar CSV, etc.)
--------------------------------------------------------------*/

class Configuracion {

    private $servidor = "localhost";
    private $usuario = "DBUSER2025";
    private $password = "DBPSWD2025";
    private $bd = "UO302698_DB";
    private $conexion;

    /* -------------------------------
       Constructor
    --------------------------------*/
    public function __construct() {
        $this->conexion = new mysqli($this->servidor, $this->usuario, $this->password);

        if ($this->conexion->connect_error) {
            die("Error de conexión: " . $this->conexion->connect_error);
        }
    }

    /* -------------------------------------------------------------
       Reiniciar BD  → Vacía TODAS las tablas sin borrarlas
       (TRUNCATE mantiene estructura y resetea AUTO_INCREMENT)
    --------------------------------------------------------------*/
    public function reiniciarBD() {
        $this->conexion->select_db($this->bd);

        $tablas = ["Observaciones", "Resultados", "Usuarios"];

        foreach ($tablas as $tabla) {
            $this->conexion->query("SET FOREIGN_KEY_CHECKS = 0;");
            $this->conexion->query("TRUNCATE TABLE $tabla;");
            $this->conexion->query("SET FOREIGN_KEY_CHECKS = 1;");
        }

        return "Base de datos reiniciada (tablas vaciadas correctamente).";
    }

    /* -------------------------------------------------------------
       Eliminar BD  → elimina completamente la base de datos
    --------------------------------------------------------------*/
    public function eliminarBD() {
        $sql = "DROP DATABASE IF EXISTS " . $this->bd;

        if ($this->conexion->query($sql) === TRUE) {
            return "Base de datos eliminada correctamente.";
        } else {
            return "Error al eliminar la base de datos: " . $this->conexion->error;
        }
    }

    /* -------------------------------------------------------------
       Exportar CSV  → genera un archivo CSV descargable
    --------------------------------------------------------------*/
    public function exportarCSV() {
        $this->conexion->select_db($this->bd);

        $tablas = ["Usuarios", "Resultados", "Observaciones"];
        $archivo = "exportacion_test_" . date("Y-m-d_H-i-s") . ".csv";

        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename='.$archivo);

        $salida = fopen("php://output", "w");

        foreach ($tablas as $tabla) {

            // Escribe el nombre de la tabla
            fputcsv($salida, ["=== TABLA: $tabla ==="]);

            // Seleccionar datos
            $resultado = $this->conexion->query("SELECT * FROM $tabla");

            // Encabezados
            $columnas = array();
            while ($col = $resultado->fetch_field()) {
                $columnas[] = $col->name;
            }
            fputcsv($salida, $columnas);

            // Filas
            while ($fila = $resultado->fetch_assoc()) {
                fputcsv($salida, $fila);
            }

            // Línea en blanco entre tablas
            fputcsv($salida, []);
        }

        fclose($salida);
        exit;
    }

    /* -------------------------------------------------------------
       Ejemplo de operación adicional (opcional)
       → Crear nuevamente la BD desde cero
    --------------------------------------------------------------*/
    public function crearBD() {
        $this->conexion->query("DROP DATABASE IF EXISTS " . $this->bd);
        $this->conexion->query("CREATE DATABASE " . $this->bd);

        return "Base de datos recreada.";
    }
}
?>
<!DOCTYPE HTML>

<html lang="es">

<head>
    <meta charset="UTF-8" />
    <title>MotoGP-Configuración</title>

    <meta name="author" content="Richard Robin Roque del Rio" />
    <meta name="description" content="Configuracion" />
    <meta name="keywords" content="config, configuracion, php" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />

   	<link rel="stylesheet" type="text/css" href="estilo/estilo.css" />
	<link rel="stylesheet" type="text/css" href="estilo/layout.css" />

    <link rel="icon" href="multimedia/favicon48px.ico">
</head>

<body>
    <main>
        <h2>Configuración</h2>
        <form method="post" name="configuración">
            <input type="submit" name="botonReiniciar" value="Reiniciar BD" />
            <input type="submit" name="botonEliminar" value="Eliminar BD" />
            <input type="submit" name="botonExportar" value="Exportar BD" />
            <input type="submit" name="botonInicializar" value="Inicializar BD" />
        </form>
    </main>

</body>

</html>