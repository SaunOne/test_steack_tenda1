-- CreateTable
CREATE TABLE `Menu` (
    `menu_id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_menu` TEXT NOT NULL,
    `deskripsi_menu` TEXT NOT NULL,
    `harga` DOUBLE NOT NULL,
    `stok_menu` INTEGER NOT NULL,

    PRIMARY KEY (`menu_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pelanggan` (
    `pelanggan_id` INTEGER NOT NULL AUTO_INCREMENT,
    `level_id` INTEGER NOT NULL,
    `nama_pelanggan` TEXT NOT NULL,

    PRIMARY KEY (`pelanggan_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Level_Member` (
    `level_id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_level` TEXT NOT NULL,
    `minimal_point` DOUBLE NOT NULL,

    PRIMARY KEY (`level_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Pelanggan` ADD CONSTRAINT `Pelanggan_level_id_fkey` FOREIGN KEY (`level_id`) REFERENCES `Level_Member`(`level_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
