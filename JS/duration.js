const durationSheetID = '1kM1vcZc6peXadFJ-1lXSIgIsHUx-P8v0Qf_Ca3O-1ZI';
const durationGid = '1577982641';
const durationBase = `https://docs.google.com/spreadsheets/d/${durationSheetID}/gviz/tq?tqx=out:json&gid=${durationGid}`;

fetch(durationBase)
    .then(res => res.text())
    .then(data => {
        const temp = data.substring(47).slice(0, -2);
        const json = JSON.parse(temp);
        const rows = json.table.rows;

        const tbody = document.getElementById('duration-table-body');
        if (tbody) {
            tbody.innerHTML = '';
            rows.forEach((row, index) => {
                // Kolom A(0) harus ada informasinya
                if (row.c[0] && row.c[0].v && typeof row.c[0].v === 'string') {

                    // Pengecekan agar hanya data tabel yang terbaca
                    if (row.c[0].v.trim() !== '') {
                        const tr = document.createElement('tr');
                        
                        // Kolom A(0): Part Name
                        const partName = row.c[0].v;
                        
                        // Kolom F(5): Jam, G(6): Menit -> Print Time
                        const jam = row.c[5] ? row.c[5].v : 0;
                        const menit = row.c[6] ? row.c[6].v : 0;
                        let printTime = '-';
                        if (jam !== 0 || menit !== 0) {
                            printTime = `${jam}j ${menit}m`;
                        } else if (row.c[7]) { 
                            // Atau fallback ke Total waktu desimal jika F/G kosong
                            printTime = `${row.c[7].f || row.c[7].v} Jam`;
                        }

                        // Kolom D(3): Weight / Total 
                        const weight = row.c[3] ? row.c[3].f || row.c[3].v : '-';
                        
                        // Kolom E(4): Status
                        const status = row.c[4] ? row.c[4].v : '-';
                        let statusHTML = status;
                        const statusVal = status.toString().trim().toLowerCase();
                        if (statusVal === 'queue') {
                            statusHTML = `<span style="padding: 4px 8px; border-radius: 4px; border: 1.5px solid #d32f2f; background-color: #ffebee; color: #d32f2f; font-weight: bold; display: inline-block; text-align: center; min-width: 60px;">${status}</span>`;
                        } else if (statusVal === 'done') {
                            statusHTML = `<span style="padding: 4px 8px; border-radius: 4px; border: 1.5px solid #2e7d32; background-color: #e8f5e9; color: #2e7d32; font-weight: bold; display: inline-block; text-align: center; min-width: 60px;">${status}</span>`;
                        } else if (statusVal === 'running') {
                            statusHTML = `<span style="padding: 4px 8px; border-radius: 4px; border: 1.5px solid #f57f17; background-color: #fffde7; color: #f57f17; font-weight: bold; display: inline-block; text-align: center; min-width: 60px;">${status}</span>`;
                        }

                        tr.innerHTML = `
                            <td>${partName}</td>
                            <td>${printTime}</td>
                            <td>${weight}</td>
                            <td>${statusHTML}</td>
                        `;
                        tbody.appendChild(tr);
                    }
                }
            });
        }

        // --- Update Summary Data dari Kolom J(9) dan K(10) ---
        let wTotal = '-', wWaki = '-', wOdachi = '-', wConn = '-';
        let mTotal = '-', mWaki = '-', mOdachi = '-', mConn = '-';

        let isMaterialSection = false;

        rows.forEach((row) => {
            if (row.c[9] && row.c[9].v) {
                const label = row.c[9].v.toString().trim().toLowerCase();
                const value = row.c[10] ? row.c[10].f || row.c[10].v : '-';

                // WAKTU SECTION
                if (label === 'waktu total') wTotal = value;
                else if (label === 'wakizashi' && !isMaterialSection) wWaki = value;
                else if (label === 'odachi' && !isMaterialSection) wOdachi = value;
                else if (label === 'connector' && !isMaterialSection) wConn = value;
                
                // MATERIAL SECTION
                else if (label === 'material total') {
                    isMaterialSection = true; // Tandai perpindahan section
                    mTotal = value;
                }
                else if (label === 'wakizashi' && isMaterialSection) mWaki = value;
                else if (label === 'odachi' && isMaterialSection) mOdachi = value;
                else if (label === 'connector' && isMaterialSection) mConn = value;
            }
        });

        // Set elemen ke DOM
        if (document.getElementById('sum-time-total')) document.getElementById('sum-time-total').innerText = wTotal;
        if (document.getElementById('sum-time-waki')) document.getElementById('sum-time-waki').innerText = wWaki;
        if (document.getElementById('sum-time-odachi')) document.getElementById('sum-time-odachi').innerText = wOdachi;
        if (document.getElementById('sum-time-conn')) document.getElementById('sum-time-conn').innerText = wConn;

        if (document.getElementById('sum-mat-total')) document.getElementById('sum-mat-total').innerText = mTotal;
        if (document.getElementById('sum-mat-waki')) document.getElementById('sum-mat-waki').innerText = mWaki;
        if (document.getElementById('sum-mat-odachi')) document.getElementById('sum-mat-odachi').innerText = mOdachi;
        if (document.getElementById('sum-mat-conn')) document.getElementById('sum-mat-conn').innerText = mConn;

    })
    .catch(err => {
        console.error("Error fetching data:", err);
        const tbody = document.getElementById('duration-table-body');
        if (tbody) tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Gagal memuat data.</td></tr>';
    });

// --- Logika Tombol Back to Top ---
const backToTopBtn = document.getElementById("btn-back-to-top");
if (backToTopBtn) {
    window.onscroll = function () {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            backToTopBtn.style.display = "block";
        } else {
            backToTopBtn.style.display = "none";
        }
    };

    backToTopBtn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}