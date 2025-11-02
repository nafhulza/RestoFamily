// Konfigurasi API
const API_BASE_URL = 'http://localhost/resto-family/api';

// Data harga menu (fallback jika API tidak tersedia)
let hargaMenu = {
    'nasi-putih': 3000,
    'nasi-uduk': 5000,
    'nasi-kuning': 7000,
    'daging': 10000,
    'ayam': 8000,
    'tahu': 2000,
    'es-teh': 1000,
    'teh-manis': 2500,
    'air-mineral': 4000
};

let riwayatPesanan = [];
let currentPesanan = [];
let menuData = [];i

// Service untuk komunikasi dengan API
class ApiService {
    // Simpan pesanan ke database
    static async simpanPesanan(pesananData) {
        try {
            const response = await fetch(`${API_BASE_URL}/pesanan.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pesananData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error menyimpan pesanan:', error);
            throw error;
        }
    }

    // Ambil riwayat pesanan dari database
    static async ambilRiwayatPesanan() {
        try {
            const response = await fetch(`${API_BASE_URL}/pesanan.php`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            return result.data || result;
        } catch (error) {
            console.error('Error mengambil riwayat:', error);
            throw error;
        }
    }

    // Ambil semua menu dari database
    static async ambilSemuaMenu() {
        try {
            const response = await fetch(`${API_BASE_URL}/menu.php`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            return result.data || result;
        } catch (error) {
            console.error('Error mengambil menu:', error);
            throw error;
        }
    }

    // Ambil menu by kategori
    static async ambilMenuByKategori(kategori) {
        try {
            const response = await fetch(`${API_BASE_URL}/menu.php?kategori=${kategori}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            return result.data || result;
        } catch (error) {
            console.error('Error mengambil menu by kategori:', error);
            throw error;
        }
    }
}

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

async function initApp() {
    console.log('Menginisialisasi aplikasi...');
    
    try {
        // Load menu dari database
        await loadMenuFromDatabase();
        showNotification('Menu berhasil dimuat dari database!', 'success');
    } catch (error) {
        console.error('Gagal load menu dari database, menggunakan default:', error);
        showNotification('Menggunakan menu default. Server mungkin offline.', 'warning');
        // Tetap lanjut dengan harga menu default
    }
    
    // Load riwayat dari localStorage
    loadRiwayatFromStorage();
    
    // Setup event listeners
    setupEventListeners();
    
    // Inisialisasi state awal
    togglePaymentInput('atm');
    updateTotal();
    
    console.log('Aplikasi berhasil diinisialisasi');
}

function setupEventListeners() {
    // Event listener untuk tombol tema
    document.getElementById('theme-btn').addEventListener('click', toggleTheme);
    
    // Event listener untuk tombol tambah pesanan
    document.getElementById('tambah-pesanan').addEventListener('click', tambahPesanan);
    
    // Event listener untuk filter
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterMenu(this.dataset.filter);
        });
    });
    
    // Event listener untuk metode pembayaran
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', function() {
            togglePaymentInput(this.value);
        });
    });
    
    // Event listener untuk input uang
    document.getElementById('uang-dibayar').addEventListener('input', updateKembalian);
    
    // Event listener untuk tombol bayar
    document.getElementById('proses-pembayaran').addEventListener('click', prosesPembayaran);
    
    // Event listener untuk navigasi tab
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            switchTab(this);
        });
    });
    
    // Event listener untuk hapus riwayat
    document.getElementById('clear-riwayat').addEventListener('click', clearRiwayat);
    
    // Event listener untuk refresh menu
    document.getElementById('refresh-menu').addEventListener('click', refreshMenu);
}

function toggleTheme() {
    const body = document.body;
    const themeBtn = document.getElementById('theme-btn');
    const icon = themeBtn.querySelector('i');
    
    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        themeBtn.title = 'Mode Terang';
        showNotification('Mode Gelap diaktifkan', 'info');
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        themeBtn.title = 'Mode Gelap';
        showNotification('Mode Terang diaktifkan', 'info');
    }
    
    // Simpan preferensi tema
    localStorage.setItem('theme', body.classList.contains('light-mode') ? 'light' : 'dark');
}

