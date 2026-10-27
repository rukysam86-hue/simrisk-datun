// Konfigurasi Indikator Early Warning System (EWS) SIMRISK DATUN Kejaksaan Tinggi NTT
// Berdasarkan modul Early Warning Pendampingan Hukum Jaksa Pengacara Negara (JPN)

export const EARLY_WARNING_INDICATORS = [
  {
    id: 'dokumenBelumLengkap',
    label: 'Dokumen Belum Lengkap',
    question: 'Apakah terdapat dokumen administrasi, legalitas perizinan, atau berkas pendukung kontrak yang belum dilengkapi oleh pemohon?',
    weight: 1,
    dangerText: 'Dokumen administrasi/legalitas belum lengkap, berpotensi menimbulkan cacat prosedural hukum.',
  },
  {
    id: 'kontrakMendekatiBerakhir',
    label: 'Kontrak Mendekati Berakhir',
    question: 'Apakah sisa masa berlaku pelaksanaan kontrak sudah mendekati batas akhir sementara pekerjaan belum tuntas?',
    weight: 1,
    dangerText: 'Masa kontrak mendekati berakhir, berisiko klaim denda keterlambatan atau pemutusan sepihak.',
  },
  {
    id: 'keterlambatan',
    label: 'Keterlambatan / Deviasi Progres Fisik',
    question: 'Apakah terjadi keterlambatan kemajuan fisik lapangan atau deviasi negatif yang signifikan terhadap Kurva S rencana?',
    weight: 1,
    dangerText: 'Terjadi deviasi negatif progres fisik terhadap rencana jadwal pelaksanaan.',
  },
  {
    id: 'perubahanRegulasi',
    label: 'Perubahan Regulasi / Kebijakan',
    question: 'Apakah terdapat perubahan regulasi, perizinan baru, atau kebijakan pemerintah yang berdampak langsung pada pelaksanaan proyek?',
    weight: 1,
    dangerText: 'Terdapat perubahan regulasi atau kebijakan yang berpotensi mempengaruhi kepatuhan hukum proyek.',
  },
  {
    id: 'rekomendasiBelumDitindaklanjuti',
    label: 'Rekomendasi Belum Ditindaklanjuti',
    question: 'Apakah saran tindakan, telaahan, atau rekomendasi mitigasi JPN pada periode sebelumnya belum ditindaklanjuti oleh pemohon?',
    weight: 1,
    dangerText: 'Rekomendasi atau saran preventif JPN periode sebelumnya belum dilaksanakan.',
  },
  {
    id: 'potensiSengketa',
    label: 'Potensi Sengketa Hukum / Klaim',
    question: 'Apakah terindikasi adanya potensi perselisihan perdata, somasi rekanan, klaim pihak ketiga, atau penolakan masyarakat?',
    weight: 2, // Bobot kritis
    dangerText: 'Terindikasi potensi perselisihan perdata / tata usaha negara yang memerlukan antisipasi yuridis cepat.',
  },
  {
    id: 'deviasiKontrak',
    label: 'Deviasi Kontrak / Pekerjaan Tambah Kurang',
    question: 'Apakah terdapat deviasi klausul kontrak, perubahan spesifikasi substansial, atau pekerjaan tambah-kurang tanpa dasar adendum sah?',
    weight: 2, // Bobot kritis
    dangerText: 'Terjadi deviasi klausul kontrak atau perubahan spesifikasi tanpa dasar adendum yang sah.',
  },
  {
    id: 'kenaikanLevelRisiko',
    label: 'Kenaikan Level Risiko Proyek',
    question: 'Apakah secara komprehensif terdapat tren eskalasi atau peningkatan level kerawanan risiko dibanding laporan sebelumnya?',
    weight: 1,
    dangerText: 'Terdapat tren eskalasi kerawanan proyek yang memerlukan pengawasan ketat JPN.',
  },
];

export const DEFAULT_EARLY_WARNING = {
  dokumenBelumLengkap: 'tidak',
  kontrakMendekatiBerakhir: 'tidak',
  keterlambatan: 'tidak',
  perubahanRegulasi: 'tidak',
  rekomendasiBelumDitindaklanjuti: 'tidak',
  potensiSengketa: 'tidak',
  deviasiKontrak: 'tidak',
  kenaikanLevelRisiko: 'tidak',
};

/**
 * Menghitung tingkat risiko berdasarkan indikator Early Warning yang diinput admin.
 * @param {Object} earlyWarningState
 * @returns {Object} { level: 'low' | 'medium' | 'high', score: number, activeCount: number, activeItems: Array, description: string }
 */
export function calculateEarlyWarningRisk(earlyWarningState) {
  const state = earlyWarningState || DEFAULT_EARLY_WARNING;
  let totalScore = 0;
  let activeCount = 0;
  const activeItems = [];

  EARLY_WARNING_INDICATORS.forEach(item => {
    if (state[item.id] === 'ya') {
      totalScore += item.weight;
      activeCount += 1;
      activeItems.push(item);
    }
  });

  let level = 'low';
  let description = 'Seluruh indikator Early Warning terkendali (Risiko Rendah).';

  // Kriteria kalkulasi risiko:
  // - Jika indikator kritis (potensi sengketa atau deviasi kontrak) bernilai 'ya', otomatis minimal High
  // - Atau jika total skor >= 3: High
  // - Jika total skor 1 - 2: Medium
  // - Jika total skor 0: Low
  if (state.potensiSengketa === 'ya' || state.deviasiKontrak === 'ya' || totalScore >= 3) {
    level = 'high';
    description = `Terdeteksi ${activeCount} indikator peringatan dini berkategori KRITIS. Memerlukan mitigasi yuridis segera oleh JPN.`;
  } else if (totalScore >= 1) {
    level = 'medium';
    description = `Terdeteksi ${activeCount} indikator peringatan dini (PERLU PERHATIAN). JPN merekomendasikan pemantauan berkala.`;
  }

  return {
    level,
    score: totalScore,
    activeCount,
    activeItems,
    description,
  };
}
