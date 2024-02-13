-- AlterTable
ALTER TABLE `UserSession` 
    RENAME COLUMN `isExpired` TO `is_expired`,  
    RENAME COLUMN `lastCheckedAt` TO `last_checked_at`,
    RENAME COLUMN `ordinalAddress` TO `ordinal_address`,
    RENAME COLUMN `publicKey` TO `public_key`;

-- CreateTable
CREATE TABLE `DelegateOrdinal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `minter_address` VARCHAR(255) NOT NULL,
    `receiver_address` VARCHAR(255) NOT NULL,
    `tx_status` ENUM('UNPAID', 'PENDING', 'CONFIRMED') NOT NULL DEFAULT 'UNPAID',
    `total_fee` INTEGER NOT NULL,
    `fee_rate` INTEGER NOT NULL,
    `payment_tx_id` VARCHAR(255) NULL,
    `tx_id` VARCHAR(255) NULL,
    `ordinal_index` INTEGER NULL,

    UNIQUE INDEX `DelegateOrdinal_tx_id_key`(`tx_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
