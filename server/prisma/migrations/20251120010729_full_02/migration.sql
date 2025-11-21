/*
  Warnings:

  - You are about to alter the column `nombre` on the `administradores` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `nombre` on the `alumnos` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `apellido` on the `alumnos` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `dni` on the `alumnos` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to alter the column `telefono` on the `alumnos` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(30)`.
  - You are about to alter the column `email` on the `alumnos` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(120)`.
  - You are about to alter the column `estado` on the `asistencias` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - You are about to alter the column `p1` on the `calificaciones` table. The data in that column could be lost. The data in that column will be cast from `Int` to `TinyInt`.
  - You are about to alter the column `p2` on the `calificaciones` table. The data in that column could be lost. The data in that column will be cast from `Int` to `TinyInt`.
  - You are about to alter the column `p3` on the `calificaciones` table. The data in that column could be lost. The data in that column will be cast from `Int` to `TinyInt`.
  - You are about to alter the column `estado` on the `calificaciones` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(30)`.
  - You are about to alter the column `anio` on the `calificaciones` table. The data in that column could be lost. The data in that column will be cast from `Int` to `SmallInt`.
  - You are about to alter the column `cuatrimestre` on the `calificaciones` table. The data in that column could be lost. The data in that column will be cast from `Int` to `TinyInt`.
  - You are about to alter the column `codigo` on the `comisiones` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(80)`.
  - You are about to alter the column `letra` on the `comisiones` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(10)`.
  - You are about to alter the column `horario` on the `comisiones` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(80)`.
  - You are about to alter the column `sede` on the `comisiones` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(80)`.
  - You are about to alter the column `aula` on the `comisiones` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(40)`.
  - You are about to alter the column `nombre` on the `docentes` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `apellido` on the `docentes` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `telefono` on the `docentes` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(30)`.
  - You are about to alter the column `email` on the `docentes` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(120)`.
  - You are about to alter the column `titulo` on the `eventos` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(160)`.
  - You are about to alter the column `estado` on the `inscripciones` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.
  - The primary key for the `instituto` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `instituto` table. The data in that column could be lost. The data in that column will be cast from `Int` to `TinyInt`.
  - You are about to alter the column `nombre` on the `instituto` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(160)`.
  - You are about to alter the column `direccion` on the `instituto` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(160)`.
  - You are about to alter the column `telefono` on the `instituto` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(40)`.
  - You are about to alter the column `email_secretaria` on the `instituto` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(120)`.
  - You are about to alter the column `email_soporte` on the `instituto` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(120)`.
  - You are about to alter the column `web` on the `instituto` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(160)`.
  - You are about to alter the column `horarios` on the `instituto` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(120)`.
  - You are about to alter the column `estado` on the `justificaciones` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.
  - You are about to alter the column `codigo` on the `materias` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `nombre` on the `materias` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(120)`.
  - You are about to alter the column `destino` on the `notificaciones` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(3))`.
  - You are about to alter the column `titulo` on the `notificaciones` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(160)`.
  - You are about to alter the column `tipo` on the `notificaciones` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(40)`.
  - You are about to alter the column `nombre` on the `preceptores` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `apellido` on the `preceptores` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `nombre` on the `roles` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `username` on the `usuarios` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - A unique constraint covering the columns `[alumno_id,comision_id,fecha]` on the table `justificaciones` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `administradores` DROP FOREIGN KEY `administradores_usuario_id_fkey`;

-- DropForeignKey
ALTER TABLE `alumnos` DROP FOREIGN KEY `alumnos_usuario_id_fkey`;

-- DropForeignKey
ALTER TABLE `asistencias` DROP FOREIGN KEY `asistencias_alumno_id_fkey`;

-- DropForeignKey
ALTER TABLE `asistencias` DROP FOREIGN KEY `asistencias_comision_id_fkey`;

-- DropForeignKey
ALTER TABLE `calificaciones` DROP FOREIGN KEY `calificaciones_alumno_id_fkey`;

-- DropForeignKey
ALTER TABLE `calificaciones` DROP FOREIGN KEY `calificaciones_comision_id_fkey`;

-- DropForeignKey
ALTER TABLE `calificaciones` DROP FOREIGN KEY `calificaciones_docente_id_fkey`;

-- DropForeignKey
ALTER TABLE `comisiones` DROP FOREIGN KEY `comisiones_docente_id_fkey`;

-- DropForeignKey
ALTER TABLE `comisiones` DROP FOREIGN KEY `comisiones_materia_id_fkey`;

-- DropForeignKey
ALTER TABLE `docentes` DROP FOREIGN KEY `docentes_usuario_id_fkey`;

-- DropForeignKey
ALTER TABLE `eventos` DROP FOREIGN KEY `eventos_comision_id_fkey`;

-- DropForeignKey
ALTER TABLE `inscripciones` DROP FOREIGN KEY `inscripciones_alumno_id_fkey`;

-- DropForeignKey
ALTER TABLE `inscripciones` DROP FOREIGN KEY `inscripciones_comision_id_fkey`;

-- DropForeignKey
ALTER TABLE `justificaciones` DROP FOREIGN KEY `justificaciones_alumno_id_fkey`;

-- DropForeignKey
ALTER TABLE `justificaciones` DROP FOREIGN KEY `justificaciones_comision_id_fkey`;

-- DropForeignKey
ALTER TABLE `notificaciones` DROP FOREIGN KEY `notificaciones_usuario_id_fkey`;

-- DropForeignKey
ALTER TABLE `preceptor_comision` DROP FOREIGN KEY `preceptor_comision_comision_id_fkey`;

-- DropForeignKey
ALTER TABLE `preceptor_comision` DROP FOREIGN KEY `preceptor_comision_preceptor_id_fkey`;

-- DropForeignKey
ALTER TABLE `preceptores` DROP FOREIGN KEY `preceptores_usuario_id_fkey`;

-- DropForeignKey
ALTER TABLE `usuarios` DROP FOREIGN KEY `usuarios_rol_id_fkey`;

-- DropIndex
DROP INDEX `inscripciones_alumno_id_comision_id_idx` ON `inscripciones`;

-- AlterTable
ALTER TABLE `administradores` MODIFY `nombre` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `alumnos` MODIFY `nombre` VARCHAR(100) NOT NULL,
    MODIFY `apellido` VARCHAR(100) NOT NULL,
    MODIFY `dni` VARCHAR(20) NULL,
    MODIFY `telefono` VARCHAR(30) NULL,
    MODIFY `email` VARCHAR(120) NULL;

-- AlterTable
ALTER TABLE `asistencias` MODIFY `fecha` DATE NOT NULL,
    MODIFY `estado` ENUM('P', 'A', 'T', 'J') NOT NULL;

-- AlterTable
ALTER TABLE `calificaciones` MODIFY `p1` TINYINT NULL,
    MODIFY `p2` TINYINT NULL,
    MODIFY `p3` TINYINT NULL,
    MODIFY `estado` VARCHAR(30) NULL,
    MODIFY `observacion` VARCHAR(255) NULL,
    MODIFY `anio` SMALLINT NULL,
    MODIFY `cuatrimestre` TINYINT NULL;

-- AlterTable
ALTER TABLE `comisiones` MODIFY `codigo` VARCHAR(80) NOT NULL,
    MODIFY `letra` VARCHAR(10) NULL,
    MODIFY `horario` VARCHAR(80) NULL,
    MODIFY `sede` VARCHAR(80) NULL,
    MODIFY `aula` VARCHAR(40) NULL;

-- AlterTable
ALTER TABLE `docentes` MODIFY `nombre` VARCHAR(100) NOT NULL,
    MODIFY `apellido` VARCHAR(100) NOT NULL,
    MODIFY `telefono` VARCHAR(30) NULL,
    MODIFY `email` VARCHAR(120) NULL;

-- AlterTable
ALTER TABLE `eventos` MODIFY `fecha` DATE NOT NULL,
    MODIFY `titulo` VARCHAR(160) NOT NULL;

-- AlterTable
ALTER TABLE `inscripciones` MODIFY `fecha_insc` DATE NULL DEFAULT (curdate()),
    MODIFY `estado` ENUM('activa', 'baja') NULL DEFAULT 'activa';

-- AlterTable
ALTER TABLE `instituto` DROP PRIMARY KEY,
    MODIFY `id` TINYINT NOT NULL,
    MODIFY `nombre` VARCHAR(160) NOT NULL,
    MODIFY `direccion` VARCHAR(160) NULL,
    MODIFY `telefono` VARCHAR(40) NULL,
    MODIFY `email_secretaria` VARCHAR(120) NULL,
    MODIFY `email_soporte` VARCHAR(120) NULL,
    MODIFY `web` VARCHAR(160) NULL,
    MODIFY `horarios` VARCHAR(120) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `justificaciones` MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `fecha` DATE NOT NULL,
    MODIFY `motivo` VARCHAR(255) NOT NULL,
    MODIFY `estado` ENUM('pendiente', 'aprobada', 'rechazada') NULL DEFAULT 'pendiente',
    MODIFY `documento_url` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `materias` MODIFY `codigo` VARCHAR(50) NOT NULL,
    MODIFY `nombre` VARCHAR(120) NOT NULL;

-- AlterTable
ALTER TABLE `notificaciones` MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `destino` ENUM('todos', 'alumno', 'docente', 'preceptor', 'administrador') NOT NULL,
    MODIFY `fecha` DATE NOT NULL,
    MODIFY `titulo` VARCHAR(160) NOT NULL,
    MODIFY `detalle` TEXT NULL,
    MODIFY `tipo` VARCHAR(40) NULL,
    MODIFY `leida` BOOLEAN NULL DEFAULT false,
    MODIFY `favorito` BOOLEAN NULL DEFAULT false,
    MODIFY `link` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `preceptores` MODIFY `nombre` VARCHAR(100) NOT NULL,
    MODIFY `apellido` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `roles` MODIFY `nombre` VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE `usuarios` ADD COLUMN `avatar_url` VARCHAR(255) NULL,
    MODIFY `username` VARCHAR(50) NOT NULL,
    MODIFY `password_hash` VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE INDEX `idx_insc_alum_estado` ON `inscripciones`(`alumno_id`, `estado`);

-- CreateIndex
CREATE INDEX `idx_insc_com_estado` ON `inscripciones`(`comision_id`, `estado`);

-- CreateIndex
CREATE UNIQUE INDEX `uq_justif_alum_com_fecha` ON `justificaciones`(`alumno_id`, `comision_id`, `fecha`);

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `fk_usuarios_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `alumnos` ADD CONSTRAINT `fk_alumno_user` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `administradores` ADD CONSTRAINT `fk_admin_user` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `asistencias` ADD CONSTRAINT `fk_asist_alum` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `asistencias` ADD CONSTRAINT `fk_asist_com` FOREIGN KEY (`comision_id`) REFERENCES `comisiones`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `calificaciones` ADD CONSTRAINT `fk_calif_alum` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `calificaciones` ADD CONSTRAINT `fk_calif_com` FOREIGN KEY (`comision_id`) REFERENCES `comisiones`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `calificaciones` ADD CONSTRAINT `fk_calif_doc` FOREIGN KEY (`docente_id`) REFERENCES `docentes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `comisiones` ADD CONSTRAINT `fk_com_doc` FOREIGN KEY (`docente_id`) REFERENCES `docentes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `comisiones` ADD CONSTRAINT `fk_com_mat` FOREIGN KEY (`materia_id`) REFERENCES `materias`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `docentes` ADD CONSTRAINT `fk_docente_user` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `eventos` ADD CONSTRAINT `fk_event_com` FOREIGN KEY (`comision_id`) REFERENCES `comisiones`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `inscripciones` ADD CONSTRAINT `fk_insc_alum` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `inscripciones` ADD CONSTRAINT `fk_insc_com` FOREIGN KEY (`comision_id`) REFERENCES `comisiones`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `justificaciones` ADD CONSTRAINT `fk_j_alum` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `justificaciones` ADD CONSTRAINT `fk_j_com` FOREIGN KEY (`comision_id`) REFERENCES `comisiones`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `notificaciones` ADD CONSTRAINT `fk_notif_user` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `preceptor_comision` ADD CONSTRAINT `fk_pc_c` FOREIGN KEY (`comision_id`) REFERENCES `comisiones`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `preceptor_comision` ADD CONSTRAINT `fk_pc_p` FOREIGN KEY (`preceptor_id`) REFERENCES `preceptores`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `preceptores` ADD CONSTRAINT `fk_preceptor_user` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- RenameIndex
ALTER TABLE `administradores` RENAME INDEX `administradores_usuario_id_key` TO `usuario_id`;

-- RenameIndex
ALTER TABLE `alumnos` RENAME INDEX `alumnos_dni_key` TO `dni`;

-- RenameIndex
ALTER TABLE `alumnos` RENAME INDEX `alumnos_usuario_id_key` TO `usuario_id`;

-- RenameIndex
ALTER TABLE `asistencias` RENAME INDEX `asistencias_alumno_id_idx` TO `fk_asist_alum`;

-- RenameIndex
ALTER TABLE `asistencias` RENAME INDEX `asistencias_comision_id_fecha_idx` TO `idx_asistencia_comision_fecha`;

-- RenameIndex
ALTER TABLE `asistencias` RENAME INDEX `asistencias_fecha_alumno_id_comision_id_key` TO `uq_asistencia`;

-- RenameIndex
ALTER TABLE `calificaciones` RENAME INDEX `calificaciones_alumno_id_comision_id_idx` TO `idx_calif_alum_com`;

-- RenameIndex
ALTER TABLE `calificaciones` RENAME INDEX `calificaciones_comision_id_idx` TO `fk_calif_com`;

-- RenameIndex
ALTER TABLE `calificaciones` RENAME INDEX `calificaciones_docente_id_idx` TO `fk_calif_doc`;

-- RenameIndex
ALTER TABLE `comisiones` RENAME INDEX `comisiones_codigo_key` TO `codigo`;

-- RenameIndex
ALTER TABLE `comisiones` RENAME INDEX `comisiones_docente_id_idx` TO `fk_com_doc`;

-- RenameIndex
ALTER TABLE `comisiones` RENAME INDEX `comisiones_materia_id_idx` TO `fk_com_mat`;

-- RenameIndex
ALTER TABLE `docentes` RENAME INDEX `docentes_usuario_id_key` TO `usuario_id`;

-- RenameIndex
ALTER TABLE `eventos` RENAME INDEX `eventos_comision_id_idx` TO `fk_event_com`;

-- RenameIndex
ALTER TABLE `inscripciones` RENAME INDEX `inscripciones_alumno_id_comision_id_key` TO `uq_insc`;

-- RenameIndex
ALTER TABLE `inscripciones` RENAME INDEX `inscripciones_comision_id_idx` TO `fk_insc_com`;

-- RenameIndex
ALTER TABLE `justificaciones` RENAME INDEX `justificaciones_alumno_id_idx` TO `fk_j_alum`;

-- RenameIndex
ALTER TABLE `justificaciones` RENAME INDEX `justificaciones_comision_id_fecha_idx` TO `idx_justif_com_fecha`;

-- RenameIndex
ALTER TABLE `materias` RENAME INDEX `materias_codigo_key` TO `codigo`;

-- RenameIndex
ALTER TABLE `notificaciones` RENAME INDEX `notificaciones_usuario_id_fecha_idx` TO `idx_notif_user_fecha`;

-- RenameIndex
ALTER TABLE `preceptor_comision` RENAME INDEX `preceptor_comision_comision_id_idx` TO `fk_pc_c`;

-- RenameIndex
ALTER TABLE `preceptores` RENAME INDEX `preceptores_usuario_id_key` TO `usuario_id`;

-- RenameIndex
ALTER TABLE `roles` RENAME INDEX `roles_nombre_key` TO `nombre`;

-- RenameIndex
ALTER TABLE `usuarios` RENAME INDEX `usuarios_rol_id_idx` TO `fk_usuarios_rol`;

-- RenameIndex
ALTER TABLE `usuarios` RENAME INDEX `usuarios_username_key` TO `username`;
