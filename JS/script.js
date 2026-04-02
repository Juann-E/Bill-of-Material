// Konfigurasi Spreadsheet
const sheetID = '1kM1vcZc6peXadFJ-1lXSIgIsHUx-P8v0Qf_Ca3O-1ZI';
const base = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json`;

fetch(base)
    .then(res => res.text())
    .then(data => {
        // Membersihkan prefix JSON Google
        const temp = data.substring(47).slice(0, -2);
        const json = JSON.parse(temp);
        const rows = json.table.rows;
        const tbody = document.getElementById('table-body');
        
        tbody.innerHTML = ''; // Kosongkan pesan loading

        rows.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.className = 'data';
            
            // Mapping data kolom (v adalah value)
            const cells = row.c.map(cell => cell ? cell.v : '');
            
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${cells[0] || '-'}</td>
                <td>${cells[1] || '-'}</td>
                <td>${cells[2] || '-'}</td>
                <td>${cells[3] || '0'}</td>
                <td>${cells[4] || '0'}</td>
                <td>${cells[5] || '0'}</td>
                <td>${cells[6] || '0'}</td>
                <td>${cells[7] || '-'}</td>
                <td>${cells[8] ? `<a href="${cells[8]}" target="_blank">Link</a>` : '-'}</td>
                <td>${cells[9] || ''}</td>
            `;
            tbody.appendChild(tr);
        });
    })
    .catch(err => {
        console.error("Error fetching data:", err);
        document.getElementById('table-body').innerHTML = '<tr><td colspan="11">Gagal memuat data. Cek koneksi atau status Publish Spreadsheet.</td></tr>';
    });