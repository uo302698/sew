<?php
session_start();

/* ==========================================================
   Configuración de conexión a la base de datos
   ========================================================== */
$servidor = "localhost";
$usuarioBD = "DBUSER2025";
$passwordBD = "DBPSWD2025";
$nombreBD = "UO302698_DB";

$conexion = new mysqli($servidor, $usuarioBD, $passwordBD, $nombreBD);
if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}
$conexion->set_charset("utf8mb4");

/* ==========================================================
   Gestión del flujo de la prueba
   ========================================================== */
$estado = "inicio";
$mensaje = "";

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["estado"])) {
    $estado = $_POST["estado"];
}

/* ==========================================================
   Iniciar cronómetro
   ========================================================== */
if ($estado === "iniciar") {
    $_SESSION["inicio_prueba_usabilidad"] = microtime(true);
    $estado = "preguntas";
}

/* ==========================================================
   Función auxiliar: calcular tiempo en segundos
   ========================================================== */
function obtenerTiempoSegundos() {
    if (!isset($_SESSION["inicio_prueba_usabilidad"])) {
        return 0;
    }
    $inicio = $_SESSION["inicio_prueba_usabilidad"];
    $fin = microtime(true);
    unset($_SESSION["inicio_prueba_usabilidad"]);
    return (int) round($fin - $inicio);
}

/* ==========================================================
   Estado TERMINAR → guardar USER + RESPUESTAS + TIEMPO
   ========================================================== */
if ($estado === "terminar") {

    $tiempoSegundos = obtenerTiempoSegundos();

    // Datos usuario
    $profesion = trim($_POST["profesion"] ?? "");
    $edad = (int) ($_POST["edad"] ?? 0);
    $genero = $_POST["genero"] ?? "";
    $pericia = (int) ($_POST["pericia"] ?? 0);
    $dispositivo = $_POST["dispositivo"] ?? "Ordenador";
    $comentariosUsuario = trim($_POST["comentariosUsuario"] ?? "");
    $mejorasUsuario = trim($_POST["mejorasUsuario"] ?? "");
    $valoracion = (int) ($_POST["valoracion"] ?? 0);

    // Respuestas
    $respuestas = [];
    for ($i = 1; $i <= 10; $i++) {
        $campo = "p" . $i;
        $respuestas[$campo] = trim($_POST[$campo] ?? "");
    }
    $respuestasTexto = json_encode($respuestas, JSON_UNESCAPED_UNICODE);

    /* =====================================================
       Insertar usuario (consulta preparada)
       ===================================================== */
    $sqlUsuario = "INSERT INTO Usuarios (profesion, edad, genero, pericia_informatica)
                   VALUES (?, ?, ?, ?)";
    $stmtUsuario = $conexion->prepare($sqlUsuario);
    $stmtUsuario->bind_param("sisi", $profesion, $edad, $genero, $pericia);
    $stmtUsuario->execute();
    $idUsuario = $stmtUsuario->insert_id;
    $stmtUsuario->close();

    /* =====================================================
       Obtener o crear dispositivo
       ===================================================== */
    $sqlSelDisp = "SELECT id_dispositivo FROM Dispositivos WHERE nombre = ?";
    $stmtSelDisp = $conexion->prepare($sqlSelDisp);
    $stmtSelDisp->bind_param("s", $dispositivo);
    $stmtSelDisp->execute();
    $stmtSelDisp->bind_result($idDispositivo);

    if ($stmtSelDisp->fetch()) {
        $stmtSelDisp->close();
    } else {
        $stmtSelDisp->close();
        $sqlInsDisp = "INSERT INTO Dispositivos (nombre) VALUES (?)";
        $stmtInsDisp = $conexion->prepare($sqlInsDisp);
        $stmtInsDisp->bind_param("s", $dispositivo);
        $stmtInsDisp->execute();
        $idDispositivo = $stmtInsDisp->insert_id;
        $stmtInsDisp->close();
    }

    /* =====================================================
       Insertar resultados
       ===================================================== */
    $completado = 1;

    $sqlResultado = "INSERT INTO Resultados 
        (id_usuario, id_dispositivo, tiempo_segundos, completado,
         comentarios, propuestas_mejora, valoracion, respuestas)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    $stmtResultado = $conexion->prepare($sqlResultado);
    $stmtResultado->bind_param(
        "iiiissis",
        $idUsuario,
        $idDispositivo,
        $tiempoSegundos,
        $completado,
        $comentariosUsuario,
        $mejorasUsuario,
        $valoracion,
        $respuestasTexto
    );
    $stmtResultado->execute();
    $stmtResultado->close();

    $_SESSION["ultimo_usuario_test"] = $idUsuario;

    $estado = "observador";
}

/* ==========================================================
   Guardar observador
   ========================================================== */
