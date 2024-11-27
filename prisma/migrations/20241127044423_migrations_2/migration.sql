/*
  Warnings:

  - You are about to alter the column `deletedAt` on the `LevelMember` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `deletedAt` on the `Menu` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `deletedAt` on the `Pegawai` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `deletedAt` on the `Pelanggan` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `deletedAt` on the `Role` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `tanggal_transaksi` on the `Transaksi` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `deletedAt` on the `Transaksi` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `LevelMember` MODIFY `deletedAt` DATETIME NULL;

-- AlterTable
ALTER TABLE `Menu` MODIFY `deletedAt` DATETIME NULL;

-- AlterTable
ALTER TABLE `Pegawai` MODIFY `deletedAt` DATETIME NULL;

-- AlterTable
ALTER TABLE `Pelanggan` MODIFY `deletedAt` DATETIME NULL;

-- AlterTable
ALTER TABLE `Role` MODIFY `deletedAt` DATETIME NULL;

-- AlterTable
ALTER TABLE `Transaksi` MODIFY `tanggal_transaksi` DATETIME NOT NULL,
    MODIFY `deletedAt` DATETIME NULL;
