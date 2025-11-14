SET NAMES utf8mb4; SET time_zone = "+00:00"; SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol_id INT NOT NULL,
  CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id) REFERENCES roles(id)
) ENGINE=InnoDB;

CREATE TABLE alumnos (
  id INT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  dni VARCHAR(20) UNIQUE,
  telefono VARCHAR(30),
  email VARCHAR(120),
  usuario_id INT UNIQUE,
  CONSTRAINT fk_alumno_user FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

CREATE TABLE docentes (
  id INT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  telefono VARCHAR(30),
  email VARCHAR(120),
  usuario_id INT UNIQUE,
  CONSTRAINT fk_docente_user FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

CREATE TABLE preceptores (
  id INT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  usuario_id INT UNIQUE,
  CONSTRAINT fk_preceptor_user FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

CREATE TABLE administradores (
  id INT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  usuario_id INT UNIQUE,
  CONSTRAINT fk_admin_user FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

CREATE TABLE materias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(120) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE comisiones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(80) NOT NULL UNIQUE,     -- ej: MAT-1_A
  materia_id INT NOT NULL,
  docente_id INT,
  letra VARCHAR(10),
  horario VARCHAR(80),
  cupo INT,
  sede VARCHAR(80),
  aula VARCHAR(40),
  CONSTRAINT fk_com_mat FOREIGN KEY (materia_id) REFERENCES materias(id),
  CONSTRAINT fk_com_doc FOREIGN KEY (docente_id) REFERENCES docentes(id)
) ENGINE=InnoDB;

CREATE TABLE inscripciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumno_id INT NOT NULL,
  comision_id INT NOT NULL,
  fecha_insc DATE DEFAULT (CURRENT_DATE),
  estado ENUM('activa','baja') DEFAULT 'activa',
  UNIQUE KEY uq_insc (alumno_id, comision_id),
  CONSTRAINT fk_insc_alum FOREIGN KEY (alumno_id) REFERENCES alumnos(id),
  CONSTRAINT fk_insc_com FOREIGN KEY (comision_id) REFERENCES comisiones(id)
) ENGINE=InnoDB;

CREATE TABLE asistencias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  alumno_id INT NOT NULL,
  comision_id INT NOT NULL,
  estado ENUM('P','A','T','J') NOT NULL,
  UNIQUE KEY uq_asistencia (fecha, alumno_id, comision_id),
  KEY idx_asistencia_comision_fecha (comision_id, fecha),
  CONSTRAINT fk_asist_alum FOREIGN KEY (alumno_id) REFERENCES alumnos(id),
  CONSTRAINT fk_asist_com FOREIGN KEY (comision_id) REFERENCES comisiones(id)
) ENGINE=InnoDB;

CREATE TABLE calificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumno_id INT NOT NULL,
  comision_id INT NOT NULL,
  p1 TINYINT NULL, p2 TINYINT NULL, p3 TINYINT NULL,
  estado VARCHAR(30),
  observacion VARCHAR(255),
  anio SMALLINT,
  cuatrimestre TINYINT,
  docente_id INT,
  KEY idx_calif_alum_com (alumno_id, comision_id),
  CONSTRAINT fk_calif_alum FOREIGN KEY (alumno_id) REFERENCES alumnos(id),
  CONSTRAINT fk_calif_com FOREIGN KEY (comision_id) REFERENCES comisiones(id),
  CONSTRAINT fk_calif_doc FOREIGN KEY (docente_id) REFERENCES docentes(id)
) ENGINE=InnoDB;

CREATE TABLE justificaciones (
  id INT PRIMARY KEY,
  alumno_id INT NOT NULL,
  comision_id INT NOT NULL,
  fecha DATE NOT NULL,
  motivo VARCHAR(255) NOT NULL,
  estado ENUM('pendiente','aprobada','rechazada') DEFAULT 'pendiente',
  documento_url VARCHAR(255),
  KEY idx_justif_com_fecha (comision_id, fecha),
  CONSTRAINT fk_j_alum FOREIGN KEY (alumno_id) REFERENCES alumnos(id),
  CONSTRAINT fk_j_com FOREIGN KEY (comision_id) REFERENCES comisiones(id)
) ENGINE=InnoDB;

CREATE TABLE notificaciones (
  id INT PRIMARY KEY,
  destino ENUM('todos','alumno','docente','preceptor','administrador') NOT NULL,
  usuario_id INT NULL,
  fecha DATE NOT NULL,
  titulo VARCHAR(160) NOT NULL,
  detalle TEXT,
  tipo VARCHAR(40),
  leida BOOLEAN DEFAULT FALSE,
  favorito BOOLEAN DEFAULT FALSE,
  link VARCHAR(255),
  KEY idx_notif_user_fecha (usuario_id, fecha),
  CONSTRAINT fk_notif_user FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

CREATE TABLE eventos (
  id INT PRIMARY KEY,
  fecha DATE NOT NULL,
  titulo VARCHAR(160) NOT NULL,
  comision_id INT NULL,
  CONSTRAINT fk_event_com FOREIGN KEY (comision_id) REFERENCES comisiones(id)
) ENGINE=InnoDB;

CREATE TABLE preceptor_comision (
  preceptor_id INT NOT NULL,
  comision_id INT NOT NULL,
  PRIMARY KEY (preceptor_id, comision_id),
  CONSTRAINT fk_pc_p FOREIGN KEY (preceptor_id) REFERENCES preceptores(id),
  CONSTRAINT fk_pc_c FOREIGN KEY (comision_id) REFERENCES comisiones(id)
) ENGINE=InnoDB;

CREATE TABLE instituto (
  id TINYINT PRIMARY KEY,
  nombre VARCHAR(160) NOT NULL,
  direccion VARCHAR(160),
  telefono VARCHAR(40),
  email_secretaria VARCHAR(120),
  email_soporte VARCHAR(120),
  web VARCHAR(160),
  horarios VARCHAR(120)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS=1;