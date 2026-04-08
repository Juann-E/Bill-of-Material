const sheetID = '1kM1vcZc6peXadFJ-1lXSIgIsHUx-P8v0Qf_Ca3O-1ZI';

// Fungsi Helper untuk Fetch Data dari Google Sheets
function fetchSheetData(gid, callback) {
    const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&gid=${gid}`;
    fetch(url)
        .then(res => res.text())
        .then(data => {
            const temp = data.substring(47).slice(0, -2);
            const json = JSON.parse(temp);
            callback(json.table.rows);
        })
        .catch(err => console.error("Error fetching sheet:", err));
}

// --- LOGIKA HALAMAN INDEX (Bill of Material) ---
const tbodyIndex = document.getElementById('table-body');
if (tbodyIndex) {
    fetchSheetData('0', (rows) => {
        // Update Total Cost dari Sel L2 (Baris 0, Kolom 11)
        const totalCostValue = rows[0].c[11] ? rows[0].c[11].f || rows[0].c[11].v : '0';
        const displayElem = document.getElementById('total-cost-val');
        if (displayElem) displayElem.innerText = totalCostValue;

        tbodyIndex.innerHTML = '';
        let countTersedia = 0;
        let countBelum = 0;

        rows.forEach((row, index) => {
            if (row.c[0] && row.c[0].v) {
                const tr = document.createElement('tr');
                const cells = row.c.map(cell => cell ? (cell.f || cell.v) : '-');

                // Note ada di indeks 8 (Kolom I) berdasarkan data lokal kamu
                const noteVal = cells[8] ? cells[8].toString().trim().toLowerCase() : '';
                let noteColor = 'inherit';
                let rowClass = '';

                if (noteVal === 'tersedia') {
                    noteColor = '#2e7d32';
                    countTersedia++;
                    rowClass = 'border-green';
                } else if (noteVal === 'belum') {
                    noteColor = '#d32f2f';
                    countBelum++;
                    rowClass = 'border-red';
                } else if (noteVal !== '' && noteVal !== '-') {
                    noteColor = '#f57f17';
                    rowClass = 'border-yellow';
                }

                if (rowClass) tr.classList.add(rowClass);

                const linkHTML = row.c[7] && row.c[7].v ? `<a href="${row.c[7].v}" target="_blank">Link</a>` : '-';
                const noteHTML = cells[8] !== '-' ? `<span style="font-weight:bold; color:${noteColor};">${cells[8]}</span>` : '-';

                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${cells[0]}</td>
                    <td>${cells[1]}</td>
                    <td>${cells[2]}</td>
                    <td>${cells[3]}</td>
                    <td>${cells[4]}</td>
                    <td>${cells[5]}</td>
                    <td>${cells[6]}</td>
                    <td>${linkHTML}</td>
                    <td>${noteHTML}</td>
                `;
                tbodyIndex.appendChild(tr);
            }
        });

        // Update Stats di Header
        if (document.getElementById('count-tersedia')) document.getElementById('count-tersedia').innerText = countTersedia;
        if (document.getElementById('count-belum')) document.getElementById('count-belum').innerText = countBelum;
    });
}

