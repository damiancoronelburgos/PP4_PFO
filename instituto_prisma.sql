-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 10-11-2025 a las 00:49:05
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `instituto_prisma`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `administradores`
--

CREATE TABLE `administradores` (
  `administrador_id` int(11) NOT NULL,
  `nombre_administrador` varchar(50) DEFAULT NULL,
  `fk_usuario` int(11) DEFAULT NULL,
  `fk_rol` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `administradores`
--

INSERT INTO `administradores` (`administrador_id`, `nombre_administrador`, `fk_usuario`, `fk_rol`) VALUES
(2, 'damian', 3, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alumnos`
--

CREATE TABLE `alumnos` (
  `alumnos_id` int(11) NOT NULL,
  `nombre_alumno` varchar(50) DEFAULT NULL,
  `apellido_alumno` varchar(50) DEFAULT NULL,
  `edad_alumno` int(11) DEFAULT NULL,
  `fecha_nac_alumno` date DEFAULT NULL,
  `dni_alumno` int(11) DEFAULT NULL,
  `email_alumno` varchar(50) DEFAULT NULL,
  `fk_usuario` int(11) DEFAULT NULL,
  `contrasenia` varchar(255) DEFAULT NULL,
  `fk_rol` int(11) DEFAULT NULL,
  `fk_curso` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `alumnos`
--

INSERT INTO `alumnos` (`alumnos_id`, `nombre_alumno`, `apellido_alumno`, `edad_alumno`, `fecha_nac_alumno`, `dni_alumno`, `email_alumno`, `fk_usuario`, `contrasenia`, `fk_rol`, `fk_curso`) VALUES
(1, 'sabrina', 'choque', 39, '2025-04-02', 32328252, 'sabrinaechoque@gmail.com', 1, '1111', 1, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencias`
--

CREATE TABLE `asistencias` (
  `asistencia_id` int(11) NOT NULL,
  `fecha_asistencia` date DEFAULT NULL,
  `fk_materia` int(11) DEFAULT NULL,
  `fk_comision` int(11) DEFAULT NULL,
  `fk_alumno` int(11) DEFAULT NULL,
  `estado_asistencia` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `calificaciones`
--

CREATE TABLE `calificaciones` (
  `calificacion_id` int(11) NOT NULL,
  `fk_alumno` int(11) DEFAULT NULL,
  `fk_materia` int(11) DEFAULT NULL,
  `fk_comision` int(11) DEFAULT NULL,
  `fk_docente` int(11) DEFAULT NULL,
  `parciales_calificacion` int(11) DEFAULT NULL,
  `estado_calificacion` varchar(50) DEFAULT NULL,
  `observaciones_calificacion` varchar(50) DEFAULT NULL,
  `anio_calificacion` int(11) DEFAULT NULL,
  `cuatrimestre_calificacion` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comisiones`
--

CREATE TABLE `comisiones` (
  `comision_id` int(11) NOT NULL,
  `nombre_comision` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `comisiones`
--

INSERT INTO `comisiones` (`comision_id`, `nombre_comision`) VALUES
(1, 'A'),
(2, 'B'),
(3, 'C'),
(4, 'D');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cursos`
--

CREATE TABLE `cursos` (
  `curso_id` int(11) NOT NULL,
  `nombre_cursos` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cursos`
--

INSERT INTO `cursos` (`curso_id`, `nombre_cursos`) VALUES
(1, 'Introduccion a la programacion'),
(2, 'Matematica'),
(3, 'Base de datos');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `docentes`
--

CREATE TABLE `docentes` (
  `docente_id` int(11) NOT NULL,
  `nombre_docente` varchar(50) DEFAULT NULL,
  `apellido_docente` varchar(50) DEFAULT NULL,
  `edad_docente` int(11) DEFAULT NULL,
  `telefono_docente` int(11) DEFAULT NULL,
  `email_docente` varchar(50) DEFAULT NULL,
  `fk_usuario` int(11) DEFAULT NULL,
  `fk_rol` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `docentes`
--

INSERT INTO `docentes` (`docente_id`, `nombre_docente`, `apellido_docente`, `edad_docente`, `telefono_docente`, `email_docente`, `fk_usuario`, `fk_rol`) VALUES
(1, 'Alejandro', 'Cubas', 30, 111111111, 'ale@cubas.com', 2, 2),
(2, 'daniel', 'burgos', 20, 12323, 'daniel@gmail.com', 2, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `eventos_calendario`
--

CREATE TABLE `eventos_calendario` (
  `evento_id` int(11) NOT NULL,
  `fecha_evento` date DEFAULT NULL,
  `titulo_evento` varchar(50) DEFAULT NULL,
  `fk_comision` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `justificaciones`
--

CREATE TABLE `justificaciones` (
  `justificacion_id` int(11) NOT NULL,
  `fk_alumno` int(11) DEFAULT NULL,
  `fk_materia` int(11) DEFAULT NULL,
  `fk_comision` int(11) DEFAULT NULL,
  `fecha_justificacion` date DEFAULT NULL,
  `motivo_justificacion` varchar(50) DEFAULT NULL,
  `estado_justificacion` varchar(50) DEFAULT NULL,
  `documentoUrl` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `materias`
--

CREATE TABLE `materias` (
  `materia_id` int(11) NOT NULL,
  `nombre_materia` varchar(50) DEFAULT NULL,
  `fk_docente` int(11) DEFAULT NULL,
  `fk_comision` int(11) DEFAULT NULL,
  `horario` varchar(50) DEFAULT NULL,
  `cupo` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `notificacion_id` int(11) NOT NULL,
  `destino` varchar(50) DEFAULT NULL,
  `fecha_notificacion` date DEFAULT NULL,
  `titulo_notificacion` varchar(50) DEFAULT NULL,
  `detalle_notificacion` varchar(50) DEFAULT NULL,
  `tipo_notificacion` varchar(50) DEFAULT NULL,
  `leida_notificacion` tinyint(1) DEFAULT 0,
  `favorito` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `preceptores`
--

CREATE TABLE `preceptores` (
  `preceptor_id` int(11) NOT NULL,
  `nombre_preceptor` varchar(50) DEFAULT NULL,
  `apellido_preceptor` varchar(50) DEFAULT NULL,
  `fk_usuario` int(11) DEFAULT NULL,
  `fk_rol` int(11) DEFAULT NULL,
  `fk_comision` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `preceptores`
--

INSERT INTO `preceptores` (`preceptor_id`, `nombre_preceptor`, `apellido_preceptor`, `fk_usuario`, `fk_rol`, `fk_comision`) VALUES
(1, 'federico', 'castro', 4, 4, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `rol_id` int(11) NOT NULL,
  `nombre` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`rol_id`, `nombre`) VALUES
(1, 'alumno'),
(2, 'docente'),
(3, 'administrador'),
(4, 'preceptor');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `usuario_id` int(11) NOT NULL,
  `username` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fk_roles` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`usuario_id`, `username`, `password`, `fk_roles`) VALUES
(1, 'alumno1', '1111', 1),
(2, 'docente2', '2222', 2),
(3, 'administrativo3', '3333', 3),
(4, 'preceptor4', '4444', 4);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `administradores`
--
ALTER TABLE `administradores`
  ADD PRIMARY KEY (`administrador_id`),
  ADD KEY `fk_rol` (`fk_rol`),
  ADD KEY `fk_usuario` (`fk_usuario`);

--
-- Indices de la tabla `alumnos`
--
ALTER TABLE `alumnos`
  ADD PRIMARY KEY (`alumnos_id`),
  ADD KEY `fk_curso` (`fk_curso`),
  ADD KEY `fk_rol` (`fk_rol`),
  ADD KEY `fk_usuario` (`fk_usuario`);

--
-- Indices de la tabla `asistencias`
--
ALTER TABLE `asistencias`
  ADD PRIMARY KEY (`asistencia_id`),
  ADD KEY `fk_alumno` (`fk_alumno`),
  ADD KEY `fk_comision` (`fk_comision`),
  ADD KEY `fk_materia` (`fk_materia`);

--
-- Indices de la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  ADD PRIMARY KEY (`calificacion_id`),
  ADD KEY `fk_alumno` (`fk_alumno`),
  ADD KEY `fk_comision` (`fk_comision`),
  ADD KEY `fk_docente` (`fk_docente`),
  ADD KEY `fk_materia` (`fk_materia`);

--
-- Indices de la tabla `comisiones`
--
ALTER TABLE `comisiones`
  ADD PRIMARY KEY (`comision_id`);

--
-- Indices de la tabla `cursos`
--
ALTER TABLE `cursos`
  ADD PRIMARY KEY (`curso_id`);

--
-- Indices de la tabla `docentes`
--
ALTER TABLE `docentes`
  ADD PRIMARY KEY (`docente_id`),
  ADD KEY `fk_rol` (`fk_rol`),
  ADD KEY `fk_usuario` (`fk_usuario`);

--
-- Indices de la tabla `eventos_calendario`
--
ALTER TABLE `eventos_calendario`
  ADD PRIMARY KEY (`evento_id`),
  ADD KEY `fk_comision` (`fk_comision`);

--
-- Indices de la tabla `justificaciones`
--
ALTER TABLE `justificaciones`
  ADD PRIMARY KEY (`justificacion_id`),
  ADD KEY `fk_alumno` (`fk_alumno`),
  ADD KEY `fk_comision` (`fk_comision`),
  ADD KEY `fk_materia` (`fk_materia`);

--
-- Indices de la tabla `materias`
--
ALTER TABLE `materias`
  ADD PRIMARY KEY (`materia_id`),
  ADD KEY `fk_comision` (`fk_comision`),
  ADD KEY `fk_docente` (`fk_docente`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`notificacion_id`);

--
-- Indices de la tabla `preceptores`
--
ALTER TABLE `preceptores`
  ADD PRIMARY KEY (`preceptor_id`),
  ADD KEY `fk_comision` (`fk_comision`),
  ADD KEY `fk_rol` (`fk_rol`),
  ADD KEY `fk_usuario` (`fk_usuario`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`rol_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`usuario_id`),
  ADD KEY `fk_roles` (`fk_roles`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `administradores`
--
ALTER TABLE `administradores`
  MODIFY `administrador_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `alumnos`
--
ALTER TABLE `alumnos`
  MODIFY `alumnos_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `asistencias`
--
ALTER TABLE `asistencias`
  MODIFY `asistencia_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  MODIFY `calificacion_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `comisiones`
--
ALTER TABLE `comisiones`
  MODIFY `comision_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `cursos`
--
ALTER TABLE `cursos`
  MODIFY `curso_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `docentes`
--
ALTER TABLE `docentes`
  MODIFY `docente_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `eventos_calendario`
--
ALTER TABLE `eventos_calendario`
  MODIFY `evento_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `justificaciones`
--
ALTER TABLE `justificaciones`
  MODIFY `justificacion_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `materias`
--
ALTER TABLE `materias`
  MODIFY `materia_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `notificacion_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `preceptores`
--
ALTER TABLE `preceptores`
  MODIFY `preceptor_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `rol_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `usuario_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `administradores`
--
ALTER TABLE `administradores`
  ADD CONSTRAINT `administradores_ibfk_1` FOREIGN KEY (`fk_rol`) REFERENCES `roles` (`rol_id`),
  ADD CONSTRAINT `administradores_ibfk_2` FOREIGN KEY (`fk_usuario`) REFERENCES `usuarios` (`usuario_id`);

--
-- Filtros para la tabla `alumnos`
--
ALTER TABLE `alumnos`
  ADD CONSTRAINT `alumnos_ibfk_1` FOREIGN KEY (`fk_curso`) REFERENCES `cursos` (`curso_id`),
  ADD CONSTRAINT `alumnos_ibfk_2` FOREIGN KEY (`fk_rol`) REFERENCES `roles` (`rol_id`),
  ADD CONSTRAINT `alumnos_ibfk_3` FOREIGN KEY (`fk_usuario`) REFERENCES `usuarios` (`usuario_id`);

--
-- Filtros para la tabla `asistencias`
--
ALTER TABLE `asistencias`
  ADD CONSTRAINT `asistencias_ibfk_1` FOREIGN KEY (`fk_alumno`) REFERENCES `alumnos` (`alumnos_id`),
  ADD CONSTRAINT `asistencias_ibfk_2` FOREIGN KEY (`fk_comision`) REFERENCES `comisiones` (`comision_id`),
  ADD CONSTRAINT `asistencias_ibfk_3` FOREIGN KEY (`fk_materia`) REFERENCES `materias` (`materia_id`);

--
-- Filtros para la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  ADD CONSTRAINT `calificaciones_ibfk_1` FOREIGN KEY (`fk_alumno`) REFERENCES `alumnos` (`alumnos_id`),
  ADD CONSTRAINT `calificaciones_ibfk_2` FOREIGN KEY (`fk_comision`) REFERENCES `comisiones` (`comision_id`),
  ADD CONSTRAINT `calificaciones_ibfk_3` FOREIGN KEY (`fk_docente`) REFERENCES `docentes` (`docente_id`),
  ADD CONSTRAINT `calificaciones_ibfk_4` FOREIGN KEY (`fk_materia`) REFERENCES `materias` (`materia_id`);

--
-- Filtros para la tabla `docentes`
--
ALTER TABLE `docentes`
  ADD CONSTRAINT `docentes_ibfk_1` FOREIGN KEY (`fk_rol`) REFERENCES `roles` (`rol_id`),
  ADD CONSTRAINT `docentes_ibfk_2` FOREIGN KEY (`fk_usuario`) REFERENCES `usuarios` (`usuario_id`);

--
-- Filtros para la tabla `eventos_calendario`
--
ALTER TABLE `eventos_calendario`
  ADD CONSTRAINT `eventos_calendario_ibfk_1` FOREIGN KEY (`fk_comision`) REFERENCES `comisiones` (`comision_id`);

--
-- Filtros para la tabla `justificaciones`
--
ALTER TABLE `justificaciones`
  ADD CONSTRAINT `justificaciones_ibfk_1` FOREIGN KEY (`fk_alumno`) REFERENCES `alumnos` (`alumnos_id`),
  ADD CONSTRAINT `justificaciones_ibfk_2` FOREIGN KEY (`fk_comision`) REFERENCES `comisiones` (`comision_id`),
  ADD CONSTRAINT `justificaciones_ibfk_3` FOREIGN KEY (`fk_materia`) REFERENCES `materias` (`materia_id`);

--
-- Filtros para la tabla `materias`
--
ALTER TABLE `materias`
  ADD CONSTRAINT `materias_ibfk_2` FOREIGN KEY (`fk_comision`) REFERENCES `comisiones` (`comision_id`),
  ADD CONSTRAINT `materias_ibfk_3` FOREIGN KEY (`fk_docente`) REFERENCES `docentes` (`docente_id`);

--
-- Filtros para la tabla `preceptores`
--
ALTER TABLE `preceptores`
  ADD CONSTRAINT `preceptores_ibfk_1` FOREIGN KEY (`fk_comision`) REFERENCES `comisiones` (`comision_id`),
  ADD CONSTRAINT `preceptores_ibfk_2` FOREIGN KEY (`fk_rol`) REFERENCES `roles` (`rol_id`),
  ADD CONSTRAINT `preceptores_ibfk_3` FOREIGN KEY (`fk_usuario`) REFERENCES `usuarios` (`usuario_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
