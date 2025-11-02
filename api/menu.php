<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

include_once '../config/database.php';
include_once '../models/Menu.php';

$database = new Database();
$db = $database->getConnection();
$menu = new Menu($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Ambil parameter filter jika ada
        $kategori = isset($_GET['kategori']) ? $_GET['kategori'] : '';
        
        if($kategori) {
            // Ambil menu berdasarkan kategori
            $stmt = $menu->readByKategori($kategori);
        } else {
            // Ambil semua menu
            $stmt = $menu->read();
        }
        
        $num = $stmt->rowCount();
        
        if($num > 0) {
            $menu_arr = array();
            $menu_arr["data"] = array();
            
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($menu_arr["data"], $row);
            }
            
            http_response_code(200);
            echo json_encode($menu_arr);
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "Menu tidak ditemukan."));
        }
        break;
        
    case 'POST':
        // Tambah menu baru (untuk admin)
        $data = json_decode(file_get_contents("php://input"));
        
        if(
            !empty($data->nama) &&
            !empty($data->kategori) &&
            !empty($data->harga)
        ) {
            $menu->nama = $data->nama;
            $menu->kategori = $data->kategori;
            $menu->harga = $data->harga;
            $menu->deskripsi = isset($data->deskripsi) ? $data->deskripsi : '';
            $menu->tersedia = isset($data->tersedia) ? $data->tersedia : true;
            
            if($menu->create()) {
                http_response_code(201);
                echo json_encode(array("message" => "Menu berhasil ditambahkan."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Gagal menambahkan menu."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Data tidak lengkap."));
        }
        break;
        
    case 'PUT':
        // Update menu (untuk admin)
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->id)) {
            $menu->id = $data->id;
            $menu->nama = isset($data->nama) ? $data->nama : $menu->nama;
            $menu->kategori = isset($data->kategori) ? $data->kategori : $menu->kategori;
            $menu->harga = isset($data->harga) ? $data->harga : $menu->harga;
            $menu->deskripsi = isset($data->deskripsi) ? $data->deskripsi : $menu->deskripsi;
            $menu->tersedia = isset($data->tersedia) ? $data->tersedia : $menu->tersedia;
            
            if($menu->update()) {
                http_response_code(200);
                echo json_encode(array("message" => "Menu berhasil diupdate."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Gagal mengupdate menu."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "ID menu diperlukan."));
        }
        break;
        
    case 'DELETE':
        // Hapus menu (untuk admin)
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->id)) {
            $menu->id = $data->id;
            
            if($menu->delete()) {
                http_response_code(200);
                echo json_encode(array("message" => "Menu berhasil dihapus."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Gagal menghapus menu."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "ID menu diperlukan."));
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method tidak diizinkan."));
        break;
}
?>