// --- LOGIKA HALAMAN DURATION (duration.html) ---
const tbodyDuration = document.getElementById('duration-table-body');
if (tbodyDuration) {
    fetchSheetData('1577982641', (rows) => {
        tbodyDuration.innerHTML = '';

        let summary = {
            wTotal: '-', wWaki: '-', wOdachi: '-', wConn: '-',
            mTotal: '-', mWaki: '-', mOdachi: '-', mConn: '-'
        };
        let isMaterialSection = false;

        rows.forEach((row) => {
            // Render Tabel Utama (Hanya jika kolom A ada isi)
            if (row.c[0] && row.c[0].v && typeof row.c[0].v === 'string' && row.c[0].v.trim() !== '') {
                const tr = document.createElement('tr');
                const jam = row.c[5] ? row.c[5].v : 0;
                const menit = row.c[6] ? row.c[6].v : 0;
                let printTime = (jam !== 0 || menit !== 0) ? `${jam}j ${menit}m` : (row.c[7] ? `${row.c[7].f || row.c[7].v} Jam` : '-');

                const status = row.c[4] ? row.c[4].v.toString().toLowerCase() : '';
                let statusHTML = row.c[4] ? row.c[4].v : '-';

                if (status === 'done') {
                    statusHTML = `<span class="status-badge done" style="padding: 4px 8px; border-radius: 4px; border: 1.5px solid #2e7d32; background-color: #e8f5e9; color: #2e7d32; font-weight: bold; display: inline-block; text-align: center; min-width: 60px;">${row.c[4].v}</span>`;
                } else if (status === 'queue') {
                    statusHTML = `<span class="status-badge queue" style="padding: 4px 8px; border-radius: 4px; border: 1.5px solid #d32f2f; background-color: #ffebee; color: #d32f2f; font-weight: bold; display: inline-block; text-align: center; min-width: 60px;">${row.c[4].v}</span>`;
                } else if (status === 'running') {
                    statusHTML = `<span class="status-badge running" style="padding: 4px 8px; border-radius: 4px; border: 1.5px solid #f57f17; background-color: #fffde7; color: #f57f17; font-weight: bold; display: inline-block; text-align: center; min-width: 60px;">${row.c[4].v}</span>`;
                }

                tr.innerHTML = `
                    <td>${row.c[0].v}</td>
                    <td>${printTime}</td>
                    <td>${row.c[3] ? row.c[3].f || row.c[3].v : '-'}</td>
                    <td>${statusHTML}</td>
                `;
                tbodyDuration.appendChild(tr);
            }

            // Logika Summary (Kolom J & K)
            if (row.c[9] && row.c[9].v) {
                const label = row.c[9].v.toString().trim().toLowerCase();
                const value = row.c[10] ? row.c[10].f || row.c[10].v : '-';

                if (label === 'waktu total') summary.wTotal = value;
                else if (label === 'material total') { summary.mTotal = value; isMaterialSection = true; }
                else if (label === 'wakizashi') isMaterialSection ? summary.mWaki = value : summary.wWaki = value;
                else if (label === 'odachi') isMaterialSection ? summary.mOdachi = value : summary.wOdachi = value;
                else if (label === 'connector') isMaterialSection ? summary.mConn = value : summary.wConn = value;
            }
        });

        // Update DOM Summary
        const updateSum = (id, val) => { if (document.getElementById(id)) document.getElementById(id).innerText = val; };
        updateSum('sum-time-total', summary.wTotal); updateSum('sum-time-waki', summary.wWaki);
        updateSum('sum-time-odachi', summary.wOdachi); updateSum('sum-time-conn', summary.wConn);
        updateSum('sum-mat-total', summary.mTotal); updateSum('sum-mat-waki', summary.mWaki);
        updateSum('sum-mat-odachi', summary.mOdachi); updateSum('sum-mat-conn', summary.mConn);
    });
}

// --- LOGIKA GLOBAL (Back to Top & Modal) ---
const backToTopBtn = document.getElementById("btn-back-to-top");
window.onscroll = () => {
    if (backToTopBtn) backToTopBtn.style.display = (window.scrollY > 100) ? "block" : "none";
};
if (backToTopBtn) backToTopBtn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });

// Modal Gambar
const modal = document.getElementById("image-modal");
document.querySelectorAll(".clickable-image").forEach(img => {
    img.onclick = function () {
        modal.style.display = "block";
        document.getElementById("img-fullscreen").src = this.src;
        document.getElementById("modal-caption").innerHTML = this.alt;
        document.body.style.overflow = "hidden";
    }
});
const closeModal = () => { if (modal) { modal.style.display = "none"; document.body.style.overflow = "auto"; } };
if (document.querySelector(".close-modal")) document.querySelector(".close-modal").onclick = closeModal;
window.onclick = (e) => { if (e.target === modal) closeModal(); };