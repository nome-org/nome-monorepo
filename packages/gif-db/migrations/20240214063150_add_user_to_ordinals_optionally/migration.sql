/*
  Warnings:

  - Made the column `receiver_address` on table `Ordinal` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Ordinal` MODIFY `receiver_address` VARCHAR(255) NOT NULL;

-- AddForeignKey
ALTER TABLE `Ordinal` ADD CONSTRAINT `Ordinal_receiver_address_fkey` FOREIGN KEY (`receiver_address`) REFERENCES `User`(`ordinal_address`) ON DELETE RESTRICT ON UPDATE CASCADE;
