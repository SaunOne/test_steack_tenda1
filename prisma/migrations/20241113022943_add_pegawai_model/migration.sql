-- CreateTable
CREATE TABLE `Pegawai` (
    `pegawai_id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` TEXT NOT NULL,
    `akses_menu` TEXT NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Pegawai_username_key`(`username`),
    PRIMARY KEY (`pegawai_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