function switchTab(clickedTab) {
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    clickedTab.classList.add('active');
    const tabId = clickedTab.getAttribute('data-tab') + '-tab';
    document.getElementById(tabId).classList.add('active');
    
    // Jika pindah ke tab pesanan, muat riwayat
    if (tabId === 'pesanan-tab') {
        loadRiwayatPesanan();
    }
}

function filterMenu(kategori) {
    const sections = document.querySelectorAll('.form-section');
    
    sections.forEach(section => {
        if (kategori === 'all') {
            section.style.display = 'block';
            section.style.opacity = '1';
        } else if (section.querySelector('h3').textContent.toLowerCase().includes(kategori)) {
            section.style.display = 'block';
            section.style.opacity = '1';
        } else {
            section.style.display = 'none';
        }
    });
    
    showNotification(`Menampilkan filter: ${kategori === 'all' ? 'Semua Menu' : kategori}`, 'info');
}

function togglePaymentInput(paymentMethod) {
    const tunaiInput = document.getElementById('tunai-input');
    const kembalianSection = document.getElementById('kembalian-section');
    
    console.log('Mengubah metode pembayaran ke:', paymentMethod);
    
    if (paymentMethod === 'tunai') {
        tunaiInput.style.display = 'block';
        kembalianSection.style.display = 'flex';
        // Fokus ke input uang
        setTimeout(() => {
            document.getElementById('uang-dibayar').focus();
        }, 300);
    } else {
        tunaiInput.style.display = 'none';
        kembalianSection.style.display = 'none';
    }
    updateKembalian();
}

// Fungsi untuk menambah pesanan
function tambahPesanan() {
    console.log('Tombol tambah pesanan diklik!');
    
    // Ambil nilai dari form
    const nasiSelect = document.getElementById('nasi');
    const jumlahNasi = parseInt(document.getElementById('jumlah-nasi').value) || 0;
    const laukCheckboxes = document.querySelectorAll('.lauk-checkbox:checked');
    const jumlahLauk = parseInt(document.getElementById('jumlah-lauk').value) || 0;
    const minumanSelect = document.getElementById('minuman');
    const jumlahMinuman = parseInt(document.getElementById('jumlah-minuman').value) || 0;
    
    // Validasi input
    if (!validateInput(nasiSelect.value, jumlahNasi, laukCheckboxes.length, jumlahLauk, minumanSelect.value, jumlahMinuman)) {
        showNotification('Silakan pilih minimal satu menu dan isi jumlah yang valid!', 'error');
        return;
    }
    
    // Buat objek pesanan
    const pesanan = {
        id: Date.now() + Math.random().toString(36).substr(2, 5),
        nasi: nasiSelect.value,
        nasiText: nasiSelect.value ? nasiSelect.options[nasiSelect.selectedIndex].text.split(' - ')[0] : '',
        jumlahNasi: jumlahNasi,
        lauk: getLaukData(laukCheckboxes),
        laukText: getLaukText(laukCheckboxes),
        jumlahLauk: jumlahLauk,
        minuman: minumanSelect.value,
        minumanText: minumanSelect.value ? minumanSelect.options[minumanSelect.selectedIndex].text.split(' - ')[0] : '',
        jumlahMinuman: jumlahMinuman,
        subTotal: calculateSubTotal(nasiSelect.value, jumlahNasi, laukCheckboxes, jumlahLauk, minumanSelect.value, jumlahMinuman),
        timestamp: new Date().toISOString()
    };
    
    // Tambahkan ke current pesanan
    currentPesanan.push(pesanan);
    
    // Update tabel
    updateTabelPesanan();
    
    // Update total
    updateTotal();
    
    // Reset form
    resetForm();
    
    showNotification('Pesanan berhasil ditambahkan!', 'success');
}

