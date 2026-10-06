import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, FileText, ShieldAlert, Download, Edit3, Save, X, Trash2, Activity, Sparkles, Plus, ExternalLink, Copy, FileDown, DollarSign, CreditCard, TrendingUp, Wallet, CheckCircle2, AlertTriangle, Folder, Users } from 'lucide-react';
import { getPermohonanById, updatePermohonan, deletePermohonan, getMasterJpnList } from '../data/store';
import ReactMarkdown from 'react-markdown';
import { downloadAnalysisAsDocx } from '../lib/docxGenerator';
import DriveFileUpload from '../components/DriveFileUpload';

function DetailPermohonan() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [suratData, setSuratData] = useState({});
  const [activePdf, setActivePdf] = useState('permohonan'); // Kept for logic if needed, but we'll use modal
  const [isViewingPdf, setIsViewingPdf] = useState(false);
  const [pdfUrlToView, setPdfUrlToView] = useState('');
  const [pdfTitleToView, setPdfTitleToView] = useState('');
  const [currentStep, setCurrentStep] = useState(2);
  const [activeAccordionStep, setActiveAccordionStep] = useState(2);
  
  const [monitoringData, setMonitoringData] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [isEditingAiResponse, setIsEditingAiResponse] = useState(false);
  const [adminRiskLevel, setAdminRiskLevel] = useState('low');
  const [adminRiskNotes, setAdminRiskNotes] = useState('');
  
  // -1 means assessing "Data Awal", 0+ means assessing a report index. null means closed.
  const [assessingReportIndex, setAssessingReportIndex] = useState(null);
  const [adminSaranDriveUrl, setAdminSaranDriveUrl] = useState('');

  // States for Admin inputting Data Awal directly
  const [isAddingInitialData, setIsAddingInitialData] = useState(false);
  const [formKegiatan, setFormKegiatan] = useState('');
  const [formNilai, setFormNilai] = useState('');
  const [formRealisasiPencairan, setFormRealisasiPencairan] = useState('');
  const [formPersentasePencairan, setFormPersentasePencairan] = useState('');
  const [formKasusPosisi, setFormKasusPosisi] = useState('');
  const [formPermasalahan, setFormPermasalahan] = useState('');
  const [formJenisAset, setFormJenisAset] = useState(['']);
  const [formProgres, setFormProgres] = useState('');
  const [formPersentase, setFormPersentase] = useState('');
  const [formHambatan, setFormHambatan] = useState('');
  const [formKeterangan, setFormKeterangan] = useState('');

  const [isEditingSP1, setIsEditingSP1] = useState(false);
  const [sp1Data, setSp1Data] = useState({ timJpn: [] });

  const [isEditingTelaah, setIsEditingTelaah] = useState(false);
  const [telaahData, setTelaahData] = useState({});

  const [isEditingSP2, setIsEditingSP2] = useState(false);
  const [sp2Data, setSp2Data] = useState({ timJpn: [] });

  useEffect(() => {
    const fetchData = async () => {
      const data = await getPermohonanById(id);
      if (data) {
        setCurrentStep(data.currentStep);
        setActiveAccordionStep(data.currentStep);
        setSuratData(data.suratData || {});
        setSp1Data(data.sp1Data || { timJpn: [] });
        setTelaahData(data.telaahData || {});
        setSp2Data(data.sp2Data || { timJpn: [] });
        
        if (data.monitoring) {
          setMonitoringData(data.monitoring);
          if (data.monitoring.aiAnalysis) setAiResponse(data.monitoring.aiAnalysis);
          if (data.monitoring.risk) setAdminRiskLevel(data.monitoring.risk);
          if (data.monitoring.adminNotes) setAdminRiskNotes(data.monitoring.adminNotes);
        }
        setIsLoading(false);
      } else {
        alert('Permohonan tidak ditemukan!');
        navigate('/');
      }
    };
    
    fetchData();
  }, [id, navigate]);

  const saveToDb = async (step, surat, sp1, telaah, sp2) => {
    await updatePermohonan(id, {
      currentStep: step !== undefined ? step : currentStep,
      suratData: surat || suratData,
      sp1Data: sp1 || sp1Data,
      telaahData: telaah || telaahData,
      sp2Data: sp2 || sp2Data
    });
  };

  // States are defined at the top of the component
  
  const openPdfViewer = (url, title) => {
    setPdfUrlToView(url);
    setPdfTitleToView(title);
    setIsViewingPdf(true);
  };
  const [masterJpnList, setMasterJpnList] = useState([]);

  useEffect(() => {
    setMasterJpnList(getMasterJpnList());
  }, []);

  const tambahJpn = () => setSp1Data({ ...sp1Data, timJpn: [...(sp1Data.timJpn || []), { nama: '', nip: '', jabatan: '' }] });
  const hapusJpn = (idx) => setSp1Data({ ...sp1Data, timJpn: (sp1Data.timJpn || []).filter((_, i) => i !== idx) });
  const updateJpn = (idx, field, val) => {
    const baru = [...(sp1Data.timJpn || [])];
    baru[idx][field] = val;
    setSp1Data({ ...sp1Data, timJpn: baru });
  };

  const handleAutoFillAllJpnSp1 = () => {
    const list = getMasterJpnList();
    const mapped = list.map(j => ({
      nama: j.nama,
      nip: j.nip,
      jabatan: j.jabatan || 'Jaksa Pengacara Negara'
    }));
    setSp1Data({ ...sp1Data, timJpn: mapped });
  };

  const handleSelectMasterJpnForSp1 = (index, jpnId) => {
    if (!jpnId) return;
    const selected = masterJpnList.find(j => j.id === jpnId);
    if (!selected) return;
    const baru = [...(sp1Data.timJpn || [])];
    baru[index] = {
      ...baru[index],
      nama: selected.nama,
      nip: selected.nip,
      jabatan: selected.jabatan
    };
    setSp1Data({ ...sp1Data, timJpn: baru });
  };

  const tambahJpnSp2 = () => setSp2Data({ ...sp2Data, timJpn: [...(sp2Data.timJpn || []), { nama: '', nip: '', jabatan: '' }] });
  const hapusJpnSp2 = (idx) => setSp2Data({ ...sp2Data, timJpn: (sp2Data.timJpn || []).filter((_, i) => i !== idx) });
  const updateJpnSp2 = (idx, field, val) => {
    const baru = [...(sp2Data.timJpn || [])];
    baru[idx][field] = val;
    setSp2Data({ ...sp2Data, timJpn: baru });
  };

  const handleAutoFillAllJpnSp2 = () => {
    const list = getMasterJpnList();
    const mapped = list.map(j => ({
      nama: j.nama,
      nip: j.nip,
      jabatan: j.jabatan || 'Jaksa Pengacara Negara'
    }));
    setSp2Data({ ...sp2Data, timJpn: mapped });
  };

  const handleCopyJpnFromSp1ToSp2 = () => {
    if (!sp1Data.timJpn || sp1Data.timJpn.length === 0) {
      alert('Tim JPN pada SP-1 belum diisi.');
      return;
    }
    setSp2Data({ ...sp2Data, timJpn: [...sp1Data.timJpn] });
  };

  const handleSelectMasterJpnForSp2 = (index, jpnId) => {
    if (!jpnId) return;
    const selected = masterJpnList.find(j => j.id === jpnId);
    if (!selected) return;
    const baru = [...(sp2Data.timJpn || [])];
    baru[index] = {
      ...baru[index],
      nama: selected.nama,
      nip: selected.nip,
      jabatan: selected.jabatan
    };
    setSp2Data({ ...sp2Data, timJpn: baru });
  };

  const handleSaveSP2 = async () => {
    if (window.confirm('Simpan data SP-2?')) {
      setIsEditingSP2(false);
      setCurrentStep(5); // Move to step 5 or completed
      await saveToDb(5, suratData, sp1Data, telaahData, sp2Data);
    }
  };

  const handleSaveTelaah = async () => {
    if (!telaahData.pembuat) {
      alert("Silakan pilih Pembuat Telaah terlebih dahulu.");
      return;
    }
    if (window.confirm('Simpan hasil Telaahan Hukum S-5?')) {
      setIsEditingTelaah(false);
      let nextStep = currentStep;
      if (telaahData.dapatDidampingi === 'ya') {
        nextStep = 4;
      } else {
        nextStep = 5; // Anggap 5 adalah masuk arsip
      }
      setCurrentStep(nextStep);
      await saveToDb(nextStep, suratData, sp1Data, telaahData, sp2Data);
    }
  };

  // Fungsi untuk mengubah link Google Drive biasa menjadi link embed/preview
  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('drive.google.com/file/d/')) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    return url;
  };

  const isAset = suratData?.kategoriPermohonan === 'Pendampingan Pemulihan/Penyelamatan Aset';
  const isInfrastruktur = (suratData?.kategoriPermohonan || 'Pendampingan Hukum Proyek Infrastruktur') === 'Pendampingan Hukum Proyek Infrastruktur';

  const handleAddAsetAdmin = () => setFormJenisAset([...formJenisAset, '']);
  const handleRemoveAsetAdmin = (idx) => {
    const baru = [...formJenisAset];
    baru.splice(idx, 1);
    setFormJenisAset(baru);
  };
  const handleAsetChangeAdmin = (idx, val) => {
    const baru = [...formJenisAset];
    baru[idx] = val;
    setFormJenisAset(baru);
  };

  const formatRupiah = (value) => {
    const numberString = (value || '').toString().replace(/[^,\d]/g, '');
    const split = numberString.split(',');
    const sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
      const separator = sisa ? '.' : '';
      rupiah += separator + ribuan.join('.');
    }

    return split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
  };

  const formatCurrency = (value) => {
    const num = Number(value) || 0;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  const getDisbursementStats = () => {
    const totalAnggaran = monitoringData?.nilai || 0;
    const initialDisbursed = Number(monitoringData?.initialData?.realisasiPencairan || monitoringData?.realisasiPencairan || 0);
    
    let totalKumulatif = initialDisbursed;
    const reports = monitoringData?.reports || [];
    reports.forEach(rep => {
      totalKumulatif += Number(rep.realisasiPencairan || 0);
    });

    const percentKumulatif = totalAnggaran > 0 ? ((totalKumulatif / totalAnggaran) * 100).toFixed(1) : '0';
    const sisa = Math.max(0, totalAnggaran - totalKumulatif);

    return {
      totalAnggaran,
      totalKumulatif,
      percentKumulatif,
      sisa
    };
  };

  const getReportDisbursement = (index) => {
    const totalAnggaran = monitoringData?.nilai || 0;
    if (index === -1) {
      const initVal = Number(monitoringData?.initialData?.realisasiPencairan || monitoringData?.realisasiPencairan || 0);
      const initPct = monitoringData?.initialData?.persentasePencairan || (totalAnggaran > 0 ? `${((initVal / totalAnggaran) * 100).toFixed(1)}%` : '0%');
      return {
        tahap: initVal,
        persenTahap: initPct,
        kumulatif: initVal,
        persenKumulatif: initPct,
        sisa: Math.max(0, totalAnggaran - initVal)
      };
    }

    const reports = monitoringData?.reports || [];
    let kumulatif = Number(monitoringData?.initialData?.realisasiPencairan || monitoringData?.realisasiPencairan || 0);
    for (let i = 0; i <= index; i++) {
      const r = reports[i];
      const val = Number(r?.realisasiPencairan || 0);
      if (i < index) {
        kumulatif += val;
      } else if (i === index) {
        kumulatif += val;
        const pctTahap = r?.persentasePencairan || (totalAnggaran > 0 ? `${((val / totalAnggaran) * 100).toFixed(1)}%` : '0%');
        const pctKumulatif = r?.persentaseKumulatif || (totalAnggaran > 0 ? `${((kumulatif / totalAnggaran) * 100).toFixed(1)}%` : '0%');
        return {
          tahap: val,
          persenTahap: pctTahap,
          kumulatif: r?.totalPencairanKumulatif || kumulatif,
          persenKumulatif: pctKumulatif,
          sisa: Math.max(0, totalAnggaran - (r?.totalPencairanKumulatif || kumulatif))
        };
      }
    }

    return { tahap: 0, persenTahap: '0%', kumulatif: 0, persenKumulatif: '0%', sisa: totalAnggaran };
  };

  const handleFormRealisasiChange = (value) => {
    const formatted = formatRupiah(value);
    setFormRealisasiPencairan(formatted);
    const numeric = parseInt((value || '').replace(/\./g, ''), 10) || 0;
    const totalAnggaran = parseInt((formNilai || '').replace(/\./g, ''), 10) || 0;
    if (totalAnggaran > 0) {
      const pct = ((numeric / totalAnggaran) * 100).toFixed(1);
      setFormPersentasePencairan(pct);
    }
  };

  const handleFormPersentaseChange = (value) => {
    setFormPersentasePencairan(value);
    const pct = parseFloat(value) || 0;
    const totalAnggaran = parseInt((formNilai || '').replace(/\./g, ''), 10) || 0;
    if (totalAnggaran > 0 && (!formRealisasiPencairan || formRealisasiPencairan === '0')) {
      const nominal = Math.round((pct / 100) * totalAnggaran);
      setFormRealisasiPencairan(formatRupiah(nominal.toString()));
    }
  };

  const handleSaveInitialDataAdmin = async (e) => {
    e.preventDefault();
    const dateStr = new Date().toISOString().split('T')[0];
    const totalAnggaranNum = parseInt((formNilai || '').replace(/\./g, ''), 10) || 0;
    const initDisbursedNum = parseInt((formRealisasiPencairan || '0').replace(/\./g, ''), 10) || 0;
    const initPct = formPersentasePencairan ? `${formPersentasePencairan}%` : (totalAnggaranNum > 0 ? `${((initDisbursedNum / totalAnggaranNum) * 100).toFixed(1)}%` : '0%');
    const initSisa = Math.max(0, totalAnggaranNum - initDisbursedNum);

    const newMonitoring = {
      kegiatan: formKegiatan,
      nilai: totalAnggaranNum,
      kasusPosisi: formKasusPosisi,
      progressKegiatan: formProgres,
      persentaseKegiatan: `${formPersentase}%`,
      ...(isInfrastruktur ? {
        realisasiPencairan: initDisbursedNum,
        persentasePencairan: initPct,
        totalRealisasiPencairan: initDisbursedNum,
        persentasePencairanTotal: initPct,
        sisaAnggaran: initSisa,
      } : {}),
      hambatan: formHambatan,
      keterangan: formKeterangan,
      lastUpdate: dateStr,
      initialData: {
        date: dateStr,
        progressKegiatan: formProgres,
        persentaseKegiatan: `${formPersentase}%`,
        ...(isInfrastruktur ? {
          realisasiPencairan: initDisbursedNum,
          persentasePencairan: initPct,
          totalPencairanKumulatif: initDisbursedNum,
          persentaseKumulatif: initPct,
        } : {}),
        hambatan: formHambatan,
        keterangan: formKeterangan,
        ...(isAset ? { permasalahan: formPermasalahan, jenisAset: formJenisAset.filter(a => a.trim() !== '') } : {})
      },
      reports: []
    };
    await updatePermohonan(id, { monitoring: newMonitoring });
    setMonitoringData(newMonitoring);
    setIsAddingInitialData(false);
    alert('Data Awal (Monev) berhasil disimpan ke Supabase!');
  };

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  const handleSave = async () => {
    setIsEditing(false);
    await saveToDb(currentStep, suratData, sp1Data, telaahData, sp2Data);
    alert('Data surat permohonan berhasil diperbarui!');
  };

  const handleDelete = async () => {
    if (window.confirm('Yakin ingin menghapus permohonan ini secara permanen?')) {
      await deletePermohonan(id);
      navigate('/');
    }
  };

  const handleSaveSP1 = async () => {
    if (window.confirm('Data SP-1 sudah lengkap. Lanjutkan ke tahapan Telaah Hukum?')) {
      setIsEditingSP1(false);
      setCurrentStep(3);
      setActiveAccordionStep(3);
      await saveToDb(3, suratData, sp1Data, telaahData, sp2Data);
    }
  };

  const handleGenerateAIAnalysis = async () => {
    const aiSettings = JSON.parse(localStorage.getItem('simrisk_ai_settings') || '{}');
    const apiKey = aiSettings.apiKey;
    let model = aiSettings.model || 'gemini-3.8-flash';
    if (model.includes('gemini-1.5-flash') || model.includes('gemini-1.5-pro')) {
      model = 'gemini-3.8-flash';
    }

    if (!apiKey) {
      alert('API Key Gemini belum diatur. Silakan masukkan API Key di menu Pengaturan (Settings).');
      return;
    }
    
    setIsAiLoading(true);
    try {
      let prompt = `Anda adalah seorang ahli hukum perdata dan Tata Usaha Negara (TUN) sekaligus Jaksa Pengacara Negara (JPN) yang sangat berpengalaman dalam memberikan pertimbangan hukum atau pendampingan litigasi terhadap proyek permohonan pemerintah, BUMN, atau BUMD.`;
      
      const totalAnggaran = monitoringData.nilai || 0;

      if (assessingReportIndex === -1 || assessingReportIndex === null) {
        if (isInfrastruktur) {
          const info = getReportDisbursement(-1);
          prompt += `\n\nTolong berikan analisis risiko, skor risiko (Rendah/Sedang/Tinggi), serta rekomendasi langkah mitigasi hukum dan teknis untuk proyek ini berdasarkan data awal pemohon:
- Kategori Permohonan: Pendampingan Hukum Proyek Infrastruktur
- Kegiatan: ${monitoringData.kegiatan}
- Total Nilai Anggaran Proyek: Rp ${formatRupiah(totalAnggaran)}
- Realisasi Pencairan Anggaran Awal: Rp ${formatRupiah(info.tahap)} (${info.persenTahap})
- Total Keseluruhan Dicairkan: Rp ${formatRupiah(info.kumulatif)} (${info.persenKumulatif} dari total dana)
- Sisa Anggaran: Rp ${formatRupiah(info.sisa)}
- Kasus Posisi: ${monitoringData.kasusPosisi}
- Progres Fisik: ${monitoringData.initialData?.progressKegiatan || monitoringData.progressKegiatan} (${monitoringData.initialData?.persentaseKegiatan || monitoringData.persentaseKegiatan})
- Hambatan: ${monitoringData.initialData?.hambatan || monitoringData.hambatan}

KORELASI PRESTASI FISIK VS PENCAIRAN ANGGARAN:
- Progres Fisik: ${monitoringData.initialData?.persentaseKegiatan || monitoringData.persentaseKegiatan || '0%'}
- Realisasi Pencairan: ${info.persenKumulatif} (Rp ${formatRupiah(info.kumulatif)})
Evaluasi apakah pencairan uang muka / termin awal ini proporsional sesuai ketentuan kontrak dan perundang-undangan pengadaan, serta mitigasi risiko preventif awal yang perlu dilakukan JPN.`;
        } else {
          prompt += `\n\nTolong berikan analisis risiko, skor risiko (Rendah/Sedang/Tinggi), serta rekomendasi langkah mitigasi hukum dan teknis untuk permohonan ini berdasarkan data awal pemohon:
- Kategori Permohonan: ${suratData?.kategoriPermohonan || '-'}
- Kasus Posisi: ${monitoringData.kasusPosisi}
${isAset ? `- Nilai Total Aset: Rp ${formatRupiah(totalAnggaran)}\n- Permasalahan: ${monitoringData.initialData?.permasalahan || '-'}\n- Jenis Aset: ${(monitoringData.initialData?.jenisAset || []).join(', ')}` : `- Nilai: Rp ${formatRupiah(totalAnggaran)}\n- Progres: ${monitoringData.initialData?.progressKegiatan || monitoringData.progressKegiatan} (${monitoringData.initialData?.persentaseKegiatan || monitoringData.persentaseKegiatan})`}
- Hambatan: ${monitoringData.initialData?.hambatan || monitoringData.hambatan}`;
        }
      } else {
        const report = (monitoringData.reports || [])[assessingReportIndex] || {};
        if (isInfrastruktur) {
          const info = getReportDisbursement(assessingReportIndex);
          
          prompt += `\n\nKonteks Proyek: ${monitoringData.kegiatan} (Total Nilai Anggaran: Rp ${formatRupiah(totalAnggaran)})
Kasus Posisi: ${monitoringData.kasusPosisi}

Riwayat Progres & Pencairan Historis:
- Data Awal: Fisik ${monitoringData.initialData?.persentaseKegiatan || monitoringData.persentaseKegiatan || '0%'}, Pencairan Rp ${formatRupiah(getReportDisbursement(-1).kumulatif)} (${getReportDisbursement(-1).persenKumulatif}), Hambatan: ${monitoringData.initialData?.hambatan || monitoringData.hambatan || '-'}`;

          for(let i = 0; i < assessingReportIndex; i++) {
             const r = (monitoringData.reports || [])[i] || {};
             const rInfo = getReportDisbursement(i);
             prompt += `\n- Progres ${i+1}: Fisik ${r.persentaseKegiatan || '0%'}, Pencairan Tahap Ini Rp ${formatRupiah(rInfo.tahap)} (Total Kumulatif: Rp ${formatRupiah(rInfo.kumulatif)} / ${rInfo.persenKumulatif}), Hambatan: ${r.hambatan || '-'}`;
          }
          
          prompt += `\n\nBerdasarkan riwayat di atas, tolong berikan analisis risiko, skor risiko (Rendah/Sedang/Tinggi), serta rekomendasi langkah mitigasi hukum dan teknis JPN untuk LAPORAN PROGRES TERBARU berikut ini:
- Progres Fisik Saat Ini: ${report.progressKegiatan} (${report.persentaseKegiatan})
- Realisasi Pencairan Anggaran Tahap Ini: Rp ${formatRupiah(info.tahap)} (${info.persenTahap})
- TOTAL KESELURUHAN ANGGARAN YANG SUDAH DICAIRKAN: Rp ${formatRupiah(info.kumulatif)} (${info.persenKumulatif} dari total dana)
- Sisa Anggaran Belum Dicairkan: Rp ${formatRupiah(info.sisa)}
- Hambatan Saat Ini: ${report.hambatan || '-'}
- Keterangan Tambahan: ${report.keterangan || '-'}

ANALISIS KRITIS KORELASI PROGRES FISIK VS REALISASI PENCAIRAN ANGGARAN:
- Progres Fisik: ${report.persentaseKegiatan || '0%'}
- Total Realisasi Pencairan Anggaran: ${info.persenKumulatif} (Rp ${formatRupiah(info.kumulatif)} dari total Rp ${formatRupiah(totalAnggaran)})
Tinjau secara seksama:
1. Apakah terjadi pembayaran mendahului prestasi fisik (kelebihan bayar/overpayment) yang berpotensi menimbulkan risiko hukum kerugian keuangan negara atau wanprestasi penyedia jasa?
2. Atau apakah pencairan anggaran tertunda secara tidak wajar terhadap kemajuan fisik yang berpotensi memicu klaim kontraktual atau penghentian pekerjaan oleh kontraktor?
3. Langkah pencegahan (preventif) dan rekomendasi yuridis Jaksa Pengacara Negara (JPN) bagi instansi pemohon.`;
        } else {
          prompt += `\n\nKonteks Permohonan: ${monitoringData.kegiatan || suratData?.perihal}
Kasus Posisi: ${monitoringData.kasusPosisi}
Riwayat Sebelumnya:
- Data Awal: Hambatan: ${monitoringData.initialData?.hambatan || monitoringData.hambatan || '-'}`;
          for(let i = 0; i < assessingReportIndex; i++) {
             const r = (monitoringData.reports || [])[i] || {};
             prompt += `\n- Laporan ${i+1}: Hambatan: ${r.hambatan || '-'}`;
          }
          prompt += `\n\nBerdasarkan riwayat di atas, tolong berikan analisis risiko, skor risiko (Rendah/Sedang/Tinggi), serta rekomendasi langkah mitigasi untuk LAPORAN TERBARU berikut ini:
${isAset ? `- Nominal Aset Pulih Laporan Ini: Rp ${formatRupiah(report.nilaiDipulihkan || 0)}` : `- Progres: ${report.progressKegiatan} (${report.persentaseKegiatan})`}
- Hambatan Saat Ini: ${report.hambatan || '-'}
- Keterangan Tambahan: ${report.keterangan || '-'}`;
        }
      }

      prompt += `\n\nBerikan respons secara profesional, padat, dan langsung pada substansi hukum dan risiko proyek. Pertimbangkan apakah hambatan semakin memburuk, menetap, atau membaik dari laporan-laporan sebelumnya.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      
      const resData = await response.json();
      if (resData.error) {
        alert(`API Error: ${resData.error.message}`);
      } else {
        const text = resData.candidates[0].content.parts[0].text;
        setAiResponse(text);
        
        const lowerText = text.toLowerCase();
        if (lowerText.includes('tinggi')) setAdminRiskLevel('high');
        else if (lowerText.includes('sedang')) setAdminRiskLevel('medium');
        else setAdminRiskLevel('low');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan atau API.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveRiskAssessment = async () => {
    let newMonitoringData = { ...monitoringData };
    const targetIdx = (assessingReportIndex === null) ? -1 : assessingReportIndex;
    
    if (targetIdx === -1) {
      newMonitoringData.initialData = {
        ...(newMonitoringData.initialData || {}),
        aiAnalysis: aiResponse,
        risk: adminRiskLevel,
        adminNotes: adminRiskNotes,
        saranDriveUrl: adminSaranDriveUrl,
      };
      newMonitoringData.aiAnalysis = aiResponse;
      newMonitoringData.risk = adminRiskLevel;
      newMonitoringData.adminNotes = adminRiskNotes;
      newMonitoringData.saranDriveUrl = adminSaranDriveUrl;
    } else {
      newMonitoringData.reports = [...(newMonitoringData.reports || [])];
      newMonitoringData.reports[targetIdx] = {
        ...newMonitoringData.reports[targetIdx],
        aiAnalysis: aiResponse,
        risk: adminRiskLevel,
        adminNotes: adminRiskNotes,
        saranDriveUrl: adminSaranDriveUrl,
      };
    }

    // Recalculate the OVERALL project risk (used by the dashboard)
    let overallRisk = newMonitoringData.initialData?.risk || newMonitoringData.risk || 'low';
    if (newMonitoringData.reports && newMonitoringData.reports.length > 0) {
      for (let i = newMonitoringData.reports.length - 1; i >= 0; i--) {
        if (newMonitoringData.reports[i].risk) {
          overallRisk = newMonitoringData.reports[i].risk;
          break;
        }
      }
    }
    newMonitoringData.risk = overallRisk;

    await updatePermohonan(id, {
      monitoring: newMonitoringData
    });
    setMonitoringData(newMonitoringData);
    alert('Penilaian Risiko Kejati berhasil disimpan!');
  };

  const handleSelesai = async () => {
    if (window.confirm('Tandai proses pendampingan hukum ini sebagai Selesai? Pemohon tidak akan bisa menambahkan laporan progres baru lagi.')) {
      await updatePermohonan(id, { currentStep: 6 }); // step 6 is Selesai
      setCurrentStep(6);
    }
  };

  const openAssessmentModal = (index) => {
    setAssessingReportIndex(index);
    if (index === -1) {
      setAiResponse(monitoringData?.initialData?.aiAnalysis || monitoringData?.aiAnalysis || '');
      setAdminRiskLevel(monitoringData?.initialData?.risk || monitoringData?.risk || 'low');
      setAdminRiskNotes(monitoringData?.initialData?.adminNotes || monitoringData?.adminNotes || '');
      setAdminSaranDriveUrl(monitoringData?.initialData?.saranDriveUrl || monitoringData?.saranDriveUrl || '');
    } else {
      const rep = (monitoringData?.reports || [])[index] || {};
      setAiResponse(rep.aiAnalysis || '');
      setAdminRiskLevel(rep.risk || 'low');
      setAdminRiskNotes(rep.adminNotes || '');
      setAdminSaranDriveUrl(rep.saranDriveUrl || '');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '2rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '50%' }}>
            <ArrowLeft size={24} />
          </Link>

          <div>
            <h1 style={{ margin: 0 }}>Detail Permohonan #{id}</h1>
            <p style={{ color: 'var(--color-text-muted)', fontWeight: 700, margin: 0 }}>
              {suratData.asalSurat} - {suratData.perihal}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {suratData.driveFolderUrl && (
            <a
              href={suratData.driveFolderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
              style={{
                padding: '0.5rem 1rem',
                color: 'var(--color-primary-shadow)',
                borderColor: 'var(--color-primary-shadow)',
                textDecoration: 'none'
              }}
              title="Buka Folder Arsip Google Drive Kegiatan Ini"
            >
              <Folder size={18} style={{ marginRight: '0.4rem' }} /> Folder Drive
            </a>
          )}
          <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', color: 'var(--color-danger-shadow)', borderColor: 'var(--color-danger-shadow)' }} onClick={handleDelete}>
            <Trash2 size={20} style={{ marginRight: '0.5rem' }} /> Hapus
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem' }}>

        {/* Left Column: Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Status Card */}
          {(() => {
            // Tentukan warna & label berdasarkan currentStep
            let borderColor, bgColor, textColor, statusLabel, showSelesaiBtn = false;

            if (currentStep === 1) {
              borderColor = 'var(--color-secondary-shadow)';
              bgColor     = '#ddf4ff';
              textColor   = 'var(--color-secondary-shadow)';
              statusLabel = '📥 Permohonan Diterima';
            } else if (currentStep === 2) {
              borderColor = 'var(--color-warning-shadow)';
              bgColor     = '#fff9e6';
              textColor   = 'var(--color-warning-shadow)';
              statusLabel = '⏳ Menunggu SP-1';
            } else if (currentStep === 3) {
              borderColor = '#b84d00';
              bgColor     = '#fff0e5';
              textColor   = '#b84d00';
              statusLabel = '⏳ Menunggu Telaah Hukum S-5';
            } else if (currentStep === 4) {
              borderColor = 'var(--color-warning-shadow)';
              bgColor     = '#fff9e6';
              textColor   = 'var(--color-warning-shadow)';
              statusLabel = '⏳ Menunggu Surat Perintah Pendampingan (SP-2)';
            } else if (currentStep === 5 && telaahData.dapatDidampingi === 'ya') {
              borderColor = 'var(--color-primary-shadow)';
              bgColor     = '#e5f9d6';
              textColor   = 'var(--color-primary-shadow)';
              statusLabel = '🔄 Dalam Proses Pendampingan';
              showSelesaiBtn = true;
            } else if (currentStep === 5 && telaahData.dapatDidampingi === 'tidak') {
              borderColor = 'var(--color-danger-shadow)';
              bgColor     = '#fff0f0';
              textColor   = 'var(--color-danger-shadow)';
              statusLabel = '🗂️ Tidak Dapat Didampingi (Arsip)';
            } else if (currentStep === 6) {
              borderColor = 'var(--color-primary-shadow)';
              bgColor     = '#e5f9d6';
              textColor   = 'var(--color-primary-shadow)';
              statusLabel = '✅ Pendampingan Selesai';
            } else {
              // fallback step 5 tanpa telaah
              borderColor = 'var(--color-primary-shadow)';
              bgColor     = '#e5f9d6';
              textColor   = 'var(--color-primary-shadow)';
              statusLabel = '🔄 Dalam Proses Pendampingan';
              showSelesaiBtn = true;
            }

            return (
              <div className="card" style={{ border: `2px solid ${borderColor}`, background: bgColor }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Status Saat Ini</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ margin: 0, color: textColor, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
                    <Clock size={22} />
                    {statusLabel}
                  </h2>
                  {showSelesaiBtn && (
                    <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={handleSelesai}>
                      <CheckCircle size={16} /> Tandai Selesai
                    </button>
                  )}
                </div>
                {(currentStep === 2 || currentStep === 4) && (
                  <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: 600 }}>Tenggat waktu: 2 hari lagi</p>
                )}
              </div>
            );
          })()}

          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Tahapan Proses</h2>

            {/* Horizontal Stepper */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {[1, 2, 3, 4].map(step => {
                let title = '';
                let isCompleted = currentStep > step;
                let isActive = currentStep === step;
                
                if (step === 1) title = 'Permohonan';
                else if (step === 2) title = 'SP-1';
                else if (step === 3) title = 'Telaah';
                else if (step === 4) title = 'SP-2';
                
                if (step === 4 && currentStep === 5) {
                  if (telaahData?.dapatDidampingi === 'tidak') title = 'Arsip';
                  else isCompleted = true;
                }
                
                const bgColor = isCompleted ? 'var(--color-primary)' : isActive ? 'var(--color-warning)' : 'white';
                const textColor = isCompleted || isActive ? 'white' : 'var(--color-text-muted)';
                const borderColor = isCompleted ? 'var(--color-primary)' : isActive ? 'var(--color-warning)' : 'var(--color-border)';

                return (
                  <button 
                    key={step}
                    onClick={() => setActiveAccordionStep(step)}
                    style={{
                       flex: 1, minWidth: '100px',
                       display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                       padding: '0.75rem', borderRadius: 'var(--radius-md)',
                       background: activeAccordionStep === step ? '#f0f7ff' : 'white',
                       border: `2px solid ${activeAccordionStep === step ? 'var(--color-primary)' : 'var(--color-border)'}`,
                       cursor: 'pointer', textAlign: 'center',
                       opacity: currentStep < step ? 0.5 : 1
                    }}
                  >
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: bgColor, border: `2px solid ${borderColor}`, color: textColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.9rem' }}>
                      {isCompleted ? <CheckCircle size={16} /> : step}
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: activeAccordionStep === step ? 'var(--color-primary-shadow)' : 'var(--color-text-main)' }}>
                      {title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Accordion Content */}
            <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              
              {/* Step 1 Content */}
              {activeAccordionStep === 1 && (
                <div>
                  <h4 style={{ margin: 0, color: 'var(--color-primary-shadow)', marginBottom: '1rem' }}>1. Permohonan Diterima</h4>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0' }}>{suratData.asalSurat}</h3>
                  <p style={{ fontWeight: 800, fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>{suratData.perihal}</p>
                  <p style={{ color: 'var(--color-text-main)', fontSize: '0.9rem', margin: '0 0 0.25rem 0' }}>Nomor Surat: {suratData.nomorSurat}</p>
                  <p style={{ color: 'var(--color-text-main)', fontSize: '0.9rem', margin: '0 0 0.25rem 0' }}>Tanggal Surat: {suratData.tanggalSurat}</p>
                  <p style={{ color: 'var(--color-text-main)', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>
                    Kategori: <span style={{ fontWeight: 700, color: 'var(--color-primary-shadow)' }}>{suratData.kategoriPermohonan || 'Pendampingan Hukum Proyek Infrastruktur'}</span>
                  </p>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline" style={{ padding: '0.5rem', fontSize: '0.85rem' }} onClick={() => setIsEditing(true)}>
                      <Edit3 size={16} /> Detail Surat
                    </button>
                    {suratData.pdfUrl && (
                      <button className="btn btn-outline" style={{ padding: '0.5rem', fontSize: '0.85rem', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }} onClick={() => openPdfViewer(suratData.pdfUrl, 'Dokumen Surat Permohonan')}>
                        <FileText size={16} /> Lihat Surat
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2 Content */}
              {activeAccordionStep === 2 && (
                <div>
                  <h4 style={{ margin: 0, color: currentStep > 2 ? 'var(--color-primary-shadow)' : 'var(--color-warning-shadow)', marginBottom: '1rem' }}>2. Penerbitan SP-1</h4>
                  {sp1Data.nomor ? (
                    <>
                      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--color-text-main)', fontWeight: 600 }}>{sp1Data.nomor}</p>
                      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Tanggal: {sp1Data.tanggal}</p>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                        <strong>Tim JPN:</strong>
                        <ul style={{ margin: '0.25rem 0 0 1rem', padding: 0 }}>
                          {(sp1Data.timJpn || []).map((jpn, i) => <li key={i}>{jpn.nama}</li>)}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Menunggu kelengkapan data SP-1.</p>
                  )}
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline" style={{ padding: '0.5rem', fontSize: '0.85rem' }} onClick={() => setIsEditingSP1(true)}>
                      <Edit3 size={16} /> Edit SP-1
                    </button>
                    {sp1Data.pdfUrl && (
                      <button className="btn btn-outline" style={{ padding: '0.5rem', fontSize: '0.85rem', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }} onClick={() => openPdfViewer(sp1Data.pdfUrl, 'Dokumen SP-1')}>
                        <FileText size={16} /> Lihat SP-1
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3 Content */}
              {activeAccordionStep === 3 && (
                <div>
                  <h4 style={{ margin: 0, color: currentStep >= 3 ? (currentStep > 3 ? 'var(--color-primary-shadow)' : 'var(--color-warning-shadow)') : 'var(--color-text-muted)', marginBottom: '1rem' }}>3. Telaah Hukum S-5</h4>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: currentStep >= 3 ? 'var(--color-text-main)' : 'var(--color-text-muted)' }}>
                    {currentStep === 3 && 'Sedang menunggu hasil Telaahan JPN.'}
                    {currentStep > 3 && telaahData.dapatDidampingi === 'ya' && `Selesai ditelaah oleh ${telaahData.pembuat || 'JPN'} (Dapat didampingi).`}
                    {currentStep > 3 && telaahData.dapatDidampingi === 'tidak' && `Selesai ditelaah oleh ${telaahData.pembuat || 'JPN'} (Tidak dapat didampingi).`}
                    {currentStep < 3 && 'Menunggu tahapan sebelumnya selesai.'}
                  </p>
                  {currentStep > 3 && telaahData.tanggal && (
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Tanggal Telaahan: {telaahData.tanggal}</p>
                  )}
                  
                  {currentStep >= 3 && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-outline" style={{ padding: '0.5rem', fontSize: '0.85rem' }} onClick={() => setIsEditingTelaah(true)}>
                        <Edit3 size={16} /> {telaahData.pembuat ? 'Edit Telaah' : 'Isi Telaah'}
                      </button>
                      {telaahData.pdfUrl && (
                        <button className="btn btn-outline" style={{ padding: '0.5rem', fontSize: '0.85rem', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }} onClick={() => openPdfViewer(telaahData.pdfUrl, 'Dokumen Telaah')}>
                          <FileText size={16} /> Lihat Telaah
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4 Content */}
              {activeAccordionStep === 4 && (
                <div>
                  <h4 style={{ margin: 0, color: currentStep >= 4 ? (currentStep === 5 && telaahData.dapatDidampingi === 'tidak' ? '#e74c3c' : 'var(--color-warning-shadow)') : 'var(--color-text-muted)', marginBottom: '1rem' }}>
                    {currentStep === 5 && telaahData.dapatDidampingi === 'tidak' ? '4. Masuk Database Arsip' : '4. Surat Perintah Pendampingan (SP-2)'}
                  </h4>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: currentStep >= 4 ? 'var(--color-text-main)' : 'var(--color-text-muted)' }}>
                    {currentStep === 5 && telaahData.dapatDidampingi === 'tidak' ? 'Permohonan tidak dapat didampingi.' : currentStep < 4 ? 'Menunggu tahapan sebelumnya selesai.' : 'Penerbitan SP-2 dan pengawasan.'}
                  </p>

                  {currentStep >= 4 && telaahData.dapatDidampingi === 'ya' && (
                    <div>
                      {sp2Data.nomor && (
                        <div style={{ marginBottom: '1rem' }}>
                          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--color-text-main)', fontWeight: 600 }}>{sp2Data.nomor}</p>
                          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Tanggal: {sp2Data.tanggal}</p>
                          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                            <strong>Untuk:</strong> {sp2Data.untuk}
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {currentStep === 4 && (
                          <button className="btn btn-outline" style={{ padding: '0.5rem', fontSize: '0.85rem' }} onClick={() => setIsEditingSP2(true)}>
                            <Edit3 size={16} /> {sp2Data.nomor ? 'Edit SP-2' : 'Input SP-2'}
                          </button>
                        )}
                        {sp2Data.pdfUrl && (
                          <button className="btn btn-outline" style={{ padding: '0.5rem', fontSize: '0.85rem', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }} onClick={() => openPdfViewer(sp2Data.pdfUrl, 'Dokumen SP-2')}>
                            <FileText size={16} /> Lihat SP-2
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Data Awal & AI Analysis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {!monitoringData ? (
            /* KASUS 1: Pemohon Belum Mengisi Data Awal */
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#fef5e7', color: '#d35400', padding: '1rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={32} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Data Awal (Monev) Kegiatan</h2>
                  <p style={{ color: 'var(--color-text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                    Pemohon belum mengisi formulir Data Awal Monev melalui Portal Pemohon.
                  </p>
                </div>
              </div>

              {/* Box Info Akses Portal Pemohon */}
              <div style={{ background: '#f8f9fa', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: 'var(--color-text-main)' }}>Akses Portal Klien (Pemohon):</h4>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.25rem' }}>PIN / Password Akses:</span>
                    <strong style={{ fontSize: '1.1rem', letterSpacing: '0.15em', background: '#eef7ff', padding: '0.3rem 0.8rem', borderRadius: '4px', color: 'var(--color-primary-shadow)', border: '1px solid #cce5ff' }}>
                      {id}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <a href={`/portal/${id}`} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <ExternalLink size={15} /> Buka Portal Klien
                    </a>
                    <button 
                      type="button"
                      className="btn btn-outline" 
                      style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/portal/${id}`);
                        alert(`Link portal pemohon berhasil disalin!\n${window.location.origin}/portal/${id}\nPIN: ${id}`);
                      }}
                    >
                      <Copy size={15} /> Salin Link & PIN
                    </button>
                  </div>
                </div>
              </div>

              {/* Pilihan Input Langsung oleh Kejati */}
              {!isAddingInitialData ? (
                <div style={{ textAlign: 'center', padding: '1rem 0', borderTop: '1px solid var(--color-border)' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                    Atau Anda dapat menginputkan Data Awal Monev proyek ini langsung dari sisi Kejati:
                  </p>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => {
                      setFormKegiatan(suratData?.perihal || '');
                      setIsAddingInitialData(true);
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Plus size={18} /> Input Data Awal (Monev) Kejati
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveInitialDataAdmin} style={{ borderTop: '2px dashed var(--color-border)', paddingTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-primary-shadow)' }}>Form Input Data Awal Monev (Kejati)</h3>
                    <button type="button" className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }} onClick={() => setIsAddingInitialData(false)}>Batal</button>
                  </div>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>{isAset ? 'Nilai Total Aset' : 'Nilai Anggaran'}</label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0 0.5rem' }}>
                      <span style={{ fontWeight: 700, paddingRight: '0.5rem', color: 'var(--color-text-muted)' }}>Rp</span>
                      <input type="text" style={{ flex: 1, padding: '0.6rem 0', border: 'none', outline: 'none', background: 'transparent' }} placeholder="Contoh: 15.000.000.000" value={formNilai} onChange={e => setFormNilai(formatRupiah(e.target.value))} required />
                    </div>
                  </div>
                  {!isAset && (
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label className="form-label" style={{ fontWeight: 600 }}>Kegiatan Yang Didampingi</label>
                      <input className="form-input" required value={formKegiatan} onChange={e => setFormKegiatan(e.target.value)} placeholder="Contoh: Pembangunan SMA Unggul Garuda..." />
                    </div>
                  )}
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>Kasus Posisi</label>
                    <textarea className="form-input" rows="3" required value={formKasusPosisi} onChange={e => setFormKasusPosisi(e.target.value)} placeholder="Uraian singkat posisi kasus/kegiatan..." />
                  </div>
                  {isAset && (
                    <>
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label" style={{ fontWeight: 600 }}>Permasalahan</label>
                        <textarea className="form-input" rows="3" required value={formPermasalahan} onChange={e => setFormPermasalahan(e.target.value)} placeholder="Uraian singkat permasalahan..." />
                      </div>
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label" style={{ fontWeight: 600 }}>Jenis Aset (Daftar)</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {formJenisAset.map((aset, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '0.5rem' }}>
                              <input className="form-input" style={{ flex: 1 }} required value={aset} onChange={e => handleAsetChangeAdmin(idx, e.target.value)} placeholder={`Aset ${idx + 1}`} />
                              {formJenisAset.length > 1 && (
                                <button type="button" className="btn btn-outline" style={{ padding: '0.5rem' }} onClick={() => handleRemoveAsetAdmin(idx)}><X size={16} /></button>
                              )}
                            </div>
                          ))}
                          <button type="button" className="btn btn-outline" style={{ alignSelf: 'flex-start', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={handleAddAsetAdmin}><Plus size={14} style={{ marginRight: '0.3rem' }} /> Tambah Aset</button>
                        </div>
                      </div>
                    </>
                  )}
                  {!isAset && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                          <label className="form-label" style={{ fontWeight: 600 }}>Progress Kegiatan</label>
                          <input className="form-input" required value={formProgres} onChange={e => setFormProgres(e.target.value)} placeholder="Contoh: Tahap Pengadaan / Konstruksi Awal" />
                        </div>
                        <div>
                          <label className="form-label" style={{ fontWeight: 600 }}>Persentase Fisik (%)</label>
                          <input type="number" className="form-input" required value={formPersentase} onChange={e => setFormPersentase(e.target.value)} placeholder="0 - 100" />
                        </div>
                      </div>

                      {isInfrastruktur && (
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                          <div>
                            <label className="form-label" style={{ fontWeight: 600 }}>Realisasi Pencairan Anggaran</label>
                            <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0 0.5rem' }}>
                              <span style={{ fontWeight: 700, paddingRight: '0.5rem', color: 'var(--color-text-muted)' }}>Rp</span>
                              <input
                                type="text"
                                style={{ flex: 1, padding: '0.6rem 0', border: 'none', outline: 'none', background: 'transparent' }}
                                placeholder="0 (Uang Muka / Termin Awal)"
                                value={formRealisasiPencairan}
                                onChange={e => handleFormRealisasiChange(e.target.value)}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="form-label" style={{ fontWeight: 600 }}>% Pencairan</label>
                            <input
                              type="number"
                              step="0.1"
                              className="form-input"
                              value={formPersentasePencairan}
                              onChange={e => handleFormPersentaseChange(e.target.value)}
                              placeholder="0 - 100"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>Hambatan / Kendala</label>
                    <textarea className="form-input" rows="2" value={formHambatan} onChange={e => setFormHambatan(e.target.value)} placeholder="Tuliskan hambatan atau kendala yang dihadapi di lapangan..." />
                  </div>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>Keterangan Tambahan</label>
                    <textarea className="form-input" rows="2" value={formKeterangan} onChange={e => setFormKeterangan(e.target.value)} placeholder="Catatan tambahan (opsional)..." />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Simpan Data Awal & Buka Form Penilaian</button>
                </form>
              )}
            </div>
          ) : (
            /* KASUS 2: Data Awal Sudah Ada */
              /* Card 1: Data Awal / Konteks Proyek */
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                  <h2 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={20} color="var(--color-primary-shadow)" /> Data Awal (Monev) Klien
                  </h2>
                  <span className="badge" style={{ background: '#eef7ff', color: 'var(--color-primary-shadow)' }}>
                    Terdaftar: {monitoringData.initialData?.date || monitoringData.lastUpdate}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  {!isAset && (
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Kegiatan</span>
                      <div style={{ fontWeight: 700 }}>{monitoringData.kegiatan || '-'}</div>
                    </div>
                  )}
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{isAset ? 'Nilai Total Aset' : 'Nilai Anggaran'}</span>
                    <div style={{ fontWeight: 700 }}>
                      {monitoringData.nilai ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(monitoringData.nilai) : '-'}
                    </div>
                  </div>
                  {!isAset && (
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Progres Kegiatan (Terbaru)</span>
                      <div style={{ fontWeight: 700 }}>
                        {(() => {
                          const hasReports = monitoringData.reports && monitoringData.reports.length > 0;
                          const latest = hasReports ? monitoringData.reports[monitoringData.reports.length - 1] : monitoringData.initialData;
                          return `${latest?.progressKegiatan || monitoringData.progressKegiatan || '-'} (${latest?.persentaseKegiatan || monitoringData.persentaseKegiatan || '0%'})`;
                        })()}
                      </div>
                    </div>
                  )}
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Terakhir Update</span>
                    <div style={{ fontWeight: 700 }}>{monitoringData.lastUpdate || '-'}</div>
                  </div>
                </div>

                {isInfrastruktur && (() => {
                  const stats = getDisbursementStats();
                  const latestReport = (monitoringData.reports && monitoringData.reports.length > 0)
                    ? monitoringData.reports[monitoringData.reports.length - 1]
                    : monitoringData.initialData;
                  const physicalPct = parseFloat((latestReport?.persentaseKegiatan || monitoringData.persentaseKegiatan || '0').replace('%', '')) || 0;
                  const financialPct = parseFloat(stats.percentKumulatif) || 0;
                  const deviasi = financialPct - physicalPct;

                  return (
                    <div style={{
                      marginBottom: '1.25rem',
                      background: 'linear-gradient(135deg, #f8fdf8 0%, #f0fdf4 100%)',
                      border: '1px solid #bbf7d0',
                      borderRadius: '8px',
                      padding: '1rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#166534', fontSize: '0.9rem' }}>
                          <DollarSign size={18} /> Realisasi Pencairan Anggaran & Progres Keuangan
                        </div>
                        {deviasi > 10 ? (
                          <span style={{ fontSize: '0.75rem', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <AlertTriangle size={12} /> Peringatan: Pencairan Keuangan (+{deviasi.toFixed(1)}%) Melampaui Progres Fisik
                          </span>
                        ) : deviasi < -15 ? (
                          <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <TrendingUp size={12} /> Pencairan Lambat (Deviasi {deviasi.toFixed(1)}%)
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                            ✓ Keuangan & Fisik Seimbang
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ background: 'white', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Total Pagu Dana:</span>
                          <strong style={{ fontSize: '0.95rem', color: '#1e293b' }}>{formatCurrency(stats.totalAnggaran)}</strong>
                        </div>
                        <div style={{ background: 'white', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Total Dicairkan:</span>
                          <strong style={{ fontSize: '0.95rem', color: '#15803d' }}>
                            {formatCurrency(stats.totalKumulatif)} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>({stats.percentKumulatif}%)</span>
                          </strong>
                        </div>
                        <div style={{ background: 'white', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Sisa Anggaran:</span>
                          <strong style={{ fontSize: '0.95rem', color: stats.sisa > 0 ? '#334155' : '#15803d' }}>{formatCurrency(stats.sisa)}</strong>
                        </div>
                      </div>

                      {/* Progress Comparison Bars */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>Pencairan Keuangan</span>
                            <span style={{ fontWeight: 700, color: '#15803d' }}>{stats.percentKumulatif}%</span>
                          </div>
                          <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(100, parseFloat(stats.percentKumulatif))}%`, height: '100%', background: '#16a34a', borderRadius: '3px' }} />
                          </div>
                        </div>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>Progres Fisik Lapangan</span>
                            <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{physicalPct}%</span>
                          </div>
                          <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(100, physicalPct)}%`, height: '100%', background: 'var(--color-primary)', borderRadius: '3px' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
                
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Kasus Posisi</span>
                  <div style={{ background: 'var(--color-surface)', padding: '0.75rem', borderRadius: '4px', fontSize: '0.9rem' }}>{monitoringData.kasusPosisi || '-'}</div>
                </div>

                {isAset && monitoringData.initialData?.permasalahan && (
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Permasalahan</span>
                    <div style={{ background: 'var(--color-surface)', padding: '0.75rem', borderRadius: '4px', fontSize: '0.9rem' }}>{monitoringData.initialData.permasalahan}</div>
                  </div>
                )}

                {isAset && monitoringData.initialData?.jenisAset && monitoringData.initialData.jenisAset.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Jenis Aset</span>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', background: 'var(--color-surface)', padding: '0.75rem 0.75rem 0.75rem 2rem', borderRadius: '4px', fontSize: '0.9rem' }}>
                      {monitoringData.initialData.jenisAset.map((aset, i) => (
                        <li key={i} style={{ marginBottom: '0.25rem' }}>{aset}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Hambatan / Kendala Awal</span>
                  <div style={{ background: '#fff0f0', color: '#c0392b', border: '1px solid #ffcccc', padding: '0.75rem', borderRadius: '4px', fontSize: '0.9rem' }}>
                    <div dangerouslySetInnerHTML={{ __html: monitoringData.initialData?.hambatan || monitoringData.hambatan || '-' }} />
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Full Width Section Below Grid */}
      {monitoringData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1rem' }}>
              {/* Card 2: Tabel Riwayat Laporan Progres & Penilaian */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '2px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fafafa' }}>
                  <h2 style={{ fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={20} color="var(--color-primary-shadow)" /> Riwayat Laporan Progres & Penilaian
                  </h2>
                </div>
                <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Tahap / Waktu</th>
                        <th>Progres</th>
                        {isInfrastruktur && <th>Realisasi Pencairan Anggaran</th>}
                        <th>Hambatan / Catatan</th>
                        <th>Status Risiko & Catatan Kejati</th>
                        <th style={{ width: '130px' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Baris 1: Data Awal */}
                      <tr>
                        <td>
                          <div style={{ fontWeight: 800 }}>Data Awal</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{monitoringData.initialData?.date || monitoringData.lastUpdate}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{monitoringData.initialData?.progressKegiatan || monitoringData.progressKegiatan || '-'} ({monitoringData.initialData?.persentaseKegiatan || monitoringData.persentaseKegiatan || '0%'})</div>
                        </td>
                        {isInfrastruktur && (() => {
                          const dis = getReportDisbursement(-1);
                          return (
                            <td>
                              <div style={{ fontWeight: 700, color: dis.tahap > 0 ? '#1b5e20' : 'var(--color-text-muted)' }}>
                                {dis.tahap > 0 ? formatCurrency(dis.tahap) : 'Rp 0'}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                Termin: {dis.persenTahap}
                              </div>
                              <div style={{ fontSize: '0.78rem', marginTop: '0.25rem', padding: '0.2rem 0.45rem', background: '#eef7ff', color: 'var(--color-primary-shadow)', borderRadius: '4px', display: 'inline-block', fontWeight: 600 }}>
                                Total Dicairkan: {formatCurrency(dis.kumulatif)} ({dis.persenKumulatif})
                              </div>
                            </td>
                          );
                        })()}
                        <td>
                          <div style={{ fontSize: '0.9rem', color: '#c0392b' }}>
                            <div dangerouslySetInnerHTML={{ __html: monitoringData.initialData?.hambatan || monitoringData.hambatan || '-' }} />
                          </div>
                          {(monitoringData.initialData?.keterangan || monitoringData.keterangan) && (
                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-main)', marginTop: '0.25rem' }}>
                              <span style={{ fontWeight: 700, color: 'var(--color-text-muted)' }}>Ket:</span> <div dangerouslySetInnerHTML={{ __html: monitoringData.initialData?.keterangan || monitoringData.keterangan }} />
                            </div>
                          )}
                          {((monitoringData.initialData?.dokumenFiles && monitoringData.initialData.dokumenFiles.length > 0) || (monitoringData.initialData?.linkDokumen || monitoringData.linkDokumen)) && (
                            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              {monitoringData.initialData?.dokumenFiles && monitoringData.initialData.dokumenFiles.length > 0 ? (
                                monitoringData.initialData.dokumenFiles.map((doc, dIdx) => (
                                  <a key={dIdx} href={doc.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-secondary-shadow)', textDecoration: 'underline', fontWeight: 600, fontSize: '0.82rem' }}>
                                    <FileText size={12} /> {doc.name || `Dokumen ${dIdx + 1}`}
                                  </a>
                                ))
                              ) : (
                                <a href={monitoringData.initialData?.linkDokumen || monitoringData.linkDokumen} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-secondary-shadow)', textDecoration: 'underline', fontWeight: 600, fontSize: '0.85rem' }}>
                                  Lihat Dokumen
                                </a>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          {monitoringData.initialData?.risk || monitoringData.risk ? (
                            <div>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: (monitoringData.initialData?.risk || monitoringData.risk) === 'high' ? '#ffe2e2' : (monitoringData.initialData?.risk || monitoringData.risk) === 'medium' ? '#fff5cc' : '#e5f9d6', color: (monitoringData.initialData?.risk || monitoringData.risk) === 'high' ? 'var(--color-danger)' : (monitoringData.initialData?.risk || monitoringData.risk) === 'medium' ? '#d4ac0d' : 'var(--color-primary-shadow)' }}>
                                {(monitoringData.initialData?.risk || monitoringData.risk) === 'high' ? 'Tinggi' : (monitoringData.initialData?.risk || monitoringData.risk) === 'medium' ? 'Sedang' : 'Rendah'}
                              </div>
                              {(monitoringData.initialData?.adminNotes || monitoringData.adminNotes) && (
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
                                  {monitoringData.initialData?.adminNotes || monitoringData.adminNotes}
                                </div>
                              )}
                              {(monitoringData.initialData?.saranDriveUrl || monitoringData.saranDriveUrl) && (
                                <div style={{ marginTop: '0.5rem' }}>
                                  <a href={monitoringData.initialData?.saranDriveUrl || monitoringData.saranDriveUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#8e44ad', textDecoration: 'underline', fontWeight: 700, fontSize: '0.8rem' }}>
                                    <Download size={12} /> Unduh Saran Kejati
                                  </a>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: '#e67e22', fontStyle: 'italic', fontSize: '0.85rem', fontWeight: 600 }}>Belum Dinilai</span>
                          )}
                        </td>
                        <td>
                          {monitoringData.initialData?.risk || monitoringData.risk ? (
                            <button className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', width: '100%', display: 'flex', justifyContent: 'center', gap: '0.25rem' }} onClick={() => openAssessmentModal(-1)}>
                              <ShieldAlert size={14} /> Detail
                            </button>
                          ) : (
                            <button className="btn btn-primary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', width: '100%', display: 'flex', justifyContent: 'center', gap: '0.25rem', background: '#8e44ad', borderColor: '#732d91' }} onClick={() => openAssessmentModal(-1)}>
                              <Sparkles size={14} /> Beri Penilaian
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Baris-baris Laporan Progres Berkala */}
                      {(monitoringData.reports || []).map((rep, idx) => (
                        <tr key={rep.id || idx}>
                          <td>
                            <div style={{ fontWeight: 800 }}>Laporan #{idx + 1}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{rep.tanggal || rep.date}</div>
                          </td>
                          <td>
                            {!isAset ? (
                              <div style={{ fontWeight: 700 }}>{rep.progressKegiatan || '-'} ({rep.persentaseKegiatan || '0%'})</div>
                            ) : (
                              <>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Nominal Dipulihkan:</div>
                                <div style={{ fontWeight: 700, color: '#27ae60' }}>
                                  {rep.nilaiDipulihkan ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(rep.nilaiDipulihkan) : '-'}
                                </div>
                              </>
                            )}
                          </td>
                          {isInfrastruktur && (() => {
                            const dis = getReportDisbursement(idx);
                            return (
                              <td>
                                <div style={{ fontWeight: 700, color: dis.tahap > 0 ? '#1b5e20' : 'var(--color-text-muted)' }}>
                                  {dis.tahap > 0 ? formatCurrency(dis.tahap) : 'Rp 0'}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                  Termin: {dis.persenTahap}
                                </div>
                                <div style={{ fontSize: '0.78rem', marginTop: '0.25rem', padding: '0.2rem 0.45rem', background: '#eef7ff', color: 'var(--color-primary-shadow)', borderRadius: '4px', display: 'inline-block', fontWeight: 600 }}>
                                  Total Dicairkan: {formatCurrency(dis.kumulatif)} ({dis.persenKumulatif})
                                </div>
                              </td>
                            );
                          })()}
                          <td>
                            <div style={{ fontSize: '0.9rem', color: '#c0392b' }}>
                              <div dangerouslySetInnerHTML={{ __html: rep.hambatan || '-' }} />
                            </div>
                            {rep.keterangan && (
                              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-main)', marginTop: '0.25rem' }}>
                                <span style={{ fontWeight: 700, color: 'var(--color-text-muted)' }}>Ket:</span> <div dangerouslySetInnerHTML={{ __html: rep.keterangan }} />
                              </div>
                            )}
                            {((rep.dokumenFiles && rep.dokumenFiles.length > 0) || rep.linkDokumen) && (
                              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                {rep.dokumenFiles && rep.dokumenFiles.length > 0 ? (
                                  rep.dokumenFiles.map((doc, dIdx) => (
                                    <a key={dIdx} href={doc.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-secondary-shadow)', textDecoration: 'underline', fontWeight: 600, fontSize: '0.82rem' }}>
                                      <FileText size={12} /> {doc.name || `Dokumen ${dIdx + 1}`}
                                    </a>
                                  ))
                                ) : (
                                  <a href={rep.linkDokumen} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-secondary-shadow)', textDecoration: 'underline', fontWeight: 600, fontSize: '0.85rem' }}>
                                    Lihat Dokumen
                                  </a>
                                )}
                              </div>
                            )}
                          </td>
                          <td>
                            {rep.risk ? (
                              <div>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: rep.risk === 'high' ? '#ffe2e2' : rep.risk === 'medium' ? '#fff5cc' : '#e5f9d6', color: rep.risk === 'high' ? 'var(--color-danger)' : rep.risk === 'medium' ? '#d4ac0d' : 'var(--color-primary-shadow)' }}>
                                  {rep.risk === 'high' ? 'Tinggi' : rep.risk === 'medium' ? 'Sedang' : 'Rendah'}
                                </div>
                                {rep.adminNotes && (
                                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>{rep.adminNotes}</div>
                                )}
                                {rep.saranDriveUrl && (
                                  <div style={{ marginTop: '0.5rem' }}>
                                    <a href={rep.saranDriveUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#8e44ad', textDecoration: 'underline', fontWeight: 700, fontSize: '0.8rem' }}>
                                      <Download size={12} /> Unduh Saran Kejati
                                    </a>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: '#e67e22', fontStyle: 'italic', fontSize: '0.85rem', fontWeight: 600 }}>Belum Dinilai</span>
                            )}
                          </td>
                          <td>
                            {rep.risk ? (
                              <button className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', width: '100%', display: 'flex', justifyContent: 'center', gap: '0.25rem' }} onClick={() => openAssessmentModal(idx)}>
                                <ShieldAlert size={14} /> Detail
                              </button>
                            ) : (
                              <button className="btn btn-primary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', width: '100%', display: 'flex', justifyContent: 'center', gap: '0.25rem', background: '#8e44ad', borderColor: '#732d91' }} onClick={() => openAssessmentModal(idx)}>
                                <Sparkles size={14} /> Beri Penilaian
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Card 3: Form Penilaian Kejati Langsung (Jika Data Awal Belum Dinilai) */}
              {(!monitoringData.initialData?.risk && !monitoringData.risk) && (
                <div className="card" style={{ border: '2px solid #8e44ad', background: '#fdfcfe' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #ebdcf5', paddingBottom: '0.75rem' }}>
                    <h3 style={{ margin: 0, color: '#8e44ad', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
                      <Sparkles size={22} /> Form Penilaian Risiko oleh Kejati
                    </h3>
                    <span className="badge" style={{ background: '#8e44ad', color: 'white' }}>Data Awal</span>
                  </div>

                  {/* AI Analysis Section */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#5b2c6f' }}>
                        ✨ Analisis Risiko AI Gemini (Persona JPN & Ahli Hukum Perdata/TUN)
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {aiResponse && (
                          <>
                            <button
                              className="btn btn-outline"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', borderColor: '#27ae60', color: '#27ae60', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                              onClick={() => {
                                const dis = getReportDisbursement(-1);
                                const extra = isInfrastruktur ? {
                                  nilaiAnggaran: formatCurrency(monitoringData?.nilai || 0),
                                  realisasiPencairan: formatCurrency(dis.tahap),
                                  persentasePencairan: dis.persenKumulatif,
                                  progresFisik: `${monitoringData?.initialData?.progressKegiatan || monitoringData?.progressKegiatan || '-'} (${monitoringData?.initialData?.persentaseKegiatan || monitoringData?.persentaseKegiatan || '0%'})`
                                } : {};
                                downloadAnalysisAsDocx(monitoringData?.kegiatan || id, monitoringData?.kegiatan, aiResponse, 'Data Awal', extra);
                              }}
                            >
                              <FileDown size={14} /> Unduh Word
                            </button>
                            <button
                              className="btn btn-outline"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', borderColor: '#8e44ad', color: '#8e44ad' }}
                              onClick={() => setIsEditingAiResponse(!isEditingAiResponse)}
                            >
                              {isEditingAiResponse ? 'Lihat Markdown' : 'Edit Analisis'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {!aiResponse ? (
                      <button onClick={handleGenerateAIAnalysis} className="btn btn-primary" style={{ background: '#8e44ad', borderColor: '#732d91', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }} disabled={isAiLoading}>
                        <Sparkles size={18} />
                        {isAiLoading ? 'Menghitung Analisis & Rekomendasi JPN...' : 'Hitung Analisis & Rekomendasi Risiko (Gemini)'}
                      </button>
                    ) : (
                      <div>
                        {isEditingAiResponse ? (
                          <textarea 
                            className="form-input" 
                            style={{ width: '100%', height: '300px', fontSize: '0.9rem', backgroundColor: '#fff', borderColor: '#8e44ad', outline: 'none' }} 
                            value={aiResponse} 
                            onChange={(e) => setAiResponse(e.target.value)}
                          />
                        ) : (
                          <div className="markdown-body" style={{ background: '#fff', border: '1px solid #d7bde2', padding: '1.5rem', borderRadius: '8px', lineHeight: '1.6', maxHeight: '400px', overflowY: 'auto' }}>
                            <ReactMarkdown>{aiResponse}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Form Penentuan Risiko */}
                  <div style={{ background: 'white', border: '1px solid #d7bde2', padding: '1.25rem', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', color: 'var(--color-text-main)' }}>
                      Penentuan Tingkat Risiko & Instruksi Mitigasi
                    </h4>

                    <div style={{ marginBottom: '1rem' }}>
                      <label className="form-label" style={{ fontWeight: 600 }}>Tingkat Risiko Final</label>
                      <select className="form-input" value={adminRiskLevel} onChange={e => setAdminRiskLevel(e.target.value)}>
                        <option value="low">🟢 Rendah (Aman / Proyek Berjalan Normal)</option>
                        <option value="medium">🟡 Sedang (Perlu Perhatian & Monitoring Ketat)</option>
                        <option value="high">🔴 Tinggi (Kritis / Perlu Tindakan Mitigasi Segera)</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                      <label className="form-label" style={{ fontWeight: 600 }}>Catatan / Instruksi untuk Pemohon</label>
                      <textarea 
                        className="form-input" 
                        rows="3" 
                        value={adminRiskNotes} 
                        onChange={e => setAdminRiskNotes(e.target.value)} 
                        placeholder="Tuliskan instruksi langkah mitigasi yang harus dipenuhi oleh pemohon pada pelaporan berikutnya..."
                      />
                    </div>

                    <DriveFileUpload
                      label="Dokumen Saran Tindakan JPN (Google Drive)"
                      value={adminSaranDriveUrl}
                      onChange={(url, meta) => {
                        setAdminSaranDriveUrl(url);
                        if (meta?.folderUrl && !suratData.driveFolderUrl) {
                          setSuratData(prev => ({ ...prev, driveFolderUrl: meta.folderUrl }));
                        }
                      }}
                      permohonanId={id}
                      permohonanTitle={monitoringData?.kegiatan || suratData?.perihal || id}
                      folderCategory="saran"
                      helpText="Unggah berkas Word (.docx) atau PDF surat saran untuk pemohon"
                    />

                    <button className="btn btn-primary" style={{ width: '100%', background: '#8e44ad', borderColor: '#732d91' }} onClick={handleSaveRiskAssessment}>
                      Simpan Penilaian Kejati
                    </button>
                  </div>
                </div>
              )}
        </div>
      )}

      {/* Modal PDF Viewer */}
      {isViewingPdf && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="card" style={{ width: '90%', height: '90%', display: 'flex', flexDirection: 'column', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={24} color="var(--color-primary-shadow)" /> {pdfTitleToView}
              </h2>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <a href={pdfUrlToView} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Download size={18} /> Download
                </a>
                <button onClick={() => setIsViewingPdf(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-main)' }}>
                  <X size={28} />
                </button>
              </div>
            </div>
            <div style={{ flex: 1, backgroundColor: '#f0f0f0', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <iframe 
                src={getEmbedUrl(pdfUrlToView)} 
                width="100%" 
                height="100%" 
                style={{ border: 'none' }}
                title="PDF Viewer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail & Penilaian Risiko */}
      {assessingReportIndex !== null && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="card" style={{ width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={28} color="var(--color-primary-shadow)" /> {assessingReportIndex === -1 ? 'Penilaian Data Awal' : `Penilaian Laporan Progres ${assessingReportIndex + 1}`}
              </h2>
              <button onClick={() => setAssessingReportIndex(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X size={28} />
              </button>
            </div>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {isInfrastruktur && (() => {
                const dis = getReportDisbursement(assessingReportIndex);
                const isInitial = assessingReportIndex === -1;
                const rep = isInitial ? (monitoringData?.initialData || monitoringData) : (monitoringData?.reports?.[assessingReportIndex] || {});
                return (
                  <div style={{
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    padding: '1rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#166534', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                      <DollarSign size={18} /> Informasi Pencairan & Progres ({isInitial ? 'Data Awal' : `Laporan #${assessingReportIndex + 1}`})
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                      <div style={{ background: 'white', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Total Pagu Dana:</span>
                        <strong style={{ fontSize: '0.9rem', color: '#1e293b' }}>{formatCurrency(monitoringData?.nilai || 0)}</strong>
                      </div>
                      <div style={{ background: 'white', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Pencairan Termin Ini:</span>
                        <strong style={{ fontSize: '0.9rem', color: '#15803d' }}>
                          {formatCurrency(dis.tahap)} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>({dis.persenTahap})</span>
                        </strong>
                      </div>
                      <div style={{ background: 'white', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Total Sudah Dicairkan:</span>
                        <strong style={{ fontSize: '0.9rem', color: '#1e293b' }}>
                          {formatCurrency(dis.kumulatif)} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#15803d' }}>({dis.persenKumulatif})</span>
                        </strong>
                      </div>
                      <div style={{ background: 'white', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Sisa Anggaran:</span>
                        <strong style={{ fontSize: '0.9rem', color: '#334155' }}>{formatCurrency(dis.sisa)}</strong>
                      </div>
                      <div style={{ background: 'white', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Progres Fisik:</span>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>
                          {rep?.progressKegiatan || '-'} ({rep?.persentaseKegiatan || '0%'})
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Kasus Posisi (Konteks Proyek):</span>
                <div style={{ background: 'var(--color-surface)', padding: '1rem', borderRadius: '8px' }}>{monitoringData?.kasusPosisi || '-'}</div>
              </div>
              
              <div>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Hambatan / Kendala yang Dilaporkan:</span>
                <div style={{ background: '#fff0f0', color: '#c0392b', border: '1px solid #ffcccc', padding: '1rem', borderRadius: '8px' }}>
                  <div dangerouslySetInnerHTML={{ __html: assessingReportIndex === -1
                    ? (monitoringData?.initialData?.hambatan || monitoringData?.hambatan || '-')
                    : (monitoringData?.reports[assessingReportIndex]?.hambatan || '-') }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem', color: '#8e44ad', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ✨ Hasil Analisis Gemini
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {aiResponse && (
                      <>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', borderColor: '#27ae60', color: '#27ae60', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          onClick={() => {
                            const label = assessingReportIndex === -1 ? 'Data Awal' : `Laporan #${assessingReportIndex + 1}`;
                            const dis = getReportDisbursement(assessingReportIndex);
                            const isInitial = assessingReportIndex === -1;
                            const rep = isInitial ? (monitoringData?.initialData || monitoringData) : (monitoringData?.reports?.[assessingReportIndex] || {});
                            const extra = isInfrastruktur ? {
                              nilaiAnggaran: formatCurrency(monitoringData?.nilai || 0),
                              realisasiPencairan: formatCurrency(dis.tahap),
                              persentasePencairan: dis.persenKumulatif,
                              progresFisik: `${rep?.progressKegiatan || '-'} (${rep?.persentaseKegiatan || '0%'})`
                            } : {};
                            downloadAnalysisAsDocx(monitoringData?.kegiatan || id, monitoringData?.kegiatan, aiResponse, label, extra);
                          }}
                        >
                          <FileDown size={14} /> Unduh Word
                        </button>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', borderColor: '#8e44ad', color: '#8e44ad' }}
                          onClick={() => setIsEditingAiResponse(!isEditingAiResponse)}
                        >
                          {isEditingAiResponse ? 'Tutup Edit' : 'Edit Analisis'}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {!aiResponse ? (
                   <button onClick={handleGenerateAIAnalysis} className="btn btn-primary" style={{ background: '#8e44ad', borderColor: '#732d91', width: '100%' }} disabled={isAiLoading}>
                     {isAiLoading ? 'Menghitung Risiko & Korelasi Historis...' : 'Hitung Analisis & Rekomendasi (Gemini)'}
                   </button>
                ) : (
                  isEditingAiResponse ? (
                    <textarea 
                      className="form-input" 
                      style={{ width: '100%', height: '300px', fontSize: '0.9rem', backgroundColor: '#f9f2fc', borderColor: '#8e44ad', outline: 'none' }} 
                      value={aiResponse} 
                      onChange={(e) => setAiResponse(e.target.value)}
                    />
                  ) : (
                    <div className="markdown-body" style={{ background: '#f9f2fc', border: '1px solid #d7bde2', padding: '1.5rem', borderRadius: '8px', lineHeight: '1.6', maxHeight: '400px', overflowY: 'auto' }}>
                      <ReactMarkdown>{aiResponse}</ReactMarkdown>
                    </div>
                  )
                )}
              </div>

              <div style={{ background: 'var(--color-surface)', border: '2px solid var(--color-border)', padding: '1.5rem', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem' }}>Penentuan Risiko & Instruksi (Oleh Admin)</h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>Tingkat Risiko Final</label>
                  <select className="form-input" value={adminRiskLevel} onChange={e => setAdminRiskLevel(e.target.value)}>
                    <option value="low">Rendah (Aman)</option>
                    <option value="medium">Sedang (Perlu Perhatian)</option>
                    <option value="high">Tinggi (Kritis / Perlu Mitigasi Segera)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>Catatan / Instruksi untuk Pemohon</label>
                  <textarea className="form-input" rows="3" value={adminRiskNotes} onChange={e => setAdminRiskNotes(e.target.value)} placeholder="Tuliskan instruksi langkah mitigasi yang harus dipenuhi oleh pemohon pada pelaporan berikutnya..."></textarea>
                </div>

                <DriveFileUpload
                  label="Dokumen Saran Tindakan JPN (Google Drive)"
                  value={adminSaranDriveUrl}
                  onChange={(url, meta) => {
                    setAdminSaranDriveUrl(url);
                    if (meta?.folderUrl && !suratData.driveFolderUrl) {
                      setSuratData(prev => ({ ...prev, driveFolderUrl: meta.folderUrl }));
                    }
                  }}
                  permohonanId={id}
                  permohonanTitle={monitoringData?.kegiatan || suratData?.perihal || id}
                  folderCategory="saran"
                  helpText="Unggah berkas Word (.docx) atau PDF surat saran untuk pemohon"
                />
              </div>
            </div>
            
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setAssessingReportIndex(null)}>Tutup</button>
              <button className="btn btn-primary" onClick={() => { handleSaveRiskAssessment(); setAssessingReportIndex(null); }}>Simpan Penilaian</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Data Surat */}
      {isEditing && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Edit Data Surat</h2>
              <button onClick={() => setIsEditing(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Instansi Pemohon (Asal Surat)</label>
                <input
                  className="form-input"
                  value={suratData.asalSurat}
                  onChange={(e) => setSuratData({ ...suratData, asalSurat: e.target.value })}
                  placeholder="Contoh: PT Nindya Karya"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Kategori Permohonan</label>
                <select 
                  className="form-input"
                  value={suratData.kategoriPermohonan || 'Pendampingan Hukum Proyek Infrastruktur'}
                  onChange={(e) => setSuratData({ ...suratData, kategoriPermohonan: e.target.value })}
                >
                  <option value="Pendampingan Pemulihan/Penyelamatan Aset">Pendampingan Pemulihan/Penyelamatan Aset</option>
                  <option value="Pendampingan Hukum Proyek Infrastruktur">Pendampingan Hukum Proyek Infrastruktur</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Perihal</label>
                <input
                  className="form-input"
                  value={suratData.perihal}
                  onChange={(e) => setSuratData({ ...suratData, perihal: e.target.value })}
                  placeholder="Contoh: Permohonan Bantuan Hukum"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Nomor Surat</label>
                <input
                  className="form-input"
                  value={suratData.nomorSurat}
                  onChange={(e) => setSuratData({ ...suratData, nomorSurat: e.target.value })}
                  placeholder="Contoh: B-123/NK/II/2026"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Tanggal Surat</label>
                <input
                  className="form-input"
                  value={suratData.tanggalSurat}
                  onChange={(e) => setSuratData({ ...suratData, tanggalSurat: e.target.value })}
                  placeholder="Contoh: 13 Februari 2026"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Tautan Dokumen (Google Drive PDF)</label>
                <input
                  className="form-input"
                  value={suratData.pdfUrl}
                  onChange={(e) => setSuratData({ ...suratData, pdfUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setIsEditing(false)}>Batal</button>
              <button className="btn btn-primary" onClick={handleSave}>Simpan Perubahan</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Data SP-1 */}
      {isEditingSP1 && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', margin: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Edit Data SP-1</h2>
              <button onClick={() => setIsEditingSP1(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Nomor SP-1</label>
                <input
                  className="form-input"
                  value={sp1Data.nomor}
                  onChange={(e) => setSp1Data({ ...sp1Data, nomor: e.target.value })}
                  placeholder="Nomor SP-1"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Tanggal SP-1</label>
                <input
                  type="date"
                  className="form-input"
                  value={sp1Data.tanggal}
                  onChange={(e) => setSp1Data({ ...sp1Data, tanggal: e.target.value })}
                />
              </div>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <label style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Users size={16} /> Tim JPN (Kepada)
                  </label>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', color: 'var(--color-primary-shadow)', borderColor: 'var(--color-primary-shadow)' }}
                    onClick={handleAutoFillAllJpnSp1}
                    title="Otomatis masukkan seluruh daftar JPN yang terdaftar"
                  >
                    ⚡ Input Otomatis Semua JPN ({masterJpnList.length})
                  </button>
                </div>

                {(sp1Data.timJpn || []).map((jpn, index) => (
                  <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem', padding: '0.6rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <select
                        className="form-input"
                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem', flex: 1, backgroundColor: 'var(--color-surface)' }}
                        value={masterJpnList.find(m => m.nama === jpn.nama)?.id || ''}
                        onChange={(e) => handleSelectMasterJpnForSp1(index, e.target.value)}
                      >
                        <option value="">-- Pilih dari Daftar JPN ({masterJpnList.length}) --</option>
                        {masterJpnList.map(m => (
                          <option key={m.id} value={m.id}>{m.nama} ({m.pangkat || 'JPN'})</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.6rem', color: 'var(--color-danger-shadow)', borderColor: 'var(--color-danger-shadow)' }}
                        onClick={() => hapusJpn(index)}
                        title="Hapus baris ini"
                      >
                        <X size={15} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input className="form-input" style={{ flex: 1.5, fontSize: '0.82rem', padding: '0.4rem 0.6rem' }} value={jpn.nama} onChange={e => updateJpn(index, 'nama', e.target.value)} placeholder="Nama Lengkap & Gelar" />
                      <input className="form-input" style={{ flex: 1, fontSize: '0.82rem', padding: '0.4rem 0.6rem' }} value={jpn.nip} onChange={e => updateJpn(index, 'nip', e.target.value)} placeholder="NIP" />
                      <input className="form-input" style={{ flex: 1.2, fontSize: '0.82rem', padding: '0.4rem 0.6rem' }} value={jpn.jabatan} onChange={e => updateJpn(index, 'jabatan', e.target.value)} placeholder="Jabatan" />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', borderStyle: 'dashed' }}
                  onClick={tambahJpn}
                >
                  + Tambah Anggota JPN
                </button>
              </div>

              <DriveFileUpload
                label="Berkas Dokumen SP-1 (Google Drive)"
                value={sp1Data.pdfUrl}
                onChange={(url, meta) => {
                  setSp1Data({ ...sp1Data, pdfUrl: url });
                  if (meta?.folderUrl && !suratData.driveFolderUrl) {
                    setSuratData(prev => ({ ...prev, driveFolderUrl: meta.folderUrl }));
                  }
                }}
                permohonanId={id}
                permohonanTitle={monitoringData?.kegiatan || suratData?.perihal || id}
                folderCategory="sp1"
                helpText="Unggah scan dokumen SP-1 resmi (.pdf)"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setIsEditingSP1(false)}>Batal</button>
              <button className="btn btn-primary" onClick={handleSaveSP1}>Simpan & Lanjutkan</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Telaah Hukum */}
      {isEditingTelaah && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Input Telaah Hukum S-5</h2>
              <button onClick={() => setIsEditingTelaah(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Tanggal Telaah</label>
                <input
                  type="date"
                  className="form-input"
                  value={telaahData.tanggal}
                  onChange={(e) => setTelaahData({ ...telaahData, tanggal: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Pembuat Telaah</label>
                <select 
                  className="form-input"
                  value={telaahData.pembuat}
                  onChange={(e) => setTelaahData({ ...telaahData, pembuat: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                >
                  <option value="">Pilih JPN...</option>
                  {(sp1Data.timJpn || []).map((jpn, idx) => (
                    jpn.nama && <option key={idx} value={jpn.nama}>{jpn.nama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Keputusan Telaah</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="keputusan" 
                      value="ya" 
                      checked={telaahData.dapatDidampingi === 'ya'} 
                      onChange={() => setTelaahData({...telaahData, dapatDidampingi: 'ya'})} 
                    />
                    JPN dapat melakukan pendampingan
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="keputusan" 
                      value="tidak" 
                      checked={telaahData.dapatDidampingi === 'tidak'} 
                      onChange={() => setTelaahData({...telaahData, dapatDidampingi: 'tidak'})} 
                    />
                    Tidak dapat dilakukan pendampingan
                  </label>
                </div>
              </div>
              
              <DriveFileUpload
                label="Berkas Lembar Telaahan Hukum (Google Drive)"
                value={telaahData.pdfUrl}
                onChange={(url, meta) => {
                  setTelaahData({ ...telaahData, pdfUrl: url });
                  if (meta?.folderUrl && !suratData.driveFolderUrl) {
                    setSuratData(prev => ({ ...prev, driveFolderUrl: meta.folderUrl }));
                  }
                }}
                permohonanId={id}
                permohonanTitle={monitoringData?.kegiatan || suratData?.perihal || id}
                folderCategory="telaahan"
                helpText="Unggah berkas telaahan yuridis (.pdf atau .docx)"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setIsEditingTelaah(false)}>Batal</button>
              <button className="btn btn-primary" onClick={handleSaveTelaah}>Simpan & Lanjutkan</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Data SP-2 */}
      {isEditingSP2 && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', margin: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Input Data SP-2</h2>
              <button onClick={() => setIsEditingSP2(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Nomor SP-2</label>
                <input
                  className="form-input"
                  value={sp2Data.nomor}
                  onChange={(e) => setSp2Data({ ...sp2Data, nomor: e.target.value })}
                  placeholder="Nomor SP-2"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Tanggal SP-2</label>
                <input
                  type="date"
                  className="form-input"
                  value={sp2Data.tanggal}
                  onChange={(e) => setSp2Data({ ...sp2Data, tanggal: e.target.value })}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Untuk</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={sp2Data.untuk}
                  onChange={(e) => setSp2Data({ ...sp2Data, untuk: e.target.value })}
                  placeholder="Melakukan pendampingan hukum proyek..."
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <label style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Users size={16} /> Tim Jaksa yang Diperintahkan
                  </label>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', color: 'var(--color-primary-shadow)', borderColor: 'var(--color-primary-shadow)' }}
                      onClick={handleAutoFillAllJpnSp2}
                      title="Otomatis masukkan seluruh daftar JPN yang terdaftar"
                    >
                      ⚡ Input Otomatis Semua JPN ({masterJpnList.length})
                    </button>
                    {sp1Data.timJpn && sp1Data.timJpn.length > 0 && (
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                        onClick={handleCopyJpnFromSp1ToSp2}
                        title="Salin susunan tim dari SP-1"
                      >
                        📋 Salin dari SP-1 ({sp1Data.timJpn.length})
                      </button>
                    )}
                  </div>
                </div>

                {(sp2Data.timJpn || []).map((jpn, index) => (
                  <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem', padding: '0.6rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <select
                        className="form-input"
                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem', flex: 1, backgroundColor: 'var(--color-surface)' }}
                        value={masterJpnList.find(m => m.nama === jpn.nama)?.id || ''}
                        onChange={(e) => handleSelectMasterJpnForSp2(index, e.target.value)}
                      >
                        <option value="">-- Pilih dari Daftar JPN ({masterJpnList.length}) --</option>
                        {masterJpnList.map(m => (
                          <option key={m.id} value={m.id}>{m.nama} ({m.pangkat || 'JPN'})</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.6rem', color: 'var(--color-danger-shadow)', borderColor: 'var(--color-danger-shadow)' }}
                        onClick={() => hapusJpnSp2(index)}
                        title="Hapus baris ini"
                      >
                        <X size={15} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input className="form-input" style={{ flex: 1.5, fontSize: '0.82rem', padding: '0.4rem 0.6rem' }} value={jpn.nama} onChange={e => updateJpnSp2(index, 'nama', e.target.value)} placeholder="Nama Lengkap & Gelar" />
                      <input className="form-input" style={{ flex: 1, fontSize: '0.82rem', padding: '0.4rem 0.6rem' }} value={jpn.nip} onChange={e => updateJpnSp2(index, 'nip', e.target.value)} placeholder="NIP" />
                      <input className="form-input" style={{ flex: 1.2, fontSize: '0.82rem', padding: '0.4rem 0.6rem' }} value={jpn.jabatan} onChange={e => updateJpnSp2(index, 'jabatan', e.target.value)} placeholder="Jabatan" />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', borderStyle: 'dashed' }}
                  onClick={tambahJpnSp2}
                >
                  + Tambah Jaksa
                </button>
              </div>

              <DriveFileUpload
                label="Berkas Surat Perintah SP-2 (Google Drive)"
                value={sp2Data.pdfUrl}
                onChange={(url, meta) => {
                  setSp2Data({ ...sp2Data, pdfUrl: url });
                  if (meta?.folderUrl && !suratData.driveFolderUrl) {
                    setSuratData(prev => ({ ...prev, driveFolderUrl: meta.folderUrl }));
                  }
                }}
                permohonanId={id}
                permohonanTitle={monitoringData?.kegiatan || suratData?.perihal || id}
                folderCategory="sp2"
                helpText="Unggah scan dokumen SP-2 resmi (.pdf)"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setIsEditingSP2(false)}>Batal</button>
              <button className="btn btn-primary" onClick={handleSaveSP2}>Simpan SP-2</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default DetailPermohonan;
