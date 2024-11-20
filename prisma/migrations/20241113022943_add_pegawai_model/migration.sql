-- Membuat tabel Role
CREATE TABLE Role (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    name TEXT NOT NULL,
    deletedAt DATETIME NULL
);

-- Membuat tabel Pegawai
CREATE TABLE Pegawai (
    pegawai_id INT AUTO_INCREMENT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role_id INT NOT NULL,
    deletedAt DATETIME NULL,
    FOREIGN KEY (role_id) REFERENCES Role(role_id)
);

-- Membuat tabel Pelanggan
CREATE TABLE Pelanggan (
    pelanggan_id INT AUTO_INCREMENT PRIMARY KEY,
    name TEXT NOT NULL,
    points INT NOT NULL,
    deletedAt DATETIME NULL
);

-- Membuat tabel Menu
CREATE TABLE Menu (
    menu_id INT AUTO_INCREMENT PRIMARY KEY, -- Kolom ID unik dengan auto increment
    name TEXT NOT NULL,                     -- Nama menu, wajib diisi
    description TEXT NOT NULL,              -- Deskripsi menu, wajib diisi
    stok INT NOT NULL,                      -- Jumlah stok, wajib diisi
    price DOUBLE NOT NULL,                  -- Harga menu, wajib diisi
    deletedAt DATETIME NULL                 -- Tanggal penghapusan untuk soft delete (nullable)
);


-- Membuat tabel LevelMember
CREATE TABLE LevelMember (
    level_member_id INT AUTO_INCREMENT PRIMARY KEY,
    name TEXT NOT NULL,
    diskon INT NOT NULL,
    minimum_point INT NOT NULL,
    deletedAt DATETIME NULL
);

-- Membuat tabel Transaksi
CREATE TABLE Transaksi (
    transaksi_id INT AUTO_INCREMENT PRIMARY KEY,
    pelanggan_id INT NOT NULL,
    diskon_id INT NULL,
    tanggal_transaksi DATETIME NOT NULL,
    total_harga FLOAT NOT NULL,
    deletedAt DATETIME NULL,
    FOREIGN KEY (pelanggan_id) REFERENCES Pelanggan(pelanggan_id),
    FOREIGN KEY (diskon_id) REFERENCES LevelMember(level_member_id)
);

-- Membuat tabel DetailTransaksi
CREATE TABLE DetailTransaksi (
    detail_transaksi_id INT AUTO_INCREMENT PRIMARY KEY,
    transaksi_id INT NOT NULL,
    menu_id INT NOT NULL,
    amount INT NOT NULL,
    FOREIGN KEY (transaksi_id) REFERENCES Transaksi(transaksi_id),
    FOREIGN KEY (menu_id) REFERENCES Menu(menu_id)
);