function getLaukData(laukCheckboxes) {
    const laukData = {};
    laukCheckboxes.forEach(checkbox => {
        laukData[checkbox.value] = true;
    });
    return laukData;
}

function getLaukText(laukCheckboxes) {
    const laukText = [];
    laukCheckboxes.forEach(checkbox => {
        const label = checkbox.nextElementSibling.textContent.split(' - ')[0];
        laukText.push(label);
    });
    return laukText.length > 0 ? laukText.join(', ') : '-';
}

function validateInput(nasi, jumlahNasi, jumlahLaukChecked, jumlahLauk, minuman, jumlahMinuman) {
    const adaNasi = nasi !== '' && jumlahNasi > 0;
    const adaLauk = jumlahLaukChecked > 0 && jumlahLauk > 0;
    const adaMinuman = minuman !== '' && jumlahMinuman > 0;
    
    if (!adaNasi && !adaLauk && !adaMinuman) {
        return false;
    }
    
    // Validasi jumlah
    if (adaNasi && jumlahNasi < 1) return false;
    if (adaLauk && jumlahLauk < 1) return false;
    if (adaMinuman && jumlahMinuman < 1) return false;
    
    return true;
}

function calculateSubTotal(nasi, jumlahNasi, laukCheckboxes, jumlahLauk, minuman, jumlahMinuman) {
    let total = 0;
    
    // Hitung nasi
    if (nasi && jumlahNasi > 0) {
        total += (hargaMenu[nasi] || 0) * jumlahNasi;
    }
    
    // Hitung lauk
    let hargaLauk = 0;
    laukCheckboxes.forEach(checkbox => {
        hargaLauk += hargaMenu[checkbox.value] || 0;
    });
    
    if (hargaLauk > 0 && jumlahLauk > 0) {
        total += hargaLauk * jumlahLauk;
    }
    
    // Hitung minuman
    if (minuman && jumlahMinuman > 0) {
        total += (hargaMenu[minuman] || 0) * jumlahMinuman;
    }
    
    return total;
}

function updateTabelPesanan() {
    const tbody = document.querySelector('#tabel-pesanan tbody');
    const emptyMessage = tbody.querySelector('.empty-table-message');
    
    if (currentPesanan.length === 0) {
        if (!emptyMessage) {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-table-message">Belum ada pesanan. Silakan tambah pesanan terlebih dahulu.</td></tr>';
        }
        return;
    }
    
    // Hapus pesan kosong jika ada
    if (emptyMessage) {
        emptyMessage.remove();
    }
    
    tbody.innerHTML = '';
    
    currentPesanan.forEach(pesanan => {
        const row = document.createElement('tr');
        row.dataset.id = pesanan.id;
        row.className = 'pesanan-row';
        
        // Nasi
        row.appendChild(createCell(pesanan.nasiText || '-'));
        
        // Jumlah nasi
        row.appendChild(createCell(pesanan.jumlahNasi > 0 ? pesanan.jumlahNasi : '-'));
        
        // Lauk
        row.appendChild(createCell(pesanan.laukText));
        
        // Jumlah lauk
        row.appendChild(createCell(pesanan.jumlahLauk > 0 ? pesanan.jumlahLauk : '-'));
        
        // Minuman
        row.appendChild(createCell(pesanan.minumanText || '-'));
        
        // Jumlah minuman
        row.appendChild(createCell(pesanan.jumlahMinuman > 0 ? pesanan.jumlahMinuman : '-'));
        
        // Sub Total
        row.appendChild(createCell(`Rp ${pesanan.subTotal.toLocaleString('id-ID')}`));
        
        // Aksi (tombol hapus)
        const actionCell = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Hapus';
        deleteBtn.className = 'btn-hapus';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Hapus';
        deleteBtn.onclick = function() {
            hapusPesanan(pesanan.id);
        };
        actionCell.appendChild(deleteBtn);
        row.appendChild(actionCell);
        
        tbody.appendChild(row);
    });
}

