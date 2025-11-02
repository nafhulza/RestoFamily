<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

include_once '../config/database.php';
include_once '../models/Pesanan.php';

$database = new Database();
$db = $database->getConnection();
$pesanan = new Pesanan($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Ambil semua pesanan
        $stmt = $pesanan->read();
        $num = $stmt->rowCount();
        
        if($num > 0) {
            $pesanan_arr = array();
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($pesanan_arr, $row);
            }
            echo json_encode($pesanan_arr);
        } else {
            echo json_encode(array());
        }
        break;
        
    case 'POST':
        // Tambah pesanan baru
        $data = json_decode(file_get_contents("php://input"));
        
        if(
            !empty($data->items) &&
            !empty($data->total) &&
            !empty($data->metode_bayar)
        ) {
            $pesanan->items = json_encode($data->items);
            $pesanan->total = $data->total;
            $pesanan->metode_bayar = $data->metode_bayar;
            $pesanan->status = 'selesai';
            $pesanan->created_at = date('Y-m-d H:i:s');
            
            if($pesanan->create()) {
                http_response_code(201);
                echo json_encode(array("message" => "Pesanan berhasil disimpan."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Gagal menyimpan pesanan."));
            }
        }
        break;
}
?>