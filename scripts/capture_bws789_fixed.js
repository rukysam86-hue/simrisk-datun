import { chromium } from 'playwright';
import path from 'path';

async function captureFixed() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 665 }
  });

  await context.addInitScript(() => {
    sessionStorage.setItem('simrisk_admin_session', JSON.stringify({
      username: 'simrisk_admin',
      token: 'admin_authenticated_token',
      loginTime: new Date().toISOString()
    }));
  });

  const page = await context.newPage();
  await page.goto('http://localhost:5173/permohonan/bws789', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('h1', { timeout: 15000 });
  await page.waitForTimeout(600);

  // 1. Tangkapan Layar Bagian Atas
  await page.screenshot({ path: path.resolve('screenshots/bws789_fixed_top.png') });

  // 2. Gulir ke Tabel Riwayat Laporan Progres & Penilaian
  await page.evaluate(() => {
    const el = document.querySelector('.table-container') || document.querySelector('table');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await page.waitForTimeout(600);

  // 3. Tangkapan Layar Bagian Tabel (Mencakup kolom Aksi / Detail)
  await page.screenshot({ path: path.resolve('screenshots/bws789_fixed_table.png') });

  await browser.close();
  console.log('CAPTURE_FIXED_COMPLETE');
}

captureFixed().catch(err => {
  console.error('Error capturing fixed view:', err);
  process.exit(1);
});