function createCell(text) {
    const cell = document.createElement('td');
    cell.textContent = text;
    return cell;
}

function hapusPesanan(id) {
    currentPesanan = currentPesanan.filter(pesanan => pesanan.id !== id);
    updateTabelPesanan();
    updateTotal();
    showNotification('Pesanan berhasil dihapus!', 'info');
}

function updateTotal() {
    let totalPesanan = 0;
    
    currentPesanan.forEach(pesanan => {
        totalPesanan += pesanan.subTotal;
    });
    
    const ppn = Math.round(totalPesanan * 0.1);
    const totalBayar = totalPesanan + ppn;
    
    console.log('Update Total - Pesanan:', totalPesanan, 'PPN:', ppn, 'Total Bayar:', totalBayar);
    
    // Update tampilan
    document.getElementById('total-pesanan').textContent = `Rp ${totalPesanan.toLocaleString('id-ID')}`;
    document.getElementById('ppn').textContent = `Rp ${ppn.toLocaleString('id-ID')}`;
    document.getElementById('total-bayar').textContent = `Rp ${totalBayar.toLocaleString('id-ID')}`;
    
    // Enable/disable tombol bayar
    const btnBayar = document.getElementById('proses-pembayaran');
    btnBayar.disabled = totalPesanan === 0;
    
    if (totalPesanan > 0) {
        btnBayar.innerHTML = '<i class="fas fa-credit-card"></i> PROSES PEMBAYARAN - Rp ' + totalBayar.toLocaleString('id-ID');
    } else {
        btnBayar.innerHTML = '<i class="fas fa-credit-card"></i> PROSES PEMBAYARAN';
    }
    
    // Update kembalian
    updateKembalian();
}

function updateKembalian() {
    const totalBayarText = document.getElementById('total-bayar').textContent;
    const totalBayar = parseHargaToNumber(totalBayarText);
    const uangDibayar = parseInt(document.getElementById('uang-dibayar').value) || 0;
    
    const kembalian = uangDibayar >= totalBayar ? uangDibayar - totalBayar : 0;
    document.getElementById('uang-kembalian').textContent = `Rp ${kembalian.toLocaleString('id-ID')}`;
    
    // Update warna kembalian
    const kembalianElement = document.getElementById('uang-kembalian');
    if (kembalian > 0) {
        kembalianElement.style.color = '#27ae60';
        kembalianElement.style.fontWeight = 'bold';
    } else {
        kembalianElement.style.color = '';
        kembalianElement.style.fontWeight = '';
    }
}

function parseHargaToNumber(hargaText) {
    return parseInt(hargaText.replace('Rp ', '').replace(/\./g, '')) || 0;
}

