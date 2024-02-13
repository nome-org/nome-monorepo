-- AlterTable
ALTER TABLE `Ordinal` ADD COLUMN `is_open_source` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `receiver_address` VARCHAR(255) NULL;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `ordinal_address` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NULL,

    UNIQUE INDEX `User_ordinal_address_key`(`ordinal_address`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserSession` ADD CONSTRAINT `UserSession_ordinal_address_fkey` FOREIGN KEY (`ordinal_address`) REFERENCES `User`(`ordinal_address`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `UserSession` RENAME INDEX `UserSession_publicKey_key` TO `UserSession_public_key_key`;
