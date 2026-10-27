import React from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, AlertCircle, Info, Zap } from 'lucide-react';
import { EARLY_WARNING_INDICATORS, DEFAULT_EARLY_WARNING, calculateEarlyWarningRisk } from '../lib/earlyWarning';

/**
 * EarlyWarningSection
 * Komponen input radio button & visualisasi Early Warning System (EWS) SIMRISK DATUN.
 * 
 * Props:
 * - value: Object (state indikator early warning, e.g. { dokumenBelumLengkap: 'tidak', ... })
 * - onChange: Function(updatedState, calculatedResult)
 * - readOnly: boolean (jika true, hanya menampilkan hasil evaluasi tanpa radio input)
 * - showTitle: boolean (tampilkan judul header)
 */
export default function EarlyWarningSection({
  value = DEFAULT_EARLY_WARNING,
  onChange,
  readOnly = false,
  showTitle = true,
}) {
  const currentState = { ...DEFAULT_EARLY_WARNING, ...(value || {}) };
  const calc = calculateEarlyWarningRisk(currentState);

  const handleRadioChange = (indicatorId, newValue) => {
    if (readOnly || !onChange) return;
    const updated = {
      ...currentState,
      [indicatorId]: newValue,
    };
    const newCalc = calculateEarlyWarningRisk(updated);
    onChange(updated, newCalc);
  };

  const getRiskTheme = (level) => {
    switch (level) {
      case 'high':
        return {
          bg: '#fef2f2',
          border: '#f87171',
          text: '#991b1b',
          badgeBg: '#ef4444',
          label: 'RISIKO TINGGI (KRITIS)',
          icon: <AlertTriangle size={20} color="#dc2626" />,
        };
      case 'medium':
        return {
          bg: '#fffbeb',
          border: '#fcd34d',
          text: '#92400e',
          badgeBg: '#f59e0b',
          label: 'RISIKO SEDANG (PERLU PERHATIAN)',
          icon: <AlertCircle size={20} color="#d97706" />,
        };
      case 'low':
      default:
        return {
          bg: '#f0fdf4',
          border: '#86efac',
          text: '#166534',
          badgeBg: '#10b981',
          label: 'RISIKO RENDAH (TERKENDALI)',
          icon: <CheckCircle size={20} color="#16a34a" />,
        };
    }
  };

  const theme = getRiskTheme(calc.level);

  return (
    <div style={{
      background: 'white',
      border: '1.5px solid var(--color-border)',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      marginBottom: '1.5rem',
    }}>
      {showTitle && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '0.75rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: '1.15rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--color-primary-shadow)',
            }}>
              <ShieldAlert size={22} color="var(--color-primary-shadow)" />
              Indikator Early Warning System (EWS) - JPN
            </h3>
            <p style={{
              margin: '0.25rem 0 0 0',
              fontSize: '0.85rem',
              color: 'var(--color-text-muted)',
            }}>
              {readOnly 
                ? 'Hasil penilaian indikator peringatan dini oleh Jaksa Pengacara Negara.'
                : 'Pilih jawaban radio button pada setiap indikator di bawah. Hasilnya akan secara langsung mengkalkulasi rekomendasi risiko.'}
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: 700,
              backgroundColor: theme.bg,
              color: theme.text,
              border: `1px solid ${theme.border}`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}>
              {theme.icon}
              {theme.label} (Skor: {calc.score})
            </span>
          </div>
        </div>
      )}

      {/* Live EWS Result Banner */}
      <div style={{
        backgroundColor: theme.bg,
        border: `1.5px solid ${theme.border}`,
        borderRadius: '10px',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.85rem',
      }}>
        <div style={{ marginTop: '2px' }}>{theme.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '0.25rem',
          }}>
            <strong style={{ fontSize: '0.95rem', color: theme.text }}>
              Kalkulasi EWS: {theme.label}
            </strong>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              background: 'white',
              padding: '0.2rem 0.55rem',
              borderRadius: '6px',
              border: `1px solid ${theme.border}`,
              color: theme.text,
            }}>
              {calc.activeCount} dari {EARLY_WARNING_INDICATORS.length} Indikator Terindikasi Risiko
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.86rem', color: theme.text, lineHeight: 1.45 }}>
            {calc.description}
          </p>

          {calc.activeItems.length > 0 && (
            <div style={{
              marginTop: '0.75rem',
              paddingTop: '0.75rem',
              borderTop: `1px dashed ${theme.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
            }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: theme.text, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Perhatian Khusus / Temuan Risiko:
              </span>
              {calc.activeItems.map(item => (
                <div key={item.id} style={{
                  fontSize: '0.82rem',
                  color: theme.text,
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0.4rem',
                }}>
                  <span style={{ color: '#dc2626', fontWeight: 800 }}>•</span>
                  <span><strong>{item.label}:</strong> {item.dangerText}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* List of Indicators with Radio Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {EARLY_WARNING_INDICATORS.map((indicator, index) => {
          const isYes = currentState[indicator.id] === 'ya';
          const isCritical = indicator.weight === 2;

          return (
            <div
              key={indicator.id}
              style={{
                borderRadius: '10px',
                border: isYes 
                  ? '1.5px solid #f87171' 
                  : '1px solid var(--color-border)',
                backgroundColor: isYes ? '#fff5f5' : '#fcfcfc',
                padding: '1rem',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1rem',
                flexWrap: 'wrap',
              }}>
                {/* Left: Indicator title & question */}
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.35rem',
                    flexWrap: 'wrap',
                  }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: isYes ? '#fee2e2' : '#e2e8f0',
                      color: isYes ? '#991b1b' : '#475569',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                    }}>
                      {index + 1}
                    </span>
                    <strong style={{
                      fontSize: '0.92rem',
                      color: isYes ? '#991b1b' : 'var(--color-text-main)',
                    }}>
                      {indicator.label}
                    </strong>
                    {isCritical && (
                      <span style={{
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: '#fee2e2',
                        color: '#991b1b',
                        border: '1px solid #fecaca',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}>
                        <Zap size={11} /> Kritis (Bobot 2)
                      </span>
                    )}
                  </div>

                  <p style={{
                    margin: 0,
                    fontSize: '0.84rem',
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.4,
                  }}>
                    {indicator.question}
                  </p>

                  {isYes && (
                    <div style={{
                      marginTop: '0.5rem',
                      fontSize: '0.78rem',
                      color: '#b91c1c',
                      backgroundColor: '#fef2f2',
                      padding: '0.4rem 0.65rem',
                      borderRadius: '6px',
                      borderLeft: '3px solid #ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}>
                      <Info size={13} style={{ flexShrink: 0 }} />
                      <span>{indicator.dangerText}</span>
                    </div>
                  )}
                </div>

                {/* Right: Radio Button Options */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexShrink: 0,
                }}>
                  {readOnly ? (
                    <span style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      backgroundColor: isYes ? '#fee2e2' : '#dcfce7',
                      color: isYes ? '#991b1b' : '#166534',
                      border: isYes ? '1px solid #fca5a5' : '1px solid #86efac',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}>
                      {isYes ? <AlertTriangle size={13} /> : <CheckCircle size={13} />}
                      {isYes ? 'Ya (Terindikasi Risiko)' : 'Tidak (Aman)'}
                    </span>
                  ) : (
                    <div style={{
                      display: 'inline-flex',
                      backgroundColor: '#f1f5f9',
                      padding: '3px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}>
                      {/* Option: TIDAK */}
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.4rem 0.75rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          userSelect: 'none',
                          transition: 'all 0.15s ease',
                          backgroundColor: !isYes ? '#ffffff' : 'transparent',
                          color: !isYes ? '#15803d' : '#64748b',
                          boxShadow: !isYes ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        }}
                      >
                        <input
                          type="radio"
                          name={`ews-${indicator.id}`}
                          value="tidak"
                          checked={!isYes}
                          onChange={() => handleRadioChange(indicator.id, 'tidak')}
                          style={{ accentColor: '#16a34a', cursor: 'pointer' }}
                        />
                        <span>Tidak (Aman)</span>
                      </label>

                      {/* Option: YA */}
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.4rem 0.75rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          userSelect: 'none',
                          transition: 'all 0.15s ease',
                          backgroundColor: isYes ? '#ef4444' : 'transparent',
                          color: isYes ? '#ffffff' : '#64748b',
                          boxShadow: isYes ? '0 1px 3px rgba(239, 68, 68, 0.4)' : 'none',
                        }}
                      >
                        <input
                          type="radio"
                          name={`ews-${indicator.id}`}
                          value="ya"
                          checked={isYes}
                          onChange={() => handleRadioChange(indicator.id, 'ya')}
                          style={{ accentColor: '#dc2626', cursor: 'pointer' }}
                        />
                        <span>Ya (Risiko)</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