function resetForm() {
    document.getElementById('nasi').value = '';
    document.getElementById('jumlah-nasi').value = '1';
    
    // Reset semua checkbox lauk
    document.querySelectorAll('.lauk-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    document.getElementById('jumlah-lauk').value = '1';
    document.getElementById('minuman').value = '';
    document.getElementById('jumlah-minuman').value = '1';
}

// FUNGSI PROSES PEMBAYARAN YANG DIPERBAIKI
async function prosesPembayaran() {
    console.log('Tombol proses pembayaran diklik!');
    
    const totalBayarText = document.getElementById('total-bayar').textContent;
    const totalBayar = parseHargaToNumber(totalBayarText);
    
    console.log('Total Bayar:', totalBayar);
    
    if (totalBayar === 0 || currentPesanan.length === 0) {
        showNotification('Tidak ada pesanan untuk dibayar! Silakan tambah pesanan terlebih dahulu.', 'error');
        return;
    }
    
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    console.log('Metode Pembayaran:', paymentMethod);
    
    // Validasi untuk pembayaran tunai
    if (paymentMethod === 'tunai') {
        const uangDibayar = parseInt(document.getElementById('uang-dibayar').value) || 0;
        console.log('Uang Dibayar:', uangDibayar);
        
        if (uangDibayar === 0) {
            showNotification('Silakan masukkan jumlah uang yang dibayarkan!', 'error');
            return;
        }
        
        if (uangDibayar < totalBayar) {
            const kekurangan = totalBayar - uangDibayar;
            showNotification(`Uang yang dibayarkan kurang! Kurang Rp ${kekurangan.toLocaleString('id-ID')}`, 'error');
            return;
        }
    }
    
    // Tampilkan loading
    const btnBayar = document.getElementById('proses-pembayaran');
    const originalText = btnBayar.innerHTML;
    btnBayar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> MEMPROSES...';
    btnBayar.disabled = true;
    
    try {
        // Simpan ke riwayat (baik ke API maupun localStorage)
        const success = await simpanKeRiwayat(totalBayar, paymentMethod);
        
        if (success) {
            // Tampilkan konfirmasi sukses berdasarkan metode pembayaran
            let message = '';
            let receiptDetails = '';
            
            if (paymentMethod === 'tunai') {
                const uangDibayar = parseInt(document.getElementById('uang-dibayar').value);
                const kembalian = uangDibayar - totalBayar;
                message = `✅ PEMBAYARAN TUNAI BERHASIL!\n\nTotal: ${document.getElementById('total-bayar').textContent}\nUang Dibayar: Rp ${uangDibayar.toLocaleString('id-ID')}\nKembalian: Rp ${kembalian.toLocaleString('id-ID')}\n\nTerima kasih atas pesanan Anda!`;
                receiptDetails = `Tunai - Dibayar: Rp ${uangDibayar.toLocaleString('id-ID')} - Kembali: Rp ${kembalian.toLocaleString('id-ID')}`;
            } else if (paymentMethod === 'atm') {
                message = `✅ PEMBAYARAN ATM/DEBIT BERHASIL!\n\nTotal: ${document.getElementById('total-bayar').textContent}\nMetode: ATM/Debit\n\nTransaksi berhasil diproses. Terima kasih!`;
                receiptDetails = 'ATM/Debit - Transaksi Berhasil';
            } else if (paymentMethod === 'kartu-kredit') {
                message = `✅ PEMBAYARAN KARTU KREDIT BERHASIL!\n\nTotal: ${document.getElementById('total-bayar').textContent}\nMetode: Kartu Kredit\n\nTransaksi berhasil diproses. Terima kasih!`;
                receiptDetails = 'Kartu Kredit - Transaksi Berhasil';
            }
            
            showNotification(message, 'success');
            
            // Cetak struk virtual
            cetakStrukVirtual(receiptDetails);
            
            // Reset setelah pembayaran berhasil (dengan delay)
            setTimeout(() => {
                resetPesanan();
                btnBayar.innerHTML = originalText;
                btnBayar.disabled = false;
            }, 4000);
        } else {
            throw new Error('Gagal menyimpan pesanan');
        }
    } catch (error) {
        console.error('Error dalam proses pembayaran:', error);
        showNotification('Maaf, terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.', 'error');
        btnBayar.innerHTML = originalText;
        btnBayar.disabled = false;
    }
}

function cetakStrukVirtual(receiptDetails) {
    const strukWindow = window.open('', '_blank', 'width=400,height=600');
    const strukContent = `
        <html>
            <head>
                <title>Struk Pembayaran - RESTO FAMILY</title>
                <style>
                    body { font-family: 'Courier New', monospace; margin: 20px; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .divider { border-top: 1px dashed #000; margin: 10px 0; }
                    .item { display: flex; justify-content: space-between; margin: 5px 0; }
                    .total { font-weight: bold; border-top: 2px solid #000; padding-top: 10px; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>RESTO FAMILY</h2>
                    <p>Makanan Lezat untuk Keluarga Anda</p>
                    <p>${new Date().toLocaleString('id-ID')}</p>
                </div>
                <div class="divider"></div>
                ${currentPesanan.map(pesanan => `
                    <div class="item">
                        <span>${pesanan.nasiText || ''} ${pesanan.laukText !== '-' ? '+ ' + pesanan.laukText : ''} ${pesanan.minumanText || ''}</span>
                        <span>Rp ${pesanan.subTotal.toLocaleString('id-ID')}</span>
                    </div>
                `).join('')}
                <div class="divider"></div>
                <div class="item">
                    <span>Sub Total:</span>
                    <span>${document.getElementById('total-pesanan').textContent}</span>
                </div>
                <div class="item">
                    <span>PPN (10%):</span>
                    <span>${document.getElementById('ppn').textContent}</span>
                </div>
                <div class="item total">
                    <span>TOTAL:</span>
                    <span>${document.getElementById('total-bayar').textContent}</span>
                </div>
                <div class="item">
                    <span>Metode:</span>
                    <span>${receiptDetails}</span>
                </div>
                <div class="divider"></div>
                <div class="footer">
                    <p>Terima kasih atas kunjungan Anda!</p>
                    <p>*** Struk Ini Sah ***</p>
                </div>
            </body>
        </html>
    `;
    
    strukWindow.document.write(strukContent);
    strukWindow.document.close();
    strukWindow.print();
}

function resetPesanan() {
    // Kosongkan current pesanan
    currentPesanan = [];
    
    // Update tabel
    updateTabelPesanan();
    
    // Reset input pembayaran tunai
    document.getElementById('uang-dibayar').value = '0';
    
    // Reset ke metode pembayaran default
    document.getElementById('atm').checked = true;
    togglePaymentInput('atm');
    
    // Update total untuk reset nilai
    updateTotal();
    
    // Reset form input
    resetForm();
    
    console.log('Pesanan telah direset setelah pembayaran');
}

function getPaymentMethodText(method) {
    const methods = {
        'atm': 'ATM/Debit',
        'kartu-kredit': 'Kartu Kredit',
        'tunai': 'Tunai'
    };
    return methods[method] || method;
}

async function simpanKeRiwayat(total, metode) {
    try {
        if (currentPesanan.length === 0) {
            console.error('Tidak ada pesanan untuk disimpan');
            return false;
        }
        
        const pesananData = {
            items: currentPesanan,
            total: total,
            metode_bayar: getPaymentMethodText(metode),
            status: 'selesai'
        };
        
        let apiSuccess = false;
        
        // Coba simpan ke API PHP
        try {
            const result = await ApiService.simpanPesanan(pesananData);
            if (result.message) {
                console.log('Pesanan berhasil disimpan ke database');
                apiSuccess = true;
                showNotification('Pesanan tersimpan ke database server!', 'success');
            }
        } catch (apiError) {
            console.warn('Gagal menyimpan ke API, menggunakan localStorage:', apiError);
        }
        
        // Simpan ke localStorage sebagai backup/fallback
        const pesananLocal = {
            id: 'P' + Date.now().toString().slice(-6),
            tanggal: new Date().toLocaleString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }),
            total: total,
            metode: getPaymentMethodText(metode),
            items: [...currentPesanan],
            disimpan_di: apiSuccess ? 'database' : 'localStorage'
        };
        
        riwayatPesanan.unshift(pesananLocal);
        saveRiwayatToStorage();
        
        console.log('Pesanan berhasil disimpan ke riwayat');
        return true;
        
    } catch (error) {
        console.error('Error menyimpan ke riwayat:', error);
        return false;
    }
}

