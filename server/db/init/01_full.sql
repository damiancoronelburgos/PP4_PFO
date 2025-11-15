-- MySQL dump 10.13  Distrib 8.4.7, for Linux (x86_64)
--
-- Host: localhost    Database: prisma_app
-- ------------------------------------------------------
-- Server version	8.4.7

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `administradores`
--

DROP TABLE IF EXISTS `administradores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `administradores` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `usuario_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `fk_admin_user` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `administradores`
--

LOCK TABLES `administradores` WRITE;
/*!40000 ALTER TABLE `administradores` DISABLE KEYS */;
INSERT INTO `administradores` VALUES (1,'damian',3);
/*!40000 ALTER TABLE `administradores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alumnos`
--

DROP TABLE IF EXISTS `alumnos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alumnos` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `dni` varchar(20) DEFAULT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `email` varchar(120) DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dni` (`dni`),
  UNIQUE KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `fk_alumno_user` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alumnos`
--

LOCK TABLES `alumnos` WRITE;
/*!40000 ALTER TABLE `alumnos` DISABLE KEYS */;
INSERT INTO `alumnos` VALUES (1,'sabrina','choque','32328252','1130110713','sabrinaechoque@gmail.com',1),(2,'juan','perez','40123456','1145678901','juan.perez@example.com',NULL),(3,'ana','gomez','39987654','1145678902','ana.gomez@example.com',NULL),(4,'luis','fernandez','38999111','1145678903','luis.fernandez@example.com',NULL),(5,'maria','lopez','40111222','1145678904','maria.lopez@example.com',NULL),(6,'carla','diaz','42123456','1145678905','carla.diaz@example.com',NULL),(7,'diego','ramirez','37999888','1145678906','diego.ramirez@example.com',NULL),(8,'valentina','torres','40123999','1145678907','valentina.torres@example.com',NULL),(9,'nicolas','sosa','39911222','1145678908','nicolas.sosa@example.com',NULL),(10,'laura','martinez','38910001','1145678909','laura.martinez@example.com',NULL);
/*!40000 ALTER TABLE `alumnos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asistencias`
--

DROP TABLE IF EXISTS `asistencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asistencias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `alumno_id` int NOT NULL,
  `comision_id` int NOT NULL,
  `estado` enum('P','A','T','J') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_asistencia` (`fecha`,`alumno_id`,`comision_id`),
  KEY `idx_asistencia_comision_fecha` (`comision_id`,`fecha`),
  KEY `fk_asist_alum` (`alumno_id`),
  CONSTRAINT `fk_asist_alum` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`),
  CONSTRAINT `fk_asist_com` FOREIGN KEY (`comision_id`) REFERENCES `comisiones` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asistencias`
--

LOCK TABLES `asistencias` WRITE;
/*!40000 ALTER TABLE `asistencias` DISABLE KEYS */;
INSERT INTO `asistencias` VALUES (5,'2025-09-18',1,2,'P'),(6,'2025-09-18',2,2,'P'),(7,'2025-09-18',5,2,'J'),(8,'2025-09-18',6,2,'A'),(9,'2025-09-17',3,3,'P'),(10,'2025-09-17',4,3,'P'),(11,'2025-09-19',5,4,'P'),(12,'2025-09-19',6,4,'P'),(13,'2025-09-19',10,4,'A'),(14,'2025-09-16',7,5,'P'),(15,'2025-09-16',8,5,'P'),(16,'2025-09-16',9,5,'T'),(17,'2025-09-20',1,2,'P'),(18,'2025-09-20',2,2,'A'),(19,'2025-09-20',5,2,'J'),(20,'2025-09-20',6,2,'P'),(25,'2025-09-19',1,1,'P'),(26,'2025-09-19',4,1,'T'),(27,'2025-09-19',3,1,'P'),(28,'2025-09-19',2,1,'A');
/*!40000 ALTER TABLE `asistencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `calificaciones`
--

DROP TABLE IF EXISTS `calificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calificaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `alumno_id` int NOT NULL,
  `comision_id` int NOT NULL,
  `p1` tinyint DEFAULT NULL,
  `p2` tinyint DEFAULT NULL,
  `p3` tinyint DEFAULT NULL,
  `estado` varchar(30) DEFAULT NULL,
  `observacion` varchar(255) DEFAULT NULL,
  `anio` smallint DEFAULT NULL,
  `cuatrimestre` tinyint DEFAULT NULL,
  `docente_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_calif_alum_com` (`alumno_id`,`comision_id`),
  KEY `fk_calif_com` (`comision_id`),
  KEY `fk_calif_doc` (`docente_id`),
  CONSTRAINT `fk_calif_alum` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`),
  CONSTRAINT `fk_calif_com` FOREIGN KEY (`comision_id`) REFERENCES `comisiones` (`id`),
  CONSTRAINT `fk_calif_doc` FOREIGN KEY (`docente_id`) REFERENCES `docentes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calificaciones`
--

LOCK TABLES `calificaciones` WRITE;
/*!40000 ALTER TABLE `calificaciones` DISABLE KEYS */;
INSERT INTO `calificaciones` VALUES (1,1,1,8,10,NULL,'En curso','Regular',2025,2,1),(2,2,1,7,6,NULL,'En curso',NULL,2025,2,1),(3,3,1,9,8,9,'Aprobado',NULL,2025,2,1),(4,4,1,5,7,6,'En curso','Rinde recup. p1',2025,2,1),(5,5,4,6,6,7,'En curso',NULL,2025,2,1),(6,6,4,9,9,NULL,'En curso',NULL,2025,2,1),(7,10,4,7,8,8,'Aprobado',NULL,2025,2,1),(8,1,2,9,8,10,'Aprobado',NULL,2025,2,2),(9,2,2,6,7,NULL,'En curso','Recuperatorio p3',2025,2,2),(10,5,2,8,8,9,'Aprobado',NULL,2025,2,2),(11,6,2,5,6,6,'En curso',NULL,2025,2,2),(12,7,5,7,7,8,'En curso',NULL,2025,2,2),(13,8,5,9,9,9,'Aprobado',NULL,2025,2,2),(14,9,5,6,6,7,'En curso',NULL,2025,2,2),(15,3,3,8,7,8,'Aprobado',NULL,2025,2,1),(16,4,3,5,6,6,'En curso',NULL,2025,2,1),(17,7,6,6,7,7,'En curso',NULL,2025,2,3);
/*!40000 ALTER TABLE `calificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comisiones`
--

DROP TABLE IF EXISTS `comisiones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comisiones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(80) NOT NULL,
  `materia_id` int NOT NULL,
  `docente_id` int DEFAULT NULL,
  `letra` varchar(10) DEFAULT NULL,
  `horario` varchar(80) DEFAULT NULL,
  `cupo` int DEFAULT NULL,
  `sede` varchar(80) DEFAULT NULL,
  `aula` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `fk_com_mat` (`materia_id`),
  KEY `fk_com_doc` (`docente_id`),
  CONSTRAINT `fk_com_doc` FOREIGN KEY (`docente_id`) REFERENCES `docentes` (`id`),
  CONSTRAINT `fk_com_mat` FOREIGN KEY (`materia_id`) REFERENCES `materias` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comisiones`
--

LOCK TABLES `comisiones` WRITE;
/*!40000 ALTER TABLE `comisiones` DISABLE KEYS */;
INSERT INTO `comisiones` VALUES (1,'MAT-1_A',1,1,'A','Lunes 19hs',20,'Central','A confirmar'),(2,'PROG-1_B',2,2,'B','Miércoles 18hs',30,'Central','A confirmar'),(3,'BD-1_C',3,1,'C','Jueves 20hs',25,'Central','A confirmar'),(4,'MAT-1_B',1,1,'B','Martes 18hs',25,'Central','A confirmar'),(5,'PROG-1_A',2,2,'A','Lunes 20hs',30,'Central','A confirmar'),(6,'BD-1_A',3,3,'A','Viernes 19hs',25,'Central','A confirmar');
/*!40000 ALTER TABLE `comisiones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `docentes`
--

DROP TABLE IF EXISTS `docentes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `docentes` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `email` varchar(120) DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `fk_docente_user` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `docentes`
--

LOCK TABLES `docentes` WRITE;
/*!40000 ALTER TABLE `docentes` DISABLE KEYS */;
INSERT INTO `docentes` VALUES (1,'Alejandro','Cubas','1234567890','alejandro.gomez@prisma.edu',2),(2,'Betik','Enrique','1132456789','betik.enrique@prisma.edu',NULL),(3,'Carolina','Ruiz','1187654321','carolina.ruiz@prisma.edu',NULL);
/*!40000 ALTER TABLE `docentes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eventos`
--

DROP TABLE IF EXISTS `eventos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eventos` (
  `id` int NOT NULL,
  `fecha` date NOT NULL,
  `titulo` varchar(160) NOT NULL,
  `comision_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_event_com` (`comision_id`),
  CONSTRAINT `fk_event_com` FOREIGN KEY (`comision_id`) REFERENCES `comisiones` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eventos`
--

LOCK TABLES `eventos` WRITE;
/*!40000 ALTER TABLE `eventos` DISABLE KEYS */;
INSERT INTO `eventos` VALUES (1,'2025-10-10','Entrega TP 2',NULL),(2,'2025-10-20','Primer parcial',NULL),(3,'2025-10-06','Reunión de cátedra',NULL),(4,'2025-10-27','Entrega Informe',NULL);
/*!40000 ALTER TABLE `eventos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inscripciones`
--

DROP TABLE IF EXISTS `inscripciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inscripciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `alumno_id` int NOT NULL,
  `comision_id` int NOT NULL,
  `fecha_insc` date DEFAULT (curdate()),
  `estado` enum('activa','baja') DEFAULT 'activa',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_insc` (`alumno_id`,`comision_id`),
  KEY `fk_insc_com` (`comision_id`),
  KEY `idx_insc_com_estado` (`comision_id`,`estado`),
  KEY `idx_insc_alum_estado` (`alumno_id`,`estado`),
  CONSTRAINT `fk_insc_alum` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`),
  CONSTRAINT `fk_insc_com` FOREIGN KEY (`comision_id`) REFERENCES `comisiones` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inscripciones`
--

LOCK TABLES `inscripciones` WRITE;
/*!40000 ALTER TABLE `inscripciones` DISABLE KEYS */;
INSERT INTO `inscripciones` VALUES (1,1,1,'2025-11-14','activa'),(2,1,2,'2025-11-14','activa'),(3,2,1,'2025-11-14','activa'),(4,2,2,'2025-11-14','activa'),(5,3,1,'2025-11-14','activa'),(6,3,3,'2025-11-14','activa'),(7,4,1,'2025-11-14','activa'),(8,4,3,'2025-11-14','activa'),(9,5,2,'2025-11-14','activa'),(10,5,4,'2025-11-14','activa'),(11,6,2,'2025-11-14','activa'),(12,6,4,'2025-11-14','activa'),(13,7,5,'2025-11-14','activa'),(14,7,6,'2025-11-14','activa'),(15,8,5,'2025-11-14','activa'),(16,9,5,'2025-11-14','activa'),(17,10,4,'2025-11-14','activa');
/*!40000 ALTER TABLE `inscripciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instituto`
--

DROP TABLE IF EXISTS `instituto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `instituto` (
  `id` tinyint NOT NULL,
  `nombre` varchar(160) NOT NULL,
  `direccion` varchar(160) DEFAULT NULL,
  `telefono` varchar(40) DEFAULT NULL,
  `email_secretaria` varchar(120) DEFAULT NULL,
  `email_soporte` varchar(120) DEFAULT NULL,
  `web` varchar(160) DEFAULT NULL,
  `horarios` varchar(120) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instituto`
--

LOCK TABLES `instituto` WRITE;
/*!40000 ALTER TABLE `instituto` DISABLE KEYS */;
INSERT INTO `instituto` VALUES (1,'Instituto Superior Prisma','Av. Siempre Viva 123, CABA','+54 11 5555-0000','secretaria@instituto.edu.ar','soporte@instituto.edu.ar','https://instituto.edu.ar','Lun a Vie 9:00-18:00');
/*!40000 ALTER TABLE `instituto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `justificaciones`
--

DROP TABLE IF EXISTS `justificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `justificaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `alumno_id` int NOT NULL,
  `comision_id` int NOT NULL,
  `fecha` date NOT NULL,
  `motivo` varchar(255) NOT NULL,
  `estado` enum('pendiente','aprobada','rechazada') DEFAULT 'pendiente',
  `documento_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_justif_alum_com_fecha` (`alumno_id`,`comision_id`,`fecha`),
  KEY `idx_justif_com_fecha` (`comision_id`,`fecha`),
  KEY `fk_j_alum` (`alumno_id`),
  CONSTRAINT `fk_j_alum` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`),
  CONSTRAINT `fk_j_com` FOREIGN KEY (`comision_id`) REFERENCES `comisiones` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1006 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `justificaciones`
--

LOCK TABLES `justificaciones` WRITE;
/*!40000 ALTER TABLE `justificaciones` DISABLE KEYS */;
INSERT INTO `justificaciones` VALUES (1001,2,1,'2025-09-19','Turno médico','pendiente','/uploads/docs/1001.pdf'),(1002,5,2,'2025-09-18','Enfermedad','pendiente','/uploads/docs/1002.pdf'),(1003,4,3,'2025-09-17','Familiar','pendiente','/uploads/docs/1003.pdf'),(1004,6,4,'2025-09-19','Trabajo','pendiente','/uploads/docs/1004.pdf'),(1005,10,4,'2025-09-18','Otro','rechazada','/uploads/docs/1005.pdf');
/*!40000 ALTER TABLE `justificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `materias`
--

DROP TABLE IF EXISTS `materias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `materias`
--

LOCK TABLES `materias` WRITE;
/*!40000 ALTER TABLE `materias` DISABLE KEYS */;
INSERT INTO `materias` VALUES (1,'MAT-1','Matemáticas'),(2,'PROG-1','Introducción a la Programación'),(3,'BD-1','Base de Datos');
/*!40000 ALTER TABLE `materias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `destino` enum('todos','alumno','docente','preceptor','administrador') NOT NULL,
  `usuario_id` int DEFAULT NULL,
  `fecha` date NOT NULL,
  `titulo` varchar(160) NOT NULL,
  `detalle` text,
  `tipo` varchar(40) DEFAULT NULL,
  `leida` tinyint(1) DEFAULT '0',
  `favorito` tinyint(1) DEFAULT '0',
  `link` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notif_user_fecha` (`usuario_id`,`fecha`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
INSERT INTO `notificaciones` VALUES (1,'alumno',NULL,'2025-04-24','Calificación final cargada','Se cargó la calificación final en Introducción a la Programación.','calificacion',0,0,NULL),(2,'docente',NULL,'2025-04-25','Nueva inscripción en su comisión','El alumno/a Sabrina Choque se inscribió a su cátedra de Modelado (Comisión B).','inscripcion',0,0,NULL),(3,'docente',NULL,'2025-04-29','Nueva inscripción','El alumno/a Sabrina Choque se inscribió a Modelado (Comisión B).','inscripcion',0,0,NULL),(4,'todos',NULL,'2025-05-01','Mantenimiento del sistema','El sistema estará en mantenimiento el sábado de 00:00 a 02:00.','sistema',0,0,NULL),(5,'preceptor',4,'2025-05-03','Nuevas justificaciones pendientes','Hay 3 solicitudes de justificación para revisar.','justificacion',0,0,NULL),(6,'preceptor',4,'2025-05-04','Recordatorio de asistencia','Cargar asistencia de PROG-1_B antes de las 22:00.','asistencia',0,0,NULL),(8,'alumno',1,'2025-11-15','Asunto de prueba','Este es un mensaje de prueba a ver si se manda a la base de datos. Saludos!','comunicacion',0,0,NULL),(9,'alumno',1,'2025-11-15','ASunto 2','mensaje 2','comunicacion',0,0,NULL),(10,'alumno',1,'2025-11-14','asunto 3','mensaje 3','comunicacion',0,0,NULL);
/*!40000 ALTER TABLE `notificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `preceptor_comision`
--

DROP TABLE IF EXISTS `preceptor_comision`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `preceptor_comision` (
  `preceptor_id` int NOT NULL,
  `comision_id` int NOT NULL,
  PRIMARY KEY (`preceptor_id`,`comision_id`),
  KEY `fk_pc_c` (`comision_id`),
  CONSTRAINT `fk_pc_c` FOREIGN KEY (`comision_id`) REFERENCES `comisiones` (`id`),
  CONSTRAINT `fk_pc_p` FOREIGN KEY (`preceptor_id`) REFERENCES `preceptores` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `preceptor_comision`
--

LOCK TABLES `preceptor_comision` WRITE;
/*!40000 ALTER TABLE `preceptor_comision` DISABLE KEYS */;
INSERT INTO `preceptor_comision` VALUES (1,1),(1,2),(1,3);
/*!40000 ALTER TABLE `preceptor_comision` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `preceptores`
--

DROP TABLE IF EXISTS `preceptores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `preceptores` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `usuario_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `fk_preceptor_user` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `preceptores`
--

LOCK TABLES `preceptores` WRITE;
/*!40000 ALTER TABLE `preceptores` DISABLE KEYS */;
INSERT INTO `preceptores` VALUES (1,'federico','castro',4);
/*!40000 ALTER TABLE `preceptores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (3,'administrador'),(1,'alumno'),(2,'docente'),(4,'preceptor');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol_id` int NOT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `fk_usuarios_rol` (`rol_id`),
  CONSTRAINT `fk_usuarios_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'alumno1','$2a$10$MDZbW8eIrGdC96.3kw5YXOZa3crzpq/sRlbetTE4YfAu9Jdp/k4oa',1,NULL),(2,'docente2','$2a$10$KKeSEg/1JCzgyYMXs9auQOcuvyk5SKJYOMTvK2qNVjA7UErwNHmrW',2,NULL),(3,'administrativo3','$2a$10$7kL8dvcKvqTzbrtfmXwRNeNXw0kK/UtL.Fn932NLszqHsqNVnieQK',3,NULL),(4,'preceptor4','$2a$10$jxYAG6YHtPJ7YkJi7KbHF.mjItce/xem6lt5p4EZ/tNGTFV6e2dbq',4,NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'prisma_app'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-15 19:47:05
