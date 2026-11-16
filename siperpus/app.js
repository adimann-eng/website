/* ===== SIPERPUS UNUGIRI — data disimpan di localStorage ===== */
const LOAN_DAYS = 7;
const FINE_PER_DAY = 1000; // Denda default Rp1.000 per hari keterlambatan
const MAX_ACTIVE = 3;
const COLORS = ['#157347', '#2563eb', '#d99a1b', '#c0392b', '#7c3aed', '#0891b2'];
const $ = (s, r = document) => r.querySelector(s);
const view = $('#view');

/* ---------- helpers ---------- */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const BULAN_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
const today = () => iso(new Date());
const fmt = s => { const d = parse(s); return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`; };
const fmtShort = s => { const d = parse(s); return `${d.getDate()} ${BULAN[d.getMonth()]}`; };
const fmtFull = s => { const d = parse(s); return `${d.getDate()} ${BULAN_FULL[d.getMonth()]} ${d.getFullYear()}`; };
const diffDays = (a, b) => Math.round((parse(a) - parse(b)) / 864e5);
const num = n => Number(n).toLocaleString('id-ID');

function toast(msg, error) {
  const t = $('#toast');
  t.textContent = msg;
  t.className = 'toast show' + (error ? ' error' : '');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.className = 'toast', 2600);
}

/* ---------- data ---------- */
const KEY = 'siperpus_data_v1';
function seed() {
  const t = today();
  const books = [
    ['BK-001', 'Dasar-Dasar Komputer', 'Andi Wijaya', 'Informatika', 2021, 'Komputer', 8],
    ['BK-002', 'Algoritma & Pemrograman', 'Rinaldi Munir', 'Informatika', 2020, 'Komputer', 6],
    ['BK-003', 'Pengantar Basis Data', 'Fathansyah', 'Informatika', 2019, 'Komputer', 4],
    ['BK-004', 'Jaringan Komputer', 'Tanenbaum', 'Pearson', 2018, 'Jaringan', 5],
    ['BK-005', 'Matematika Diskrit', 'Rosen', 'McGraw-Hill', 2017, 'Matematika', 3],
    ['BK-006', 'Sistem Informasi Manajemen', 'Jogiyanto', 'Andi', 2022, 'Sistem Informasi', 2],
    ['BK-007', 'Pendidikan Pancasila', 'Kaelan', 'Paradigma', 2016, 'Umum', 10],
    ['BK-008', 'Bahasa Indonesia Akademik', 'Tim Penyusun', 'Kemdikbud', 2020, 'Bahasa', 6],
    ['BK-009', 'Statistika Dasar', 'Sudjana', 'Tarsito', 2015, 'Matematika', 4],
  ].map(([kode, judul, penulis, penerbit, tahun, kategori, stok]) => ({ kode, judul, penulis, penerbit, tahun, kategori, stok }));
  const members = [
    ['251101060', 'Siti Aisyah', 'Teknik Informatika'], ['251101012', 'Budi Santoso', 'Teknik Informatika'],
    ['251101033', 'Rina Wulandari', 'Sistem Informasi'], ['251101044', 'Fajar Nugroho', 'Teknik Informatika'],
    ['251101055', 'Dewi Lestari', 'Sistem Informasi'], ['251101071', 'Hasan Basri', 'Teknik Informatika'],
    ['251101081', 'Ahmad Mansur', 'Pendidikan Matematika'], ['251101090', 'Lina Marlina', 'Pendidikan Bahasa'],
  ].map(([no, nama, prodi]) => ({ no, nama, prodi }));
  const L = (m, b, ago, ret) => ({ id: 'L' + Math.random().toString(36).slice(2, 9), member: m, book: b, loanDate: addDays(t, -ago), dueDate: addDays(t, -ago + LOAN_DAYS), returnDate: ret == null ? null : addDays(t, -ret) });
  const loans = [
    L('251101060', 'BK-001', 4), L('251101012', 'BK-002', 5), L('251101033', 'BK-003', 13, 6),
    L('251101044', 'BK-004', 12), L('251101055', 'BK-006', 7, 3), L('251101071', 'BK-005', 8),
    L('251101081', 'BK-009', 14), L('251101090', 'BK-008', 20, 10),
    L('251101012', 'BK-001', 40, 34), L('251101033', 'BK-002', 70, 64), L('251101055', 'BK-001', 100, 94),
    L('251101071', 'BK-003', 130, 124), L('251101090', 'BK-005', 160, 154), L('251101044', 'BK-001', 30, 24),
  ];
  return { books, members, loans };
}
let db;
function load() {
  try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) { db = null; }
  if (!db || !db.books) { db = seed(); save(); }
}
function save() { localStorage.setItem(KEY, JSON.stringify(db)); }

const activeLoans = () => db.loans.filter(l => !l.returnDate);
const activeOfBook = kode => activeLoans().filter(l => l.book === kode).length;
const available = b => b.stok - activeOfBook(b.kode);
const getBook = k => db.books.find(b => b.kode === k);
const getMember = n => db.members.find(m => m.no === n);
const isLate = l => !l.returnDate && today() > l.dueDate;
const lateDays = l => diffDays(today(), l.dueDate);
const overdueDaysAt = (l, date) => Math.max(0, diffDays(date, l.dueDate));
const fineFor = (l, date = today()) => overdueDaysAt(l, date) * FINE_PER_DAY;
const cover = (b, i = 0) => b && b.cover
  ? `<div class="sw" style="background:url('${b.cover}') center/cover no-repeat"></div>`
  : `<div class="sw" style="background:${COLORS[i % COLORS.length]}"></div>`;
let pendingCover = null;
const initials = n => n.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();

function loanStatus(l) {
  if (l.returnDate) return '<span class="badge ok">Dikembalikan</span>';
  if (isLate(l)) return '<span class="badge bad">Terlambat</span>';
  return '<span class="badge warn">Dipinjam</span>';
}

/* ---------- login / session ---------- */
function showApp() {
  $('#login').classList.add('hidden');
  $('#app').classList.remove('hidden');
  go(location.hash.slice(1) || 'dashboard');
}
$('#loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const u = $('#lUser').value.trim().toLowerCase(), p = $('#lPass').value;
  if (u === 'petugas01' && p === 'admin123') {
    sessionStorage.setItem('siperpus_login', '1');
    $('#loginErr').textContent = '';
    showApp();
  } else $('#loginErr').textContent = 'Username atau password salah. Periksa kembali data login.';
});
$('#togglePass').addEventListener('click', () => {
  const field = $('#lPass'), visible = field.type === 'password';
  field.type = visible ? 'text' : 'password';
  $('#togglePass').textContent = visible ? '🙈' : '👁';
  $('#togglePass').setAttribute('aria-label', visible ? 'Sembunyikan password' : 'Tampilkan password');
});
$('#forgotToggle').addEventListener('click', () => {
  const panel = $('#forgotPanel'), opening = !panel.classList.contains('open');
  panel.classList.toggle('open', opening);
  $('#forgotToggle').setAttribute('aria-expanded', String(opening));
  panel.setAttribute('aria-hidden', String(!opening));
});
$('#logoutBtn').addEventListener('click', () => {
  if (!confirm('Keluar dari sistem?')) return;
  sessionStorage.removeItem('siperpus_login');
  $('#app').classList.add('hidden');
  $('#login').classList.remove('hidden');
  $('#lPass').value = '';
});

/* ---------- router ---------- */
const pages = { dashboard: pDashboard, buku: pBuku, anggota: pAnggota, peminjaman: pPeminjaman, pengembalian: pPengembalian, laporan: pLaporan };
function go(name) {
  if (!pages[name]) name = 'dashboard';
  location.hash = name;
  document.querySelectorAll('.sidebar nav a').forEach(a => a.classList.toggle('active', a.dataset.view === name));
  pages[name]();
  window.scrollTo(0, 0);
}
document.querySelectorAll('.sidebar nav a').forEach(a => a.addEventListener('click', () => go(a.dataset.view)));

/* ---------- modal ---------- */
function openModal(html) { $('#modalBox').innerHTML = html; $('#modal').classList.remove('hidden'); }
function closeModal() { $('#modal').classList.add('hidden'); }
$('#modal').addEventListener('mousedown', e => { if (e.target.id === 'modal') closeModal(); });

/* ================= DASHBOARD ================= */
function pDashboard() {
  const now = new Date();
  const recent = [...db.loans].sort((a, b) => b.loanDate.localeCompare(a.loanDate)).slice(0, 6);
  // chart 6 bulan
  const months = [];
  for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); months.push({ y: d.getFullYear(), m: d.getMonth(), c: 0 }); }
  db.loans.forEach(l => { const d = parse(l.loanDate); const x = months.find(m => m.y === d.getFullYear() && m.m === d.getMonth()); if (x) x.c++; });
  const max = Math.max(1, ...months.map(m => m.c));
  // populer
  const cnt = {};
  db.loans.forEach(l => cnt[l.book] = (cnt[l.book] || 0) + 1);
  const pop = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 3);

  view.innerHTML = `
  <div class="page-head">
    <div><h1>Dashboard</h1><p>${HARI[now.getDay()]}, ${fmtFull(today())} · Ringkasan aktivitas perpustakaan</p></div>
    <button class="btn primary" onclick="go('peminjaman')">+ Peminjaman Baru</button>
  </div>
  <div class="grid4">
    <div class="card stat"><div class="ico g">📘</div><div class="num">${num(db.books.length)}</div><div class="lbl">Total judul buku</div></div>
    <div class="card stat"><div class="ico b">👥</div><div class="num">${num(db.members.length)}</div><div class="lbl">Anggota terdaftar</div></div>
    <div class="card stat"><div class="ico y">🔖</div><div class="num">${num(activeLoans().length)}</div><div class="lbl">Sedang dipinjam</div></div>
    <div class="card stat"><div class="ico r">⏰</div><div class="num">${num(activeLoans().filter(isLate).length)}</div><div class="lbl">Terlambat dikembalikan</div></div>
  </div>
  <div class="two">
    <div class="card"><h3>Transaksi Terbaru</h3>
      <table><thead><tr><th>Anggota</th><th>Buku</th><th>Tgl Pinjam</th><th>Status</th></tr></thead><tbody>
      ${recent.map(l => `<tr><td>${esc(getMember(l.member)?.nama || l.member)}</td><td>${esc(getBook(l.book)?.judul || l.book)}</td><td>${fmt(l.loanDate)}</td><td>${loanStatus(l)}</td></tr>`).join('') || '<tr><td colspan="4" class="empty">Belum ada transaksi</td></tr>'}
      </tbody></table></div>
    <div class="stack">
      <div class="card"><h3>Peminjaman 6 Bulan Terakhir</h3>
        <div class="chart">${months.map(m => `<div class="col"><div class="bar" title="${m.c} peminjaman" style="height:${Math.max(4, m.c / max * 100)}%"></div>${BULAN[m.m]}</div>`).join('')}</div></div>
      <div class="card"><h3>Buku Terpopuler</h3>
        ${pop.map(([k, c], i) => `<div class="pop">${cover(getBook(k), i)}<div>${esc(getBook(k)?.judul || k)}<small>${c} kali dipinjam</small></div></div>`).join('') || '<p class="muted">Belum ada data</p>'}</div>
    </div>
  </div>`;
}

/* ================= DATA BUKU ================= */
function pBuku() {
  const cats = [...new Set(db.books.map(b => b.kategori))].sort();
  view.innerHTML = `
  <div class="page-head"><div><h1>Data Buku</h1><p>Kelola koleksi dan pantau ketersediaan stok</p></div>
    <button class="btn primary" onclick="bookForm()">+ Tambah Buku</button></div>
  <div class="toolbar">
    <input id="bq" placeholder="🔍 Cari judul, penulis, atau kode buku...">
    <select id="bc"><option value="">Semua Kategori</option>${cats.map(c => `<option>${esc(c)}</option>`).join('')}</select>
    <select id="bs"><option value="">Semua Status</option><option value="ada">Tersedia</option><option value="habis">Dipinjam</option></select>
  </div>
  <div class="tbl-wrap"><table><thead><tr><th>Cover</th><th>Kode</th><th>Judul</th><th>Penulis</th><th>Penerbit</th><th>Tahun</th><th>Kategori</th><th>Stok</th><th>Status</th><th>Aksi</th></tr></thead><tbody id="bbody"></tbody></table></div>
  <p class="foot-note" id="bfoot"></p>`;
  const draw = () => {
    const q = $('#bq').value.toLowerCase(), c = $('#bc').value, s = $('#bs').value;
    const rows = db.books.filter(b => (!q || [b.judul, b.penulis, b.kode].join(' ').toLowerCase().includes(q)) && (!c || b.kategori === c) && (!s || (s === 'ada') === (available(b) > 0)));
    $('#bbody').innerHTML = rows.map(b => { const a = available(b); return `<tr>
      <td>${cover(b, db.books.indexOf(b))}</td><td>${esc(b.kode)}</td><td class="b">${esc(b.judul)}</td><td>${esc(b.penulis)}</td><td>${esc(b.penerbit)}</td><td>${esc(b.tahun)}</td><td>${esc(b.kategori)}</td>
      <td>${a}/${b.stok}</td><td>${a > 0 ? '<span class="badge ok">Tersedia</span>' : '<span class="badge warn">Dipinjam</span>'}</td>
      <td><button class="icon-btn" title="Edit" onclick="bookForm('${esc(b.kode)}')">✏️</button><button class="icon-btn" title="Hapus" onclick="delBook('${esc(b.kode)}')">🗑️</button></td></tr>`; }).join('') || '<tr><td colspan="10" class="empty">Buku tidak ditemukan</td></tr>';
    $('#bfoot').textContent = `Menampilkan ${rows.length} dari ${num(db.books.length)} buku`;
  };
  ['bq', 'bc', 'bs'].forEach(id => $('#' + id).addEventListener('input', draw));
  draw();
}
function bookForm(kode) {
  const b = kode ? getBook(kode) : { kode: 'BK-' + String(db.books.length + 1).padStart(3, '0'), judul: '', penulis: '', penerbit: '', tahun: new Date().getFullYear(), kategori: '', stok: 1 };
  pendingCover = b.cover || null;
  openModal(`<h3>${kode ? 'Edit Buku' : 'Tambah Buku'}</h3>
  <label>Kode Buku</label><input id="f_kode" value="${esc(b.kode)}" ${kode ? 'disabled' : ''}>
  <label>Judul</label><input id="f_judul" value="${esc(b.judul)}">
  <div class="row2"><div><label>Penulis</label><input id="f_penulis" value="${esc(b.penulis)}"></div><div><label>Penerbit</label><input id="f_penerbit" value="${esc(b.penerbit)}"></div></div>
  <div class="row2"><div><label>Tahun</label><input id="f_tahun" type="number" value="${esc(b.tahun)}"></div><div><label>Kategori</label><input id="f_kategori" list="catlist" value="${esc(b.kategori)}"></div></div>
  <datalist id="catlist">${[...new Set(db.books.map(x => x.kategori))].map(c => `<option>${esc(c)}</option>`).join('')}</datalist>
  <label>Cover Buku (gambar)</label>
  <div style="display:flex;gap:14px;align-items:center">
    <div id="coverPrev">${cover(b, 0)}</div>
    <div style="flex:1"><input id="f_cover" type="file" accept="image/*" onchange="readCover(this)">
    <button type="button" class="btn sm" style="margin-top:8px" onclick="clearCover()">Hapus cover</button></div>
  </div>
  <label>Jumlah Stok (total eksemplar)</label><input id="f_stok" type="number" min="1" value="${esc(b.stok)}">
  <div class="modal-actions"><button class="btn" onclick="closeModal()">Batal</button><button class="btn primary" onclick="saveBook('${kode || ''}')">Simpan</button></div>`);
}
function readCover(inp) {
  const f = inp.files[0]; if (!f) return;
  const fr = new FileReader();
  fr.onload = () => {
    const img = new Image();
    img.onload = () => {
      const h = Math.min(300, img.height), w = Math.round(img.width * h / img.height);
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      pendingCover = c.toDataURL('image/jpeg', 0.8);
      $('#coverPrev').innerHTML = cover({ cover: pendingCover });
    };
    img.src = fr.result;
  };
  fr.readAsDataURL(f);
}
function clearCover() { pendingCover = null; $('#f_cover').value = ''; $('#coverPrev').innerHTML = cover({}, 0); }
function saveBook(old) {
  const v = id => $('#f_' + id).value.trim();
  const data = { kode: v('kode'), judul: v('judul'), penulis: v('penulis'), penerbit: v('penerbit'), tahun: v('tahun'), kategori: v('kategori'), stok: parseInt(v('stok')), cover: pendingCover };
  if (!data.kode || !data.judul || !data.kategori || !(data.stok >= 1)) return toast('Kode, judul, kategori, dan stok wajib diisi.', true);
  if (old) {
    if (data.stok < activeOfBook(old)) return toast(`Stok tidak boleh kurang dari jumlah yang sedang dipinjam (${activeOfBook(old)}).`, true);
    Object.assign(getBook(old), data);
  } else {
    if (getBook(data.kode)) return toast('Kode buku sudah digunakan.', true);
    db.books.push(data);
  }
  save(); closeModal(); toast('Data buku disimpan.'); pBuku();
}
function delBook(kode) {
  if (activeOfBook(kode)) return toast('Buku sedang dipinjam, tidak bisa dihapus.', true);
  if (!confirm('Hapus buku ini?')) return;
  db.books = db.books.filter(b => b.kode !== kode); save(); toast('Buku dihapus.'); pBuku();
}

/* ================= DATA ANGGOTA ================= */
function pAnggota() {
  view.innerHTML = `
  <div class="page-head"><div><h1>Data Anggota</h1><p>Kelola anggota perpustakaan</p></div>
    <button class="btn primary" onclick="memberForm()">+ Tambah Anggota</button></div>
  <div class="toolbar"><input id="mq" placeholder="🔍 Cari nama atau nomor anggota..."></div>
  <div class="tbl-wrap"><table><thead><tr><th>No. Anggota</th><th>Nama</th><th>Program Studi</th><th>Pinjaman Aktif</th><th>Aksi</th></tr></thead><tbody id="mbody"></tbody></table></div>
  <p class="foot-note" id="mfoot"></p>`;
  const draw = () => {
    const q = $('#mq').value.toLowerCase();
    const rows = db.members.filter(m => !q || (m.nama + m.no).toLowerCase().includes(q));
    $('#mbody').innerHTML = rows.map(m => `<tr><td>${esc(m.no)}</td><td class="b">${esc(m.nama)}</td><td>${esc(m.prodi)}</td>
      <td>${activeLoans().filter(l => l.member === m.no).length} buku</td>
      <td><button class="icon-btn" onclick="memberForm('${esc(m.no)}')">✏️</button><button class="icon-btn" onclick="delMember('${esc(m.no)}')">🗑️</button></td></tr>`).join('') || '<tr><td colspan="5" class="empty">Anggota tidak ditemukan</td></tr>';
    $('#mfoot').textContent = `Menampilkan ${rows.length} dari ${db.members.length} anggota`;
  };
  $('#mq').addEventListener('input', draw); draw();
}
function memberForm(no) {
  const m = no ? getMember(no) : { no: '', nama: '', prodi: '' };
  openModal(`<h3>${no ? 'Edit Anggota' : 'Tambah Anggota'}</h3>
  <label>No. Anggota (NIM)</label><input id="m_no" value="${esc(m.no)}" ${no ? 'disabled' : ''}>
  <label>Nama Lengkap</label><input id="m_nama" value="${esc(m.nama)}">
  <label>Program Studi</label><input id="m_prodi" value="${esc(m.prodi)}">
  <div class="modal-actions"><button class="btn" onclick="closeModal()">Batal</button><button class="btn primary" onclick="saveMember('${no || ''}')">Simpan</button></div>`);
}
function saveMember(old) {
  const d = { no: $('#m_no').value.trim(), nama: $('#m_nama').value.trim(), prodi: $('#m_prodi').value.trim() };
  if (!d.no || !d.nama) return toast('No. anggota dan nama wajib diisi.', true);
  if (old) Object.assign(getMember(old), d);
  else { if (getMember(d.no)) return toast('No. anggota sudah terdaftar.', true); db.members.push(d); }
  save(); closeModal(); toast('Data anggota disimpan.'); pAnggota();
}
function delMember(no) {
  if (activeLoans().some(l => l.member === no)) return toast('Anggota masih memiliki pinjaman aktif.', true);
  if (!confirm('Hapus anggota ini?')) return;
  db.members = db.members.filter(m => m.no !== no); save(); toast('Anggota dihapus.'); pAnggota();
}

/* ================= PEMINJAMAN ================= */
let selMember = null, selBook = null;
function pPeminjaman() {
  selMember = null; selBook = null;
  view.innerHTML = `
  <div class="page-head"><div><h1>Peminjaman Buku</h1><p>Catat transaksi peminjaman baru</p></div></div>
  <div class="steps">
    <div class="step" id="st1"><i>1</i>Pilih anggota</div>
    <div class="step" id="st2"><i>2</i>Pilih buku</div>
    <div class="step" id="st3"><i>3</i>Konfirmasi</div>
  </div>
  <div class="two-eq">
    <div class="card"><h3>Data Peminjam</h3>
      <label style="margin-top:0">Cari anggota</label>
      <input id="pm" placeholder="🔍 Ketik nama atau no. anggota (mis. 251101060)" autocomplete="off">
      <div id="pmRes"></div><div id="pmCard"></div>
      <label>Cari buku</label>
      <input id="pb" placeholder="🔍 Ketik judul, penulis, atau kode buku" autocomplete="off">
      <div id="pbList" style="margin-top:8px"></div>
    </div>
    <div class="card"><h3>Ringkasan Transaksi</h3><div id="sum"></div>
      <div class="note">ℹ️ Stok buku otomatis berkurang 1 setelah transaksi disimpan.</div>
      <div class="btn-row"><button class="btn" onclick="pPeminjaman()">Batal</button><button class="btn primary" onclick="saveLoan()">Simpan Peminjaman</button></div>
    </div>
  </div>`;
  $('#pm').addEventListener('input', drawMemberSearch);
  $('#pb').addEventListener('input', drawBookList);
  drawBookList(); drawSummary();
}
function drawMemberSearch() {
  const q = $('#pm').value.trim().toLowerCase();
  const res = !q ? [] : db.members.filter(m => (m.nama + ' ' + m.no).toLowerCase().includes(q)).slice(0, 5);
  $('#pmRes').innerHTML = res.length && !(selMember && selMember.no === q) ? `<div class="result">${res.map(m => `<div onclick="pickMember('${esc(m.no)}')"><b>${esc(m.nama)}</b> · ${esc(m.no)} · ${esc(m.prodi)}</div>`).join('')}</div>` : (q ? '<p class="muted small" style="margin-top:8px">Anggota tidak ditemukan.</p>' : '');
}
function pickMember(no) {
  selMember = getMember(no);
  $('#pm').value = selMember.no; $('#pmRes').innerHTML = '';
  const n = activeLoans().filter(l => l.member === no).length;
  $('#pmCard').innerHTML = `<div class="member-card"><div class="avatar">${esc(initials(selMember.nama))}</div><div><b style="font-size:17px">${esc(selMember.nama)}</b><small>No. Anggota ${esc(selMember.no)} · ${esc(selMember.prodi)}</small><small>Pinjaman aktif: ${n} buku</small></div></div>`;
  drawSummary();
}
function drawBookList() {
  const q = $('#pb').value.trim().toLowerCase();
  const rows = db.books.filter(b => !q || (b.judul + b.penulis + b.kode).toLowerCase().includes(q)).slice(0, 6);
  $('#pbList').innerHTML = rows.map(b => { const a = available(b); const i = db.books.indexOf(b);
    return `<div class="book-opt ${selBook === b.kode ? 'sel' : ''} ${a < 1 ? 'disabled' : ''}" onclick="pickBook('${esc(b.kode)}')">
      ${cover(b, i)}
      <div class="info"><b>${esc(b.judul)}</b><small>${esc(b.kode)} · ${esc(b.penulis)} · Stok ${a}</small></div>
      <span class="badge ${a > 0 ? 'ok' : 'warn'}">${a > 0 ? 'Tersedia' : 'Habis'}</span></div>`; }).join('') || '<p class="muted small">Buku tidak ditemukan.</p>';
}
function pickBook(kode) {
  if (available(getBook(kode)) < 1) return toast('Stok buku habis.', true);
  selBook = kode; drawBookList(); drawSummary();
}
function drawSummary() {
  const t = today(), b = selBook && getBook(selBook);
  $('#sum').innerHTML = [
    ['Anggota', selMember ? esc(selMember.nama) : '<span class="muted">— belum dipilih</span>'],
    ['Buku', b ? esc(b.judul) : '<span class="muted">— belum dipilih</span>'],
    ['Tanggal pinjam', fmtFull(t)],
    ['Batas pengembalian', `<b class="red">${fmtFull(addDays(t, LOAN_DAYS))}</b>`],
    ['Lama pinjam', LOAN_DAYS + ' hari'],
    ['Petugas', 'Adi Nur Rahman'],
  ].map(([k, v]) => `<div class="summary-row"><span>${k}</span><b>${v}</b></div>`).join('');
  $('#st1').classList.toggle('done', !!selMember);
  $('#st2').classList.toggle('done', !!selBook);
  $('#st3').classList.toggle('done', !!(selMember && selBook));
}
function saveLoan() {
  if (!selMember) return toast('Pilih anggota terlebih dahulu.', true);
  if (!selBook) return toast('Pilih buku terlebih dahulu.', true);
  const b = getBook(selBook);
  if (available(b) < 1) return toast('Stok buku habis.', true);
  const mine = activeLoans().filter(l => l.member === selMember.no);
  if (mine.length >= MAX_ACTIVE) return toast(`Anggota sudah meminjam ${MAX_ACTIVE} buku (batas maksimal).`, true);
  if (mine.some(l => l.book === selBook)) return toast('Anggota sudah meminjam buku yang sama.', true);
  if (mine.some(isLate)) return toast('Anggota memiliki pinjaman terlambat. Kembalikan dulu.', true);
  const t = today();
  db.loans.push({ id: 'L' + Date.now().toString(36), member: selMember.no, book: selBook, loanDate: t, dueDate: addDays(t, LOAN_DAYS), returnDate: null });
  save(); toast(`Peminjaman "${b.judul}" oleh ${selMember.nama} berhasil disimpan.`);
  go('pengembalian');
}

/* ================= PENGEMBALIAN ================= */
function pPengembalian() {
  const t = today();
  view.innerHTML = `
  <div class="page-head"><div><h1>Pengembalian Buku</h1><p>Daftar buku yang belum dikembalikan</p></div>
    <div style="width:280px"><input id="rq" placeholder="🔍 Cari anggota / judul..."></div></div>
  <div class="grid3">
    <div class="card stat"><div class="num">${activeLoans().length}</div><div class="lbl">Sedang dipinjam</div></div>
    <div class="card stat"><div class="num red">${activeLoans().filter(isLate).length}</div><div class="lbl">Melewati batas waktu</div></div>
    <div class="card stat"><div class="num grn">${db.loans.filter(l => l.returnDate === t).length}</div><div class="lbl">Dikembalikan hari ini</div></div>
  </div>
  <div class="tbl-wrap"><table><thead><tr><th>Anggota</th><th>Buku</th><th>Tgl Pinjam</th><th>Batas Kembali</th><th>Status</th><th>Denda</th><th>Aksi</th></tr></thead><tbody id="rbody"></tbody></table></div>`;
  const draw = () => {
    const q = $('#rq').value.toLowerCase();
    const name = l => getMember(l.member)?.nama || l.member, title = l => getBook(l.book)?.judul || l.book;
    const act = activeLoans().sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const done = db.loans.filter(l => l.returnDate).sort((a, b) => b.returnDate.localeCompare(a.returnDate)).slice(0, 5);
    const rows = [...act, ...done].filter(l => !q || (name(l) + title(l)).toLowerCase().includes(q));
    $('#rbody').innerHTML = rows.map(l => {
      let st, ak;
      if (l.returnDate) { st = `<span class="badge ok">Dikembalikan ${fmtShort(l.returnDate)}</span>`; ak = '<span class="muted">Selesai</span>'; }
      else {
        st = isLate(l) ? `<span class="badge bad">Terlambat ${lateDays(l)} hari</span>` : '<span class="badge warn">Dipinjam</span>';
        ak = `<button class="btn primary sm" onclick="doReturn('${l.id}')">Kembalikan</button>`;
      }
      const denda = l.returnDate ? (l.fine || 0) : fineFor(l);
      return `<tr><td class="b">${esc(name(l))}</td><td>${esc(title(l))}</td><td>${fmt(l.loanDate)}</td><td>${fmt(l.dueDate)}</td><td>${st}</td><td>${denda ? `<b class="red">Rp${num(denda)}</b>` : '<span class="muted">Rp0</span>'}</td><td>${ak}</td></tr>`;
    }).join('') || '<tr><td colspan="7" class="empty">Tidak ada data</td></tr>';
  };
  $('#rq').addEventListener('input', draw); draw();
}
function doReturn(id) {
  const l = db.loans.find(x => x.id === id); if (!l) return;
  const days = overdueDaysAt(l, today()), fine = days * FINE_PER_DAY;
  const detail = days ? `
Terlambat: ${days} hari
Denda: Rp${num(fine)} (Rp${num(FINE_PER_DAY)} per hari)` : '\nTidak ada denda.';
  if (!confirm(`Konfirmasi pengembalian "${getBook(l.book)?.judul}"?${detail}`)) return;
  l.returnDate = today(); l.fine = fine; save();
  toast(fine ? `Buku dikembalikan. Denda Rp${num(fine)}.` : 'Buku berhasil dikembalikan tanpa denda.'); pPengembalian();
}

/* ================= LAPORAN ================= */
function pLaporan() {
  const now = new Date();
  const per = [];
  for (let i = 0; i < 6; i++) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); per.push({ v: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, t: `${BULAN_FULL[d.getMonth()]} ${d.getFullYear()}` }); }
  view.innerHTML = `
  <div class="page-head"><div><h1>Laporan Transaksi</h1><p>Rekap peminjaman dan pengembalian</p></div>
    <div class="head-actions"><button class="btn" onclick="window.print()">📄 Ekspor PDF</button><button class="btn primary" onclick="window.print()">🖨️ Cetak Laporan</button></div></div>
  <div class="filters">
    <select id="lp"><option value="">Periode: Semua</option>${per.map(p => `<option value="${p.v}">Periode: ${p.t}</option>`).join('')}</select>
    <select id="lj"><option value="">Semua Jenis</option><option value="pinjam">Pinjam</option><option value="kembali">Kembali</option></select>
    <select id="ls"><option value="">Semua Status</option><option value="aktif">Belum dikembalikan</option><option value="selesai">Sudah dikembalikan</option></select>
  </div>
  <div class="grid4" id="lstat"></div>
  <div class="two-eq" style="grid-template-columns:1fr 1.6fr">
    <div class="card"><h3>Peminjaman per Kategori</h3><div id="lcat"></div></div>
    <div class="tbl-wrap"><table><thead><tr><th>No</th><th>Tanggal</th><th>Anggota</th><th>Buku</th><th>Jenis</th></tr></thead><tbody id="lbody"></tbody></table></div>
  </div>`;
  per.length && ($('#lp').value = per[0].v);
  const draw = () => {
    const p = $('#lp').value, j = $('#lj').value, s = $('#ls').value;
    const inP = d => !p || d.startsWith(p);
    const st = l => !s || (s === 'aktif') === !l.returnDate;
    let rows = [];
    db.loans.forEach(l => {
      if (st(l)) {
        if (inP(l.loanDate)) rows.push({ date: l.loanDate, l, jenis: 'pinjam' });
        if (l.returnDate && inP(l.returnDate)) rows.push({ date: l.returnDate, l, jenis: 'kembali' });
      }
    });
    const totalP = rows.filter(r => r.jenis === 'pinjam').length, totalK = rows.filter(r => r.jenis === 'kembali').length;
    rows = rows.filter(r => !j || r.jenis === j).sort((a, b) => b.date.localeCompare(a.date));
    $('#lstat').innerHTML = [['Total peminjaman', totalP], ['Total pengembalian', totalK], ['Belum dikembalikan', activeLoans().length], ['Total denda tercatat', db.loans.reduce((a, l) => a + (l.fine || 0), 0) + activeLoans().reduce((a, l) => a + fineFor(l), 0)]]
      .map(([k, v]) => `<div class="card stat"><div class="num">${num(v)}</div><div class="lbl">${k}</div></div>`).join('');
    const cat = {};
    db.loans.filter(l => inP(l.loanDate) && st(l)).forEach(l => { const c = getBook(l.book)?.kategori || 'Lainnya'; cat[c] = (cat[c] || 0) + 1; });
    const cs = Object.entries(cat).sort((a, b) => b[1] - a[1]), mx = Math.max(1, ...cs.map(c => c[1]));
    $('#lcat').innerHTML = cs.map(([c, n]) => `<div class="cat-row"><span class="n">${esc(c)}</span><div class="track"><div class="fill" style="width:${n / mx * 100}%"></div></div><b>${n}</b></div>`).join('') || '<p class="muted">Tidak ada data</p>';
    $('#lbody').innerHTML = rows.map((r, i) => `<tr><td>${i + 1}</td><td>${fmtShort(r.date)}</td><td>${esc(getMember(r.l.member)?.nama || r.l.member)}</td><td>${esc(getBook(r.l.book)?.judul || r.l.book)}</td>
      <td><span class="badge ${r.jenis === 'pinjam' ? 'warn' : 'info'}">${r.jenis === 'pinjam' ? 'Pinjam' : 'Kembali'}</span></td></tr>`).join('') || '<tr><td colspan="5" class="empty">Tidak ada transaksi</td></tr>';
  };
  ['lp', 'lj', 'ls'].forEach(id => $('#' + id).addEventListener('input', draw)); draw();
}

/* ---------- start ---------- */
load();
if (sessionStorage.getItem('siperpus_login')) showApp();
