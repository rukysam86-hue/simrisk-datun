import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';

function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-1.5-flash');

  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem('simrisk_ai_settings') || '{}');
    if (savedSettings.apiKey) setApiKey(savedSettings.apiKey);
    if (savedSettings.model) {
      // Migrate old gemini-pro to gemini-1.5-flash
      setModel(savedSettings.model === 'gemini-pro' ? 'gemini-1.5-flash' : savedSettings.model);
    }
  }, []);

  const handleSave = () => {
    const settings = { apiKey, model };
    localStorage.setItem('simrisk_ai_settings', JSON.stringify(settings));
    alert('Pengaturan berhasil disimpan!');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <SettingsIcon size={28} color="var(--color-primary-shadow)" />
          Pengaturan Sistem
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Konfigurasi integrasi AI dan preferensi aplikasi</p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          Integrasi Google Gemini AI
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>API Key Gemini</label>
            <input 
              type="password" 
              className="form-input" 
              value={apiKey} 
              onChange={e => setApiKey(e.target.value)} 
              placeholder="Masukkan API Key (AIzaSy...)"
            />
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
              Dapatkan API Key gratis di Google AI Studio. Key hanya disimpan di browser (Local Storage) dan tidak dikirim ke server manapun selain endpoint resmi Google.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Model AI</label>
            <select 
              className="form-input" 
              value={model} 
              onChange={e => setModel(e.target.value)}
            >
              <option value="gemini-3.8-flash">Gemini 3.8 Flash (Terbaru & Cepat)</option>
              <option value="gemini-3.5-flash">Gemini 3.5 Flash (Stabil)</option>
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Generasi Sebelumnya)</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro (Akurat & Kompleks)</option>
            </select>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
              Pilih model yang akan digunakan untuk analisis risiko.
            </p>
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Save size={20} />
          Simpan Pengaturan
        </button>
      </div>
    </div>
  );
}

export default Settings;
