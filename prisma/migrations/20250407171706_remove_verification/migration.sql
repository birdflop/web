/*
  Warnings:

  - You are about to drop the column `artist` on the `Presets` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `Presets` DROP COLUMN `artist`,
    MODIFY `userId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `emailVerified`;

-- DropTable
DROP TABLE `VerificationToken`;
