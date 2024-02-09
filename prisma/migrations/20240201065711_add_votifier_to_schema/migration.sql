/*
  Warnings:

  - Added the required column `votifierIp` to the `Server` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Server` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `totalVotes` INTEGER NULL DEFAULT 0,
    ADD COLUMN `votes` INTEGER NULL DEFAULT 0,
    ADD COLUMN `votifierIp` VARCHAR(191) NOT NULL,
    ADD COLUMN `votifierPort` INTEGER NULL DEFAULT 8192;
