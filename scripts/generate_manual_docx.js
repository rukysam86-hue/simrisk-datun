import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  Header,
  Footer,
  PageNumber,
  PageBreak,
  ImageRun
} from 'docx';
import fs from 'fs';
import path from 'path';

// Palette Colors (Standar Korporat & Kejaksaan)
const C = {
  NAVY_PRIMARY: '0A2540',
  NAVY_SECONDARY: '1E3A8A',
  NAVY_LIGHT: 'EFF6FF',
  BLUE_BORDER: '93C5FD',
  BLUE_TEXT: '1D4ED8',
  GOLD_ACCENT: 'B45309',
  GOLD_BG: 'FEF3C7',
  GOLD_BORDER: 'FCD34D',
  GREEN_SUCCESS: '065F46',
  GREEN_BG: 'D1FAE5',
  GREEN_BORDER: '6EE7B7',
  TEXT_MAIN: '1E293B',
  TEXT_MUTED: '475569',
  TEXT_LIGHT: '64748B',
  BORDER_TABLE: 'CBD5E1',
  HEADER_BG: '0F2C59',
  ROW_ALT_BG: 'F8FAFC',
  WHITE: 'FFFFFF'
};

// Formatting Helpers
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, size: 28, color: C.NAVY_PRIMARY, font: 'Calibri' })],
    spacing: { before: 340, after: 120 },
    border: {
      bottom: { color: C.NAVY_SECONDARY, space: 4, value: BorderStyle.SINGLE, size: 10 }
    }
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, size: 23, color: C.NAVY_SECONDARY, font: 'Calibri' })],
    spacing: { before: 240, after: 100 }
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, bold: true, size: 21, color: C.TEXT_MAIN, font: 'Calibri' })],
    spacing: { before: 180, after: 80 }
  });
}

function p(text, opts = {}) {
  const runs = Array.isArray(text) ? text : [new TextRun({ text, size: 22, color: C.TEXT_MAIN, font: 'Calibri', ...opts })];
  return new Paragraph({
    children: runs,
    spacing: { before: 70, after: 70, line: 260 },
    alignment: opts.align || AlignmentType.JUSTIFIED
  });
}

function bullet(runsOrText, level = 0) {
  const runs = Array.isArray(runsOrText) 
    ? runsOrText 
    : [new TextRun({ text: runsOrText, size: 22, color: C.TEXT_MAIN, font: 'Calibri' })];
  return new Paragraph({
    children: runs,
    bullet: { level },
    spacing: { before: 40, after: 40, line: 250 }
  });
}

function callout(title, message, type = 'info') {
  let bgColor = C.NAVY_LIGHT;
  let borderColor = C.NAVY_SECONDARY;
  let titleColor = C.BLUE_TEXT;

  if (type === 'warning') {
    bgColor = C.GOLD_BG;
    borderColor = C.GOLD_ACCENT;
    titleColor = C.GOLD_ACCENT;
  } else if (type === 'success') {
    bgColor = C.GREEN_BG;
    borderColor = C.GREEN_SUCCESS;
    titleColor = C.GREEN_SUCCESS;
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      left: { style: BorderStyle.SINGLE, size: 36, color: borderColor }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `${title}: `, bold: true, size: 21, color: titleColor, font: 'Calibri' }),
                  new TextRun({ text: message, size: 21, color: C.TEXT_MAIN, font: 'Calibri' })
                ],
                spacing: { before: 60, after: 60, line: 250 }
              })
            ],
            shading: { fill: bgColor, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 180, right: 180 }
          })
        ]
      })
    ]
  });
}

