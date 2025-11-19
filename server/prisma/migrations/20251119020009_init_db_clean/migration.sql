-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `roles_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `rol_id` INTEGER NOT NULL,

    UNIQUE INDEX `usuarios_username_key`(`username`),
    INDEX `usuarios_rol_id_idx`(`rol_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alumnos` (
    `id` INTEGER NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191) NOT NULL,
    `dni` VARCHAR(191) NULL,
    `telefono` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `usuario_id` INTEGER NULL,

    UNIQUE INDEX `alumnos_dni_key`(`dni`),
    UNIQUE INDEX `alumnos_usuario_id_key`(`usuario_id`),
    INDEX `alumnos_usuario_id_idx`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `administradores` (
    `id` INTEGER NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `usuario_id` INTEGER NULL,

    UNIQUE INDEX `administradores_usuario_id_key`(`usuario_id`),
    INDEX `administradores_usuario_id_idx`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asistencias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME(3) NOT NULL,
    `alumno_id` INTEGER NOT NULL,
    `comision_id` INTEGER NOT NULL,
    `estado` VARCHAR(191) NOT NULL,

    INDEX `asistencias_alumno_id_idx`(`alumno_id`),
    INDEX `asistencias_comision_id_fecha_idx`(`comision_id`, `fecha`),
    UNIQUE INDEX `asistencias_fecha_alumno_id_comision_id_key`(`fecha`, `alumno_id`, `comision_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `calificaciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `alumno_id` INTEGER NOT NULL,
    `comision_id` INTEGER NOT NULL,
    `p1` INTEGER NULL,
    `p2` INTEGER NULL,
    `p3` INTEGER NULL,
    `estado` VARCHAR(191) NULL,
    `observacion` VARCHAR(191) NULL,
    `anio` INTEGER NULL,
    `cuatrimestre` INTEGER NULL,
    `docente_id` INTEGER NULL,

    INDEX `calificaciones_alumno_id_comision_id_idx`(`alumno_id`, `comision_id`),
    INDEX `calificaciones_comision_id_idx`(`comision_id`),
    INDEX `calificaciones_docente_id_idx`(`docente_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comisiones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(191) NOT NULL,
    `materia_id` INTEGER NOT NULL,
    `docente_id` INTEGER NULL,
    `letra` VARCHAR(191) NULL,
    `horario` VARCHAR(191) NULL,
    `cupo` INTEGER NULL,
    `sede` VARCHAR(191) NULL,
    `aula` VARCHAR(191) NULL,

    UNIQUE INDEX `comisiones_codigo_key`(`codigo`),
    INDEX `comisiones_docente_id_idx`(`docente_id`),
    INDEX `comisiones_materia_id_idx`(`materia_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `docentes` (
    `id` INTEGER NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `usuario_id` INTEGER NULL,

    UNIQUE INDEX `docentes_usuario_id_key`(`usuario_id`),
    INDEX `docentes_usuario_id_idx`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `eventos` (
    `id` INTEGER NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `comision_id` INTEGER NULL,

    INDEX `eventos_comision_id_idx`(`comision_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inscripciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `alumno_id` INTEGER NOT NULL,
    `comision_id` INTEGER NOT NULL,
    `fecha_insc` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `estado` VARCHAR(191) NOT NULL DEFAULT 'activa',

    INDEX `inscripciones_alumno_id_comision_id_idx`(`alumno_id`, `comision_id`),
    INDEX `inscripciones_comision_id_idx`(`comision_id`),
    UNIQUE INDEX `inscripciones_alumno_id_comision_id_key`(`alumno_id`, `comision_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instituto` (
    `id` INTEGER NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `direccion` VARCHAR(191) NULL,
    `telefono` VARCHAR(191) NULL,
    `email_secretaria` VARCHAR(191) NULL,
    `email_soporte` VARCHAR(191) NULL,
    `web` VARCHAR(191) NULL,
    `horarios` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `justificaciones` (
    `id` INTEGER NOT NULL,
    `alumno_id` INTEGER NOT NULL,
    `comision_id` INTEGER NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `motivo` VARCHAR(191) NOT NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'pendiente',
    `documento_url` VARCHAR(191) NULL,

    INDEX `justificaciones_alumno_id_idx`(`alumno_id`),
    INDEX `justificaciones_comision_id_fecha_idx`(`comision_id`, `fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `materias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `materias_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notificaciones` (
    `id` INTEGER NOT NULL,
    `destino` VARCHAR(191) NOT NULL,
    `usuario_id` INTEGER NULL,
    `fecha` DATETIME(3) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `detalle` VARCHAR(191) NULL,
    `tipo` VARCHAR(191) NULL,
    `leida` BOOLEAN NOT NULL DEFAULT false,
    `favorito` BOOLEAN NOT NULL DEFAULT false,
    `link` VARCHAR(191) NULL,

    INDEX `notificaciones_usuario_id_fecha_idx`(`usuario_id`, `fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `preceptor_comision` (
    `preceptor_id` INTEGER NOT NULL,
    `comision_id` INTEGER NOT NULL,

    INDEX `preceptor_comision_comision_id_idx`(`comision_id`),
    PRIMARY KEY (`preceptor_id`, `comision_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `preceptores` (
    `id` INTEGER NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191) NOT NULL,
    `usuario_id` INTEGER NULL,

    UNIQUE INDEX `preceptores_usuario_id_key`(`usuario_id`),
    INDEX `preceptores_usuario_id_idx`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_rol_id_fkey` FOREIGN KEY (`rol_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alumnos` ADD CONSTRAINT `alumnos_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `administradores` ADD CONSTRAINT `administradores_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE `comisiones` ADD CONSTRAINT `comisiones_docente_id_fkey` FOREIGN KEY (`docente_id`) REFERENCES `docentes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comisiones` ADD CONSTRAINT `comisiones_materia_id_fkey` FOREIGN KEY (`materia_id`) REFERENCES `materias`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `docentes` ADD CONSTRAINT `docentes_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eventos` ADD CONSTRAINT `eventos_comision_id_fkey` FOREIGN KEY (`comision_id`) REFERENCES `comisiones`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inscripciones` ADD CONSTRAINT `inscripciones_alumno_id_fkey` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inscripciones` ADD CONSTRAINT `inscripciones_comision_id_fkey` FOREIGN KEY (`comision_id`) REFERENCES `comisiones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `justificaciones` ADD CONSTRAINT `justificaciones_alumno_id_fkey` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `justificaciones` ADD CONSTRAINT `justificaciones_comision_id_fkey` FOREIGN KEY (`comision_id`) REFERENCES `comisiones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificaciones` ADD CONSTRAINT `notificaciones_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `preceptor_comision` ADD CONSTRAINT `preceptor_comision_preceptor_id_fkey` FOREIGN KEY (`preceptor_id`) REFERENCES `preceptores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `preceptor_comision` ADD CONSTRAINT `preceptor_comision_comision_id_fkey` FOREIGN KEY (`comision_id`) REFERENCES `comisiones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `preceptores` ADD CONSTRAINT `preceptores_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
