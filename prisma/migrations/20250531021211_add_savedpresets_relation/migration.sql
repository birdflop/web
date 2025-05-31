-- CreateTable
CREATE TABLE `_SavedPresets` (
    `A` INTEGER NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_SavedPresets_AB_unique`(`A`, `B`),
    INDEX `_SavedPresets_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_SavedPresets` ADD CONSTRAINT `_SavedPresets_A_fkey` FOREIGN KEY (`A`) REFERENCES `Presets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SavedPresets` ADD CONSTRAINT `_SavedPresets_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
