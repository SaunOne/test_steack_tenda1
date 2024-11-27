-- CreateTable
CREATE TABLE `Pegawai` (
    `pegawai_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` TEXT NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `password` TEXT NOT NULL,
    `role_id` INTEGER NOT NULL,
    `deletedAt` DATETIME NULL,

    UNIQUE INDEX `Pegawai_username_key`(`username`),
    PRIMARY KEY (`pegawai_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
    `role_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` TEXT NOT NULL,
    `deletedAt` DATETIME NULL,

    PRIMARY KEY (`role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pelanggan` (
    `pelanggan_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` TEXT NOT NULL,
    `points` INTEGER NOT NULL,
    `deletedAt` DATETIME NULL,
    `level_member_id` INTEGER NULL,

    PRIMARY KEY (`pelanggan_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Menu` (
    `menu_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `stok` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    `deletedAt` DATETIME NULL,

    PRIMARY KEY (`menu_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LevelMember` (
    `level_member_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` TEXT NOT NULL,
    `diskon` INTEGER NOT NULL,
    `minimum_point` INTEGER NOT NULL,
    `deletedAt` DATETIME NULL,

    PRIMARY KEY (`level_member_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaksi` (
    `transaksi_id` INTEGER NOT NULL AUTO_INCREMENT,
    `pelanggan_id` INTEGER NOT NULL,
    `diskon` DOUBLE NULL,
    `tanggal_transaksi` DATETIME NOT NULL,
    `total_diskon` INTEGER NOT NULL DEFAULT 0,
    `total_harga` DOUBLE NOT NULL,
    `deletedAt` DATETIME NULL,

    PRIMARY KEY (`transaksi_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DetailTransaksi` (
    `detail_transaksi_id` INTEGER NOT NULL AUTO_INCREMENT,
    `transaksi_id` INTEGER NOT NULL,
    `menu_id` INTEGER NOT NULL,
    `amount` INTEGER NOT NULL,

    PRIMARY KEY (`detail_transaksi_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Pegawai` ADD CONSTRAINT `Pegawai_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pelanggan` ADD CONSTRAINT `Pelanggan_level_member_id_fkey` FOREIGN KEY (`level_member_id`) REFERENCES `LevelMember`(`level_member_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaksi` ADD CONSTRAINT `Transaksi_pelanggan_id_fkey` FOREIGN KEY (`pelanggan_id`) REFERENCES `Pelanggan`(`pelanggan_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailTransaksi` ADD CONSTRAINT `DetailTransaksi_transaksi_id_fkey` FOREIGN KEY (`transaksi_id`) REFERENCES `Transaksi`(`transaksi_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailTransaksi` ADD CONSTRAINT `DetailTransaksi_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `Menu`(`menu_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
