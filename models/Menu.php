<?php
class Menu {
    private $conn;
    private $table_name = "menu";

    public $id;
    public $nama;
    public $kategori;
    public $harga;
    public $deskripsi;
    public $tersedia;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // CREATE menu baru
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                SET nama=:nama, kategori=:kategori, harga=:harga, 
                    deskripsi=:deskripsi, tersedia=:tersedia, 
                    created_at=NOW(), updated_at=NOW()";
        
        $stmt = $this->conn->prepare($query);
        
        // sanitize dan bind values
        $this->nama = htmlspecialchars(strip_tags($this->nama));
        $this->kategori = htmlspecialchars(strip_tags($this->kategori));
        $this->harga = floatval($this->harga);
        $this->deskripsi = htmlspecialchars(strip_tags($this->deskripsi));
        $this->tersedia = boolval($this->tersedia);
        
        $stmt->bindParam(":nama", $this->nama);
        $stmt->bindParam(":kategori", $this->kategori);
        $stmt->bindParam(":harga", $this->harga);
        $stmt->bindParam(":deskripsi", $this->deskripsi);
        $stmt->bindParam(":tersedia", $this->tersedia);
        
        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // READ semua menu
    public function read() {
        $query = "SELECT * FROM " . $this->table_name . " 
                 WHERE tersedia = 1 
                 ORDER BY kategori, nama";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // READ menu by kategori
    public function readByKategori($kategori) {
        $query = "SELECT * FROM " . $this->table_name . " 
                 WHERE kategori = :kategori AND tersedia = 1 
                 ORDER BY nama";
        
        $stmt = $this->conn->prepare($query);
        $kategori = htmlspecialchars(strip_tags($kategori));
        $stmt->bindParam(":kategori", $kategori);
        $stmt->execute();
        return $stmt;
    }

    // READ single menu by ID
    public function readOne() {
        $query = "SELECT * FROM " . $this->table_name . " 
                 WHERE id = ? LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->nama = $row['nama'];
            $this->kategori = $row['kategori'];
            $this->harga = $row['harga'];
            $this->deskripsi = $row['deskripsi'];
            $this->tersedia = $row['tersedia'];
            return true;
        }
        return false;
    }

    // UPDATE menu
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                SET nama=:nama, kategori=:kategori, harga=:harga, 
                    deskripsi=:deskripsi, tersedia=:tersedia, 
                    updated_at=NOW()
                WHERE id=:id";
        
        $stmt = $this->conn->prepare($query);
        
        // sanitize dan bind values
        $this->nama = htmlspecialchars(strip_tags($this->nama));
        $this->kategori = htmlspecialchars(strip_tags($this->kategori));
        $this->harga = floatval($this->harga);
        $this->deskripsi = htmlspecialchars(strip_tags($this->deskripsi));
        $this->tersedia = boolval($this->tersedia);
        $this->id = intval($this->id);
        
        $stmt->bindParam(":nama", $this->nama);
        $stmt->bindParam(":kategori", $this->kategori);
        $stmt->bindParam(":harga", $this->harga);
        $stmt->bindParam(":deskripsi", $this->deskripsi);
        $stmt->bindParam(":tersedia", $this->tersedia);
        $stmt->bindParam(":id", $this->id);
        
        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // DELETE menu
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        
        $stmt = $this->conn->prepare($query);
        $this->id = intval($this->id);
        $stmt->bindParam(1, $this->id);
        
        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // GET menu statistics
    public function getStats() {
        $query = "SELECT 
                    COUNT(*) as total_menu,
                    COUNT(CASE WHEN tersedia = 1 THEN 1 END) as menu_tersedia,
                    COUNT(CASE WHEN tersedia = 0 THEN 1 END) as menu_tidak_tersedia,
                    COUNT(DISTINCT kategori) as total_kategori
                 FROM " . $this->table_name;
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>