// FUNGSI MANAJEMEN MENU DARI DATABASE
async function loadMenuFromDatabase() {
    try {
        const menuData = await ApiService.ambilSemuaMenu();
        
        if (menuData && menuData.length > 0) {
            // Update hargaMenu dengan data dari database
            menuData.forEach(item => {
                const key = convertToKey(item.nama);
                hargaMenu[key] = parseFloat(item.harga);
            });
            
            // Simpan menuData untuk referensi
            window.menuData = menuData;
            
            // Update options di form berdasarkan database
            updateMenuOptions(menuData);
            
            console.log('Menu loaded dari database:', menuData.length, 'items');
            return true;
        } else {
            throw new Error('Data menu kosong');
        }
    } catch (error) {
        console.error('Error loading menu dari database:', error);
        throw error;
    }
}

async function refreshMenu() {
    showNotification('Memperbarui menu...', 'info');
    
    try {
        await loadMenuFromDatabase();
        showNotification('Menu berhasil diperbarui!', 'success');
    } catch (error) {
        showNotification('Gagal memperbarui menu', 'error');
    }
}

function convertToKey(nama) {
    return nama.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}

function updateMenuOptions(menuData) {
    const nasiSelect = document.getElementById('nasi');
    const minumanSelect = document.getElementById('minuman');
    const laukContainer = document.querySelector('.checkbox-group');
    
    // Clear existing options (kecuali placeholder)
    nasiSelect.innerHTML = '<option value="">-- Pilih Jenis Nasi --</option>';
    minumanSelect.innerHTML = '<option value="">-- Pilih Minuman --</option>';
    laukContainer.innerHTML = '';
    
    // Group by kategori
    const nasiItems = menuData.filter(item => item.kategori === 'nasi' && item.tersedia);
    const laukItems = menuData.filter(item => item.kategori === 'lauk' && item.tersedia);
    const minumanItems = menuData.filter(item => item.kategori === 'minuman' && item.tersedia);
    
    // Populate nasi options
    nasiItems.forEach(item => {
        const option = document.createElement('option');
        option.value = convertToKey(item.nama);
        option.textContent = `${item.nama} - Rp ${parseFloat(item.harga).toLocaleString('id-ID')}`;
        option.dataset.harga = item.harga;
        nasiSelect.appendChild(option);
    });
    
    // Populate minuman options
    minumanItems.forEach(item => {
        const option = document.createElement('option');
        option.value = convertToKey(item.nama);
        option.textContent = `${item.nama} - Rp ${parseFloat(item.harga).toLocaleString('id-ID')}`;
        option.dataset.harga = item.harga;
        minumanSelect.appendChild(option);
    });
    
    // Populate lauk checkboxes
    laukItems.forEach(item => {
        const checkboxItem = document.createElement('div');
        checkboxItem.className = 'checkbox-item';
        
        const checkboxId = convertToKey(item.nama);
        
        checkboxItem.innerHTML = `
            <input type="checkbox" id="${checkboxId}" value="${checkboxId}" class="lauk-checkbox">
            <label for="${checkboxId}">${item.nama} - Rp ${parseFloat(item.harga).toLocaleString('id-ID')}</label>
        `;
        
        laukContainer.appendChild(checkboxItem);
    });
}

