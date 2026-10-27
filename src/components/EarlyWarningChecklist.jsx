import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck, Info } from 'lucide-react';
import { EARLY_WARNING_INDICATORS, DEFAULT_EARLY_WARNING, calculateEarlyWarningRisk } from '../lib/earlyWarning';

/**
 * Komponen Input / Tampilan Indikator Early Warning System (EWS)
 * Berdasarkan modul Early Warning Pendampingan Hukum JPN Kejati NTT
 */
export default function EarlyWarningChecklist({
  values = DEFAULT_EARLY_WARNING,
  onChange,
  readOnly = false,
  showSummary = true,
}) {
  const currentValues = { ...DEFAULT_EARLY_WARNING, ...(values || {}) };
  const calculation = calculateEarlyWarningRisk(currentValues);

  const handleRadioChange = (id, val) => {
    if (readOnly || !onChange) return;
    onChange(id, val);
  };

  const setAllSafe = () => {
    if (readOnly || !onChange) return;
    EARLY_WARNING_INDICATORS.forEach(item => {
      onChange(item.id, 'tidak');
    });
  };

  const getBadgeStyle = (level) => {
    if (level === 'high') {
      return {
        bg: '#fef2f2',
        border: '#f87171',
        text: '#b91c1c',
        badgeClass: 'badge-high',
        label: 'Tinggi (Kritis / Perlu Mitigasi Segera)',
        icon: <ShieldAlert size={18} color="#dc2626" />,
      };
    }
    if (level === 'medium') {
      return {
        bg: '#fffbeb',
        border: '#fcd34d',
        text: '#b45309',
        badgeClass: 'badge-medium',
        label: 'Sedang (Perlu Perhatian / Pemantauan)',
        icon: <AlertTriangle size={18} color="#d97706" />,
      };
    }
    return {
      bg: '#f0fdf4',
      border: '#86efac',
      text: '#15803d',
      badgeClass: 'badge-low',
      label: 'Rendah (Aman / Normal)',
      icon: <ShieldCheck size={18} color="#16a34a" />,
    };
  };

  const badgeInfo = getBadgeStyle(calculation.level);

  return (
    <div className="ews-container" style={{
      background: '#ffffff',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
      marginBottom: '1.5rem',
    }}>
      {/* Header Banner bergaya resmi Early Warning (Mirip Referensi 02 Early Warning) */}
      <div style={{
        background: 'linear-gradient(135deg, #091224 0%, #172554 100%)',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        borderBottom: '3px solid #d97706',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
            color: '#ffffff',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1rem',
            boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4)',
            border: '2px solid #fef08a',
            flexShrink: 0,
          }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                background: '#fef08a',
                color: '#854d0e',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                letterSpacing: '0.5px',
              }}>
                MODUL 02
              </span>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#ffffff', fontWeight: 700 }}>
                Early Warning System (EWS)
              </h3>
            </div>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#93c5fd' }}>
              {readOnly ? 'Evaluasi indikator peringatan dini risiko proyek oleh Tim JPN Kejati NTT' : 'Input evaluasi 8 indikator peringatan dini yang mempengaruhi penilaian risiko JPN'}
            </p>
          </div>
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={setAllSafe}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s',
            }}
            title="Tandai semua indikator sebagai Tidak (Aman)"
          >
            <CheckCircle2 size={14} color="#86efac" />
            Set Semua Aman
          </button>
        )}
      </div>

      {/* Summary Box */}
      {showSummary && (
        <div style={{
          background: badgeInfo.bg,
          borderBottom: `1px solid ${badgeInfo.border}`,
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {badgeInfo.icon}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Kalkulasi Risiko Otomatis EWS
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: badgeInfo.text }}>
                {badgeInfo.label}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.15rem' }}>
                {calculation.description}
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'white',
            padding: '0.5rem 0.85rem',
            borderRadius: '8px',
            border: `1px solid ${badgeInfo.border}`,
          }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Indikator Aktif:</span>
            <strong style={{
              fontSize: '1rem',
              color: calculation.activeCount > 0 ? (calculation.level === 'high' ? '#dc2626' : '#d97706') : '#16a34a',
              fontWeight: 800,
            }}>
              {calculation.activeCount} / {EARLY_WARNING_INDICATORS.length}
            </strong>
          </div>
        </div>
      )}

      {/* List / Grid Indikator Pertanyaan */}
      <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {EARLY_WARNING_INDICATORS.map((indicator, idx) => {
          const isFlagged = currentValues[indicator.id] === 'ya';

          return (
            <div
              key={indicator.id}
              style={{
                background: isFlagged ? '#fff7ed' : '#ffffff',
                border: isFlagged ? '1px solid #fdba74' : '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                transition: 'all 0.15s ease-in-out',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}>
                <div style={{ flex: '1 1 320px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: isFlagged ? '#ea580c' : '#3b82f6',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      flexShrink: 0,
                    }}>
                      {idx + 1}
                    </span>
                    <strong style={{
                      fontSize: '0.92rem',
                      color: isFlagged ? '#9a3412' : '#1e293b',
                    }}>
                      {indicator.label}
                    </strong>
                    {indicator.weight === 2 && (
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        background: '#fee2e2',
                        color: '#b91c1c',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '4px',
                        border: '1px solid #fca5a5',
                      }}>
                        Bobot Kritis
                      </span>
                    )}
                  </div>
                  <p style={{
                    margin: 0,
                    fontSize: '0.83rem',
                    color: '#475569',
                    lineHeight: '1.4',
                  }}>
                    {indicator.question}
                  </p>
                </div>

                {/* Radio Buttons */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: '#f1f5f9',
                  borderRadius: '8px',
                  padding: '3px',
                  gap: '4px',
                  flexShrink: 0,
                }}>
                  {/* Opsi TIDAK (Aman) */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: !isFlagged ? 700 : 500,
                      color: !isFlagged ? '#15803d' : '#64748b',
                      background: !isFlagged ? '#ffffff' : 'transparent',
                      boxShadow: !isFlagged ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      cursor: readOnly ? 'default' : 'pointer',
                      userSelect: 'none',
                      transition: 'all 0.15s ease',
                      border: !isFlagged ? '1px solid #bbf7d0' : '1px solid transparent',
                    }}
                  >
                    <input
                      type="radio"
                      name={`ews_${indicator.id}`}
                      value="tidak"
                      checked={!isFlagged}
                      disabled={readOnly}
                      onChange={() => handleRadioChange(indicator.id, 'tidak')}
                      style={{
                        accentColor: '#16a34a',
                        cursor: readOnly ? 'default' : 'pointer',
                      }}
                    />
                    <span>Tidak (Aman)</span>
                  </label>

                  {/* Opsi YA (Terindikasi) */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: isFlagged ? 700 : 500,
                      color: isFlagged ? '#b91c1c' : '#64748b',
                      background: isFlagged ? '#ffffff' : 'transparent',
                      boxShadow: isFlagged ? '0 1px 3px rgba(220, 38, 38, 0.15)' : 'none',
                      cursor: readOnly ? 'default' : 'pointer',
                      userSelect: 'none',
                      transition: 'all 0.15s ease',
                      border: isFlagged ? '1px solid #fecaca' : '1px solid transparent',
                    }}
                  >
                    <input
                      type="radio"
                      name={`ews_${indicator.id}`}
                      value="ya"
                      checked={isFlagged}
                      disabled={readOnly}
                      onChange={() => handleRadioChange(indicator.id, 'ya')}
                      style={{
                        accentColor: '#dc2626',
                        cursor: readOnly ? 'default' : 'pointer',
                      }}
                    />
                    <span>Ya (Terindikasi)</span>
                  </label>
                </div>
              </div>

              {/* Warning Text jika 'Ya' */}
              {isFlagged && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px dashed #fca5a5',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.78rem',
                  color: '#991b1b',
                }}>
                  <AlertTriangle size={14} color="#dc2626" style={{ flexShrink: 0 }} />
                  <span><strong>Dampak Risiko:</strong> {indicator.dangerText}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
