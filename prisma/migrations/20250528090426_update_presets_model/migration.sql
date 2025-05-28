/*
  Warnings:

  - You are about to drop the column `presetJSON` on the `Presets` table. All the data in the column will be lost.
  - You are about to drop the column `timesUsed` on the `Presets` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Presets` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Presets` table. All the data in the column will be lost.
  - Added the required column `author` to the `Presets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Presets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preset` to the `Presets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Presets` DROP COLUMN `presetJSON`,
    DROP COLUMN `timesUsed`,
    DROP COLUMN `title`,
    DROP COLUMN `userId`,
    ADD COLUMN `author` VARCHAR(191) NOT NULL,
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `preset` VARCHAR(191) NOT NULL;