function imageFigure(filename, captionText, width = 480, height = 310) {
  const filePath = path.resolve('screenshots', filename);
  if (!fs.existsSync(filePath)) {
    return [new Paragraph({ text: `[Tangkapan Layar: ${filename} sedang dipersiapkan]`, italics: true })];
  }
  const imgData = fs.readFileSync(filePath);
  return [
    new Paragraph({
      children: [
        new ImageRun({
          data: imgData,
          transformation: { width, height }
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 160, after: 60 }
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: captionText,
          italics: true,
          bold: true,
          size: 19,
          color: C.TEXT_MUTED,
          font: 'Calibri'
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 20, after: 160 }
    })
  ];
}

function createStyledTable(headers, rowsData, colWidths = []) {
  const tableRows = [];

  // Header Row
  const headerCells = headers.map((h, i) => {
    const cellProps = {
      children: [
        new Paragraph({
          children: [new TextRun({ text: h, bold: true, size: 20, color: C.WHITE, font: 'Calibri' })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 70, after: 70 }
        })
      ],
      shading: { fill: C.HEADER_BG, type: ShadingType.CLEAR },
      margins: { top: 100, bottom: 100, left: 120, right: 120 },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 6, color: C.BORDER_TABLE },
        bottom: { style: BorderStyle.SINGLE, size: 8, color: C.BORDER_TABLE },
        left: { style: BorderStyle.SINGLE, size: 6, color: C.BORDER_TABLE },
        right: { style: BorderStyle.SINGLE, size: 6, color: C.BORDER_TABLE }
      }
    };
    if (colWidths[i]) {
      cellProps.width = { size: colWidths[i], type: WidthType.PERCENTAGE };
    }
    return new TableCell(cellProps);
  });

  tableRows.push(new TableRow({ children: headerCells, cantSplit: true }));

  // Body Rows
  rowsData.forEach((row, rowIndex) => {
    const isAlt = rowIndex % 2 === 1;
    const cells = row.map((cellText, cellIndex) => {
      const cellProps = {
        children: [
          new Paragraph({
            children: [new TextRun({ text: cellText, size: 20, color: C.TEXT_MAIN, font: 'Calibri' })],
            spacing: { before: 60, after: 60 }
          })
        ],
        shading: { fill: isAlt ? C.ROW_ALT_BG : C.WHITE, type: ShadingType.CLEAR },
        margins: { top: 90, bottom: 90, left: 120, right: 120 },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 4, color: C.BORDER_TABLE },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: C.BORDER_TABLE },
          left: { style: BorderStyle.SINGLE, size: 4, color: C.BORDER_TABLE },
          right: { style: BorderStyle.SINGLE, size: 4, color: C.BORDER_TABLE }
        }
      };
      if (colWidths[cellIndex]) {
        cellProps.width = { size: colWidths[cellIndex], type: WidthType.PERCENTAGE };
      }
      return new TableCell(cellProps);
    });
    tableRows.push(new TableRow({ children: cells, cantSplit: true }));
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows
  });
}

