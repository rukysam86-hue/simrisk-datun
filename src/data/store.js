import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'simrisk_datun_data';

// Data contoh realistis untuk kebutuhan pengujian & demo SIMRISK DATUN Kejati NTT
const INITIAL_MOCK_DATA = [
  {
    id: 'demo123',
    currentStep: 4,
    suratData: {
      kategoriPermohonan: 'Pendampingan Hukum Proyek Infrastruktur',
      namaPemohon: 'Dinas Pekerjaan Umum dan Penataan Ruang (PUPR) Provinsi NTT',
      nomorSurat: '600/142/PUPR-NTT/VII/2026',
      tanggalSurat: '2026-07-15',
      perihal: 'Permohonan Pendampingan Hukum Proyek Pembangunan Jembatan Kembar Liliba Kota Kupang',
      linkSurat: 'https://drive.google.com/file/d/1demo-surat-pupr-liliba/preview',
      pin: 'demo123'
    },
    sp1Data: {
      nomorSp1: 'PRINT-104/N.3/Datun/07/2026',
      tanggalSp1: '2026-07-20',
      linkSp1: 'https://drive.google.com/file/d/1demo-sp1-liliba/preview',
      timJpn: [
        { nama: 'Hendrik S., S.H., M.H.', nip: '19760512 200112 1 002', jabatan: 'Koordinator Datun (Ketua Tim)' },
        { nama: 'Maria F. Bria, S.H.', nip: '19820315 200604 2 004', jabatan: 'Kasi Perdata (Anggota)' },
        { nama: 'Yoseph G. Lape, S.H.', nip: '19880721 201212 1 001', jabatan: 'Jaksa Fungsional (Anggota)' }
      ]
    },
    telaahData: {
      pembuat: 'Kasi Perdata',
      tanggal: '2026-07-28',
      kesimpulan: 'Dapat Didampingi secara yuridis preventif guna memitigasi risiko hukum kontrak dan pengadaan barang/jasa.',
      dapatDidampingi: 'ya',
      linkTelaah: 'https://drive.google.com/file/d/1demo-telaah-s5/preview'
    },
    sp2Data: {
      nomorSp2: 'PRINT-128/N.3/Datun/08/2026',
      tanggalSp2: '2026-08-05',
      linkSp2: 'https://drive.google.com/file/d/1demo-sp2-liliba/preview',
      timJpn: [
        { nama: 'Hendrik S., S.H., M.H.', nip: '19760512 200112 1 002', jabatan: 'Ketua Tim JPN' },
        { nama: 'Maria F. Bria, S.H.', nip: '19820315 200604 2 004', jabatan: 'Anggota Tim JPN' },
        { nama: 'Yoseph G. Lape, S.H.', nip: '19880721 201212 1 001', jabatan: 'Anggota Tim JPN' }
      ]
    },
    monitoring: {
      kegiatan: 'Pembangunan Jembatan Kembar Liliba Kota Kupang',
      nilai: 45000000000,
      realisasiPencairan: 9000000000,
      persentasePencairan: '20.0%',
      kasusPosisi: 'Proyek pembangunan jembatan kembar Liliba dengan bentang 140 meter menghubungkan wilayah Oebobo dan Maulafa Kota Kupang dengan pagu dana APBD Provinsi NTT TA 2026.',
      hambatan: 'Relokasi utilitas pipa transmisi PDAM dan tiang listrik PLN di area abutment barat.',
      solusi: 'Koordinasi terpadu lintas instansi bersama Pemkot Kupang, PDAM, dan PLN.',
      risk: 'medium',
      adminNotes: 'Tim JPN merekomendasikan percepatan adendum utilitas dan memastikan jaminan uang muka rekanan tetap aktif.',
      linkSaranPdf: 'https://drive.google.com/file/d/1demo-surat-saran-jpn/preview',
      aiAnalysis: '### Telaahan Yuridis Terintegrasi (AI Gemini - JPN)\n\n**1. Aspek Legalitas Kontrak & Prosedur:**\nPelaksanaan kontrak telah memenuhi ketentuan Perpres Pengadaan Barang/Jasa Pemerintah. Perlu diperhatikan batas akhir masa pelaksanaan kontrak pada Desember 2026.\n\n**2. Evaluasi Deviasi Fisik vs Keuangan:**\nCapaian fisik (58%) berada seimbang dengan realisasi keuangan kumulatif (60%). Rasio deviasi sebesar -2% tergolong dalam batas toleransi wajar (Deviasi Normal). Pembayaran termin telah berbasis Berita Acara MC Konsultan Pengawas.\n\n**3. Mitigasi Risiko Preventif:**\n- Pastikan jaminan pelaksanaan (Performance Bond) dan jaminan uang muka diperpanjang sebelum masa berlakunya berakhir.\n- Pengawasan ketat terhadap uji mutu beton dan pembebanan struktur jembatan.',
      initialData: {
        kegiatan: 'Pembangunan Jembatan Kembar Liliba Kota Kupang',
        nilai: 45000000000,
        realisasiPencairan: 9000000000,
        persentasePencairan: '20.0%',
        kasusPosisi: 'Proyek pembangunan jembatan kembar Liliba dengan bentang 140 meter menghubungkan wilayah Oebobo dan Maulafa Kota Kupang.',
        hambatan: 'Relokasi utilitas pipa PDAM dan jaringan listrik PLN.'
      },
      reports: [
        {
          tanggal: '2026-08-15',
          progres: '35%',
          realisasiPencairan: 9000000000,
          persentasePencairan: '20.0%',
          totalPencairanKumulatif: 18000000000,
          persentaseKumulatif: '40.0%',
          hambatan: 'Tahap pemancangan tiang pancang pilar tengah jembatan.',
          solusi: 'Pengerahan alat berat crane tambahan untuk percepatan.',
          linkDokumen: 'https://drive.google.com/file/d/1demo-laporan-1/preview'
        },
        {
          tanggal: '2026-09-10',
          progres: '58%',
          realisasiPencairan: 9000000000,
          persentasePencairan: '20.0%',
          totalPencairanKumulatif: 27000000000,
          persentaseKumulatif: '60.0%',
          hambatan: 'Pengecoran gelagar utama geladak jembatan bentang kedua.',
          solusi: 'Pemberlakuan shift malam dan penyesuaian rekayasa lalu lintas.',
          linkDokumen: 'https://drive.google.com/file/d/1demo-laporan-2/preview'
        }
      ]
    }
  },
  {
    id: 'aset456',
    currentStep: 3,
    suratData: {
      kategoriPermohonan: 'Pendampingan Pemulihan/Penyelamatan Aset',
      namaPemohon: 'Badan Keuangan dan Aset Daerah (BKAD) Kota Kupang',
      nomorSurat: '028/318/BKAD/VIII/2026',
      tanggalSurat: '2026-08-02',
      perihal: 'Permohonan Pendampingan Pemulihan Aset Tanah dan Gedung Eks Kantor Dinas Perikanan',
      linkSurat: 'https://drive.google.com/file/d/1demo-surat-aset/preview',
      pin: 'aset456'
    },
    sp1Data: {
      nomorSp1: 'PRINT-112/N.3/Datun/08/2026',
      tanggalSp1: '2026-08-10',
      timJpn: [
        { nama: 'Maria F. Bria, S.H.', nip: '19820315 200604 2 004', jabatan: 'Kasi Perdata (Ketua Tim)' },
        { nama: 'Agus Salim, S.H.', nip: '19850614 200912 1 003', jabatan: 'Jaksa Fungsional (Anggota)' }
      ]
    },
    telaahData: {
      pembuat: 'Kasi Perdata',
      tanggal: '2026-08-25',
      kesimpulan: 'Sedang dalam proses telaahan hukum sertifikasi dan penelusuran riwayat penguasaan fisik tanah.',
      dapatDidampingi: 'ya'
    },
    monitoring: {
      kegiatan: 'Pemulihan Aset Tanah & Gedung Eks Kantor Dinas Perikanan',
      nilai: 12500000000,
      jenisAset: ['Tanah seluas 3.400 m2', 'Bangunan Kantor 2 Lantai'],
      kasusPosisi: 'Aset tanah tercatat di KIB A Pemkot Kupang, namun sebagian area dikuasai tanpa izin oleh pihak ketiga.',
      hambatan: 'Klaim sepihak dari ahli waris mantan pejabat tanpa alas hak yang sah.',
      solusi: 'Pendekatan persuasif dan mediasi non-litigasi oleh Jaksa Pengacara Negara.',
      risk: 'high'
    }
  },
  {
    id: 'bws789',
    currentStep: 2,
    suratData: {
      kategoriPermohonan: 'Pendampingan Hukum Proyek Infrastruktur',
      namaPemohon: 'Balai Wilayah Sungai (BWS) Nusa Tenggara II',
      nomorSurat: 'PW.01.02/BWS-NT2/89/2026',
      tanggalSurat: '2026-08-20',
      perihal: 'Permohonan Pendampingan Hukum Pembangunan Saluran Irigasi Sekunder Daerah Irigasi Mbay Kanan',
      linkSurat: 'https://drive.google.com/file/d/1demo-surat-bws/preview',
      pin: 'bws789'
    },
    sp1Data: {
      nomorSp1: 'PRINT-118/N.3/Datun/08/2026',
      tanggalSp1: '2026-08-28',
      timJpn: [
        { nama: 'Hendrik S., S.H., M.H.', nip: '19760512 200112 1 002', jabatan: 'Koordinator Datun' },
        { nama: 'Yoseph G. Lape, S.H.', nip: '19880721 201212 1 001', jabatan: 'Jaksa Fungsional' }
      ]
    },
    monitoring: {
      kegiatan: 'Pembangunan Saluran Irigasi Sekunder DI Mbay Kanan',
      nilai: 18200000000,
      realisasiPencairan: 3640000000,
      persentasePencairan: '20.0%',
      kasusPosisi: 'Pekerjaan jaringan irigasi sekunder sepanjang 8,4 km untuk mendukung ketahanan pangan di Kabupaten Nagekeo.',
      risk: 'low'
    }
  },
  {
    id: 'pln101',
    currentStep: 1,
    suratData: {
      kategoriPermohonan: 'Pendampingan Hukum Proyek Infrastruktur',
      namaPemohon: 'PT PLN (Persero) Unit Induk Wilayah Nusa Tenggara Timur',
      nomorSurat: '045/PLN-NTT/IX/2026',
      tanggalSurat: '2026-09-10',
      perihal: 'Pendampingan Hukum Pengadaan Tanah Tapak Tower Transmisi SUTT 150 kV Kupang - Semau',
      linkSurat: 'https://drive.google.com/file/d/1demo-surat-pln/preview',
      pin: 'pln101'
    }
  }
];