// FUNGSI RIWAYAT PESANAN
function loadRiwayatFromStorage() {
    try {
        const saved = localStorage.getItem('riwayatPesanan');
        if (saved) {
            riwayatPesanan = JSON.parse(saved);
            console.log('Riwayat loaded dari storage:', riwayatPesanan.length, 'pesanan');
        }
    } catch (error) {
        console.error('Error loading riwayat dari storage:', error);
        riwayatPesanan = [];
    }
}

function saveRiwayatToStorage() {
    try {
        localStorage.setItem('riwayatPesanan', JSON.stringify(riwayatPesanan));
        console.log('Riwayat disimpan ke storage:', riwayatPesanan.length, 'pesanan');
    } catch (error) {
        console.error('Error menyimpan riwayat ke storage:', error);
    }
}

async function loadRiwayatPesanan() {
    const container = document.getElementById('riwayat-pesanan');
    
    // Coba load dari API dulu
    try {
        const riwayatFromAPI = await ApiService.ambilRiwayatPesanan();
        if (riwayatFromAPI && riwayatFromAPI.length > 0) {
            riwayatPesanan = riwayatFromAPI;
            showNotification('Riwayat dimuat dari database server', 'success');
        }
    } catch (error) {
        console.log('Gagal load riwayat dari API, menggunakan localStorage');
    }
    
    if (riwayatPesanan.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <h3>Belum Ada Riwayat Pesanan</h3>
                <p>Pesanan yang sudah dibayar akan muncul di sini</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = riwayatPesanan.map(pesanan => `
        <div class="pesanan-item">
            <div class="pesanan-header">
                <div class="pesanan-id">Pesanan #${pesanan.id}</div>
                <div class="pesanan-tanggal">${pesanan.tanggal}</div>
                ${pesanan.disimpan_di ? `<div class="pesanan-source">${pesanan.disimpan_di}</div>` : ''}
            </div>
            <div class="pesanan-items">
                ${pesanan.items.map(item => `
                    <div class="pesanan-item-row">
                        <div class="pesanan-item-details">
                            ${item.nasiText && item.nasiText !== '-' ? 
                                `<span class="pesanan-item-detail">🍚 ${item.nasiText} (${item.jumlahNasi})</span>` : ''}
                            ${item.laukText && item.laukText !== '-' ? 
                                `<span class="pesanan-item-detail">🍖 ${item.laukText} (${item.jumlahLauk})</span>` : ''}
                            ${item.minumanText && item.minumanText !== '-' ? 
                                `<span class="pesanan-item-detail">🥤 ${item.minumanText} (${item.jumlahMinuman})</span>` : ''}
                        </div>
                        <div class="pesanan-item-total">${`Rp ${item.subTotal.toLocaleString('id-ID')}`}</div>
                    </div>
                `).join('')}
            </div>
            <div class="pesanan-footer">
                <div class="pesanan-total">Total: Rp ${pesanan.total.toLocaleString('id-ID')}</div>
                <div class="pesanan-metode">
                    <i class="fas fa-credit-card"></i>
                    ${pesanan.metode}
                </div>
            </div>
        </div>
    `).join('');
}

function clearRiwayat() {
    if (riwayatPesanan.length === 0) {
        showNotification('Tidak ada riwayat pesanan untuk dihapus.', 'info');
        return;
    }
    
    if (confirm('Apakah Anda yakin ingin menghapus semua riwayat pesanan? Tindakan ini tidak dapat dibatalkan.')) {
        riwayatPesanan = [];
        saveRiwayatToStorage();
        loadRiwayatPesanan();
        showNotification('Semua riwayat pesanan berhasil dihapus!', 'success');
    }
}

// FUNGSI NOTIFIKASI
function showNotification(message, type = 'info') {
    console.log('Menampilkan notifikasi:', type, message);
    
    // Hapus notifikasi sebelumnya
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Buat elemen notifikasi
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Format message untuk menangani newlines
    const formattedMessage = message.replace(/\n/g, '<br>');
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <div class="notification-message">${formattedMessage}</div>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Tambahkan ke body
    document.body.appendChild(notification);
    
    // Tampilkan notifikasi dengan animasi
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto hide setelah 5 detik untuk success/info, 7 detik untuk error
    const hideTime = type === 'error' ? 7000 : 5000;
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, hideTime);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    return icons[type] || 'fa-info-circle';
}

// Utility functions
function formatRupiah(angka) {
    return 'Rp ' + angka.toLocaleString('id-ID');
}

function getCurrentDateTime() {
    return new Date().toLocaleString('id-ID');
}

// Export functions untuk akses global (jika diperlukan)
window.tambahPesanan = tambahPesanan;
window.hapusPesanan = hapusPesanan;
window.prosesPembayaran = prosesPembayaran;
window.clearRiwayat = clearRiwayat;
window.refreshMenu = refreshMenu;