if ($estado === "guardar_observador") {

    $comentarioObservador = trim($_POST["comentarioObservador"] ?? "");
    $idUsuarioObs = $_SESSION["ultimo_usuario_test"] ?? null;

    if ($idUsuarioObs !== null && $comentarioObservador !== "") {

        $sqlObs = "INSERT INTO Observaciones (id_usuario, comentario)
                   VALUES (?, ?)";
        $stmtObs = $conexion->prepare($sqlObs);
        $stmtObs->bind_param("is", $idUsuarioObs, $comentarioObservador);
        $stmtObs->execute();
        $stmtObs->close();

        $mensaje = "Prueba de usabilidad guardada correctamente.";
    } else {
        $mensaje = "No se pudo guardar el comentario del observador.";
    }

    unset($_SESSION["ultimo_usuario_test"]);
    $estado = "fin";
}
?>
<!DOCTYPE HTML>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <title>Test de Usabilidad - MotoGP Desktop</title>
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />

    <link rel="stylesheet" href="../estilo/estilo.css" />
    <link rel="stylesheet" href="../estilo/layout.css" />
</head>

<body>
<main>

<?php if ($estado === "inicio"): ?>

    <section>
        <h2>Test de Usabilidad</h2>
        <p>Al iniciar comenzará la prueba y el tiempo empezará a contarse.</p>

        <form method="post">
            <p>
                <input type="hidden" name="estado" value="iniciar" />
                <input type="submit" value="Iniciar prueba" />
            </p>
        </form>
    </section>

<?php elseif ($estado === "preguntas"): ?>

    <section>
        <h2>Cuestionario sobre MotoGP Desktop</h2>

        <form method="post">

            <section>
                <h3>Datos del usuario</h3>

                <p>Profesión:
                    <input type="text" name="profesion" required />
                </p>

                <p>Edad:
                    <input type="number" name="edad" min="10" max="120" required />
                </p>

                <p>Género:
                    <label><input type="radio" name="genero" value="Masculino" required /> Masculino</label>
                    <label><input type="radio" name="genero" value="Femenino" /> Femenino</label>
                    <label><input type="radio" name="genero" value="Otro" /> Otro</label>
                </p>

                <p>Pericia informática (0–10):
                    <input type="number" name="pericia" min="0" max="10" required />
                </p>

                <p>Dispositivo utilizado:
                    <label><input type="radio" name="dispositivo" value="Ordenador" required /> Ordenador</label>
                    <label><input type="radio" name="dispositivo" value="Tableta" /> Tableta</label>
                    <label><input type="radio" name="dispositivo" value="Telefono" /> Teléfono</label>
                </p>
            </section>

            <section>
                <h3>Preguntas (10)</h3>

                <p>1. ¿Cuál es el nombre del piloto principal mostrado en la sección "Piloto"?
                    <input type="text" name="p1" required />
                </p>

                <p>2. ¿Qué país aparece como origen del piloto?
                    <input type="text" name="p2" required />
                </p>

                <p>3. ¿Cuál es el nombre del circuito principal?
                    <input type="text" name="p3" required />
                </p>

                <p>4. ¿Qué longitud tiene el circuito?
                    <input type="text" name="p4" required />
                </p>

                <p>5. ¿Qué dato del tiempo te parece más útil para un aficionado al motociclismo?
                    <input type="text" name="p5" required />
                </p>

                <p>6. ¿Qué tipo de juego aparece disponible en la sección "Juegos"?
                    <input type="text" name="p6" required />
                </p>

                <p>7. ¿Para qué te podría servir un cronómetro dentro del sitio?
                    <input type="text" name="p7" required />
                </p>

                <p>8. ¿Qué información aparece sobre el ganador de la carrera?
                    <input type="text" name="p8" required />
                </p>

                <p>9. Escribe una recomendación útil de la sección "Ayuda".
                    <input type="text" name="p9" required />
                </p>

                <p>10. ¿Con qué dispositivo te resulta más cómodo navegar por el sitio?
                    <input type="text" name="p10" required />
                </p>
            </section>

            <section>
                <h3>Opinión del usuario</h3>

                <p>Comentarios:
                    <textarea name="comentariosUsuario" rows="3"></textarea>
                </p>

                <p>Propuestas de mejora:
                    <textarea name="mejorasUsuario" rows="3"></textarea>
                </p>

                <p>Valoración global (0–10):
                    <input type="number" name="valoracion" min="0" max="10" required />
                </p>
            </section>

            <p>
                <input type="hidden" name="estado" value="terminar" />
                <input type="submit" value="Terminar prueba" />
            </p>

        </form>

    </section>

<?php elseif ($estado === "observador"): ?>

    <section>
        <h2>Comentarios del observador</h2>

        <form method="post">
            <p>
                <textarea name="comentarioObservador" rows="4" required></textarea>
            </p>
            <p>
                <input type="hidden" name="estado" value="guardar_observador" />
                <input type="submit" value="Guardar comentario" />
            </p>
        </form>

    </section>

<?php elseif ($estado === "fin"): ?>

    <section>
        <h2>Prueba finalizada</h2>
        <p><?= htmlspecialchars($mensaje, ENT_QUOTES, 'UTF-8') ?></p>
    </section>

<?php endif; ?>

</main>
</body>
</html>
