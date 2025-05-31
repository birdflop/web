/*
  Warnings:

  - You are about to alter the column `preset` on the `Presets` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `Presets` MODIFY `preset` JSON NOT NULL;