// Helper Local Storage
const getLocalStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_DATA));
      return INITIAL_MOCK_DATA;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_MOCK_DATA;
  } catch (err) {
    console.warn('LocalStorage error, using INITIAL_MOCK_DATA:', err);
    return INITIAL_MOCK_DATA;
  }
};

const saveLocalStore = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage save error:', err);
  }
};

export const getAllPermohonan = async () => {
  if (isSupabaseConfigured) {
    try {
      console.log('[Supabase] Mengambil semua data permohonan...');
      const response = await supabase
        .from('permohonan')
        .select('*')
        .order('currentStep', { ascending: true });
      if (!response.error && response.data && response.data.length > 0) {
        return response.data;
      }
    } catch (err) {
      console.warn('[Supabase] Gagal mengambil data, menggunakan fallback localStorage:', err);
    }
  }
  return getLocalStore();
};

export const getPermohonanById = async (id) => {
  if (isSupabaseConfigured) {
    try {
      console.log(`[Supabase] Mengambil data permohonan ID: ${id}...`);
      const response = await supabase
        .from('permohonan')
        .select('*')
        .eq('id', id)
        .single();
      if (!response.error && response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn(`[Supabase] Gagal get ID ${id}, cek localStorage:`, err);
    }
  }
  const store = getLocalStore();
  return store.find(item => item.id === id) || null;
};

export const addPermohonan = async (newPermohonan) => {
  if (isSupabaseConfigured) {
    try {
      const response = await supabase
        .from('permohonan')
        .insert([newPermohonan])
        .select()
        .single();
      if (!response.error && response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn('[Supabase] Gagal add, menyimpan ke localStorage:', err);
    }
  }
  const store = getLocalStore();
  const updated = [newPermohonan, ...store];
  saveLocalStore(updated);
  return newPermohonan;
};

export const updatePermohonan = async (id, updatedData) => {
  if (isSupabaseConfigured) {
    try {
      const response = await supabase
        .from('permohonan')
        .update(updatedData)
        .eq('id', id)
        .select()
        .single();
      if (!response.error && response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn(`[Supabase] Gagal update ${id}, update ke localStorage:`, err);
    }
  }
  const store = getLocalStore();
  const index = store.findIndex(item => item.id === id);
  if (index !== -1) {
    store[index] = { ...store[index], ...updatedData };
    saveLocalStore(store);
    return store[index];
  }
  return null;
};

export const deletePermohonan = async (id) => {
  if (isSupabaseConfigured) {
    try {
      const response = await supabase
        .from('permohonan')
        .delete()
        .eq('id', id);
      if (!response.error) return true;
    } catch (err) {
      console.warn(`[Supabase] Gagal delete ${id}:`, err);
    }
  }
  const store = getLocalStore();
  const updatedStore = store.filter(item => item.id !== id);
  saveLocalStore(updatedStore);
  return true;
};

export const generateId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
