/*
  Warnings:

  - You are about to drop the `orders` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `orders`;

-- CreateTable
CREATE TABLE `Order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `ordinals_bot_order_id` VARCHAR(255) NULL,
    `total_fee` INTEGER NOT NULL,
    `fee_rate` INTEGER NOT NULL,
    `rarity` VARCHAR(255) NOT NULL,
    `receiver_address` VARCHAR(255) NOT NULL,
    `update_token` VARCHAR(255) NULL,
    `status` ENUM('UNPAID', 'PAYMENT_PENDING', 'IMAGE_ORDINALS_PENDING', 'HTML_ORDINALS_PENDING', 'READY') NOT NULL DEFAULT 'UNPAID',
    `payment_tx_id` VARCHAR(255) NULL,
    `quantity` INTEGER NOT NULL,

    UNIQUE INDEX `Order_ordinals_bot_order_id_key`(`ordinals_bot_order_id`),
    UNIQUE INDEX `Order_update_token_key`(`update_token`),
    UNIQUE INDEX `Order_payment_tx_id_key`(`payment_tx_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ordinal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `hash` VARCHAR(255) NOT NULL,
    `type` VARCHAR(255) NOT NULL,
    `size` INTEGER NOT NULL,
    `duration` INTEGER NOT NULL,
    `tx_id` VARCHAR(255) NULL,
    `tx_status` ENUM('PENDING', 'CONFIRMED') NOT NULL DEFAULT 'PENDING',
    `ordinals_bot_order_id` VARCHAR(255) NOT NULL,
    `ordinal_index` INTEGER NULL,
    `image_files_order_id` INTEGER NULL,
    `html_files_order_id` INTEGER NULL,

    UNIQUE INDEX `Ordinal_tx_id_key`(`tx_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserSession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `ordinalAddress` VARCHAR(255) NOT NULL,
    `publicKey` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `UserSession_publicKey_key`(`publicKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Ordinal` ADD CONSTRAINT `Ordinal_image_files_order_id_fkey` FOREIGN KEY (`image_files_order_id`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ordinal` ADD CONSTRAINT `Ordinal_html_files_order_id_fkey` FOREIGN KEY (`html_files_order_id`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
