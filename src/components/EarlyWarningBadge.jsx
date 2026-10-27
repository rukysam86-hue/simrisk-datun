import React from 'react';
import { AlertTriangle, CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';
import { calculateEarlyWarningRisk, DEFAULT_EARLY_WARNING } from '../lib/earlyWarning';

export default function EarlyWarningBadge({ earlyWarning, onClick, size = 'sm' }) {
  if (!earlyWarning) return null;

  const calc = calculateEarlyWarningRisk(earlyWarning);

  let bg = '#f0fdf4';
  let border = '#86efac';
  let text = '#166534';
  let Icon = CheckCircle;
  let label = 'EWS: Terkendali';

  if (calc.level === 'high') {
    bg = '#fef2f2';
    border = '#f87171';
    text = '#991b1b';
    Icon = AlertTriangle;
    label = `EWS: Kritis (${calc.activeCount})`;
  } else if (calc.level === 'medium') {
    bg = '#fffbeb';
    border = '#fcd34d';
    text = '#92400e';
    Icon = AlertCircle;
    label = `EWS: Sedang (${calc.activeCount})`;
  }

  const isSmall = size === 'sm';

  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: isSmall ? '0.2rem 0.5rem' : '0.35rem 0.75rem',
        borderRadius: '999px',
        fontSize: isSmall ? '0.74rem' : '0.82rem',
        fontWeight: 700,
        backgroundColor: bg,
        color: text,
        border: `1px solid ${border}`,
        cursor: onClick ? 'pointer' : 'default',
        whiteSpace: 'nowrap',
      }}
      title={calc.description}
    >
      <Icon size={isSmall ? 12 : 14} />
      <span>{label}</span>
    </span>
  );
}
