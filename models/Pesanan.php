<?php
class Pesanan {
    private $conn;
    private $table_name = "pesanan";

    public $id;
    public $items;
    public $total;
    public $metode_bayar;
    public $status;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // CREATE pesanan
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                SET items=:items, total=:total, metode_bayar=:metode_bayar, 
                    status=:status, created_at=:created_at";
        
        $stmt = $this->conn->prepare($query);
        
        // bind values
        $stmt->bindParam(":items", $this->items);
        $stmt->bindParam(":total", $this->total);
        $stmt->bindParam(":metode_bayar", $this->metode_bayar);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":created_at", $this->created_at);
        
        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // READ semua pesanan
    public function read() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }
}
?>