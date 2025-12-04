CREATE DATABASE UO302698_DB;
USE UO302698_DB;

CREATE TABLE Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    profesion VARCHAR(100) NOT NULL,
    edad INT NOT NULL,
    genero ENUM('Masculino','Femenino','Otro') NOT NULL,
    pericia_informatica TINYINT NOT NULL CHECK (pericia_informatica BETWEEN 0 AND 10)
);

CREATE TABLE Dispositivos (
    id_dispositivo INT AUTO_INCREMENT PRIMARY KEY,
    nombre ENUM('Ordenador','Tableta','Telefono') NOT NULL
);

CREATE TABLE Resultados (
    id_resultado INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_dispositivo INT NOT NULL,
    tiempo_segundos INT NOT NULL,
    completado TINYINT(1) NOT NULL,
    comentarios TEXT,
    propuestas_mejora TEXT,
    valoracion TINYINT NOT NULL CHECK (valoracion BETWEEN 0 AND 10),
    respuestas TEXT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
    FOREIGN KEY (id_dispositivo) REFERENCES Dispositivos(id_dispositivo)
);

CREATE TABLE Observaciones (
    id_observacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    comentario TEXT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);