async function buildDocument() {
  const logoPath = path.resolve('public', 'logo.png');
  let logoRun = null;
  if (fs.existsSync(logoPath)) {
    const imgData = fs.readFileSync(logoPath);
    logoRun = new ImageRun({
      data: imgData,
      transformation: { width: 135, height: 135 }
    });
  }

  const doc = new Document({
    sections: [
      // ═════════════════════════════════════════════════════════════════════════
      // COVER PAGE
      // ═════════════════════════════════════════════════════════════════════════
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
          }
        },
        children: [
          new Paragraph({ text: '', spacing: { before: 300, after: 150 } }),
          ...(logoRun
            ? [
                new Paragraph({
                  children: [logoRun],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 250 }
                })
              ]
            : []),
          new Paragraph({
            children: [
              new TextRun({
                text: 'BUKU PANDUAN PENGGUNAAN SISTEM (USER MANUAL)',
                bold: true,
                size: 30,
                color: C.NAVY_PRIMARY,
                font: 'Calibri'
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 80 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'SIMRISK DATUN',
                bold: true,
                size: 42,
                color: C.NAVY_SECONDARY,
                font: 'Calibri'
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: '(Sistem Informasi Manajemen Risiko Bidang Perdata dan Tata Usaha Negara)',
                italics: true,
                size: 23,
                color: C.TEXT_MUTED,
                font: 'Calibri'
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 260 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Panduan Praktis Visual Disertai Tangkapan Layar Aplikasi untuk Pengawalan Proyek Infrastruktur, Pemulihan Aset Negara, Monitoring Realisasi Pencairan Anggaran, dan Analisis Risiko Yuridis AI Gemini',
                size: 21,
                color: C.TEXT_MAIN,
                font: 'Calibri'
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 500 }
          }),

          // Metadata Table Box
          createStyledTable(
            ['IDENTITAS DOKUMEN', 'KETERANGAN'],
            [
              ['Nama Aplikasi', 'SIMRISK DATUN Kejati NTT'],
              ['Instansi Pengelola', 'Kejaksaan Tinggi Nusa Tenggara Timur'],
              ['Satuan Kerja', 'Asisten Bidang Perdata dan Tata Usaha Negara (Asdatun)'],
              ['Versi Dokumen', 'Versi 2.1 (Edisi Panduan Bergambar & Data Realistis)'],
              ['Kelengkapan Dokumen', 'Dilengkapi 10 Tangkapan Layar Aplikasi Asli & Contoh Nyata'],
              ['Sasaran Pengguna', 'Jaksa Pengacara Negara (JPN) Kejati NTT & Instansi Pemohon']
            ],
            [35, 65]
          ),

          new Paragraph({ text: '', spacing: { before: 600 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'KEJAKSAAN TINGGI NUSA TENGGARA TIMUR\nKUPANG - 2026',
                bold: true,
                size: 23,
                color: C.NAVY_PRIMARY,
                font: 'Calibri'
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [new PageBreak()]
          })
        ]
      },

      // ═════════════════════════════════════════════════════════════════════════
      // ISI BUKU PANDUAN BERGAMBAR
      // ═════════════════════════════════════════════════════════════════════════
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'SIMRISK DATUN — Kejaksaan Tinggi Nusa Tenggara Timur | Panduan Bergambar',
                    size: 18,
                    color: C.TEXT_LIGHT,
                    font: 'Calibri'
                  })
                ],
                alignment: AlignmentType.RIGHT,
                spacing: { after: 180 }
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Halaman ',
                    size: 18,
                    color: C.TEXT_LIGHT,
                    font: 'Calibri'
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18,
                    color: C.TEXT_LIGHT,
                    font: 'Calibri'
                  }),
                  new TextRun({
                    text: ' dari ',
                    size: 18,
                    color: C.TEXT_LIGHT,
                    font: 'Calibri'
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 18,
                    color: C.TEXT_LIGHT,
                    font: 'Calibri'
                  }),
                  new TextRun({
                    text: ' | Panduan Resmi SIMRISK DATUN Kejati NTT',
                    size: 18,
                    color: C.TEXT_LIGHT,
                    font: 'Calibri'
                  })
                ],
                alignment: AlignmentType.CENTER
              })
            ]
          })
        },
        children: [
          // ───────────────────────────────────────────────────────────────────
          // RINGKASAN EKSEKUTIF
          // ───────────────────────────────────────────────────────────────────
          h1('RINGKASAN EKSEKUTIF & PETUNJUK MEMBACA PANDUAN'),
          p(
            'Buku Panduan ini disusun secara visual untuk memberikan kemudahan bagi seluruh pengguna, baik staf tata usaha, Jaksa Pengacara Negara (JPN), pejabat struktural Kejaksaan Tinggi NTT, maupun perwakilan instansi pemohon (Pemerintah Daerah, Dinas PUPR, Balai Kementerian, BUMN, dan BUMD).'
          ),
          p(
            'Untuk memudahkan pemahaman bagi pengguna awam, setiap instruksi langkah kerja dalam buku panduan ini telah dilengkapi dengan tangkapan layar asli (screenshot) dari sistem dengan menggunakan data proyek realistis (seperti Proyek Jembatan Kembar Liliba dan Pemulihan Aset Daerah).'
          ),
          new Paragraph({ text: '', spacing: { before: 80, after: 80 } }),
          callout(
            'TIPS PENGGUNA AWAM',
            'Cukup perhatikan gambar tangkapan layar di setiap bagian panduan dan cocokkan dengan tampilan pada layar komputer atau ponsel Anda. Tombol atau menu penting telah diberi keterangan yang jelas.',
            'info'
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ───────────────────────────────────────────────────────────────────
          // BAB 1: PENDAHULUAN & RUANG LINGKUP
          // ───────────────────────────────────────────────────────────────────
          h1('BAB 1: PENGENALAN SISTEM & RUANG LINGKUP LAYANAN'),
          
          h2('1.1 Gambaran Umum SIMRISK DATUN'),
          p(
            'SIMRISK DATUN adalah inovasi digital pelayanan hukum Datun pada Kejaksaan Tinggi Nusa Tenggara Timur. Sistem ini berfungsi sebagai instrumen pengawasan dini (early warning system) untuk mengidentifikasi potensi masalah hukum kontrak, keterlambatan pekerjaan, deviasi pencairan anggaran terhadap progres fisik, serta risiko tindak pidana korupsi dalam pelaksanaan pembangunan daerah.'
          ),

          h2('1.2 Dua Kategori Permohonan Pendampingan'),
          p(
            'Aplikasi membedakan formulir dan fitur pengawasan ke dalam 2 (dua) klaster permohonan:'
          ),
          bullet([
            new TextRun({ text: '1. Pendampingan Hukum Proyek Infrastruktur: ', bold: true }),
            new TextRun({ text: 'Dikhususkan untuk proyek konstruksi fisik (jembatan, jalan, bendungan, gedung pemerintah). Memiliki fitur pengawasan keuangan lengkap: Nilai Kontrak, Realisasi Pencairan Dana, Persentase Pencairan Kumulatif, Sisa Anggaran, Dual Progress Bar, dan Analisis AI Kesenjangan Fisik vs Keuangan.' })
          ]),
          bullet([
            new TextRun({ text: '2. Pendampingan Pemulihan / Penyelamatan Aset: ', bold: true }),
            new TextRun({ text: 'Dikhususkan untuk inventarisasi dan penyelamatan aset tanah, kantor/gedung dinas, kendaraan operasional, serta penagihan piutang bermasalah milik pemerintah atau BUMN/BUMD.' })
          ]),

          h2('1.3 Alur 4 Tahapan Standar Kedatunan'),
          createStyledTable(
            ['TAHAPAN', 'NAMA TAHAP', 'DESKRIPSI TUGAS & TINDAKAN', 'INDIKATOR WARNA'],
            [
              ['Tahap 1', 'Permohonan Diterima', 'Penerimaan surat permohonan resmi pemohon & penelaahan administrasi awal.', 'Badge Biru Muda'],
              ['Tahap 2', 'Surat Perintah (SP-1)', 'Kajati NTT menerbitkan SP-1 penugasan Tim JPN untuk telaahan/ekspose.', 'Badge Kuning'],
              ['Tahap 3', 'Telaahan Hukum S-5', 'Tim JPN mengkaji kelayakan yuridis: Dapat Didampingi / Tidak Dapat Didampingi.', 'Badge Oranye'],
              ['Tahap 4', 'Surat Perintah (SP-2)', 'Kajati menerbitkan SP-2 pendampingan aktif & pengawasan progres berkala.', 'Badge Ungu']
            ],
            [12, 23, 47, 18]
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ───────────────────────────────────────────────────────────────────
          // BAB 2: PANDUAN PENGGUNAAN INTERNAL (JPN / ADMIN)
          // ───────────────────────────────────────────────────────────────────
          h1('BAB 2: PANDUAN INTERNAL JAKSA PENGACARA NEGARA (JPN) & ADMIN'),

          h2('2.1 Halaman Login & Akses Masuk Sistem'),
          p(
            'Untuk menjamin kerahasiaan dokumen perkara dan telaahan intelijen kedatunan, seluruh pengguna internal Kejati NTT wajib melakukan login melalui antarmuka resmi terenkripsi.'
          ),
          ...imageFigure(
            '01_login_page.png',
            'Gambar 2.1: Antarmuka Login Administrator & Jaksa Pengacara Negara (SIMRISK DATUN Kejati NTT)'
          ),
          p('Langkah Masuk ke Sistem:'),
          bullet([new TextRun({ text: '1. Akses halaman login aplikasi di peramban web Anda.' })]),
          bullet([new TextRun({ text: '2. Masukkan Username: ' }), new TextRun({ text: 'simrisk_admin', bold: true })]),
          bullet([new TextRun({ text: '3. Masukkan Password: ' }), new TextRun({ text: 'SimriskDatun123', bold: true })]),
          bullet([new TextRun({ text: '4. Klik tombol "Masuk Sistem". Sistem akan memvalidasi kredensial dan membuka Dashboard Utama.' })]),

          h2('2.2 Dashboard Utama & Pemantauan Kegiatan Aktif'),
          p(
            'Setelah login, Anda akan disajikan Dashboard Utama yang menampilkan ringkasan eksekutif seluruh kegiatan pendampingan di wilayah NTT:'
          ),
          ...imageFigure(
            '02_dashboard_utama.png',
            'Gambar 2.2: Tampilan Dashboard Monitoring Utama Internal dengan Indikator Keuangan Proyek'
          ),
          p('Komponen Penting pada Dashboard:'),
          bullet([
            new TextRun({ text: 'Kotak Statistik Atas: ', bold: true }),
            new TextRun({ text: 'Menampilkan jumlah Total Kegiatan, permohonan Diterima (Tahap 1), Menunggu SP-1 (Tahap 2), Menunggu Telaahan S-5 (Tahap 3), dan Aktif SP-2 (Tahap 4).' })
          ]),
          bullet([
            new TextRun({ text: 'Diagram Lingkaran (Pie Chart): ', bold: true }),
            new TextRun({ text: 'Menunjukkan proporsi status kegiatan serta komposisi profil risiko (Rendah, Sedang, Tinggi).' })
          ]),
          bullet([
            new TextRun({ text: 'Tabel Kegiatan Aktif: ', bold: true }),
            new TextRun({ text: 'Memuat nama instansi pemohon, kategori, status tahapan, capaian fisik, serta indikator Realisasi Pencairan Anggaran (contoh: "Cair: Rp 27,00 Milyar (60.0%)") khusus untuk proyek infrastruktur.' })
          ]),
          bullet([
            new TextRun({ text: 'Tombol Rantai Tautan: ', bold: true }),
            new TextRun({ text: 'Dapat diklik langsung untuk menyalin URL Portal Mandiri dan PIN yang siap dikirimkan kepada instansi pemohon.' })
          ]),

          new Paragraph({ children: [new PageBreak()] }),

          h2('2.3 Pendaftaran Surat Permohonan Baru (Risk Register Form)'),
          p(
            'Saat menerima surat permohonan pendampingan hukum dari dinas, pemerintah daerah, atau BUMN, Admin menginput data awal melalui menu "Registrasi Kegiatan" di sidebar kiri:'
          ),
          ...imageFigure(
            '03_registrasi_kegiatan.png',
            'Gambar 2.3: Formulir Registrasi Permohonan Masuk Baru (Pilihan Kategori Infrastruktur / Aset)'
          ),
          p('Petunjuk Pengisian Formulir Registrasi:'),
          bullet([
            new TextRun({ text: 'Pilih Kategori Permohonan: ', bold: true }),
            new TextRun({ text: 'Pilih "Pendampingan Hukum Proyek Infrastruktur" untuk proyek fisik, atau "Pendampingan Pemulihan/Penyelamatan Aset" untuk urusan tanah/gedung/kendaraan.' })
          ]),
          bullet([new TextRun({ text: 'Asal Surat (Instansi): ', bold: true }), new TextRun({ text: 'Nama dinas/instansi pemohon (contoh: Dinas PUPR Prov. NTT).' })]),
          bullet([new TextRun({ text: 'Nomor Surat & Tanggal: ', bold: true }), new TextRun({ text: 'Nomor dinas resmi dan tanggal yang tertera pada surat fisik pemohon.' })]),
          bullet([new TextRun({ text: 'Perihal Surat: ', bold: true }), new TextRun({ text: 'Ringkasan permohonan pendampingan hukum.' })]),
          bullet([new TextRun({ text: 'Tautan Google Drive (PDF): ', bold: true }), new TextRun({ text: 'Tempelkan link file scan PDF surat pemohon yang telah diunggah ke Google Drive.' })]),
          bullet([new TextRun({ text: 'Klik "Simpan Permohonan": ', bold: true }), new TextRun({ text: 'Sistem otomatis membuatkan ID permohonan, kode PIN 6 digit, dan tautan portal pemohon.' })]),

          new Paragraph({ children: [new PageBreak()] }),

          h2('2.4 Pengelolaan Detail Permohonan & Tahapan SOP Kedatunan'),
          p(
            'Dengan mengklik tombol "DETAIL" pada tabel dashboard, JPN akan masuk ke halaman Detail Permohonan yang memuat 4 Tahapan SOP Kedatunan:'
          ),
          ...imageFigure(
            '04_detail_tahapan_sop.png',
            'Gambar 2.4: Halaman Detail Permohonan Menampilkan 4 Tahapan SOP & Riwayat Berkas'
          ),
          p('Langkah Pengelolaan 4 Tahapan:'),
          bullet([
            new TextRun({ text: '1. Tab Permohonan (Tahap 1): ', bold: true }),
            new TextRun({ text: 'Memeriksa detail surat masuk dan mengklik tombol pratinjau PDF untuk membaca berkas permohonan.' })
          ]),
          bullet([
            new TextRun({ text: '2. Tab SP-1 (Tahap 2): ', bold: true }),
            new TextRun({ text: 'Menginput Nomor SP-1, Tanggal Terbit, dan menambahkan susunan Tim JPN (Nama, NIP, Jabatan) menggunakan tombol "+ Tambah Anggota JPN".' })
          ]),
          bullet([
            new TextRun({ text: '3. Tab Telaah (Tahap 3): ', bold: true }),
            new TextRun({ text: 'Menginput nama pembuat telaah (Kasi Perdata/Koordinator), tanggal telaahan S-5, isi analisis yuridis, dan memilih rekomendasi ("Dapat Didampingi" atau "Tidak Dapat Didampingi").' })
          ]),
          bullet([
            new TextRun({ text: '4. Tab SP-2 (Tahap 4): ', bold: true }),
            new TextRun({ text: 'Menginput Nomor SP-2 dan menetapkan Tim JPN Pendamping Tetap sebagai tanda dimulainya pendampingan hukum operasional.' })
          ]),

          new Paragraph({ children: [new PageBreak()] }),

          h2('2.5 Pengawasan Keuangan Proyek & Indikator Dual Progress Bar'),
          p(
            'Khusus untuk permohonan kategori Pendampingan Hukum Proyek Infrastruktur, halaman monitoring dilengkapi kartu ringkasan realisasi pencairan anggaran dan visualisasi batang ganda (Dual Progress Bar):'
          ),
          ...imageFigure(
            '05_monev_keuangan_dual_bar.png',
            'Gambar 2.5: Panel Ringkasan Realisasi Pencairan Anggaran & Dual Progress Bar (Fisik vs Keuangan)'
          ),
          p('Membaca Indikator Visual Keuangan (Gambar 2.5):'),
          bullet([
            new TextRun({ text: 'Kartu 1 (Plafon Total Dana): ', bold: true }),
            new TextRun({ text: 'Menampilkan total pagu kontrak proyek (contoh: Rp 45.000.000.000).' })
          ]),
          bullet([
            new TextRun({ text: 'Kartu 2 (Total Sudah Dicairkan - Hijau): ', bold: true }),
            new TextRun({ text: 'Menampilkan nominal rupiah kumulatif yang telah ditarik dari kas daerah/KPPN beserta persentasenya (contoh: Rp 27.000.000.000 / 60.0%).' })
          ]),
          bullet([
            new TextRun({ text: 'Kartu 3 (Sisa Anggaran - Kuning Emas): ', bold: true }),
            new TextRun({ text: 'Menampilkan sisa dana kontrak yang belum dicairkan (contoh: Rp 18.000.000.000 / 40.0%).' })
          ]),
          bullet([
            new TextRun({ text: 'Dual Progress Bar Bersebelahan: ', bold: true }),
            new TextRun({ text: 'Bar Biru (Kemajuan Fisik: 58%) dibandingkan langsung dengan Bar Hijau (Pencairan Dana: 60%).' })
          ]),
          bullet([
            new TextRun({ text: 'Status Keselarasan Deviasi: ', bold: true }),
            new TextRun({ text: 'Badge hijau otomatis menampilkan "✓ Proporsional (Selisih 2%)" apabila deviasi wajar, atau peringatan merah "⚠️ Pencairan mendahului fisik" jika penarikan dana tidak diimbangi prestasi fisik di lapangan.' })
          ]),

          new Paragraph({ children: [new PageBreak()] }),

          h2('2.6 Analisis Risiko AI (Google Gemini) & Ekspor Word'),
          p(
            'Ketika JPN mengklik tombol "BERI PENILAIAN" pada tabel riwayat laporan, sistem akan membuka jendela evaluasi risiko yang terintegrasi dengan Google Gemini AI:'
          ),
          ...imageFigure(
            '06_ai_analisis_risiko.png',
            'Gambar 2.6: Jendela Analisis Risiko AI Gemini, Penilaian Level Risiko & Tombol Download Word Resmi'
          ),
          p('Fitur Unggulan pada Jendela Penilaian (Gambar 2.6):'),
          bullet([
            new TextRun({ text: 'Tombol "Analisis Risiko AI (Gemini)": ', bold: true }),
            new TextRun({ text: 'Mengirimkan data proyek, progres fisik, dan angka pencairan dana ke Gemini AI untuk menghasilkan kajian yuridis preventif instan.' })
          ]),
          bullet([
            new TextRun({ text: 'Editor Respon AI (Markdown): ', bold: true }),
            new TextRun({ text: 'Jaksa Pengacara Negara dapat menyunting, menambah pertimbangan hukum, atau menyesuaikan redaksional draf analisis sesuai kondisi riil.' })
          ]),
          bullet([
            new TextRun({ text: 'Tingkat Risiko (Badge Warna): ', bold: true }),
            new TextRun({ text: 'JPN menentukan tingkat risiko akhir: Rendah (Hijau), Sedang (Kuning), atau Tinggi (Merah).' })
          ]),
          bullet([
            new TextRun({ text: 'Tombol "Download Word (.docx)": ', bold: true }),
            new TextRun({ text: 'Mengunduh berkas laporan telaah resmi berformat Word (.docx) lengkap dengan kop Kejati NTT, tabel proyek, dan rekomendasi mitigasi untuk arsip atau disposisi pimpinan.' })
          ]),

          new Paragraph({ children: [new PageBreak()] }),

          // ───────────────────────────────────────────────────────────────────
          // BAB 3: PANDUAN PENGGUNAAN PORTAL MANDIRI PEMOHON
          // ───────────────────────────────────────────────────────────────────
          h1('BAB 3: PANDUAN PENGGUNAAN PORTAL MANDIRI PEMOHON (KLIEN)'),

          h2('3.1 Masuk ke Portal Menggunakan PIN Keamanan'),
          p(
            'Instansi pemohon (Kementerian, Dinas PUPR, Pemda, BUMN/BUMD) diberikan tautan portal mandiri khusus yang dapat diakses secara transparan menggunakan kode PIN 6 digit yang diterbitkan oleh Kejati NTT.'
          ),
          ...imageFigure(
            '07_portal_pemohon_login.png',
            'Gambar 3.1: Layar Autentikasi Portal Pemohon Mandiri Berbasis Kode PIN 6 Digit'
          ),
          p('Cara Masuk:'),
          bullet([new TextRun({ text: '1. Buka tautan portal yang diberikan oleh Tim JPN Kejati NTT di peramban komputer atau HP Anda.' })]),
          bullet([new TextRun({ text: '2. Masukkan 6 Digit Kode PIN Keamanan Anda pada kotak input (Gambar 3.1).' })]),
          bullet([new TextRun({ text: '3. Klik tombol "Masuk ke Portal".' })]),

          h2('3.2 Beranda Portal Pemohon & Status Berkas'),
          p(
            'Setelah PIN berhasil diverifikasi, pemohon dapat langsung melihat tracker tahapan berkas, ringkasan kontrak proyek, dan status penyerapan anggaran:'
          ),
          ...imageFigure(
            '08_portal_pemohon_dashboard.png',
            'Gambar 3.2: Tampilan Utama Portal Pemohon Menampilkan Tracker Tahapan & Tombol Lapor Progres'
          ),
          p('Informasi yang Disajikan:'),
          bullet([new TextRun({ text: 'Tracker Tahapan: ', bold: true }), new TextRun({ text: 'Mengetahui apakah berkas sedang ditelaah atau telah terbit Surat Perintah Pendampingan (SP-2).' })]),
          bullet([new TextRun({ text: 'Ringkasan Anggaran & Batang Progres: ', bold: true }), new TextRun({ text: 'Memantau akumulasi dana yang telah dicairkan dan perbandingannya dengan kemajuan fisik.' })]),
          bullet([new TextRun({ text: 'Tombol "Laporkan Progres Berkala": ', bold: true }), new TextRun({ text: 'Tombol berwarna biru/putih untuk membuka formulir pelaporan kemajuan pekerjaan berkala.' })]),

          new Paragraph({ children: [new PageBreak()] }),

          h2('3.3 Pengisian Formulir Laporan Progres Berkala & Pencairan Dana'),
          p(
            'Pemohon wajib menyampaikan laporan kemajuan pekerjaan secara berkala melalui formulir laporan terintegrasi:'
          ),
          ...imageFigure(
            '09_portal_laporan_progres.png',
            'Gambar 3.3: Formulir Pelaporan Progres Fisik, Realisasi Pencairan Dana, dan Hambatan Teknis'
          ),
          p('Panduan Mengisi Formulir Laporan (Gambar 3.3):'),
          bullet([
            new TextRun({ text: '1. Kemajuan / Progres Fisik (%): ', bold: true }),
            new TextRun({ text: 'Ketikkan angka capaian persentase pekerjaan di lapangan (contoh: 75).' })
          ]),
          bullet([
            new TextRun({ text: '2. Realisasi Pencairan Anggaran (Rp) [Khusus Infrastruktur]: ', bold: true }),
            new TextRun({ text: 'Ketikkan nominal rupiah dana yang dicairkan pada periode laporan ini (contoh: 4.500.000.000). Sistem otomatis menghitung persentase pencairannya.' })
          ]),
          bullet([
            new TextRun({ text: '3. Hambatan / Kendala Lapangan: ', bold: true }),
            new TextRun({ text: 'Uraikan kendala riil (cuaca, sengketa lahan, mobilisasi alat berat, deviasi material).' })
          ]),
          bullet([
            new TextRun({ text: '4. Solusi / Upaya yang Sedang Dilakukan: ', bold: true }),
            new TextRun({ text: 'Uraikan langkah penyelesaian yang telah diambil bersama rekanan pelaksana.' })
          ]),
          bullet([
            new TextRun({ text: '5. Tautan Google Drive Dokumen Pendukung: ', bold: true }),
            new TextRun({ text: 'Sematkan link Google Drive laporan pengawas atau berita acara termin pembayaran.' })
          ]),
          bullet([
            new TextRun({ text: '6. Klik tombol "Kirim Laporan Progres": ', bold: true }),
            new TextRun({ text: 'Data langsung terkirim dan ternotifikasi ke meja Jaksa Pengacara Negara Kejati NTT.' })
          ]),

          new Paragraph({ children: [new PageBreak()] }),

          // ───────────────────────────────────────────────────────────────────
          // BAB 4: PENGATURAN SISTEM & AI
          // ───────────────────────────────────────────────────────────────────
          h1('BAB 4: PENGATURAN SISTEM & KECERDASAN BUATAN (AI GEMINI)'),

          h2('4.1 Halaman Pengaturan AI'),
          p(
            'Menu "Pengaturan AI" pada sidebar internal digunakan untuk menghubungkan SIMRISK DATUN dengan kecerdasan buatan Google Gemini:'
          ),
          ...imageFigure(
            '10_pengaturan_ai.png',
            'Gambar 4.1: Halaman Pengaturan Sistem untuk Input API Key Google Gemini & Pilihan Model AI'
          ),
          p('Cara Konfigurasi:'),
          bullet([new TextRun({ text: '1. Buka laman ' }), new TextRun({ text: 'https://aistudio.google.com/', bold: true }), new TextRun({ text: ' untuk membuat API Key gratis.' })]),
          bullet([new TextRun({ text: '2. Tempelkan kode API Key (diawali "AIzaSy...") ke dalam kolom "API Key Gemini" (Gambar 4.1).' })]),
          bullet([new TextRun({ text: '3. Pada dropdown "Model AI", pilih ' }), new TextRun({ text: 'Gemini 3.8 Flash', bold: true }), new TextRun({ text: ' untuk kecepatan respon tertinggi atau Gemini 2.5 Pro untuk kajian kompleks.' })]),
          bullet([new TextRun({ text: '4. Klik tombol "Simpan Pengaturan".' })]),

          new Paragraph({ text: '', spacing: { before: 80, after: 80 } }),
          callout(
            'KEAMANAN DATA TINGKAT TINGGI',
            'API Key Anda hanya tersimpan di Local Storage komputer Anda sendiri, tidak dikirimkan ke server lain mana pun selain ke server resmi Google API dengan enkripsi SSL/TLS tingkat tinggi.',
            'success'
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ───────────────────────────────────────────────────────────────────
          // BAB 5: FAQ & TROUBLESHOOTING
          // ───────────────────────────────────────────────────────────────────
          h1('BAB 5: TANYA JAWAB (FAQ) & TROUBLESHOOTING PENGGUNA AWAM'),

          createStyledTable(
            ['KENDALA / PERTANYAAN', 'SOLUSI & PANDUAN CEPAT'],
            [
              [
                'Lupa Kode PIN Masuk Portal Pemohon',
                'Hubungi Jaksa Pengacara Negara (JPN) pendamping Anda. JPN dapat melihat kembali PIN Anda di halaman detail permohonan sistem internal dan mengirimkannya kembali.'
              ],
              [
                'Kolom Realisasi Pencairan Anggaran Tidak Muncul',
                'Kolom pencairan dana hanya dirancang aktif pada kategori "Pendampingan Hukum Proyek Infrastruktur". Pada permohonan "Pemulihan Aset", formulir yang muncul adalah rincian objek dan nilai aset.'
              ],
              [
                'Layar Pratinjau Dokumen PDF Berwarna Abu-Abu',
                'Pastikan link Google Drive Anda telah disetel izin berbaginya ke "Anyone with the link can view" (Siapa saja yang memiliki link dapat melihat).'
              ],
              [
                'Analisis AI Menampilkan Pesan Error',
                'Pastikan API Key Google Gemini telah dimasukkan dengan benar pada menu Pengaturan (Bab 4) dan perangkat Anda terhubung ke internet.'
              ]
            ],
            [35, 65]
          ),

          new Paragraph({ text: '', spacing: { before: 200, after: 100 } }),
          h2('5.1 Kontak Layanan Bantuan Kejati NTT'),
          p(
            'Apabila terdapat pertanyaan teknis lebih lanjut atau membutuhkan konsultasi materi hukum kedatunan, silakan menghubungi Sekretariat Asisten Perdata dan Tata Usaha Negara (Asdatun) Kejaksaan Tinggi Nusa Tenggara Timur, Jalan Polisi Militer No. 1, Kota Kupang.'
          ),

          new Paragraph({ text: '', spacing: { before: 400, after: 80 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Kupang, September 2026',
                size: 22,
                color: C.TEXT_MAIN,
                font: 'Calibri'
              })
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 300, after: 60 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'TIM PENGEMBANG & PENGELOLA SISTEM SIMRISK DATUN\nKEJAKSAAN TINGGI NUSA TENGGARA TIMUR',
                bold: true,
                size: 22,
                color: C.NAVY_PRIMARY,
                font: 'Calibri'
              })
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { after: 150 }
          })
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.resolve('PANDUAN_PENGGUNAAN_SIMRISK_DATUN.docx');
  fs.writeFileSync(outPath, buffer);
  console.log(`Document successfully generated at: ${outPath} (${buffer.length} bytes)`);

  const artifactDir = path.resolve('C:\\Users\\JD24\\.gemini\\antigravity-ide\\brain\\9a538244-e41f-4cf4-bd38-580e6c1247f0');
  if (fs.existsSync(artifactDir)) {
    const artifactOut = path.join(artifactDir, 'PANDUAN_PENGGUNAAN_SIMRISK_DATUN.docx');
    fs.writeFileSync(artifactOut, buffer);
    console.log(`Artifact copy saved at: ${artifactOut}`);
  }
}

buildDocument().catch(err => {
  console.error('Error generating document:', err);
  process.exit(1);
});
