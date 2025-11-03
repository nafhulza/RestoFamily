CREATE DATABASE IF NOT EXISTS resto_family;
USE resto_family;

-- Tabel menu
CREATE TABLE IF NOT EXISTS menu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    kategori ENUM('nasi', 'lauk', 'minuman') NOT NULL,
    harga DECIMAL(10,2) NOT NULL,
    deskripsi TEXT,
    tersedia BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel pesanan
CREATE TABLE IF NOT EXISTS pesanan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    items JSON NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    metode_bayar VARCHAR(50) NOT NULL,
    status ENUM('pending', 'diproses', 'selesai', 'dibatalkan') DEFAULT 'selesai',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert data menu
INSERT INTO menu (nama, kategori, harga, deskripsi) VALUES
('Nasi Putih', 'nasi', 3000, 'Nasi putih hangat'),
('Nasi Uduk', 'nasi', 5000, 'Nasi uduk spesial dengan santan'),
('Nasi Kuning', 'nasi', 7000, 'Nasi kuning lengkap dengan lauk-pauk'),
('Daging Sapi', 'lauk', 10000, 'Daging sapi rendang/balado'),
('Ayam Goreng', 'lauk', 8000, 'Ayam goreng krispi'),
('Tahu Tempe', 'lauk', 2000, 'Tahu dan tempe goreng'),
('Es Teh Manis', 'minuman', 2500, 'Es teh manis segar'),
('Teh Hangat', 'minuman', 2000, 'Teh hangat manis'),
('Air Mineral', 'minuman', 4000, 'Air mineral botol 600ml'),
('Jeruk Es', 'minuman', 5000, 'Es jeruk segar'),
('Kopi Hitam', 'minuman', 3000, 'Kopi hitam panas');

-- Buat index untuk performa
CREATE INDEX idx_menu_kategori ON menu(kategori);
CREATE INDEX idx_menu_tersedia ON menu(tersedia);
CREATE INDEX idx_pesanan_status ON pesanan(status);
CREATE INDEX idx_pesanan_created ON pesanan(created_at);