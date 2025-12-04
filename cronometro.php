<?php
session_start();

/* ==========================================================
   Clase Cronometro (OOP en PHP)
   ========================================================== */
class Cronometro {

    private $tiempo;
    private $inicio;

    public function __construct() {
        $this->tiempo = 0;
        $this->inicio = null;
    }

    public function arrancar() {
        $this->inicio = microtime(true);
    }

    public function parar() {
        if ($this->inicio !== null) {
            $fin = microtime(true);
            $this->tiempo = $fin - $this->inicio;
        }
    }

    public function mostrar() {
        $minutos = floor($this->tiempo / 60);
        $segundos = $this->tiempo - ($minutos * 60);
        return sprintf("%02d:%04.1f", $minutos, $segundos);
    }
}

/* ==========================================================
   Gestión de sesión (persistencia del cronómetro)
   ========================================================== */
if (!isset($_SESSION["cronometro"])) {
    $_SESSION["cronometro"] = new Cronometro();
}

$cronometro = $_SESSION["cronometro"];
$mensaje = "";

/* ==========================================================
   Gestión de la botonera (POST)
   ========================================================== */
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["accion"])) {

    if ($_POST["accion"] === "arrancar") {
        $cronometro->arrancar();
        $mensaje = "Cronómetro arrancado.";
    }

    if ($_POST["accion"] === "parar") {
        $cronometro->parar();
        $mensaje = "Cronómetro detenido.";
    }

    if ($_POST["accion"] === "mostrar") {
        $mensaje = "Tiempo: " . $cronometro->mostrar();
    }

    $_SESSION["cronometro"] = $cronometro;
}
?>

<!DOCTYPE HTML>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Cronómetro PHP - MotoGP Desktop</title>

    <!-- Hojas de estilo del proyecto -->
    <link rel="stylesheet" type="text/css" href="estilo/estilo.css">
    <link rel="stylesheet" type="text/css" href="estilo/layout.css">
</head>

<body>

<header>
    <h1><a href="index.html">MotoGP Desktop</a></h1>
    <nav>
        <a href="index.html">Inicio</a>
        <a href="piloto.html">Piloto</a>
        <a href="circuito.html">Circuito</a>
        <a href="meteorología.html">Meteorología</a>
        <a href="clasificaciones.php">Clasificaciones</a>
        <a class="active" href="juegos.html" >Juegos</a>
        <a href="ayuda.html">Ayuda</a>
    </nav>
</header>

<main>

    <!-- Migas de pan -->
    <p>Estás en: <a href="juegos.html">Juegos</a> | <strong>Cronómetro PHP</strong></p>

    <section>
        <h2>Cronómetro en PHP</h2>

        <article>
            <h3>Cronómetro</h3>
            <!-- Mensaje dinámico -->
            <p><?= htmlspecialchars($mensaje) ?></p>

            <!-- Botonera semántica -->
            <form method="post">
                <p>
                    <button type="submit" name="accion" value="arrancar" aria-label="Arrancar el cronómetro">
                        Arrancar
                    </button>

                    <button type="submit" name="accion" value="parar" aria-label="Parar el cronómetro">
                        Parar
                    </button>

                    <button type="submit" name="accion" value="mostrar" aria-label="Mostrar el tiempo transcurrido">
                        Mostrar
                    </button>
                </p>
            </form>
        </article>
    </section>

</main>

</body>
</html>
