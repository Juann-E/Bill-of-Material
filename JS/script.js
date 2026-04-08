// --- Logika Spreadsheet & Tabel (Kode kamu sebelumnya) ---
const sheetID = '1kM1vcZc6peXadFJ-1lXSIgIsHUx-P8v0Qf_Ca3O-1ZI';
const base = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json`;

fetch(base)
    .then(res => res.text())
    .then(data => {
        const temp = data.substring(47).slice(0, -2);
        const json = JSON.parse(temp);
        const rows = json.table.rows;
        
        // Update Total Cost dari Sel L2 (Kolom ke-12)
        const totalCostValue = rows[0].c[11] ? rows[0].c[11].f || rows[0].c[11].v : '0';
        const displayElem = document.getElementById('total-cost-val');
        if(displayElem) displayElem.innerText = totalCostValue;

        const tbody = document.getElementById('table-body');
        tbody.innerHTML = ''; 

        rows.forEach((row, index) => {
            if (row.c[0] && row.c[0].v) { // Hanya render jika kolom 'Item' tidak kosong
                const tr = document.createElement('tr');
                const cells = row.c.map(cell => cell ? (cell.f || cell.v) : '-');
                
                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${cells[0]}</td>
                    <td>${cells[1]}</td>
                    <td>${cells[2]}</td>
                    <td>${cells[3]}</td>
                    <td>${cells[4]}</td>
                    <td>${cells[5]}</td>
                    <td>${cells[6]}</td>
                    <td>${cells[7]}</td>
                    <td>${row.c[8] && row.c[8].v ? `<a href="${row.c[8].v}" target="_blank">Link</a>` : '-'}</td>
                    <td>${cells[9] || ''}</td>
                `;
                tbody.appendChild(tr);
            }
        });
    })
    .catch(err => {
        console.error("Error fetching data:", err);
        document.getElementById('table-body').innerHTML = '<tr><td colspan="11">Gagal memuat data.</td></tr>';
    });

// --- Logika Tombol Back to Top (Kode kamu sebelumnya) ---
const backToTopBtn = document.getElementById("btn-back-to-top");

window.onscroll = function() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        backToTopBtn.style.display = "block";
    } else {
        backToTopBtn.style.display = "none";
    }
};

backToTopBtn.addEventListener("click", function() {
    window.scrollTo({ top: 0, behavior: "smooth" });
});


// --- Tambahan Baru: Logika Modal Gambar Fullscreen ---

// Ambil elemen modal
const modal = document.getElementById("image-modal");
const modalImg = document.getElementById("img-fullscreen");
const captionText = document.getElementById("modal-caption");

// Ambil semua gambar di dalam class 'media-grid'
const images = document.querySelectorAll(".media-grid .clickable-image");

// Loop melalui semua gambar dan tambahkan event klik
images.forEach(img => {
    img.onclick = function() {
        modal.style.display = "block"; // Tampilkan modal
        modalImg.src = this.src; // Set sumber gambar modal sama dengan gambar yang diklik
        captionText.innerHTML = this.alt; // Set teks caption dari atribut alt gambar
        document.body.style.overflow = "hidden"; // Nonaktifkan scroll halaman utama saat modal terbuka
    }
});

// Ambil elemen tombol tutup (X)
const spanClose = document.querySelector(".close-modal");

// Fungsi untuk menutup modal
function closeModal() {
    modal.style.display = "none";
    document.body.style.overflow = "auto"; // Aktifkan kembali scroll halaman utama
}

// Tutup saat tombol (X) diklik
spanClose.onclick = closeModal;

// Tutup saat user mengklik di mana saja di area gelap modal (overlay)
modal.onclick = function(event) {
    if (event.target === modal) { // Pastikan klik pada latar belakang, bukan gambar
        closeModal();
    }
};

// Tutup modal jika user menekan tombol 'Esc' pada keyboard
document.addEventListener('keydown', function(event) {
    if (event.key === "Escape" && modal.style.display === "block") {
        closeModal();
    }
});