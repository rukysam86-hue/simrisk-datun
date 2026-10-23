import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function capture() {
  console.log('Launching browser to capture high quality screenshots...');
  const browser = await chromium.launch({ headless: true });

  const adminContext = await browser.newContext({
    viewport: { width: 1240, height: 860 },
    deviceScaleFactor: 1.5
  });

  await adminContext.addInitScript(() => {
    sessionStorage.setItem('simrisk_admin_session', JSON.stringify({
      username: 'simrisk_admin',
      token: 'admin_authenticated_token',
      loginTime: new Date().toISOString()
    }));
  });

  const publicContext = await browser.newContext({
    viewport: { width: 1240, height: 860 },
    deviceScaleFactor: 1.5
  });

  // 1. LOGIN PAGE
  console.log('1. Capturing 01_login_page.png...');
  const pageLogin = await publicContext.newPage();
  pageLogin.on('dialog', d => d.accept());
  await pageLogin.goto('http://localhost:5173/login');
  await pageLogin.waitForSelector('input[type="text"]');
  await pageLogin.fill('input[type="text"]', 'simrisk_admin');
  await pageLogin.fill('input[type="password"]', 'SimriskDatun123');
  await pageLogin.screenshot({ path: path.join(SCREENSHOT_DIR, '01_login_page.png') });
  await pageLogin.close();

  // 2. DASHBOARD UTAMA
  console.log('2. Capturing 02_dashboard_utama.png...');
  const pageDash = await adminContext.newPage();
  pageDash.on('dialog', d => d.accept());
  await pageDash.goto('http://localhost:5173/');
  await pageDash.waitForSelector('table');
  await pageDash.waitForTimeout(1000);
  await pageDash.screenshot({ path: path.join(SCREENSHOT_DIR, '02_dashboard_utama.png') });
  await pageDash.close();

  // 3. REGISTRASI KEGIATAN FORM
  console.log('3. Capturing 03_registrasi_kegiatan.png...');
  const pageReg = await adminContext.newPage();
  pageReg.on('dialog', d => d.accept());
  await pageReg.goto('http://localhost:5173/register');
  await pageReg.waitForSelector('.form-input');
  const formInputs = await pageReg.$$('.form-input');
  if (formInputs.length >= 4) {
    await formInputs[0].fill('Dinas Pekerjaan Umum dan Penataan Ruang (PUPR) Kabupaten Manggarai Barat');
    await formInputs[1].fill('600/215/PUPR-MB/IX/2026');
    await formInputs[2].fill('2026-09-18');
    await formInputs[3].fill('Permohonan Pendampingan Hukum Pembangunan Akses Jalan Pariwisata Labuan Bajo');
  }
  await pageReg.waitForTimeout(500);
  await pageReg.screenshot({ path: path.join(SCREENSHOT_DIR, '03_registrasi_kegiatan.png') });
  await pageReg.close();

  // 4. DETAIL PERMOHONAN & TAHAPAN SOP (ACCORDION)
  console.log('4. Capturing 04_detail_tahapan_sop.png...');
  const pageDetail = await adminContext.newPage();
  pageDetail.on('dialog', d => d.accept());
  await pageDetail.goto('http://localhost:5173/permohonan/demo123');
  await pageDetail.waitForSelector('h1');
  await pageDetail.waitForTimeout(800);
  await pageDetail.screenshot({ path: path.join(SCREENSHOT_DIR, '04_detail_tahapan_sop.png') });

  // 5. MONITORING & KEUANGAN (DUAL BAR & FINANCIAL CARDS)
  console.log('5. Capturing 05_monev_keuangan_dual_bar.png...');
  await pageDetail.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h2, h3'));
    const target = headings.find(h => h.innerText.includes('Realisasi Pencairan') || h.innerText.includes('Ringkasan'));
    if (target) {
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
    } else {
      window.scrollTo(0, 900);
    }
  });
  await pageDetail.waitForTimeout(600);
  await pageDetail.screenshot({ path: path.join(SCREENSHOT_DIR, '05_monev_keuangan_dual_bar.png') });

  // 6. HASIL ANALISIS RISIKO AI & DOKUMEN WORD
  console.log('6. Capturing 06_ai_analisis_risiko.png...');
  await pageDetail.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h2, h3, h4'));
    const target = headings.find(h => h.innerText.includes('AI') || h.innerText.includes('Analisis Risiko'));
    if (target) {
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
    } else {
      window.scrollTo(0, 1800);
    }
  });
  await pageDetail.waitForTimeout(600);
  await pageDetail.screenshot({ path: path.join(SCREENSHOT_DIR, '06_ai_analisis_risiko.png') });
  await pageDetail.close();

  // 7. PORTAL PEMOHON - LAYAR INPUT PIN
  console.log('7. Capturing 07_portal_pemohon_login.png...');
  const pagePortal = await publicContext.newPage();
  pagePortal.on('dialog', d => d.accept());
  await pagePortal.goto('http://localhost:5173/portal/demo123');
  await pagePortal.waitForSelector('input[type="password"]');
  await pagePortal.fill('input[type="password"]', 'demo123');
  await pagePortal.screenshot({ path: path.join(SCREENSHOT_DIR, '07_portal_pemohon_login.png') });

  // 8. PORTAL PEMOHON - DASHBOARD & STATUS
  console.log('8. Capturing 08_portal_pemohon_dashboard.png...');
  await pagePortal.click('button[type="submit"]');
  await pagePortal.waitForSelector('h1, h2, .card');
  await pagePortal.waitForTimeout(1000);
  await pagePortal.screenshot({ path: path.join(SCREENSHOT_DIR, '08_portal_pemohon_dashboard.png') });

  // 9. PORTAL PEMOHON - FORM PELAPORAN PROGRES & REALISASI ANGGARAN
  console.log('9. Capturing 09_portal_laporan_progres.png...');
  const addReportBtn = await pagePortal.waitForSelector('button:has-text("Laporkan Progres Berkala")', { timeout: 3000 }).catch(() => null);
  if (addReportBtn) {
    await addReportBtn.click();
    await pagePortal.waitForTimeout(800);
    const modalInputs = await pagePortal.$$('input.form-input, input');
    if (modalInputs.length >= 2) {
      await modalInputs[0].fill('75');
      await modalInputs[1].fill('4500000000');
    }
    const modalTextareas = await pagePortal.$$('textarea');
    if (modalTextareas.length >= 1) {
      await modalTextareas[0].fill('Pengecoran lantai segmen 3 jembatan berjalan lancar sesuai jadwal teknis.');
    }
    await pagePortal.waitForTimeout(400);
  }
  await pagePortal.screenshot({ path: path.join(SCREENSHOT_DIR, '09_portal_laporan_progres.png') });
  await pagePortal.close();

  // 10. PENGATURAN AI
  console.log('10. Capturing 10_pengaturan_ai.png...');
  const pageSettings = await adminContext.newPage();
  pageSettings.on('dialog', d => d.accept());
  await pageSettings.goto('http://localhost:5173/settings');
  await pageSettings.waitForSelector('.form-input');
  const settingsInputs = await pageSettings.$$('.form-input');
  if (settingsInputs.length >= 1) {
    await settingsInputs[0].fill('AIzaSyDemoKeyNtT2026SecureExampleKey');
  }
  await pageSettings.waitForTimeout(500);
  await pageSettings.screenshot({ path: path.join(SCREENSHOT_DIR, '10_pengaturan_ai.png') });
  await pageSettings.close();

  await browser.close();
  console.log('ALL_SCREENSHOTS_CAPTURED_SUCCESSFULLY');
}

capture().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
