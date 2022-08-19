/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `Account`;

-- CreateTable
CREATE TABLE `account` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bic` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `corrAccount` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
