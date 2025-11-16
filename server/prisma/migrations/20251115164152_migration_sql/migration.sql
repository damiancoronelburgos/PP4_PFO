-- AlterTable
ALTER TABLE `alumnos` ADD COLUMN `materia_id` INTEGER NULL;

-- CreateIndex
CREATE INDEX `alumnos_materia_id_idx` ON `alumnos`(`materia_id`);

-- AddForeignKey
ALTER TABLE `alumnos` ADD CONSTRAINT `alumnos_materia_id_fkey` FOREIGN KEY (`materia_id`) REFERENCES `materias`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
