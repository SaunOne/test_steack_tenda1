-- CreateTable
CREATE TABLE "Pegawai" (
    "pegawai_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "role_id" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Pegawai_pkey" PRIMARY KEY ("pegawai_id")
);

-- CreateTable
CREATE TABLE "Role" (
    "role_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "Pelanggan" (
    "pelanggan_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "level_member_id" INTEGER,

    CONSTRAINT "Pelanggan_pkey" PRIMARY KEY ("pelanggan_id")
);

-- CreateTable
CREATE TABLE "Menu" (
    "menu_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "stok" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("menu_id")
);

-- CreateTable
CREATE TABLE "LevelMember" (
    "level_member_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "diskon" INTEGER NOT NULL,
    "minimum_point" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "LevelMember_pkey" PRIMARY KEY ("level_member_id")
);

-- CreateTable
CREATE TABLE "Transaksi" (
    "transaksi_id" SERIAL NOT NULL,
    "pelanggan_id" INTEGER NOT NULL,
    "diskon" DOUBLE PRECISION,
    "tanggal_transaksi" TIMESTAMP(3) NOT NULL,
    "total_diskon" INTEGER NOT NULL DEFAULT 0,
    "total_harga" DOUBLE PRECISION NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Transaksi_pkey" PRIMARY KEY ("transaksi_id")
);

-- CreateTable
CREATE TABLE "DetailTransaksi" (
    "detail_transaksi_id" SERIAL NOT NULL,
    "transaksi_id" INTEGER NOT NULL,
    "menu_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "DetailTransaksi_pkey" PRIMARY KEY ("detail_transaksi_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pegawai_username_key" ON "Pegawai"("username");

-- AddForeignKey
ALTER TABLE "Pegawai" ADD CONSTRAINT "Pegawai_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pelanggan" ADD CONSTRAINT "Pelanggan_level_member_id_fkey" FOREIGN KEY ("level_member_id") REFERENCES "LevelMember"("level_member_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_pelanggan_id_fkey" FOREIGN KEY ("pelanggan_id") REFERENCES "Pelanggan"("pelanggan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailTransaksi" ADD CONSTRAINT "DetailTransaksi_transaksi_id_fkey" FOREIGN KEY ("transaksi_id") REFERENCES "Transaksi"("transaksi_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailTransaksi" ADD CONSTRAINT "DetailTransaksi_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "Menu"("menu_id") ON DELETE RESTRICT ON UPDATE CASCADE;
