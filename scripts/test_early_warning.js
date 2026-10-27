import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // 1. Inisialisasi session admin
  await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    sessionStorage.setItem('simrisk_admin_session', JSON.stringify({
      username: 'simrisk_admin',
      token: 'admin_authenticated_token',
      loginTime: new Date().toISOString()
    }));
  });

  // 2. Buka halaman permohonan bws789
  await page.goto('http://localhost:5173/permohonan/bws789', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // 3. Klik tombol "Detail"
  const assessBtn = page.locator('button:has-text("Detail"), button:has-text("Beri Penilaian")').first();
  await assessBtn.click();
  await page.waitForTimeout(800);

  // Scroll to EWS container
  const ewsElement = page.locator('.ews-container');
  await ewsElement.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  await page.screenshot({ path: 'scripts/ews_header_scrolled.png', fullPage: false });
  console.log('Saved ews_header_scrolled.png');

  // Klik beberapa radio button:
  // 1. Dokumen belum lengkap -> Ya
  await page.locator('input[name="ews_dokumenBelumLengkap"][value="ya"]').click();
  await page.waitForTimeout(200);

  // 2. Keterlambatan -> Ya
  await page.locator('input[name="ews_keterlambatan"][value="ya"]').click();
  await page.waitForTimeout(200);

  // Scroll sedikit ke bawah untuk melihat instruksi dan tombol simpan
  const adminSection = page.locator('text=Penentuan Risiko & Instruksi (Oleh Admin JPN)');
  await adminSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  await page.screenshot({ path: 'scripts/ews_risk_section.png', fullPage: false });
  console.log('Saved ews_risk_section.png');

  // Klik Simpan Penilaian
  page.on('dialog', async dialog => {
    console.log('Alert dialog:', dialog.message());
    await dialog.accept();
  });
  await page.locator('button:has-text("Simpan Penilaian")').click();
  await page.waitForTimeout(1000);

  // Ambil screenshot tabel Riwayat Monev dengan badge EWS
  const tableSection = page.locator('.table-monev');
  await tableSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'scripts/ews_table_badge.png', fullPage: false });
  console.log('Saved ews_table_badge.png');

  await browser.close();
  console.log('All screenshots captured successfully!');
})();
