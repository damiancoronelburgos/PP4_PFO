-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `roles_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `rol_id` INTEGER NOT NULL,

    UNIQUE INDEX `usuarios_username_key`(`username`),
    INDEX `usuarios_rol_id_idx`(`rol_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alumnos` (
    `id` INTEGER NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `apellido` VARCHAR(100) NOT NULL,
    `dni` VARCHAR(20) NULL,
    `telefono` VARCHAR(30) NULL,
    `email` VARCHAR(120) NULL,
    `usuario_id` INTEGER NULL,

    UNIQUE INDEX `alumnos_dni_key`(`dni`),
    UNIQUE INDEX `alumnos_usuario_id_key`(`usuario_id`),
    INDEX `alumnos_usuario_id_idx`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `docentes` (
    `id` INTEGER NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `apellido` VARCHAR(100) NOT NULL,
    `telefono` VARCHAR(30) NULL,
    `email` VARCHAR(120) NULL,
    `usuario_id` INTEGER NULL,

    UNIQUE INDEX `docentes_usuario_id_key`(`usuario_id`),
    INDEX `docentes_usuario_id_idx`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `preceptores` (
    `id` INTEGER NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `apellido` VARCHAR(100) NOT NULL,
    `usuario_id` INTEGER NULL,

    UNIQUE INDEX `preceptores_usuario_id_key`(`usuario_id`),
    INDEX `preceptores_usuario_id_idx`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `administradores` (
    `id` INTEGER NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `usuario_id` INTEGER NULL,

    UNIQUE INDEX `administradores_usuario_id_key`(`usuario_id`),
    INDEX `administradores_usuario_id_idx`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `materias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(50) NOT NULL,
    `nombre` VARCHAR(120) NOT NULL,

    UNIQUE INDEX `materias_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comisiones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(80) NOT NULL,
    `materia_id` INTEGER NOT NULL,
    `docente_id` INTEGER NULL,
    `letra` VARCHAR(10) NULL,
    `horario` VARCHAR(80) NULL,
    `cupo` INTEGER NULL,
    `sede` VARCHAR(80) NULL,
    `aula` VARCHAR(40) NULL,

    UNIQUE INDEX `comisiones_codigo_key`(`codigo`),
    INDEX `comisiones_materia_id_idx`(`materia_id`),
    INDEX `comisiones_docente_id_idx`(`docente_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inscripciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `alumno_id` INTEGER NOT NULL,
    `comision_id` INTEGER NOT NULL,
    `fecha_insc` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `estado` VARCHAR(50) NOT NULL DEFAULT 'activa',

    INDEX `inscripciones_alumno_id_comision_id_idx`(`alumno_id`, `comision_id`),
    UNIQUE INDEX `inscripciones_alumno_id_comision_id_key`(`alumno_id`, `comision_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asistencias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATE NOT NULL,
    `alumno_id` INTEGER NOT NULL,
    `comision_id` INTEGER NOT NULL,
    `estado` VARCHAR(10) NOT NULL,

    INDEX `asistencias_comision_id_fecha_idx`(`comision_id`, `fecha`),
    UNIQUE INDEX `asistencias_fecha_alumno_id_comision_id_key`(`fecha`, `alumno_id`, `comision_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `calificaciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `alumno_id` INTEGER NOT NULL,
    `comision_id` INTEGER NOT NULL,
    `p1` TINYINT NULL,
    `p2` TINYINT NULL,
    `p3` TINYINT NULL,
    `estado` VARCHAR(30) NULL,
    `observacion` VARCHAR(255) NULL,
    `anio` SMALLINT NULL,
    `cuatrimestre` TINYINT NULL,
    `docente_id` INTEGER NULL,

    INDEX `calificaciones_alumno_id_comision_id_idx`(`alumno_id`, `comision_id`),
    INDEX `calificaciones_docente_id_idx`(`docente_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `justificaciones` (
    `id` INTEGER NOT NULL,
    `alumno_id` INTEGER NOT NULL,
    `comision_id` INTEGER NOT NULL,
    `fecha` DATE NOT NULL,
    `motivo` VARCHAR(255) NOT NULL,
    `estado` VARCHAR(50) NOT NULL DEFAULT 'pendiente',
    `documento_url` VARCHAR(255) NULL,

    INDEX `justificaciones_comision_id_fecha_idx`(`comision_id`, `fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notificaciones` (
    `id` INTEGER NOT NULL,
    `destino` VARCHAR(50) NOT NULL,
    `usuario_id` INTEGER NULL,
    `fecha` DATE NOT NULL,
    `titulo` VARCHAR(160) NOT NULL,
    `detalle` TEXT NULL,
    `tipo` VARCHAR(40) NULL,
    `leida` BOOLEAN NOT NULL DEFAULT false,
    `favorito` BOOLEAN NOT NULL DEFAULT false,
    `link` VARCHAR(255) NULL,

    INDEX `notificaciones_usuario_id_fecha_idx`(`usuario_id`, `fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `eventos` (
    `id` INTEGER NOT NULL,
    `fecha` DATE NOT NULL,
    `titulo` VARCHAR(160) NOT NULL,
    `comision_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `preceptor_comision` (
    `preceptor_id` INTEGER NOT NULL,
    `comision_id` INTEGER NOT NULL,

    PRIMARY KEY (`preceptor_id`, `comision_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instituto` (
    `id` TINYINT NOT NULL,
    `nombre` VARCHAR(160) NOT NULL,
    `direccion` VARCHAR(160) NULL,
    `telefono` VARCHAR(40) NULL,
    `email_secretaria` VARCHAR(120) NULL,
    `email_soporte` VARCHAR(120) NULL,
    `web` VARCHAR(160) NULL,
    `horarios` VARCHAR(120) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_rol_id_fkey` FOREIGN KEY (`rol_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alumnos` ADD CONSTRAINT `alumnos_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `docentes` ADD CONSTRAINT `docentes_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `preceptores` ADD CONSTRAINT `preceptores_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `administradores` ADD CONSTRAINT `administradores_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comisiones` ADD CONSTRAINT `comisiones_materia_id_fkey` FOREIGN KEY (`materia_id`) REFERENCES `materias`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comisiones` ADD CONSTRAINT `comisiones_docente_id_fkey` FOREIGN KEY (`docente_id`) REFERENCES `docentes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inscripciones` ADD CONSTRAINT `inscripciones_alumno_id_fkey` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inscripciones` ADD CONSTRAINT `inscripciones_comision_id_fkey` FOREIGN KEY (`comision_id`) REFERENCES `comisiones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asistencias` ADD CONSTRAINT `asistencias_alumno_id_fkey` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asistencias` ADD CONSTRAINT `asistencias_comision_id_fkey` FOREIGN KEY (`comision_id`) REFERENCES `comisiones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calificaciones` ADD CONSTRAINT `calificaciones_alumno_id_fkey` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calificaciones` ADD CONSTRAINT `calificaciones_comision_id_fkey` FOREIGN KEY (`comision_id`) REFERENCES `comisiones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calificaciones` ADD CONSTRAINT `calificaciones_docente_id_fkey` FOREIGN KEY (`docente_id`) REFERENCES `docentes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `justificaciones` ADD CONSTRAINT `justificaciones_alumno_id_fkey` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `justificaciones` ADD CONSTRAINT `justificaciones_comision_id_fkey` FOREIGN KEY (`comision_id`) REFERENCES `comisiones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificaciones` ADD CONSTRAINT `notificaciones_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventos` ADD CONSTRAINT `eventos_comision_id_fkey` FOREIGN KEY (`comision_id`) REFERENCES `comisiones`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `preceptor_comision` ADD CONSTRAINT `preceptor_comision_preceptor_id_fkey` FOREIGN KEY (`preceptor_id`) REFERENCES `preceptores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `preceptor_comision` ADD CONSTRAINT `preceptor_comision_comision_id_fkey` FOREIGN KEY (`comision_id`) REFERENCES `comisiones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
